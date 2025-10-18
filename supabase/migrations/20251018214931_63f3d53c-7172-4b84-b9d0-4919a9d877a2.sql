-- ============================================
-- SPRINT 1B DIA 1 - SAFE VIEW + FK FIX
-- ============================================

-- 0) Begin: Drop FK constraints temporarily to avoid violations during cleanup
ALTER TABLE tarefa DROP CONSTRAINT IF EXISTS fk_tarefa_responsavel_pessoas;
ALTER TABLE tarefa DROP CONSTRAINT IF EXISTS fk_tarefa_executor_pessoas;
ALTER TABLE eventos_calendario DROP CONSTRAINT IF EXISTS fk_eventos_responsavel_pessoas;
ALTER TABLE projetos DROP CONSTRAINT IF EXISTS fk_projetos_grs_pessoas;

-- 1) Merge duplicates in pessoas by profile_id
DO $$
DECLARE
  v_dup RECORD;
  v_main UUID;
  v_dups UUID[];
BEGIN
  FOR v_dup IN 
    SELECT profile_id, array_agg(id ORDER BY created_at DESC) AS ids
    FROM pessoas
    WHERE profile_id IS NOT NULL
    GROUP BY profile_id
    HAVING COUNT(*) > 1
  LOOP
    v_main := v_dup.ids[1];
    v_dups := v_dup.ids[2:array_length(v_dup.ids, 1)];

    UPDATE pessoas p1
    SET 
      papeis = ARRAY(SELECT DISTINCT unnest(p1.papeis || COALESCE(p2.papeis, '{}'))),
      telefones = ARRAY(SELECT DISTINCT unnest(COALESCE(p1.telefones, '{}') || COALESCE(p2.telefones, '{}'))),
      observacoes = COALESCE(p1.observacoes, '') || CASE WHEN p2.observacoes IS NOT NULL THEN E'\n---\nMerge: ' || p2.observacoes ELSE '' END,
      updated_at = NOW()
    FROM pessoas p2
    WHERE p1.id = v_main AND p2.id = ANY(v_dups);

    DELETE FROM pessoas WHERE id = ANY(v_dups);
  END LOOP;
END $$;

-- 2) Remove pessoas whose profile_id no longer exists in auth.users
DELETE FROM pessoas 
WHERE profile_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM auth.users WHERE id = pessoas.profile_id);

-- 3) Ensure unique(profile_id)
ALTER TABLE pessoas DROP CONSTRAINT IF EXISTS unique_profile_id;
ALTER TABLE pessoas ADD CONSTRAINT unique_profile_id UNIQUE(profile_id);

-- 4) Swap profiles table for a compatibility view
--    Keep original data just in case
ALTER TABLE IF EXISTS profiles RENAME TO profiles_deprecated;

-- Create compatibility view that preserves cliente_id via cliente_usuarios
CREATE VIEW profiles AS
SELECT 
  p.profile_id AS id,
  p.nome,
  p.email,
  p.telefones[1] AS telefone,
  p.cpf,
  CASE 
    WHEN 'grs' = ANY(p.papeis) THEN 'grs'
    WHEN 'designer' = ANY(p.papeis) THEN 'design'
    WHEN 'filmmaker' = ANY(p.papeis) THEN 'audiovisual'
    WHEN 'atendimento' = ANY(p.papeis) THEN 'atendimento'
    WHEN 'financeiro' = ANY(p.papeis) THEN 'financeiro'
    WHEN 'gestor' = ANY(p.papeis) THEN 'gestor'
    WHEN 'rh' = ANY(p.papeis) THEN 'rh'
    ELSE NULL
  END::text AS especialidade,
  p.status,
  p.created_at,
  p.updated_at,
  NULL::text AS avatar_url,
  cu.cliente_id,
  p.observacoes AS observacoes_aprovacao,
  NULL::uuid AS aprovado_por,
  NULL::timestamptz AS data_aprovacao
FROM pessoas p
LEFT JOIN LATERAL (
  SELECT cux.cliente_id
  FROM cliente_usuarios cux
  WHERE cux.user_id = p.profile_id AND cux.ativo = true
  ORDER BY cux.created_at DESC
  LIMIT 1
) cu ON TRUE
WHERE p.profile_id IS NOT NULL;

COMMENT ON VIEW profiles IS 'Compat: mapeia pessoas → perfis com cliente_id via cliente_usuarios';

-- 5) Null-out invalid references before reassignment
UPDATE tarefa 
SET responsavel_id = NULL 
WHERE responsavel_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM pessoas WHERE profile_id = tarefa.responsavel_id);

