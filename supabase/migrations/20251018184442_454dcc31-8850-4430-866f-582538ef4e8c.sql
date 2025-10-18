-- =============================================
-- FASE 2.5: CORREÇÃO CRÍTICA (v4 - Final)
-- Corrigido: limpar dados órfãos antes das FKs
-- =============================================

-- ===========================================
-- ETAPA 0: LIMPAR DADOS ÓRFÃOS
-- ===========================================

-- Limpar tarefas órfãs (sem pessoa correspondente)
UPDATE tarefa SET responsavel_id = NULL
WHERE responsavel_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM pessoas WHERE id = tarefa.responsavel_id);

UPDATE tarefa SET executor_id = NULL
WHERE executor_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM pessoas WHERE id = tarefa.executor_id);

-- Limpar eventos órfãos
UPDATE eventos_calendario SET responsavel_id = NULL
WHERE responsavel_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM pessoas WHERE id = eventos_calendario.responsavel_id);

-- Limpar clientes órfãos
UPDATE clientes SET responsavel_id = NULL
WHERE responsavel_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM pessoas WHERE id = clientes.responsavel_id);

-- ===========================================
-- ETAPA 1: LIMPAR ESTADO INCONSISTENTE
-- ===========================================

TRUNCATE pessoa_papeis CASCADE;

INSERT INTO pessoa_papeis (pessoa_id, papel, ativo, data_inicio)
SELECT 
  p.id,
  unnest(p.papeis) as papel,
  true,
  COALESCE(p.data_admissao, p.created_at::date)
FROM pessoas p
WHERE p.papeis IS NOT NULL AND array_length(p.papeis, 1) > 0;

INSERT INTO user_roles (user_id, role)
SELECT DISTINCT
  pp.pessoa_id,
  CASE pp.papel
    WHEN 'grs' THEN 'grs'::user_role
    WHEN 'designer' THEN 'designer'::user_role
    WHEN 'filmmaker' THEN 'filmmaker'::user_role
    WHEN 'audiovisual' THEN 'filmmaker'::user_role
    WHEN 'atendimento' THEN 'atendimento'::user_role
    WHEN 'financeiro' THEN 'financeiro'::user_role
    WHEN 'gestor' THEN 'gestor'::user_role
    WHEN 'admin' THEN 'admin'::user_role
    WHEN 'rh' THEN 'rh'::user_role
    ELSE 'cliente'::user_role
  END
FROM pessoa_papeis pp
WHERE pp.ativo = true
  AND EXISTS (SELECT 1 FROM auth.users au WHERE au.id = pp.pessoa_id)
ON CONFLICT (user_id, role) DO NOTHING;

-- ===========================================
-- ETAPA 2: CONSTRAINTS
-- ===========================================

ALTER TABLE pessoas DROP CONSTRAINT IF EXISTS pessoas_papeis_validos;
ALTER TABLE pessoas ADD CONSTRAINT pessoas_papeis_validos CHECK (
  papeis <@ ARRAY['admin', 'gestor', 'grs', 'designer', 'filmmaker', 'audiovisual',
    'atendimento', 'financeiro', 'rh', 'colaborador', 'cliente', 'especialista']::text[]
);

ALTER TABLE pessoas ALTER COLUMN papeis SET DEFAULT '{"cliente"}';

ALTER TABLE pessoas DROP CONSTRAINT IF EXISTS pessoas_papeis_nao_vazio;
ALTER TABLE pessoas ADD CONSTRAINT pessoas_papeis_nao_vazio CHECK (array_length(papeis, 1) > 0);

-- ===========================================
-- ETAPA 3: FOREIGN KEYS
-- ===========================================

ALTER TABLE pessoa_papeis DROP CONSTRAINT IF EXISTS fk_pessoa_papeis_pessoa;
ALTER TABLE pessoa_papeis ADD CONSTRAINT fk_pessoa_papeis_pessoa
FOREIGN KEY (pessoa_id) REFERENCES pessoas(id) ON DELETE CASCADE;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'rh_cargos') THEN
    ALTER TABLE pessoas DROP CONSTRAINT IF EXISTS fk_pessoas_cargo;
    ALTER TABLE pessoas ADD CONSTRAINT fk_pessoas_cargo
    FOREIGN KEY (cargo_id) REFERENCES rh_cargos(id) ON DELETE SET NULL;
  END IF;
