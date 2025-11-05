-- ============================================================================
-- CORREÇÃO FINAL DE SEGURANÇA - Usar assinaturas completas
-- ============================================================================

-- PARTE 1: Corrigir view estrategia1_progresso_v2
-- ============================================================================

-- Buscar definição atual
DO $$
DECLARE
  view_def TEXT;
BEGIN
  SELECT definition INTO view_def
  FROM pg_views
  WHERE schemaname = 'public' AND viewname = 'estrategia1_progresso_v2';
  
  IF view_def IS NOT NULL THEN
    -- Remover SECURITY DEFINER do texto se existir
    view_def := REPLACE(view_def, 'SECURITY DEFINER', '');
    view_def := REPLACE(view_def, 'security definer', '');
    
    -- Recriar view sem SECURITY DEFINER
    EXECUTE format(
      'CREATE OR REPLACE VIEW public.estrategia1_progresso_v2 AS %s',
      view_def
    );
    RAISE NOTICE '✅ View estrategia1_progresso_v2 corrigida';
  END IF;
END $$;

-- PARTE 2: Aplicar search_path em TODAS as funções usando regprocedure
-- ============================================================================

DO $$
DECLARE
  func_record RECORD;
  func_signature TEXT;
  fixed_count INT := 0;
  already_ok_count INT := 0;
BEGIN
  -- Buscar TODAS as funções public que precisam de search_path
  FOR func_record IN 
    SELECT 
      p.oid,
      p.proname,
      p.oid::regprocedure::text as full_signature,
      COALESCE(array_to_string(p.proconfig, ', '), 'SEM CONFIG') as current_config
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND (
        p.proconfig IS NULL 
        OR NOT array_to_string(p.proconfig, ',') LIKE '%search_path%'
        OR array_to_string(p.proconfig, ',') = 'search_path=public' -- Precisa adicionar extensions
      )
      AND p.proname LIKE ANY(ARRAY[
        'fn_%',
        'get_%', 
        'trg_%',
        'decrypt_%',
        'encrypt_%',
        'create_%',
        'refresh_%'
      ])
  LOOP
    BEGIN
      -- Aplicar search_path usando a assinatura completa
      EXECUTE format(
        'ALTER FUNCTION %s SET search_path TO ''public'', ''extensions''',
        func_record.full_signature
      );
      
      fixed_count := fixed_count + 1;
      RAISE NOTICE '✅ [%] % - Config: %', 
        fixed_count, 
        func_record.proname,
        func_record.current_config;
        
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Erro em %: %', func_record.proname, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '====================================================';
  RAISE NOTICE '✅ CORREÇÃO CONCLUÍDA';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Funções corrigidas: %', fixed_count;
  RAISE NOTICE '====================================================';
END $$;

-- PARTE 3: Validação Final
-- ============================================================================

DO $$
DECLARE
  v_views_com_security_definer INT;
  v_funcs_sem_search_path INT;
  v_funcs_com_search_path INT;
BEGIN
  -- Contar views com SECURITY DEFINER
  SELECT COUNT(*) INTO v_views_com_security_definer
  FROM pg_views
  WHERE schemaname = 'public'
    AND (
      definition LIKE '%SECURITY%DEFINER%'
      OR definition LIKE '%security%definer%'
    );
  
  -- Contar funções SEM search_path
  SELECT COUNT(*) INTO v_funcs_sem_search_path
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND (
      p.proconfig IS NULL 
      OR NOT array_to_string(p.proconfig, ',') LIKE '%search_path%'
    )
    AND p.proname LIKE ANY(ARRAY['fn_%', 'get_%', 'trg_%', 'decrypt_%', 'encrypt_%']);
  
  -- Contar funções COM search_path
  SELECT COUNT(*) INTO v_funcs_com_search_path
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proconfig IS NOT NULL
    AND array_to_string(p.proconfig, ',') LIKE '%search_path%'
    AND p.proname LIKE ANY(ARRAY['fn_%', 'get_%', 'trg_%', 'decrypt_%', 'encrypt_%']);
  
  RAISE NOTICE '';
  RAISE NOTICE '====================================================';
  RAISE NOTICE '📊 VALIDAÇÃO FINAL';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Views com SECURITY DEFINER: % %', 
    v_views_com_security_definer,
    CASE WHEN v_views_com_security_definer = 0 THEN '✅' ELSE '❌' END;
  RAISE NOTICE 'Funções SEM search_path: % %',
    v_funcs_sem_search_path,
    CASE WHEN v_funcs_sem_search_path = 0 THEN '✅' ELSE '⚠️' END;
  RAISE NOTICE 'Funções COM search_path: % ✅', v_funcs_com_search_path;
  RAISE NOTICE '====================================================';
  
  IF v_views_com_security_definer = 0 AND v_funcs_sem_search_path = 0 THEN
    RAISE NOTICE '🎉 TODAS AS CORREÇÕES APLICADAS COM SUCESSO!';
  ELSIF v_funcs_sem_search_path > 0 THEN
    RAISE NOTICE '⚠️ Ainda há % funções sem search_path', v_funcs_sem_search_path;
    RAISE NOTICE '💡 Execute: SELECT proname FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = ''public'' AND p.proconfig IS NULL';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Próximo passo: Execute supabase--linter novamente';
  RAISE NOTICE '====================================================';
END $$;