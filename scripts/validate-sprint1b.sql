-- ============================================
-- SCRIPT DE VALIDAÇÃO - SPRINT 1B
-- Execute este script para validar a migração
-- ============================================

-- 🔍 PARTE 1: VALIDAÇÃO DE PESSOAS
DO $$
DECLARE
  v_duplicatas INT;
  v_orfaos INT;
  v_sem_profile_id INT;
  v_constraint_exists BOOLEAN;
BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ VALIDAÇÃO SPRINT 1B - UNIFICAÇÃO PESSOAS';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  
  -- 1. Verificar duplicações profile_id
  SELECT COUNT(*) INTO v_duplicatas
  FROM (
    SELECT profile_id FROM pessoas 
    WHERE profile_id IS NOT NULL 
    GROUP BY profile_id 
    HAVING COUNT(*) > 1
  ) s;
  
  IF v_duplicatas = 0 THEN
    RAISE NOTICE '✅ Duplicações profile_id: NENHUMA';
  ELSE
    RAISE WARNING '❌ Duplicações profile_id: % encontradas!', v_duplicatas;
  END IF;
  
  -- 2. Verificar órfãos (pessoas sem auth.users)
  SELECT COUNT(*) INTO v_orfaos
  FROM pessoas
  WHERE profile_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM auth.users WHERE id = pessoas.profile_id);
  
  IF v_orfaos = 0 THEN
    RAISE NOTICE '✅ Órfãos (sem auth): NENHUM';
  ELSE
    RAISE WARNING '❌ Órfãos encontrados: %', v_orfaos;
  END IF;
  
  -- 3. Verificar pessoas sem profile_id
  SELECT COUNT(*) INTO v_sem_profile_id
  FROM pessoas
  WHERE profile_id IS NULL;
  
  RAISE NOTICE 'ℹ️  Pessoas sem profile_id (válidas): %', v_sem_profile_id;
  
  -- 4. Verificar constraint UNIQUE
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_profile_id'
  ) INTO v_constraint_exists;
  
  IF v_constraint_exists THEN
    RAISE NOTICE '✅ Constraint UNIQUE(profile_id): ATIVA';
  ELSE
    RAISE WARNING '❌ Constraint UNIQUE(profile_id): AUSENTE!';
  END IF;
  
  RAISE NOTICE '';
END $$;

-- 🔍 PARTE 2: VALIDAÇÃO DE FKs (TAREFAS/EVENTOS/PROJETOS)
DO $$
DECLARE
  v_tarefas_sem_resp INT;
  v_tarefas_sem_exec INT;
  v_eventos_sem_resp INT;
  v_projetos_sem_grs INT;
BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ VALIDAÇÃO FOREIGN KEYS';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  
  -- 1. Tarefas sem responsável
  SELECT COUNT(*) INTO v_tarefas_sem_resp FROM tarefa WHERE responsavel_id IS NULL;
  IF v_tarefas_sem_resp = 0 THEN
    RAISE NOTICE '✅ Tarefas sem responsável: NENHUMA';
  ELSE
    RAISE WARNING '❌ Tarefas sem responsável: %', v_tarefas_sem_resp;
  END IF;
  
  -- 2. Tarefas sem executor (opcional, mas recomendado)
  SELECT COUNT(*) INTO v_tarefas_sem_exec 
  FROM tarefa 
  WHERE executor_id IS NULL AND executor_area IS NOT NULL;
  
  IF v_tarefas_sem_exec = 0 THEN
    RAISE NOTICE '✅ Tarefas sem executor: NENHUMA';
  ELSE
    RAISE NOTICE 'ℹ️  Tarefas sem executor: % (pode ser normal)', v_tarefas_sem_exec;
  END IF;
  
  -- 3. Eventos sem responsável
  SELECT COUNT(*) INTO v_eventos_sem_resp FROM eventos_calendario WHERE responsavel_id IS NULL;
  IF v_eventos_sem_resp = 0 THEN
    RAISE NOTICE '✅ Eventos sem responsável: NENHUM';
  ELSE
    RAISE WARNING '❌ Eventos sem responsável: %', v_eventos_sem_resp;
  END IF;
  
  -- 4. Projetos sem GRS
  SELECT COUNT(*) INTO v_projetos_sem_grs FROM projetos WHERE responsavel_grs_id IS NULL;
  IF v_projetos_sem_grs = 0 THEN
    RAISE NOTICE '✅ Projetos sem GRS: NENHUM';
  ELSE
    RAISE WARNING '❌ Projetos sem GRS: %', v_projetos_sem_grs;
  END IF;
  
  RAISE NOTICE '';
