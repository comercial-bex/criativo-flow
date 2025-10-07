-- ============================================================================
-- CORREÇÃO: Sistema de Notificações para Clientes vs Especialistas
-- ============================================================================
-- Problema: Todos os usuários recebem notificação "Novo Especialista Cadastrado"
-- Solução: Diferenciar entre clientes (cliente_id) e especialistas (especialidade)
-- ============================================================================

-- 1. REMOVER função e trigger antigos
DROP TRIGGER IF EXISTS trigger_notificar_novo_especialista ON public.profiles;
DROP FUNCTION IF EXISTS public.notificar_novo_especialista();

-- 2. CRIAR função inteligente que diferencia cliente de especialista
CREATE OR REPLACE FUNCTION public.notificar_novo_usuario()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_titulo TEXT;
  v_mensagem TEXT;
  v_cliente_nome TEXT;
BEGIN
  -- Só notificar se status é 'pendente_aprovacao'
  -- (Usuários criados direto como 'aprovado' não geram notificação)
  IF NEW.status != 'pendente_aprovacao' THEN
    RETURN NEW;
  END IF;

  -- CASO 1: É um CLIENTE (tem cliente_id preenchido)
  IF NEW.cliente_id IS NOT NULL THEN
    -- Buscar nome do cliente
    SELECT nome INTO v_cliente_nome 
    FROM public.clientes 
    WHERE id = NEW.cliente_id 
    LIMIT 1;

    v_titulo := 'Novo Cliente Cadastrado';
    v_mensagem := 'Um novo usuário cliente (' || NEW.nome || ') da empresa "' || 
                  COALESCE(v_cliente_nome, 'Não identificada') || 
                  '" se cadastrou e aguarda aprovação.';
  
  -- CASO 2: É um ESPECIALISTA (tem especialidade preenchida)
  ELSIF NEW.especialidade IS NOT NULL THEN
    v_titulo := 'Novo Especialista Cadastrado';
    v_mensagem := 'Um novo especialista (' || NEW.nome || ' - ' || 
                  NEW.especialidade || ') se cadastrou e aguarda aprovação.';
  
  -- CASO 3: Usuário genérico (nem cliente nem especialista)
  ELSE
    v_titulo := 'Novo Usuário Cadastrado';
    v_mensagem := 'Um novo usuário (' || NEW.nome || ') se cadastrou e aguarda aprovação.';
  END IF;

  -- Notificar todos os admins
  INSERT INTO public.notificacoes (
    user_id,
    titulo,
    mensagem,
    tipo,
    data_evento
  )
  SELECT 
    ur.user_id,
    v_titulo,
    v_mensagem,
    'info',
    NOW()
  FROM public.user_roles ur
  WHERE ur.role = 'admin';

  RETURN NEW;
END;
$$;

-- 3. CRIAR trigger atualizado
CREATE TRIGGER trigger_notificar_novo_usuario
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notificar_novo_usuario();

-- 4. ADICIONAR índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_cliente_id 
  ON public.profiles(cliente_id) 
  WHERE cliente_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_especialidade 
  ON public.profiles(especialidade) 
  WHERE especialidade IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_status 
  ON public.profiles(status);

-- 5. COMENTÁRIOS para documentação
COMMENT ON FUNCTION public.notificar_novo_usuario() IS 
'Notifica admins quando novo usuário é criado com status pendente_aprovacao.
Diferencia entre:
- CLIENTE: tem cliente_id preenchido
- ESPECIALISTA: tem especialidade preenchida  
- GENÉRICO: nem cliente_id nem especialidade';

COMMENT ON TRIGGER trigger_notificar_novo_usuario ON public.profiles IS
'Dispara notificação inteligente após insert em profiles, diferenciando clientes de especialistas';