END $$;

ALTER TABLE tarefa DROP CONSTRAINT IF EXISTS fk_tarefa_responsavel_pessoas;
ALTER TABLE tarefa DROP CONSTRAINT IF EXISTS fk_tarefa_executor_pessoas;
ALTER TABLE eventos_calendario DROP CONSTRAINT IF EXISTS fk_eventos_responsavel_pessoas;
ALTER TABLE clientes DROP CONSTRAINT IF EXISTS fk_clientes_responsavel_pessoas;

ALTER TABLE tarefa ADD CONSTRAINT fk_tarefa_responsavel_pessoas
FOREIGN KEY (responsavel_id) REFERENCES pessoas(id) ON DELETE SET NULL;

ALTER TABLE tarefa ADD CONSTRAINT fk_tarefa_executor_pessoas
FOREIGN KEY (executor_id) REFERENCES pessoas(id) ON DELETE SET NULL;

ALTER TABLE eventos_calendario ADD CONSTRAINT fk_eventos_responsavel_pessoas
FOREIGN KEY (responsavel_id) REFERENCES pessoas(id) ON DELETE SET NULL;

ALTER TABLE clientes ADD CONSTRAINT fk_clientes_responsavel_pessoas
FOREIGN KEY (responsavel_id) REFERENCES pessoas(id) ON DELETE SET NULL;

-- ===========================================
-- ETAPA 4: TRIGGER
-- ===========================================

CREATE OR REPLACE FUNCTION fn_sync_pessoa_papeis()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_papel text; v_role user_role; v_user_exists boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.id) INTO v_user_exists;
  IF NOT v_user_exists THEN RETURN NEW; END IF;
  
  UPDATE pessoa_papeis SET ativo = false, data_fim = CURRENT_DATE
  WHERE pessoa_id = NEW.id AND ativo = true;
  
  FOREACH v_papel IN ARRAY NEW.papeis LOOP
    INSERT INTO pessoa_papeis (pessoa_id, papel, ativo, data_inicio)
    VALUES (NEW.id, v_papel, true, CURRENT_DATE) ON CONFLICT DO NOTHING;
    
    v_role := CASE v_papel
      WHEN 'grs' THEN 'grs'::user_role WHEN 'designer' THEN 'designer'::user_role
      WHEN 'filmmaker' THEN 'filmmaker'::user_role WHEN 'audiovisual' THEN 'filmmaker'::user_role
      WHEN 'atendimento' THEN 'atendimento'::user_role WHEN 'financeiro' THEN 'financeiro'::user_role
      WHEN 'gestor' THEN 'gestor'::user_role WHEN 'admin' THEN 'admin'::user_role
      WHEN 'rh' THEN 'rh'::user_role ELSE 'cliente'::user_role
    END;
    
    INSERT INTO user_roles (user_id, role) VALUES (NEW.id, v_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END LOOP;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_sync_pessoa_papeis ON pessoas;
CREATE TRIGGER trg_sync_pessoa_papeis AFTER INSERT OR UPDATE OF papeis ON pessoas
FOR EACH ROW EXECUTE FUNCTION fn_sync_pessoa_papeis();

-- ===========================================
-- ETAPA 5: VIEW DE MONITORAMENTO
-- ===========================================

CREATE OR REPLACE VIEW vw_health_check_pessoas AS
SELECT 'Pessoas cadastradas' as metrica, COUNT(*)::text as valor, 'info' as severidade FROM pessoas
UNION ALL
SELECT 'Pessoas sem papéis', COUNT(*)::text, CASE WHEN COUNT(*) > 0 THEN 'error' ELSE 'ok' END
FROM pessoas WHERE papeis IS NULL OR array_length(papeis, 1) = 0
UNION ALL
SELECT 'Pessoas sem CPF', COUNT(*)::text, CASE WHEN COUNT(*) > 0 THEN 'warning' ELSE 'ok' END
FROM pessoas WHERE cpf IS NULL OR cpf = ''
UNION ALL
SELECT 'Pessoas sem usuário auth', COUNT(*)::text, CASE WHEN COUNT(*) > 0 THEN 'warning' ELSE 'ok' END
FROM pessoas p WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = p.id)
UNION ALL
SELECT 'FKs presentes', COUNT(*)::text, 'info'
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY' AND table_name IN ('pessoas', 'pessoa_papeis');