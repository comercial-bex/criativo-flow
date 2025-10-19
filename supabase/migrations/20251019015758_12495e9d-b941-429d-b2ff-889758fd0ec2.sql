-- ============================================
-- SPRINT 3: TOTAL TRACEABILITY SYSTEM
-- Objetivo: Criar sistema universal de rastreamento (trace_id)
-- ============================================

-- 1️⃣ CRIAR TABELA DE AUDITORIA UNIVERSAL
CREATE TABLE IF NOT EXISTS public.audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trace_id UUID NOT NULL DEFAULT gen_random_uuid(),
  
  -- Identificação
  entidade_tipo TEXT NOT NULL, -- 'tarefa', 'anexo', 'aprovacao', 'lancamento', etc
  entidade_id UUID NOT NULL,
  
  -- Ação
  acao TEXT NOT NULL, -- 'criacao', 'atualizacao', 'exclusao', 'aprovacao', 'rejeicao'
  acao_detalhe TEXT,
  
  -- Contexto
  user_id UUID REFERENCES auth.users(id),
  user_nome TEXT,
  user_role TEXT,
  
  -- Dados
  dados_antes JSONB,
  dados_depois JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Impacto
  impacto_tipo TEXT, -- 'baixo', 'medio', 'alto', 'critico'
  entidades_afetadas JSONB DEFAULT '[]'::jsonb, -- [{tipo, id, descricao}]
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Índices
  CONSTRAINT audit_trail_entidade_unique UNIQUE (entidade_tipo, entidade_id, acao, created_at)
);

CREATE INDEX idx_audit_trail_trace_id ON audit_trail(trace_id);
CREATE INDEX idx_audit_trail_entidade ON audit_trail(entidade_tipo, entidade_id);
CREATE INDEX idx_audit_trail_user ON audit_trail(user_id);
CREATE INDEX idx_audit_trail_created ON audit_trail(created_at DESC);

