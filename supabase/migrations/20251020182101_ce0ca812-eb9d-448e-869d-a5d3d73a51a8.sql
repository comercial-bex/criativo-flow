-- ============================================================================
-- ALTERNATIVA 1 - REFATORAÇÃO CIRÚRGICA (CORRIGIDO)
-- Sprint 1: Unificar Roles + Sprint 2: Foreign Keys + Sprint 3: Órfãos
-- ============================================================================

-- ============================================================================
-- PARTE 1: CORRIGIR INCONSISTÊNCIAS DE ROLES
-- ============================================================================

-- 1.1: Adicionar constraint UNIQUE em user_roles(user_id) se não existir
DO $$
BEGIN
  -- Remover duplicatas antes de criar UNIQUE constraint
  DELETE FROM public.user_roles a
  USING public.user_roles b
  WHERE a.id > b.id 
    AND a.user_id = b.user_id 
    AND a.role = b.role;
  
  -- Criar UNIQUE constraint se não existir
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_roles_user_id_key'
  ) THEN
    ALTER TABLE public.user_roles 
    ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- 1.2: Sincronizar user_roles baseado em pessoas.papeis para órfãos
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT 
  p.profile_id,
  CASE 
    WHEN 'admin' = ANY(p.papeis) THEN 'admin'::user_role
    WHEN 'grs' = ANY(p.papeis) THEN 'grs'::user_role
    WHEN 'gestor' = ANY(p.papeis) THEN 'gestor'::user_role
    WHEN 'design' = ANY(p.papeis) OR 'designer' = ANY(p.papeis) THEN 'designer'::user_role
    WHEN 'audiovisual' = ANY(p.papeis) OR 'filmmaker' = ANY(p.papeis) THEN 'filmmaker'::user_role
    WHEN 'atendimento' = ANY(p.papeis) THEN 'atendimento'::user_role
    WHEN 'financeiro' = ANY(p.papeis) THEN 'financeiro'::user_role
    WHEN 'trafego' = ANY(p.papeis) THEN 'trafego'::user_role
    WHEN 'cliente' = ANY(p.papeis) THEN 'cliente'::user_role
    WHEN 'fornecedor' = ANY(p.papeis) THEN 'fornecedor'::user_role
    ELSE 'cliente'::user_role
  END
FROM public.pessoas p
WHERE p.profile_id IS NOT NULL
  AND p.status = 'aprovado'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = p.profile_id
  )
ON CONFLICT (user_id) DO NOTHING;

-- 1.3: Índices para performance
CREATE INDEX IF NOT EXISTS idx_pessoas_profile_id ON public.pessoas(profile_id);
CREATE INDEX IF NOT EXISTS idx_pessoas_status ON public.pessoas(status);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- ============================================================================
-- PARTE 2: FOREIGN KEYS
-- ============================================================================

-- 2.1: Limpar órfãos antes de criar FKs
UPDATE public.tarefa SET responsavel_id = NULL 
WHERE responsavel_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM auth.users WHERE id = tarefa.responsavel_id);

UPDATE public.tarefa SET executor_id = NULL 
WHERE executor_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM auth.users WHERE id = tarefa.executor_id);

UPDATE public.projetos SET responsavel_grs_id = NULL 
WHERE responsavel_grs_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM auth.users WHERE id = projetos.responsavel_grs_id);

DELETE FROM public.projetos 
WHERE cliente_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM public.clientes WHERE id = projetos.cliente_id);

-- 2.2: Criar FKs
ALTER TABLE public.tarefa DROP CONSTRAINT IF EXISTS fk_tarefa_responsavel;
ALTER TABLE public.tarefa ADD CONSTRAINT fk_tarefa_responsavel 
FOREIGN KEY (responsavel_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.tarefa DROP CONSTRAINT IF EXISTS fk_tarefa_executor;
ALTER TABLE public.tarefa ADD CONSTRAINT fk_tarefa_executor 
FOREIGN KEY (executor_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.projetos DROP CONSTRAINT IF EXISTS fk_projetos_responsavel_grs;
ALTER TABLE public.projetos ADD CONSTRAINT fk_projetos_responsavel_grs 
FOREIGN KEY (responsavel_grs_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.projetos DROP CONSTRAINT IF EXISTS fk_projetos_cliente;
ALTER TABLE public.projetos ADD CONSTRAINT fk_projetos_cliente 
FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE CASCADE;

ALTER TABLE public.eventos_calendario DROP CONSTRAINT IF EXISTS fk_eventos_responsavel;
ALTER TABLE public.eventos_calendario ADD CONSTRAINT fk_eventos_responsavel 
FOREIGN KEY (responsavel_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.financeiro_lancamentos DROP CONSTRAINT IF EXISTS fk_lancamentos_projeto;
ALTER TABLE public.financeiro_lancamentos ADD CONSTRAINT fk_lancamentos_projeto 
FOREIGN KEY (projeto_id) REFERENCES public.projetos(id) ON DELETE SET NULL;

-- 2.3: Índices de JOIN
CREATE INDEX IF NOT EXISTS idx_tarefa_responsavel_id ON public.tarefa(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_tarefa_executor_id ON public.tarefa(executor_id);
CREATE INDEX IF NOT EXISTS idx_projetos_responsavel_grs_id ON public.projetos(responsavel_grs_id);
CREATE INDEX IF NOT EXISTS idx_projetos_cliente_id ON public.projetos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_eventos_responsavel_id ON public.eventos_calendario(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_projeto_id ON public.financeiro_lancamentos(projeto_id);

-- ============================================================================
-- PARTE 3: FUNÇÃO DIAGNÓSTICO
-- ============================================================================
CREATE OR REPLACE FUNCTION public.diagnostico_roles_v2()
RETURNS TABLE(
  total_pessoas bigint,
  pessoas_com_role bigint,
  pessoas_sem_role bigint,
  percentual_consistencia numeric
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint,
    COUNT(ur.user_id)::bigint,
    COUNT(*) FILTER (WHERE ur.user_id IS NULL)::bigint,
    ROUND((COUNT(ur.user_id)::numeric / NULLIF(COUNT(*), 0)) * 100, 2)
  FROM public.pessoas p
  LEFT JOIN public.user_roles ur ON p.profile_id = ur.user_id
  WHERE p.profile_id IS NOT NULL AND p.status = 'aprovado';
END;
$$;