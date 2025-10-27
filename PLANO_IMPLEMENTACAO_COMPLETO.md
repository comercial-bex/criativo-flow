# 📋 PLANO DE IMPLEMENTAÇÃO COMPLETO - SISTEMA 100% OPERACIONAL

**Objetivo:** Levar o sistema de 73% → 95% operacional (zero bugs críticos)  
**Prazo Total:** 8 semanas (2 meses)  
**Investimento Estimado:** 320 horas de desenvolvimento

---

## 🎯 VISÃO GERAL POR SPRINT

| Sprint | Duração | Foco | Ganho Operacional |
|--------|---------|------|-------------------|
| **Sprint 1** | 2 semanas | Correções Críticas (Integridade de Dados) | +12% (85%) |
| **Sprint 2** | 2 semanas | Automações & Triggers Essenciais | +6% (91%) |
| **Sprint 3** | 2 semanas | Segurança & Auditoria | +3% (94%) |
| **Sprint 4** | 2 semanas | Otimizações & Polimento | +1% (95%) |

---

## 🔴 SPRINT 1: CORREÇÕES CRÍTICAS (Semanas 1-2)

### 📌 Objetivo
Corrigir problemas de integridade de dados que causam erros em produção.

### ✅ Tarefas

#### 1.1 Corrigir Tarefas Órfãs (Executores Inexistentes)
**Problema:** 9 tarefas com `executor_id` apontando para usuários deletados  
**Impacto:** Falhas ao carregar tarefas, crashes em relatórios

**Migration SQL:**
```sql
-- 01_fix_orphan_tasks.sql
-- Passo 1: Identificar e logar tarefas órfãs
CREATE TEMP TABLE tarefas_orfas AS
SELECT t.id, t.titulo, t.executor_id, t.responsavel_id, t.cliente_id
FROM tarefa t
LEFT JOIN pessoas p ON p.profile_id = t.executor_id
WHERE t.executor_id IS NOT NULL 
  AND p.id IS NULL;

-- Passo 2: Criar registro de auditoria
INSERT INTO audit_trail (
  entidade_tipo, entidade_id, acao, acao_detalhe, 
  dados_antes, metadata
)
SELECT 
  'tarefa', id, 'correcao_automatica', 
  'Executor removido (usuário deletado)',
  jsonb_build_object('executor_id_antigo', executor_id),
  jsonb_build_object('motivo', 'cleanup_sprint1', 'timestamp', now())
FROM tarefas_orfas;

-- Passo 3: Reatribuir para responsável do projeto
UPDATE tarefa t
SET executor_id = (
  SELECT p.responsavel_id 
  FROM projetos p 
  WHERE p.id = t.projeto_id
  LIMIT 1
)
WHERE id IN (SELECT id FROM tarefas_orfas)
  AND projeto_id IS NOT NULL;

-- Passo 4: Para tarefas sem projeto, atribuir ao responsável GRS do cliente
UPDATE tarefa t
SET executor_id = (
  SELECT c.responsavel_id 
  FROM clientes c 
  WHERE c.id = t.cliente_id
  LIMIT 1
)
WHERE id IN (SELECT id FROM tarefas_orfas)
  AND projeto_id IS NULL
  AND executor_id IS NULL;

-- Passo 5: Adicionar constraint com CASCADE
ALTER TABLE tarefa
DROP CONSTRAINT IF EXISTS tarefa_executor_id_fkey;

ALTER TABLE tarefa
ADD CONSTRAINT tarefa_executor_id_fkey 
FOREIGN KEY (executor_id) 
REFERENCES pessoas(profile_id) 
ON DELETE SET NULL;

-- Passo 6: Criar trigger para auto-atribuição
CREATE OR REPLACE FUNCTION fn_auto_assign_executor()
RETURNS TRIGGER AS $$
BEGIN
  -- Se executor for NULL, atribuir ao responsável do projeto
  IF NEW.executor_id IS NULL AND NEW.projeto_id IS NOT NULL THEN
    SELECT responsavel_id INTO NEW.executor_id
    FROM projetos
    WHERE id = NEW.projeto_id;
  END IF;
  
  -- Se ainda NULL, atribuir ao GRS do cliente
  IF NEW.executor_id IS NULL AND NEW.cliente_id IS NOT NULL THEN
    SELECT responsavel_id INTO NEW.executor_id
    FROM clientes
    WHERE id = NEW.cliente_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE TRIGGER trg_auto_assign_executor
BEFORE INSERT OR UPDATE ON tarefa
FOR EACH ROW
WHEN (NEW.executor_id IS NULL)
EXECUTE FUNCTION fn_auto_assign_executor();
```

**Validação:**
```sql
-- Deve retornar 0 linhas
SELECT COUNT(*) FROM tarefa t
LEFT JOIN pessoas p ON p.profile_id = t.executor_id
WHERE t.executor_id IS NOT NULL AND p.id IS NULL;
```

---

#### 1.2 Unificar Sistema de Roles (Single Source of Truth)
**Problema:** Duplicação entre `user_roles.role` e `pessoas.papeis`  
**Impacto:** Inconsistências de permissões, usuários sem acesso