END $$;

-- 🔍 PARTE 3: VALIDAÇÃO DE VIEW PROFILES
DO $$
DECLARE
  v_view_exists BOOLEAN;
  v_profile_count INT;
BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ VALIDAÇÃO VIEW PROFILES';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  
  -- 1. Verificar se view existe
  SELECT EXISTS (
    SELECT 1 FROM pg_views WHERE viewname = 'profiles'
  ) INTO v_view_exists;
  
  IF v_view_exists THEN
    RAISE NOTICE '✅ View profiles: CRIADA';
    
    -- 2. Verificar dados na view
    SELECT COUNT(*) INTO v_profile_count FROM profiles;
    RAISE NOTICE 'ℹ️  Registros na view profiles: %', v_profile_count;
    
    -- 3. Verificar se campos existem
    IF EXISTS (SELECT 1 FROM profiles LIMIT 1) THEN
      RAISE NOTICE '✅ View profiles contém dados';
    ELSE
      RAISE WARNING '⚠️  View profiles vazia (pode ser normal se não há usuários)';
    END IF;
  ELSE
    RAISE WARNING '❌ View profiles: NÃO ENCONTRADA!';
  END IF;
  
  -- 4. Verificar se tabela antiga foi renomeada
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles_deprecated') THEN
    RAISE NOTICE '✅ Tabela profiles_deprecated: EXISTE (backup preservado)';
  ELSE
    RAISE WARNING '⚠️  Tabela profiles_deprecated: NÃO ENCONTRADA';
  END IF;
  
  RAISE NOTICE '';
END $$;

-- 🔍 PARTE 4: VALIDAÇÃO DE CREDENCIAIS SEGURAS
DO $$
DECLARE
  v_fn_exists BOOLEAN;
  v_fn_deprecated_exists BOOLEAN;
BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ VALIDAÇÃO CREDENCIAIS SEGURAS';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  
  -- 1. Verificar se wrapper fn_cred_save existe
  SELECT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'fn_cred_save'
  ) INTO v_fn_exists;
  
  IF v_fn_exists THEN
    RAISE NOTICE '✅ Wrapper fn_cred_save: CRIADO';
  ELSE
    RAISE WARNING '❌ Wrapper fn_cred_save: NÃO ENCONTRADO!';
  END IF;
  
  -- 2. Verificar se função antiga foi deprecada
  SELECT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'fn_cred_save_deprecated'
  ) INTO v_fn_deprecated_exists;
  
  IF v_fn_deprecated_exists THEN
    RAISE NOTICE '✅ fn_cred_save_deprecated: PRESERVADA (backup)';
  ELSE
    RAISE NOTICE 'ℹ️  fn_cred_save_deprecated: Não encontrada (pode não ter existido)';
  END IF;
  
  -- 3. Verificar se save_credential_secure existe
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'save_credential_secure') THEN
    RAISE NOTICE '✅ save_credential_secure: ATIVA';
  ELSE
    RAISE WARNING '❌ save_credential_secure: NÃO ENCONTRADA!';
  END IF;
  
  RAISE NOTICE '';
END $$;

-- 🔍 PARTE 5: VALIDAÇÃO DE RLS
DO $$
DECLARE
  v_rls_backup BOOLEAN;
  v_rls_audit BOOLEAN;
  v_policy_backup INT;
  v_policy_audit INT;
BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ VALIDAÇÃO RLS (ROW LEVEL SECURITY)';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  
  -- 1. Verificar RLS em clientes_backup_pre_unificacao
  SELECT relrowsecurity INTO v_rls_backup
  FROM pg_class
  WHERE relname = 'clientes_backup_pre_unificacao';
  
  IF v_rls_backup THEN
    RAISE NOTICE '✅ RLS clientes_backup_pre_unificacao: ATIVO';
    
    -- Verificar policies
    SELECT COUNT(*) INTO v_policy_backup
    FROM pg_policies
    WHERE tablename = 'clientes_backup_pre_unificacao';
    
    RAISE NOTICE 'ℹ️  Policies ativas: %', v_policy_backup;
  ELSE
    RAISE WARNING '❌ RLS clientes_backup_pre_unificacao: DESATIVADO!';
  END IF;
  
  -- 2. Verificar RLS em migracao_clientes_audit (se existir)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'migracao_clientes_audit') THEN
    SELECT relrowsecurity INTO v_rls_audit
    FROM pg_class
    WHERE relname = 'migracao_clientes_audit';
    
    IF v_rls_audit THEN
      RAISE NOTICE '✅ RLS migracao_clientes_audit: ATIVO';
      
      SELECT COUNT(*) INTO v_policy_audit
      FROM pg_policies
      WHERE tablename = 'migracao_clientes_audit';
      
      RAISE NOTICE 'ℹ️  Policies ativas: %', v_policy_audit;
    ELSE
      RAISE WARNING '❌ RLS migracao_clientes_audit: DESATIVADO!';
    END IF;
  ELSE
    RAISE NOTICE 'ℹ️  Tabela migracao_clientes_audit não existe (normal)';
  END IF;
  
  RAISE NOTICE '';