-- RLS
ALTER TABLE public.audit_trail ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados veem audit trail"
ON public.audit_trail FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Sistema pode criar audit trail"
ON public.audit_trail FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2️⃣ FUNÇÃO GENÉRICA DE AUDITORIA
CREATE OR REPLACE FUNCTION public.fn_registrar_auditoria(
  p_entidade_tipo TEXT,
  p_entidade_id UUID,
  p_acao TEXT,
  p_dados_antes JSONB DEFAULT NULL,
  p_dados_depois JSONB DEFAULT NULL,
  p_acao_detalhe TEXT DEFAULT NULL,
  p_trace_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trace_id UUID;
  v_user_nome TEXT;
  v_user_role TEXT;
  v_impacto TEXT := 'baixo';
BEGIN
  -- Gerar ou usar trace_id existente
  v_trace_id := COALESCE(p_trace_id, gen_random_uuid());
  
  -- Buscar dados do usuário
  SELECT p.nome, get_user_role(auth.uid())::text
  INTO v_user_nome, v_user_role
  FROM profiles p
  WHERE p.id = auth.uid();
  
  -- Determinar impacto
  IF p_acao IN ('exclusao', 'aprovacao', 'rejeicao') THEN
    v_impacto := 'alto';
  ELSIF p_acao = 'atualizacao' THEN
    v_impacto := 'medio';
  END IF;
  
  -- Inserir registro de auditoria
  INSERT INTO audit_trail (
    trace_id,
    entidade_tipo,
    entidade_id,
    acao,
    acao_detalhe,
    user_id,
    user_nome,
    user_role,
    dados_antes,
    dados_depois,
    impacto_tipo
  ) VALUES (
    v_trace_id,
    p_entidade_tipo,
    p_entidade_id,
    p_acao,
    p_acao_detalhe,
    auth.uid(),
    v_user_nome,
    v_user_role,
    p_dados_antes,
    p_dados_depois,
    v_impacto
  );
  
  RETURN v_trace_id;
END;
$$;

-- 3️⃣ TRIGGERS PARA TAREFAS
CREATE OR REPLACE FUNCTION public.trg_audit_tarefa()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_acao TEXT;
  v_detalhe TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_acao := 'criacao';
    v_detalhe := 'Tarefa criada: ' || NEW.titulo;
    NEW.trace_id := fn_registrar_auditoria('tarefa', NEW.id, v_acao, NULL, to_jsonb(NEW), v_detalhe);
    
  ELSIF TG_OP = 'UPDATE' THEN
    v_acao := 'atualizacao';
    
    -- Detectar mudanças importantes
    IF OLD.status != NEW.status THEN
      v_detalhe := 'Status alterado: ' || OLD.status || ' → ' || NEW.status;
    ELSIF OLD.executor_id != NEW.executor_id THEN
      v_detalhe := 'Executor alterado';
    ELSIF OLD.prazo_executor != NEW.prazo_executor THEN
      v_detalhe := 'Prazo alterado';
    ELSE
      v_detalhe := 'Tarefa atualizada';
    END IF;
    
    NEW.trace_id := fn_registrar_auditoria('tarefa', NEW.id, v_acao, to_jsonb(OLD), to_jsonb(NEW), v_detalhe, OLD.trace_id);
    
  ELSIF TG_OP = 'DELETE' THEN
    v_acao := 'exclusao';
    v_detalhe := 'Tarefa excluída: ' || OLD.titulo;
    PERFORM fn_registrar_auditoria('tarefa', OLD.id, v_acao, to_jsonb(OLD), NULL, v_detalhe, OLD.trace_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS audit_tarefa_trigger ON tarefa;
CREATE TRIGGER audit_tarefa_trigger
BEFORE INSERT OR UPDATE OR DELETE ON tarefa
FOR EACH ROW EXECUTE FUNCTION trg_audit_tarefa();

-- 4️⃣ TRIGGERS PARA ANEXOS
CREATE OR REPLACE FUNCTION public.trg_audit_anexo()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_acao TEXT;
  v_detalhe TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_acao := 'criacao';
    v_detalhe := 'Anexo adicionado: ' || COALESCE(NEW.legenda, 'sem legenda');
    NEW.trace_id := fn_registrar_auditoria('anexo', NEW.id, v_acao, NULL, to_jsonb(NEW), v_detalhe);
    
  ELSIF TG_OP = 'DELETE' THEN
    v_acao := 'exclusao';
    v_detalhe := 'Anexo removido: ' || COALESCE(OLD.legenda, 'sem legenda');
    PERFORM fn_registrar_auditoria('anexo', OLD.id, v_acao, to_jsonb(OLD), NULL, v_detalhe, OLD.trace_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS audit_anexo_trigger ON anexo;
CREATE TRIGGER audit_anexo_trigger
BEFORE INSERT OR DELETE ON anexo
FOR EACH ROW EXECUTE FUNCTION trg_audit_anexo();

-- 5️⃣ TRIGGERS PARA APROVAÇÕES
CREATE OR REPLACE FUNCTION public.trg_audit_aprovacao()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_acao TEXT;
  v_detalhe TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_acao := 'criacao';
    v_detalhe := 'Aprovação solicitada: ' || NEW.titulo;
    NEW.trace_id := fn_registrar_auditoria('aprovacao', NEW.id, v_acao, NULL, to_jsonb(NEW), v_detalhe);
    
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      IF NEW.status = 'aprovado' THEN
        v_acao := 'aprovacao';
        v_detalhe := 'Material aprovado: ' || NEW.titulo;
      ELSIF NEW.status = 'reprovado' THEN
        v_acao := 'rejeicao';
        v_detalhe := 'Material reprovado: ' || NEW.titulo || ' - Motivo: ' || COALESCE(NEW.motivo_reprovacao, 'não informado');
      ELSE
        v_acao := 'atualizacao';
        v_detalhe := 'Status alterado para: ' || NEW.status;
      END IF;
      
      NEW.trace_id := fn_registrar_auditoria('aprovacao', NEW.id, v_acao, to_jsonb(OLD), to_jsonb(NEW), v_detalhe, OLD.trace_id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_aprovacao_trigger ON aprovacoes_cliente;
CREATE TRIGGER audit_aprovacao_trigger
BEFORE INSERT OR UPDATE ON aprovacoes_cliente
FOR EACH ROW EXECUTE FUNCTION trg_audit_aprovacao();

-- 6️⃣ TRIGGERS PARA LANÇAMENTOS FINANCEIROS
CREATE OR REPLACE FUNCTION public.trg_audit_lancamento()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_acao TEXT;
  v_detalhe TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_acao := 'criacao';
    v_detalhe := 'Lançamento criado: ' || NEW.descricao || ' - R$ ' || NEW.valor::text;
    
    -- Registrar auditoria (não precisa atualizar trace_id pois não temos coluna)
    PERFORM fn_registrar_auditoria('lancamento_financeiro', NEW.id, v_acao, NULL, to_jsonb(NEW), v_detalhe);
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_lancamento_trigger ON financeiro_lancamentos;
CREATE TRIGGER audit_lancamento_trigger
AFTER INSERT ON financeiro_lancamentos
FOR EACH ROW EXECUTE FUNCTION trg_audit_lancamento();

-- 7️⃣ VIEW CONSOLIDADA DE TIMELINE
CREATE OR REPLACE VIEW public.vw_audit_timeline AS
SELECT 
  at.id,
  at.trace_id,
  at.entidade_tipo,
  at.entidade_id,
  at.acao,
  at.acao_detalhe,
  at.user_id,
  at.user_nome,
  at.user_role,
  at.impacto_tipo,
  at.created_at,
  
  -- Dados específicos por tipo de entidade
  CASE at.entidade_tipo
    WHEN 'tarefa' THEN (
      SELECT jsonb_build_object(
        'titulo', t.titulo,
        'status', t.status,
        'projeto_id', t.projeto_id,
        'cliente_id', t.cliente_id
      )
      FROM tarefa t WHERE t.id = at.entidade_id
    )
    WHEN 'aprovacao' THEN (
      SELECT jsonb_build_object(
        'titulo', a.titulo,
        'status', a.status,
        'tipo', a.tipo,
        'cliente_id', a.cliente_id
      )
      FROM aprovacoes_cliente a WHERE a.id = at.entidade_id
    )
    WHEN 'anexo' THEN (
      SELECT jsonb_build_object(
        'legenda', ax.legenda,
        'tipo', ax.tipo,
        'tarefa_id', ax.tarefa_id
      )
      FROM anexo ax WHERE ax.id = at.entidade_id
    )
    WHEN 'lancamento_financeiro' THEN (
      SELECT jsonb_build_object(
        'descricao', l.descricao,
        'valor', l.valor,
        'tipo_origem', l.tipo_origem
      )
      FROM financeiro_lancamentos l WHERE l.id = at.entidade_id
    )
  END AS contexto_entidade,
  
  at.dados_antes,
  at.dados_depois
  
FROM audit_trail at
ORDER BY at.created_at DESC;

-- Permissões
GRANT SELECT ON vw_audit_timeline TO authenticated;

-- 8️⃣ FUNÇÃO PARA BUSCAR TIMELINE POR TRACE_ID
CREATE OR REPLACE FUNCTION public.fn_get_timeline_by_trace(p_trace_id UUID)
RETURNS TABLE (
  id UUID,
  acao TEXT,
  acao_detalhe TEXT,
  user_nome TEXT,
  user_role TEXT,
  impacto_tipo TEXT,
  created_at TIMESTAMPTZ,
  entidade_tipo TEXT,
  contexto JSONB
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    acao,
    acao_detalhe,
    user_nome,
    user_role,
    impacto_tipo,
    created_at,
    entidade_tipo,
    contexto_entidade as contexto
  FROM vw_audit_timeline
  WHERE trace_id = p_trace_id
  ORDER BY created_at ASC;
$$;