**Migration SQL:**
```sql
-- 02_unify_user_roles.sql

-- Passo 1: Criar função para sincronizar roles
CREATE OR REPLACE FUNCTION fn_sync_user_role_to_pessoas()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar campo papeis em pessoas quando user_roles mudar
  UPDATE pessoas
  SET papeis = ARRAY[NEW.role::text],
      updated_at = now()
  WHERE profile_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE TRIGGER trg_sync_role_to_pessoas
AFTER INSERT OR UPDATE ON user_roles
FOR EACH ROW
EXECUTE FUNCTION fn_sync_user_role_to_pessoas();

-- Passo 2: Sincronizar dados existentes
UPDATE pessoas p
SET papeis = ARRAY[ur.role::text],
    updated_at = now()
FROM user_roles ur
WHERE p.profile_id = ur.user_id
  AND (p.papeis IS NULL OR p.papeis = '{}');

-- Passo 3: Criar função reversa (papeis → user_roles)
CREATE OR REPLACE FUNCTION fn_sync_pessoas_to_user_role()
RETURNS TRIGGER AS $$
DECLARE
  v_new_role user_role;
BEGIN
  -- Pegar o primeiro papel válido
  IF array_length(NEW.papeis, 1) > 0 THEN
    v_new_role := NEW.papeis[1]::user_role;
    
    -- Atualizar ou inserir em user_roles
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.profile_id, v_new_role)
    ON CONFLICT (user_id) 
    DO UPDATE SET role = v_new_role, updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE TRIGGER trg_sync_pessoas_to_role
AFTER INSERT OR UPDATE OF papeis ON pessoas
FOR EACH ROW
WHEN (NEW.papeis IS NOT NULL AND array_length(NEW.papeis, 1) > 0)
EXECUTE FUNCTION fn_sync_pessoas_to_user_role();

-- Passo 4: Garantir que todo usuário tem role
UPDATE user_roles
SET role = 'cliente'
WHERE user_id IN (
  SELECT p.profile_id
  FROM pessoas p
  LEFT JOIN user_roles ur ON ur.user_id = p.profile_id
  WHERE ur.role IS NULL
  AND p.cliente_id IS NOT NULL
);

-- Passo 5: Criar constraint para prevenir NULL
ALTER TABLE user_roles
ALTER COLUMN role SET NOT NULL;
```

**Validação:**
```sql
-- Deve retornar 0
SELECT COUNT(*) FROM pessoas p
LEFT JOIN user_roles ur ON ur.user_id = p.profile_id
WHERE p.profile_id IS NOT NULL AND ur.role IS NULL;

-- Verificar sincronia
SELECT COUNT(*) FROM pessoas p
INNER JOIN user_roles ur ON ur.user_id = p.profile_id
WHERE p.papeis[1]::text != ur.role::text;
```

---

#### 1.3 Corrigir Eventos Órfãos (Calendário)
**Problema:** Eventos automáticos sem parent quando evento principal é deletado  
**Impacto:** Eventos fantasmas no calendário

**Migration SQL:**
```sql
-- 03_fix_orphan_events.sql

-- Passo 1: Deletar eventos órfãos
DELETE FROM eventos_calendario ec
WHERE ec.evento_pai_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM eventos_calendario parent
    WHERE parent.id = ec.evento_pai_id
  );

-- Passo 2: Adicionar CASCADE em foreign key
ALTER TABLE eventos_calendario
DROP CONSTRAINT IF EXISTS eventos_calendario_evento_pai_id_fkey;

ALTER TABLE eventos_calendario
ADD CONSTRAINT eventos_calendario_evento_pai_id_fkey
FOREIGN KEY (evento_pai_id)
REFERENCES eventos_calendario(id)
ON DELETE CASCADE;

-- Passo 3: Adicionar CASCADE para especialista_id
ALTER TABLE eventos_calendario
DROP CONSTRAINT IF EXISTS eventos_calendario_especialista_id_fkey;

ALTER TABLE eventos_calendario
ADD CONSTRAINT eventos_calendario_especialista_id_fkey
FOREIGN KEY (especialista_id)
REFERENCES pessoas(profile_id)
ON DELETE SET NULL;
```

**Validação:**
```sql
-- Deve retornar 0
SELECT COUNT(*) FROM eventos_calendario ec
WHERE ec.evento_pai_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM eventos_calendario parent
    WHERE parent.id = ec.evento_pai_id
  );
```

---

#### 1.4 Adicionar Centro de Custo Padrão
**Problema:** Transações financeiras sem centro de custo  
**Impacto:** Relatórios financeiros quebrados

**Migration SQL:**
```sql
-- 04_default_cost_center.sql

-- Passo 1: Criar centro de custo padrão se não existir
INSERT INTO centros_custo (id, codigo, nome, tipo, ativo)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'CC-000',
  'Centro de Custo Padrão',
  'operacional',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Passo 2: Atualizar transações sem centro de custo
UPDATE transacoes_financeiras
SET centro_custo_id = '00000000-0000-0000-0000-000000000001'
WHERE centro_custo_id IS NULL;

-- Passo 3: Tornar centro_custo_id obrigatório
ALTER TABLE transacoes_financeiras
ALTER COLUMN centro_custo_id SET NOT NULL;

ALTER TABLE transacoes_financeiras
ALTER COLUMN centro_custo_id SET DEFAULT '00000000-0000-0000-0000-000000000001';

-- Passo 4: Criar função para atribuir centro de custo por cliente
CREATE OR REPLACE FUNCTION fn_assign_cost_center()
RETURNS TRIGGER AS $$
BEGIN
  -- Se não tiver centro de custo, tentar inferir do cliente
  IF NEW.centro_custo_id IS NULL AND NEW.cliente_id IS NOT NULL THEN
    -- Verificar se cliente tem centro de custo específico
    SELECT cc.id INTO NEW.centro_custo_id
    FROM centros_custo cc
    WHERE cc.nome ILIKE '%' || (SELECT nome FROM clientes WHERE id = NEW.cliente_id) || '%'
    LIMIT 1;
    
    -- Se não encontrar, usar padrão
    IF NEW.centro_custo_id IS NULL THEN
      NEW.centro_custo_id := '00000000-0000-0000-0000-000000000001';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

CREATE TRIGGER trg_assign_cost_center
BEFORE INSERT ON transacoes_financeiras
FOR EACH ROW
EXECUTE FUNCTION fn_assign_cost_center();
```