END $$;

-- 🔍 PARTE 6: VALIDAÇÃO DE ÍNDICES
DO $$
DECLARE
  v_idx_profile_id BOOLEAN;
  v_idx_papeis BOOLEAN;
  v_idx_email BOOLEAN;
BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ VALIDAÇÃO ÍNDICES DE PERFORMANCE';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  
  -- 1. Verificar idx_pessoas_profile_id
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_pessoas_profile_id'
  ) INTO v_idx_profile_id;
  
  IF v_idx_profile_id THEN
    RAISE NOTICE '✅ Índice idx_pessoas_profile_id: CRIADO';
  ELSE
    RAISE WARNING '❌ Índice idx_pessoas_profile_id: AUSENTE!';
  END IF;
  
  -- 2. Verificar idx_pessoas_papeis
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_pessoas_papeis'
  ) INTO v_idx_papeis;
  
  IF v_idx_papeis THEN
    RAISE NOTICE '✅ Índice idx_pessoas_papeis: CRIADO';
  ELSE
    RAISE WARNING '❌ Índice idx_pessoas_papeis: AUSENTE!';
  END IF;
  
  -- 3. Verificar idx_pessoas_email (opcional)
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_pessoas_email'
  ) INTO v_idx_email;
  
  IF v_idx_email THEN
    RAISE NOTICE '✅ Índice idx_pessoas_email: CRIADO';
  ELSE
    RAISE NOTICE 'ℹ️  Índice idx_pessoas_email: Ausente (pode ser criado depois)';
  END IF;
  
  RAISE NOTICE '';
END $$;

-- 🎯 RESUMO FINAL
DO $$
DECLARE
  v_score INT := 0;
  v_max_score INT := 100;
BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '🎯 RESUMO FINAL DA VALIDAÇÃO';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  
  -- Calcular score aproximado
  IF NOT EXISTS (SELECT 1 FROM (SELECT profile_id FROM pessoas WHERE profile_id IS NOT NULL GROUP BY profile_id HAVING COUNT(*) > 1) s) THEN v_score := v_score + 15; END IF;
  IF NOT EXISTS (SELECT 1 FROM pessoas WHERE profile_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM auth.users WHERE id = pessoas.profile_id)) THEN v_score := v_score + 15; END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_profile_id') THEN v_score := v_score + 10; END IF;
  IF NOT EXISTS (SELECT 1 FROM tarefa WHERE responsavel_id IS NULL) THEN v_score := v_score + 10; END IF;
  IF NOT EXISTS (SELECT 1 FROM eventos_calendario WHERE responsavel_id IS NULL) THEN v_score := v_score + 10; END IF;
  IF NOT EXISTS (SELECT 1 FROM projetos WHERE responsavel_grs_id IS NULL) THEN v_score := v_score + 10; END IF;
  IF EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'profiles') THEN v_score := v_score + 10; END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'fn_cred_save') THEN v_score := v_score + 10; END IF;
  IF (SELECT relrowsecurity FROM pg_class WHERE relname = 'clientes_backup_pre_unificacao') THEN v_score := v_score + 10; END IF;
  
  RAISE NOTICE 'Score Aproximado: %/%', v_score, v_max_score;
  
  IF v_score >= 90 THEN
    RAISE NOTICE '✅ EXCELENTE - Sprint 1B 100%% completo!';
  ELSIF v_score >= 70 THEN
    RAISE NOTICE '✅ BOM - Sprint 1B praticamente completo';
  ELSIF v_score >= 50 THEN
    RAISE WARNING '⚠️  ATENÇÃO - Sprint 1B parcialmente completo';
  ELSE
    RAISE WARNING '❌ CRÍTICO - Sprint 1B NÃO foi aplicado corretamente!';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '📋 Para detalhes completos, veja: docs/SPRINT_1B_COMPLETO.md';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;
