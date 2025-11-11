-- Correção Final: função fn_criar_transacao_orcamento_aprovado
-- Esta função precisa do search_path mesmo após a migração anterior

CREATE OR REPLACE FUNCTION public.fn_criar_transacao_orcamento_aprovado()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'aprovado' AND (OLD.status IS NULL OR OLD.status != 'aprovado') THEN
    INSERT INTO public.financeiro_lancamentos (
      cliente_id,
      projeto_id,
      tipo,
      descricao,
      valor,
      data_vencimento,
      status,
      categoria
    ) VALUES (
      NEW.cliente_id,
      NEW.projeto_id,
      'receita',
      'Orçamento aprovado: ' || NEW.numero,
      NEW.valor_total,
      CURRENT_DATE + INTERVAL '30 days',
      'pendente',
      'servicos'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Habilitar RLS em tabelas públicas críticas identificadas no scan

-- 1. intelligence_data (9,411 registros expostos)
ALTER TABLE public.intelligence_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "intelligence_data_select_authenticated" ON public.intelligence_data
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND (
      is_admin(auth.uid()) 
      OR get_user_role(auth.uid()) IN ('gestor', 'grs', 'atendimento')
    )
  );

-- 2. connector_status (status de APIs e erros)
ALTER TABLE public.connector_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "connector_status_admin_only" ON public.connector_status
  FOR ALL USING (
    is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor'
  );

-- 3. relatorios_benchmark (5 relatórios com análises sensíveis)
ALTER TABLE public.relatorios_benchmark ENABLE ROW LEVEL SECURITY;

CREATE POLICY "benchmark_select_owner_or_admin" ON public.relatorios_benchmark
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND (
      is_admin(auth.uid())
      OR cliente_id IN (
        SELECT cliente_id FROM pessoas WHERE profile_id = auth.uid()
      )
    )
  );

-- 4. gamificacao_usuarios (dados de performance)
ALTER TABLE public.gamificacao_usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gamificacao_select_own_or_admin" ON public.gamificacao_usuarios
  FOR SELECT USING (
    user_id = auth.uid() 
    OR is_admin(auth.uid())
    OR get_user_role(auth.uid()) IN ('gestor', 'rh')
  );

CREATE POLICY "gamificacao_update_own" ON public.gamificacao_usuarios
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 5. modulos e submodulos (estrutura do sistema)
ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "modulos_select_authenticated" ON public.modulos
  FOR SELECT USING (auth.uid() IS NOT NULL);

ALTER TABLE public.submodulos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "submodulos_select_authenticated" ON public.submodulos
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Log das correções
COMMENT ON POLICY "intelligence_data_select_authenticated" ON public.intelligence_data 
  IS 'Restringir acesso a dados de inteligência apenas a usuários autenticados com roles adequadas - Corrigido 2025-11-11';
  
COMMENT ON POLICY "connector_status_admin_only" ON public.connector_status
  IS 'Restringir status de conectores apenas a admins e gestores - Corrigido 2025-11-11';
  
COMMENT ON POLICY "benchmark_select_owner_or_admin" ON public.relatorios_benchmark
  IS 'Restringir relatórios de benchmark ao cliente proprietário ou admins - Corrigido 2025-11-11';