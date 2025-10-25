-- ============================================================================
-- SPRINT CORREÇÃO CRÍTICA: Painel Admin - Fix FK
-- ============================================================================

-- ETAPA 1: Sincronizar orphan users (criar em profiles_deprecated primeiro)
DO $$
DECLARE
  v_orphan RECORD;
  v_nome TEXT;
BEGIN
  FOR v_orphan IN 
    SELECT au.id, au.email, au.raw_user_meta_data
    FROM auth.users au
    WHERE NOT EXISTS (
      SELECT 1 FROM public.profiles_deprecated p WHERE p.id = au.id
    )
  LOOP
    v_nome := COALESCE(
      v_orphan.raw_user_meta_data->>'nome',
      v_orphan.raw_user_meta_data->>'name',
      SPLIT_PART(v_orphan.email, '@', 1)
    );

    -- Criar em profiles_deprecated primeiro (para satisfazer FK)
    INSERT INTO public.profiles_deprecated (
      id, nome, email, status
    ) VALUES (
      v_orphan.id,
      v_nome,
      v_orphan.email,
      'aprovado'
    ) ON CONFLICT (id) DO NOTHING;

    -- Depois criar em pessoas
    INSERT INTO public.pessoas (
      profile_id, nome, email, status, papeis
    ) VALUES (
      v_orphan.id,
      v_nome,
      v_orphan.email,
      'aprovado',
      ARRAY['especialista']::text[]
    ) ON CONFLICT (profile_id) DO NOTHING;

    RAISE NOTICE '✅ Sincronizado: % (%)', v_nome, v_orphan.email;
  END LOOP;
END $$;

-- ETAPA 2: AJUSTE DE POLÍTICAS RLS
DROP POLICY IF EXISTS "Admins podem ler agregações de clientes" ON public.clientes;
CREATE POLICY "Admins podem ler agregações de clientes"
ON public.clientes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins podem ler agregações de planejamentos" ON public.planejamentos;
CREATE POLICY "Admins podem ler agregações de planejamentos"
ON public.planejamentos
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins podem ler agregações de projetos" ON public.projetos;
CREATE POLICY "Admins podem ler agregações de projetos"
ON public.projetos
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins podem ler agregações financeiras" ON public.financeiro_lancamentos;
CREATE POLICY "Admins podem ler agregações financeiras"
ON public.financeiro_lancamentos
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- VALIDAÇÕES
DO $$
DECLARE
  v_orphan_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_orphan_count
  FROM auth.users au
  WHERE NOT EXISTS (
    SELECT 1 FROM public.pessoas p WHERE p.profile_id = au.id
  );

  IF v_orphan_count = 0 THEN
    RAISE NOTICE '✅ Sincronização completa';
  ELSE
    RAISE WARNING '⚠️ Ainda existem % usuários órfãos', v_orphan_count;
  END IF;
END $$;