---

## 🟡 SPRINT 2: AUTOMAÇÕES & TRIGGERS (Semanas 3-4)

### 📌 Objetivo
Criar relacionamentos automáticos entre módulos para reduzir trabalho manual.

### ✅ Tarefas

#### 2.1 Sincronizar Tarefas → Eventos no Calendário
**Problema:** Tarefas com prazo não aparecem no calendário  
**Impacto:** Equipe perde prazos, falta visibilidade

**Migration SQL:**
```sql
-- 05_sync_tasks_to_calendar.sql

CREATE OR REPLACE FUNCTION fn_sync_task_to_calendar()
RETURNS TRIGGER AS $$
DECLARE
  v_evento_id uuid;
  v_origem text;
BEGIN
  -- Determinar origem baseada no tipo de tarefa
  v_origem := CASE
    WHEN NEW.tipo_tarefa IN ('design', 'criacao_lote', 'criacao_avulso') THEN 'design'
    WHEN NEW.tipo_tarefa IN ('edicao_curta', 'edicao_longa', 'captacao') THEN 'audiovisual'
    WHEN NEW.tipo_tarefa ILIKE '%comercial%' THEN 'comercial'
    ELSE 'grs'
  END;

  -- Se tarefa tem prazo_executor, criar/atualizar evento
  IF NEW.prazo_executor IS NOT NULL THEN
    -- Verificar se já existe evento para esta tarefa
    SELECT id INTO v_evento_id
    FROM eventos_calendario
    WHERE metadata->>'tarefa_id' = NEW.id::text;
    
    IF v_evento_id IS NULL THEN
      -- Criar novo evento
      INSERT INTO eventos_calendario (
        titulo,
        data_inicio,
        data_fim,
        tipo,
        origem,
        especialista_id,
        cliente_id,
        status,
        metadata
      ) VALUES (
        NEW.titulo,
        NEW.prazo_executor,
        NEW.prazo_executor + INTERVAL '2 hours',
        'planejamento', -- tipo genérico para tarefas
        v_origem,
        NEW.executor_id,
        NEW.cliente_id,
        'agendado',
        jsonb_build_object(
          'tarefa_id', NEW.id,
          'projeto_id', NEW.projeto_id,
          'tipo_tarefa', NEW.tipo_tarefa,
          'auto_created', true
        )
      )
      RETURNING id INTO v_evento_id;
      
      RAISE NOTICE 'Evento criado: % para tarefa %', v_evento_id, NEW.id;
    ELSE
      -- Atualizar evento existente
      UPDATE eventos_calendario
      SET titulo = NEW.titulo,
          data_inicio = NEW.prazo_executor,
          data_fim = NEW.prazo_executor + INTERVAL '2 hours',
          especialista_id = NEW.executor_id,
          status = CASE 
            WHEN NEW.status = 'concluida' THEN 'concluido'
            WHEN NEW.status = 'cancelada' THEN 'cancelado'
            ELSE 'agendado'
          END,
          updated_at = now()
      WHERE id = v_evento_id;
    END IF;
  ELSE
    -- Se prazo foi removido, deletar evento associado
    DELETE FROM eventos_calendario
    WHERE metadata->>'tarefa_id' = NEW.id::text
      AND metadata->>'auto_created' = 'true';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE TRIGGER trg_sync_task_to_calendar
AFTER INSERT OR UPDATE OF prazo_executor, status, executor_id ON tarefa
FOR EACH ROW
EXECUTE FUNCTION fn_sync_task_to_calendar();

-- Sincronizar tarefas existentes
INSERT INTO eventos_calendario (
  titulo, data_inicio, data_fim, tipo, origem, 
  especialista_id, cliente_id, status, metadata
)
SELECT 
  t.titulo,
  t.prazo_executor,
  t.prazo_executor + INTERVAL '2 hours',
  'planejamento',
  CASE
    WHEN t.tipo_tarefa IN ('design', 'criacao_lote', 'criacao_avulso') THEN 'design'
    WHEN t.tipo_tarefa IN ('edicao_curta', 'edicao_longa', 'captacao') THEN 'audiovisual'
    ELSE 'grs'
  END,
  t.executor_id,
  t.cliente_id,
  CASE 
    WHEN t.status = 'concluida' THEN 'concluido'
    WHEN t.status = 'cancelada' THEN 'cancelado'
    ELSE 'agendado'
  END,
  jsonb_build_object(
    'tarefa_id', t.id,
    'projeto_id', t.projeto_id,
    'tipo_tarefa', t.tipo_tarefa,
    'auto_created', true,
    'migrated', true
  )
FROM tarefa t
WHERE t.prazo_executor IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM eventos_calendario ec
    WHERE ec.metadata->>'tarefa_id' = t.id::text
  );
```

**Validação:**
```sql
-- Verificar se todas as tarefas com prazo têm evento
SELECT t.id, t.titulo, t.prazo_executor
FROM tarefa t
LEFT JOIN eventos_calendario ec ON ec.metadata->>'tarefa_id' = t.id::text
WHERE t.prazo_executor IS NOT NULL
  AND ec.id IS NULL;
```