UPDATE tarefa 
SET executor_id = NULL 
WHERE executor_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM pessoas WHERE profile_id = tarefa.executor_id);

UPDATE eventos_calendario 
SET responsavel_id = NULL 
WHERE responsavel_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM pessoas WHERE profile_id = eventos_calendario.responsavel_id);

UPDATE projetos 
SET responsavel_grs_id = NULL 
WHERE responsavel_grs_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM pessoas WHERE profile_id = projetos.responsavel_grs_id);

-- 6) Reassign valid owners where possible (safe mapping)
-- Responsável de tarefa (fallback GRS)
UPDATE tarefa 
SET responsavel_id = (
  SELECT profile_id FROM pessoas 
  WHERE 'grs' = ANY(papeis)
  ORDER BY created_at ASC
  LIMIT 1
)
WHERE responsavel_id IS NULL;

-- Executor por área: only handle known enums to avoid cast errors
UPDATE tarefa t
SET executor_id = (
  SELECT p.profile_id FROM pessoas p
  WHERE (
    (t.executor_area = 'Audiovisual' AND 'filmmaker' = ANY(p.papeis))
    OR (t.executor_area = 'Criativo' AND 'designer' = ANY(p.papeis))
  )
  AND p.profile_id IS NOT NULL
  ORDER BY random()
  LIMIT 1
)
WHERE executor_id IS NULL
  AND t.executor_area IN ('Audiovisual','Criativo');

-- Eventos: responsável GRS
UPDATE eventos_calendario 
SET responsavel_id = (
  SELECT profile_id FROM pessoas 
  WHERE 'grs' = ANY(papeis) 
  ORDER BY created_at ASC 
  LIMIT 1
)
WHERE responsavel_id IS NULL;

-- Projetos: GRS responsável
UPDATE projetos 
SET responsavel_grs_id = (
  SELECT profile_id FROM pessoas 
  WHERE 'grs' = ANY(papeis) 
  ORDER BY created_at ASC 
  LIMIT 1
)
WHERE responsavel_grs_id IS NULL;

-- 7) Recreate FK constraints with ON DELETE SET NULL
ALTER TABLE tarefa ADD CONSTRAINT fk_tarefa_responsavel_pessoas FOREIGN KEY (responsavel_id) REFERENCES pessoas(profile_id) ON DELETE SET NULL;
ALTER TABLE tarefa ADD CONSTRAINT fk_tarefa_executor_pessoas   FOREIGN KEY (executor_id)   REFERENCES pessoas(profile_id) ON DELETE SET NULL;
ALTER TABLE eventos_calendario ADD CONSTRAINT fk_eventos_responsavel_pessoas FOREIGN KEY (responsavel_id) REFERENCES pessoas(profile_id) ON DELETE SET NULL;
ALTER TABLE projetos ADD CONSTRAINT fk_projetos_grs_pessoas FOREIGN KEY (responsavel_grs_id) REFERENCES pessoas(profile_id) ON DELETE SET NULL;

-- 8) Indexes
CREATE INDEX IF NOT EXISTS idx_pessoas_profile_id ON pessoas(profile_id) WHERE profile_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pessoas_papeis     ON pessoas USING GIN(papeis);

-- 9) Validation + health log
DO $$
DECLARE v_d INT; v_o INT; v_t INT; v_e INT; v_p INT; BEGIN
  SELECT COUNT(*) INTO v_d FROM (SELECT profile_id FROM pessoas WHERE profile_id IS NOT NULL GROUP BY profile_id HAVING COUNT(*) > 1) s;
  SELECT COUNT(*) INTO v_o FROM pessoas WHERE profile_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM auth.users WHERE id = pessoas.profile_id);
  SELECT COUNT(*) INTO v_t FROM tarefa WHERE responsavel_id IS NULL;
  SELECT COUNT(*) INTO v_e FROM eventos_calendario WHERE responsavel_id IS NULL;
  SELECT COUNT(*) INTO v_p FROM projetos WHERE responsavel_grs_id IS NULL;
  RAISE NOTICE '✅ DIA 1 OK: dups=%, órfãos=%, tarefas=%, eventos=%, projetos=%', v_d, v_o, v_t, v_e, v_p;
  INSERT INTO system_health_logs (check_type, status, details)
  VALUES ('sprint1b_dia1', CASE WHEN v_d = 0 AND v_o = 0 THEN 'ok' ELSE 'warning' END, jsonb_build_object('dups', v_d, 'orfs', v_o, 'tarefas', v_t, 'eventos', v_e, 'projetos', v_p, 'ts', NOW()));
END $$;