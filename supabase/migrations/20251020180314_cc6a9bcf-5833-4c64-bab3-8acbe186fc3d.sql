-- ============================================
-- CORREÇÃO EMERGENCIAL: Desativar trigger problemático
-- ============================================

-- 1. Desativar trigger temporariamente
ALTER TABLE tarefa DISABLE TRIGGER trg_gerar_receita_tarefa;

-- 2. Atribuir responsáveis às tarefas órfãs
DO $$
DECLARE
  v_grs_id UUID;
BEGIN
  SELECT profile_id INTO v_grs_id
  FROM pessoas
  WHERE 'grs' = ANY(papeis) AND status = 'aprovado'
  LIMIT 1;

  UPDATE tarefa
  SET responsavel_id = v_grs_id, executor_id = v_grs_id
  WHERE responsavel_id IS NULL AND v_grs_id IS NOT NULL;
  
  RAISE NOTICE 'Tarefas órfãs corrigidas';
END $$;

-- 3. Atribuir GRS aos projetos órfãos
DO $$
DECLARE
  v_grs_id UUID;
BEGIN
  SELECT profile_id INTO v_grs_id
  FROM pessoas
  WHERE 'grs' = ANY(papeis) AND status = 'aprovado'
  LIMIT 1;

  UPDATE projetos
  SET responsavel_grs_id = v_grs_id
  WHERE responsavel_grs_id IS NULL AND v_grs_id IS NOT NULL;
  
  RAISE NOTICE 'Projetos órfãos corrigidos';
END $$;

-- 4. Atribuir responsáveis aos eventos órfãos
DO $$
DECLARE
  v_grs_id UUID;
BEGIN
  SELECT profile_id INTO v_grs_id
  FROM pessoas
  WHERE 'grs' = ANY(papeis) AND status = 'aprovado'
  LIMIT 1;

  UPDATE eventos_calendario
  SET responsavel_id = v_grs_id
  WHERE responsavel_id IS NULL AND v_grs_id IS NOT NULL;
  
  RAISE NOTICE 'Eventos órfãos corrigidos';
END $$;

-- 5. Reativar trigger
ALTER TABLE tarefa ENABLE TRIGGER trg_gerar_receita_tarefa;