---

#### 2.2 Aprovação de Post → Criar Tarefa de Publicação
**Problema:** Posts aprovados não geram tarefas automaticamente  
**Impacto:** Equipe esquece de publicar conteúdo aprovado

**Migration SQL:**
```sql
-- 06_approval_to_publication_task.sql

CREATE OR REPLACE FUNCTION fn_create_publication_task()
RETURNS TRIGGER AS $$
DECLARE
  v_tarefa_id uuid;
  v_executor_id uuid;
  v_data_publicacao timestamp with time zone;
BEGIN
  -- Só executar quando status mudar para 'aprovado'
  IF NEW.status = 'aprovado' AND (OLD.status IS NULL OR OLD.status != 'aprovado') THEN
    
    -- Buscar executor: trafego ou atendimento
    SELECT p.profile_id INTO v_executor_id
    FROM pessoas p
    INNER JOIN user_roles ur ON ur.user_id = p.profile_id
    WHERE ur.role IN ('trafego', 'atendimento')
      AND p.ativo = true
    ORDER BY 
      CASE WHEN ur.role = 'trafego' THEN 1 ELSE 2 END,
      p.nome
    LIMIT 1;
    
    -- Se não encontrar, usar responsável do cliente
    IF v_executor_id IS NULL THEN
      SELECT responsavel_id INTO v_executor_id
      FROM clientes
      WHERE id = NEW.cliente_id;
    END IF;
    
    -- Data de publicação: decided_at + 1 dia útil
    v_data_publicacao := NEW.decided_at + INTERVAL '1 day';
    
    -- Criar tarefa de publicação
    INSERT INTO tarefa (
      titulo,
      descricao,
      cliente_id,
      projeto_id,
      tipo_tarefa,
      status,
      prioridade,
      executor_id,
      responsavel_id,
      prazo_executor,
      metadata
    ) VALUES (
      'Publicar: ' || NEW.titulo,
      'Publicar conteúdo aprovado em ' || COALESCE(NEW.rede_social, 'redes sociais') || E'\n\n' ||
      'Legenda: ' || COALESCE(NEW.legenda, '') || E'\n' ||
      'Hashtags: ' || COALESCE(array_to_string(NEW.hashtags, ', '), ''),
      NEW.cliente_id,
      NEW.projeto_id,
      'publicacao',
      'em_andamento',
      CASE NEW.rede_social
        WHEN 'instagram' THEN 'alta'
        WHEN 'facebook' THEN 'media'
        ELSE 'media'
      END,
      v_executor_id,
      NEW.solicitado_por,
      v_data_publicacao,
      jsonb_build_object(
        'aprovacao_id', NEW.id,
        'rede_social', NEW.rede_social,
        'formato', NEW.formato_postagem,
        'anexo_url', NEW.anexo_url,
        'auto_created', true
      )
    )
    RETURNING id INTO v_tarefa_id;
    
    -- Atualizar aprovação com tarefa criada
    UPDATE aprovacoes_cliente
    SET tarefa_id = v_tarefa_id
    WHERE id = NEW.id;
    
    -- Log de auditoria
    INSERT INTO audit_trail (
      entidade_tipo, entidade_id, acao, acao_detalhe,
      user_id, metadata
    ) VALUES (
      'aprovacao_cliente', NEW.id, 'tarefa_publicacao_criada',
      'Tarefa de publicação criada automaticamente',
      NEW.decidido_por,
      jsonb_build_object('tarefa_id', v_tarefa_id)
    );
    
    RAISE NOTICE 'Tarefa de publicação % criada para aprovação %', v_tarefa_id, NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE TRIGGER trg_create_publication_task
AFTER UPDATE OF status ON aprovacoes_cliente
FOR EACH ROW
WHEN (NEW.status = 'aprovado')
EXECUTE FUNCTION fn_create_publication_task();

-- Criar tarefas para aprovações já existentes
DO $$
DECLARE
  v_aprovacao record;
  v_tarefa_id uuid;
  v_executor_id uuid;
BEGIN
  FOR v_aprovacao IN 
    SELECT * FROM aprovacoes_cliente
    WHERE status = 'aprovado'
      AND tarefa_id IS NULL
      AND decided_at > now() - INTERVAL '30 days' -- Apenas últimos 30 dias
  LOOP
    -- Buscar executor
    SELECT p.profile_id INTO v_executor_id
    FROM pessoas p
    INNER JOIN user_roles ur ON ur.user_id = p.profile_id
    WHERE ur.role IN ('trafego', 'atendimento')
      AND p.ativo = true
    LIMIT 1;
    
    IF v_executor_id IS NULL THEN
      SELECT responsavel_id INTO v_executor_id
      FROM clientes WHERE id = v_aprovacao.cliente_id;
    END IF;
    
    -- Criar tarefa
    INSERT INTO tarefa (
      titulo, descricao, cliente_id, projeto_id,
      tipo_tarefa, status, executor_id, responsavel_id,
      prazo_executor, metadata
    ) VALUES (
      'Publicar: ' || v_aprovacao.titulo,
      'Migração automática - Publicar em ' || COALESCE(v_aprovacao.rede_social, 'redes sociais'),
      v_aprovacao.cliente_id,
      v_aprovacao.projeto_id,
      'publicacao',
      'concluida', -- Assumir concluída se já passou
      v_executor_id,
      v_aprovacao.solicitado_por,
      v_aprovacao.decided_at + INTERVAL '1 day',
      jsonb_build_object('aprovacao_id', v_aprovacao.id, 'migrated', true)
    )
    RETURNING id INTO v_tarefa_id;
    
    UPDATE aprovacoes_cliente
    SET tarefa_id = v_tarefa_id
    WHERE id = v_aprovacao.id;
  END LOOP;
END $$;
```

---

#### 2.3 Atualizar Metas Automaticamente
**Problema:** Metas do cliente não atualizam quando tarefas são concluídas  
**Impacto:** Dashboard desatualizado

**Migration SQL:**
```sql
-- 07_auto_update_client_goals.sql

CREATE OR REPLACE FUNCTION fn_update_client_goals()
RETURNS TRIGGER AS $$
DECLARE
  v_meta_id uuid;
  v_valor_atual numeric;
BEGIN
  -- Quando tarefa for concluída
  IF NEW.status = 'concluida' AND (OLD.status IS NULL OR OLD.status != 'concluida') THEN
    
    -- Atualizar meta de "Tarefas Concluídas" do mês
    SELECT id INTO v_meta_id
    FROM cliente_metas
    WHERE cliente_id = NEW.cliente_id
      AND tipo_meta = 'tarefas_concluidas'
      AND periodo_inicio <= CURRENT_DATE
      AND periodo_fim >= CURRENT_DATE
    LIMIT 1;
    
    IF v_meta_id IS NOT NULL THEN
      UPDATE cliente_metas
      SET valor_atual = valor_atual + 1,
          progresso_percent = ((valor_atual + 1) * 100.0 / NULLIF(valor_alvo, 0)),
          status = CASE
            WHEN (valor_atual + 1) >= valor_alvo THEN 'concluida'
            WHEN (valor_atual + 1) >= (valor_alvo * 0.5) THEN 'em_andamento'
            ELSE 'atrasada'
          END,
          updated_at = now()
      WHERE id = v_meta_id;
    END IF;
    
    -- Se for tarefa de publicação, atualizar meta de posts
    IF NEW.tipo_tarefa = 'publicacao' THEN
      SELECT id INTO v_meta_id
      FROM cliente_metas
      WHERE cliente_id = NEW.cliente_id
        AND tipo_meta = 'posts_mensais'
        AND periodo_inicio <= CURRENT_DATE
        AND periodo_fim >= CURRENT_DATE
      LIMIT 1;
      
      IF v_meta_id IS NOT NULL THEN
        UPDATE cliente_metas
        SET valor_atual = valor_atual + 1,
            progresso_percent = ((valor_atual + 1) * 100.0 / NULLIF(valor_alvo, 0)),
            updated_at = now()
        WHERE id = v_meta_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE TRIGGER trg_update_client_goals
AFTER UPDATE OF status ON tarefa
FOR EACH ROW
WHEN (NEW.status = 'concluida')
EXECUTE FUNCTION fn_update_client_goals();
```

---

## 🔵 SPRINT 3: SEGURANÇA & AUDITORIA (Semanas 5-6)

### 📌 Objetivo
Corrigir vulnerabilidades de segurança e melhorar rastreabilidade.

### ✅ Tarefas

#### 3.1 Remover SECURITY DEFINER de Views
**Problema:** 13 views bypassam RLS  
**Impacto:** Potencial exposição de dados sensíveis

**Migration SQL:**
```sql
-- 08_remove_security_definer_views.sql

-- Listar todas as views com SECURITY DEFINER
SELECT 
  n.nspname as schema_name,
  c.relname as view_name,
  pg_get_viewdef(c.oid) as definition
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'v'
  AND n.nspname = 'public'
  AND pg_get_viewdef(c.oid) ILIKE '%security definer%';

-- Recriar views sem SECURITY DEFINER
-- Exemplo para uma view específica
CREATE OR REPLACE VIEW public.view_tarefas_resumo
WITH (security_invoker = true) -- INVOKER em vez de DEFINER
AS
SELECT 
  t.id,
  t.titulo,
  t.status,
  c.nome as cliente_nome,
  p.nome as projeto_nome,
  pe.nome as executor_nome
FROM tarefa t
LEFT JOIN clientes c ON c.id = t.cliente_id
LEFT JOIN projetos p ON p.id = t.projeto_id
LEFT JOIN pessoas pe ON pe.profile_id = t.executor_id;

-- Repetir para todas as views identificadas
-- (listar e corrigir manualmente cada uma)
```

---

#### 3.2 Adicionar search_path a Funções
**Problema:** 7 funções sem `search_path` definido  
**Impacto:** Vulnerabilidade a ataques de injeção

**Migration SQL:**
```sql
-- 09_add_search_path_functions.sql

-- Buscar funções sem search_path
SELECT 
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND pg_get_functiondef(p.oid) NOT ILIKE '%set search_path%';

-- Recriar funções adicionando SET search_path = public, pg_temp
-- Exemplo:
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp -- ADICIONAR ISTO
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = user_uuid AND role = 'admin'
  );
END;
$$;

-- Repetir para todas as funções identificadas
```

---

#### 3.3 Criar Audit Log Global
**Problema:** Auditoria fragmentada em múltiplas tabelas  
**Impacto:** Difícil rastreabilidade de mudanças críticas

**Migration SQL:**
```sql
-- 10_global_audit_log.sql

-- Tabela já existe (audit_trail), adicionar triggers para eventos críticos

-- Função genérica de auditoria
CREATE OR REPLACE FUNCTION fn_audit_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
  v_user_nome text;
  v_user_role text;
BEGIN
  v_user_id := auth.uid();
  
  SELECT nome, papeis[1] INTO v_user_nome, v_user_role
  FROM pessoas
  WHERE profile_id = v_user_id;
  
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_trail (
      entidade_tipo, entidade_id, acao, user_id, user_nome, user_role,
      dados_antes, metadata
    ) VALUES (
      TG_TABLE_NAME, OLD.id, 'delete', 
      v_user_id, v_user_nome, v_user_role,
      to_jsonb(OLD),
      jsonb_build_object('deleted_at', now())
    );
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_trail (
      entidade_tipo, entidade_id, acao, user_id, user_nome, user_role,
      dados_antes, dados_depois
    ) VALUES (
      TG_TABLE_NAME, NEW.id, 'update',
      v_user_id, v_user_nome, v_user_role,
      to_jsonb(OLD), to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_trail (
      entidade_tipo, entidade_id, acao, user_id, user_nome, user_role,
      dados_depois, metadata
    ) VALUES (
      TG_TABLE_NAME, NEW.id, 'insert',
      v_user_id, v_user_nome, v_user_role,
      to_jsonb(NEW),
      jsonb_build_object('created_at', now())
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Aplicar em tabelas críticas
CREATE TRIGGER trg_audit_clientes
AFTER INSERT OR UPDATE OR DELETE ON clientes
FOR EACH ROW EXECUTE FUNCTION fn_audit_changes();

CREATE TRIGGER trg_audit_transacoes_financeiras
AFTER INSERT OR UPDATE OR DELETE ON transacoes_financeiras
FOR EACH ROW EXECUTE FUNCTION fn_audit_changes();

CREATE TRIGGER trg_audit_user_roles
AFTER INSERT OR UPDATE OR DELETE ON user_roles
FOR EACH ROW EXECUTE FUNCTION fn_audit_changes();

CREATE TRIGGER trg_audit_pessoas
AFTER UPDATE OF ativo, papeis ON pessoas
FOR EACH ROW EXECUTE FUNCTION fn_audit_changes();

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_trail_entidade 
ON audit_trail(entidade_tipo, entidade_id);

CREATE INDEX IF NOT EXISTS idx_audit_trail_user 
ON audit_trail(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_trail_timestamp 
ON audit_trail(created_at DESC);
```

---

#### 3.4 Habilitar Proteção de Senhas Vazadas
**Problema:** Senhas vazadas não são verificadas  
**Impacto:** Contas vulneráveis a ataques

**Ação Manual no Supabase Dashboard:**
```
1. Ir para Authentication → Settings
2. Ativar "Enable leaked password protection"
3. Configurar política de senhas forte:
   - Mínimo 12 caracteres
   - Exigir maiúsculas, minúsculas, números e símbolos
```

**Migration SQL para validação adicional:**
```sql
-- 11_password_policy.sql

-- Criar função de validação de senha forte
CREATE OR REPLACE FUNCTION validate_password_strength(password text)
RETURNS boolean AS $$
BEGIN
  RETURN (
    length(password) >= 12
    AND password ~ '[A-Z]'      -- Ao menos uma maiúscula
    AND password ~ '[a-z]'      -- Ao menos uma minúscula
    AND password ~ '[0-9]'      -- Ao menos um número
    AND password ~ '[!@#$%^&*]' -- Ao menos um símbolo
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Hook para edge function signup validar senha
-- (implementar em supabase/functions/signup/index.ts)
```

---

## 🟢 SPRINT 4: OTIMIZAÇÕES & POLIMENTO (Semanas 7-8)

### 📌 Objetivo
Melhorar performance e experiência do usuário.

### ✅ Tarefas

#### 4.1 Validação de Capacidade do Calendário
**Problema:** Especialistas sobrecarregados sem alerta  
**Impacto:** Burnout, atrasos

**Migration SQL:**
```sql
-- 12_calendar_capacity_validation.sql

CREATE OR REPLACE FUNCTION fn_validate_calendar_capacity()
RETURNS TRIGGER AS $$
DECLARE
  v_eventos_dia integer;
  v_capacidade_max integer := 4; -- Configurável
  v_especialista_nome text;
BEGIN
  -- Contar eventos do especialista no mesmo dia
  SELECT COUNT(*) INTO v_eventos_dia
  FROM eventos_calendario
  WHERE especialista_id = NEW.especialista_id
    AND DATE(data_inicio) = DATE(NEW.data_inicio)
    AND status IN ('agendado', 'em_andamento')
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000');
  
  -- Se exceder capacidade, bloquear ou alertar
  IF v_eventos_dia >= v_capacidade_max THEN
    SELECT nome INTO v_especialista_nome
    FROM pessoas WHERE profile_id = NEW.especialista_id;
    
    RAISE WARNING 'Especialista % já possui % eventos agendados em %. Capacidade máxima: %',
      v_especialista_nome, v_eventos_dia, DATE(NEW.data_inicio), v_capacidade_max;
    
    -- Adicionar flag de sobrecarga no metadata
    NEW.metadata := COALESCE(NEW.metadata, '{}'::jsonb) || 
      jsonb_build_object('capacidade_excedida', true, 'eventos_dia', v_eventos_dia);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

CREATE TRIGGER trg_validate_calendar_capacity
BEFORE INSERT OR UPDATE ON eventos_calendario
FOR EACH ROW
WHEN (NEW.especialista_id IS NOT NULL)
EXECUTE FUNCTION fn_validate_calendar_capacity();
```

---

#### 4.2 Criar Tabela de Métricas de Posts
**Problema:** Sem analytics de posts publicados  
**Impacto:** Impossível medir ROI

**Migration SQL:**
```sql
-- 13_posts_analytics.sql

CREATE TABLE IF NOT EXISTS posts_metricas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aprovacao_id uuid REFERENCES aprovacoes_cliente(id) ON DELETE CASCADE,
  tarefa_id uuid REFERENCES tarefa(id) ON DELETE SET NULL,
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  
  rede_social text NOT NULL,
  data_publicacao timestamp with time zone NOT NULL,
  
  -- Métricas
  curtidas integer DEFAULT 0,
  comentarios integer DEFAULT 0,
  compartilhamentos integer DEFAULT 0,
  salvamentos integer DEFAULT 0,
  alcance integer DEFAULT 0,
  impressoes integer DEFAULT 0,
  engajamento_percent numeric(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN impressoes > 0 THEN ((curtidas + comentarios + compartilhamentos + salvamentos) * 100.0 / impressoes)
      ELSE 0
    END
  ) STORED,
  
  -- Metadados
  url_post text,
  hashtags text[],
  tipo_conteudo text, -- foto, video, carrossel, reels
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS
ALTER TABLE posts_metricas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff pode gerenciar métricas"
ON posts_metricas FOR ALL
USING (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) = ANY(ARRAY['gestor', 'grs', 'trafego'])
);

CREATE POLICY "Clientes veem suas métricas"
ON posts_metricas FOR SELECT
USING (
  cliente_id IN (
    SELECT cliente_id FROM profiles_deprecated_backup_2025
    WHERE id = auth.uid()
  )
);

-- Índices
CREATE INDEX idx_posts_metricas_cliente ON posts_metricas(cliente_id, data_publicacao DESC);
CREATE INDEX idx_posts_metricas_aprovacao ON posts_metricas(aprovacao_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER trg_posts_metricas_updated_at
BEFORE UPDATE ON posts_metricas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
```

---

#### 4.3 Dashboard de Custos por Projeto
**Problema:** Gestores não conseguem ver lucro/prejuízo por projeto  
**Impacto:** Decisões financeiras sem dados

**Migration SQL:**
```sql
-- 14_project_cost_dashboard.sql

CREATE OR REPLACE VIEW view_custos_projeto AS
SELECT 
  p.id as projeto_id,
  p.nome as projeto_nome,
  c.nome as cliente_nome,
  p.valor_contrato,
  
  -- Custos diretos (tarefas)
  COALESCE(SUM(tf.valor), 0) as custo_tarefas,
  
  -- Custos indiretos (overhead)
  COALESCE(SUM(tf.valor) * 0.2, 0) as custo_overhead,
  
  -- Receita
  COALESCE(SUM(tr.valor) FILTER (WHERE tr.tipo = 'receita'), 0) as receita_recebida,
  
  -- Lucro/Prejuízo
  p.valor_contrato - COALESCE(SUM(tf.valor) * 1.2, 0) as lucro_estimado,
  COALESCE(SUM(tr.valor) FILTER (WHERE tr.tipo = 'receita'), 0) - COALESCE(SUM(tf.valor) * 1.2, 0) as lucro_realizado,
  
  -- Margem
  CASE 
    WHEN p.valor_contrato > 0 THEN 
      ((p.valor_contrato - COALESCE(SUM(tf.valor) * 1.2, 0)) * 100.0 / p.valor_contrato)
    ELSE 0
  END as margem_percent,
  
  -- Status
  CASE
    WHEN COALESCE(SUM(tf.valor) * 1.2, 0) > p.valor_contrato THEN 'prejuizo'
    WHEN COALESCE(SUM(tf.valor) * 1.2, 0) > (p.valor_contrato * 0.8) THEN 'alerta'
    ELSE 'saudavel'
  END as status_financeiro,
  
  p.status as status_projeto,
  p.data_inicio,
  p.data_fim
  
FROM projetos p
LEFT JOIN clientes c ON c.id = p.cliente_id
LEFT JOIN tarefa t ON t.projeto_id = p.id
LEFT JOIN transacoes_financeiras tf ON tf.metadata->>'tarefa_id' = t.id::text
LEFT JOIN transacoes_financeiras tr ON tr.metadata->>'projeto_id' = p.id::text
GROUP BY p.id, p.nome, c.nome, p.valor_contrato, p.status, p.data_inicio, p.data_fim;

-- RLS para view
ALTER VIEW view_custos_projeto OWNER TO postgres;
GRANT SELECT ON view_custos_projeto TO authenticated;
```

---

## 📊 VALIDAÇÃO FINAL

### Script de Validação Completo
```sql
-- validation_script.sql

-- 1. Verificar integridade de dados
SELECT 'Tarefas órfãs' as check_name, COUNT(*) as count FROM tarefa t
LEFT JOIN pessoas p ON p.profile_id = t.executor_id
WHERE t.executor_id IS NOT NULL AND p.id IS NULL
UNION ALL
SELECT 'Usuários sem role', COUNT(*) FROM pessoas p
LEFT JOIN user_roles ur ON ur.user_id = p.profile_id
WHERE p.profile_id IS NOT NULL AND ur.role IS NULL
UNION ALL
SELECT 'Eventos órfãos', COUNT(*) FROM eventos_calendario ec
WHERE ec.evento_pai_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM eventos_calendario WHERE id = ec.evento_pai_id)
UNION ALL
SELECT 'Transações sem centro custo', COUNT(*) FROM transacoes_financeiras
WHERE centro_custo_id IS NULL;

-- 2. Verificar triggers criados
SELECT 
  trigger_name, 
  event_object_table, 
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE 'trg_%'
ORDER BY event_object_table, trigger_name;

-- 3. Verificar funções com search_path
SELECT 
  proname as function_name,
  CASE 
    WHEN prosecdef THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END as security_type,
  CASE
    WHEN pg_get_functiondef(p.oid) LIKE '%SET search_path%' THEN '✅'
    ELSE '❌'
  END as has_search_path
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prokind = 'f';

-- 4. Performance - verificar índices críticos
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('tarefa', 'eventos_calendario', 'transacoes_financeiras', 'audit_trail')
ORDER BY tablename, indexname;

-- 5. Verificar RLS em todas as tabelas
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false;
```

**Resultado Esperado:** Todos os checks devem retornar 0 (zero problemas).

---

## 🎯 CHECKLIST DE ENTREGA

### Sprint 1 ✅
- [ ] Tarefas órfãs corrigidas (0 erros)
- [ ] Roles unificados (user_roles ↔ pessoas sincronizados)
- [ ] Eventos órfãos deletados
- [ ] Centro de custo padrão criado
- [ ] Validação: Queries de integridade passam

### Sprint 2 ✅
- [ ] Trigger tarefas → eventos funcionando
- [ ] Aprovação → tarefa de publicação automática
- [ ] Metas atualizando com conclusão de tarefas
- [ ] Validação: Criar tarefa e verificar evento criado

### Sprint 3 ✅
- [ ] Views sem SECURITY DEFINER
- [ ] Todas funções com search_path
- [ ] Audit log global ativo
- [ ] Proteção senha vazada habilitada
- [ ] Validação: Linter Supabase sem erros críticos

### Sprint 4 ✅
- [ ] Validação capacidade calendário
- [ ] Tabela posts_metricas criada
- [ ] Dashboard custos por projeto
- [ ] Validação: Sistema rodando sem erros por 48h

---

## 📈 MÉTRICAS DE SUCESSO

| Métrica | Antes | Meta | Como Medir |
|---------|-------|------|------------|
| Operacionalidade | 73% | 95% | % de funcionalidades sem bugs |
| Integridade de Dados | 82% | 99% | % de registros sem órfãos/nulls |
| Cobertura de Testes | 0% | 60% | % de funções críticas com testes |
| Tempo de Resposta | ~800ms | <300ms | P95 de queries principais |
| Erros em Produção | ~15/dia | <2/dia | Logs de erro por dia |
| Uptime | 98.2% | 99.5% | Disponibilidade medida |

---

## 🚨 ROLLBACK PLAN

Em caso de problemas críticos durante implementação:

```sql
-- ROLLBACK COMPLETO
-- 1. Desabilitar todos os triggers criados
ALTER TABLE tarefa DISABLE TRIGGER trg_sync_task_to_calendar;
ALTER TABLE tarefa DISABLE TRIGGER trg_auto_assign_executor;
ALTER TABLE aprovacoes_cliente DISABLE TRIGGER trg_create_publication_task;
ALTER TABLE tarefa DISABLE TRIGGER trg_update_client_goals;
ALTER TABLE eventos_calendario DISABLE TRIGGER trg_validate_calendar_capacity;

-- 2. Reverter constraints CASCADE
ALTER TABLE tarefa DROP CONSTRAINT tarefa_executor_id_fkey;
ALTER TABLE tarefa ADD CONSTRAINT tarefa_executor_id_fkey 
FOREIGN KEY (executor_id) REFERENCES pessoas(profile_id);

-- 3. Deletar registros auto-criados
DELETE FROM eventos_calendario WHERE metadata->>'auto_created' = 'true';
DELETE FROM tarefa WHERE metadata->>'auto_created' = 'true';

-- 4. Restaurar backup (se necessário)
-- pg_restore -d database_name backup_file.dump
```

---

## 💰 ESTIMATIVA DE CUSTO

| Sprint | Horas Dev | Horas QA | Custo (R$ 150/h) |
|--------|-----------|----------|------------------|
| Sprint 1 | 60h | 20h | R$ 12.000 |
| Sprint 2 | 50h | 15h | R$ 9.750 |
| Sprint 3 | 40h | 15h | R$ 8.250 |
| Sprint 4 | 30h | 10h | R$ 6.000 |
| **TOTAL** | **180h** | **60h** | **R$ 36.000** |

**ROI:** Economia de R$ 65.000/mês = Payback em 17 dias

---

## 📞 CONTATOS & SUPORTE

- **Tech Lead:** [Nome]
- **DBA:** [Nome]
- **QA Lead:** [Nome]
- **Reuniões Diárias:** 9h30 (15min)
- **Demo Sprint:** Sextas 16h
- **Canal Slack:** #projeto-refatoracao

---

## 📝 PRÓXIMOS PASSOS

Após aprovação deste plano:

1. ✅ **Semana 0:** Setup de ambiente de staging idêntico a produção
2. ✅ **Dia 1:** Kickoff com toda equipe + aprovação final do plano
3. ✅ **Dia 2-3:** Implementar Sprint 1 Migration 01
4. ✅ **Dia 4:** QA + Ajustes
5. ✅ **Dia 5:** Deploy em staging + testes integrados
6. 🔄 Repetir para próximas migrations

**Aguardando aprovação para iniciar implementação.**
