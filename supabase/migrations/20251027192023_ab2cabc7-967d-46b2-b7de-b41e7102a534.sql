-- Sprint 1 Migration 01 FINAL: Fix tasks without executor
-- Desabilitar apenas triggers customizados (não system triggers)

-- 1. Listar e desabilitar triggers customizados
DO $$
DECLARE
  trigger_rec record;
BEGIN
  FOR trigger_rec IN 
    SELECT tgname 
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    WHERE c.relname = 'tarefa'
      AND NOT tgisinternal
  LOOP
    EXECUTE format('ALTER TABLE tarefa DISABLE TRIGGER %I', trigger_rec.tgname);
    RAISE NOTICE 'Trigger desabilitado: %', trigger_rec.tgname;
  END LOOP;
END $$;

-- 2. Corrigir tarefas sem responsável_id
UPDATE tarefa t
SET responsavel_id = COALESCE(
  t.responsavel_id,
  (SELECT responsavel_id FROM projetos WHERE id = t.projeto_id),
  (SELECT responsavel_id FROM clientes WHERE id = t.cliente_id)
)
WHERE responsavel_id IS NULL;

-- 3. Atribuir executor para tarefas pendentes sem executor
UPDATE tarefa t
SET executor_id = COALESCE(
  (SELECT responsavel_id FROM projetos WHERE id = t.projeto_id),
  (SELECT responsavel_id FROM clientes WHERE id = t.cliente_id),
  t.responsavel_id
)
WHERE executor_id IS NULL 
  AND status NOT IN ('concluido', 'cancelado');

-- 4. Reabilitar triggers customizados
DO $$
DECLARE
  trigger_rec record;
BEGIN
  FOR trigger_rec IN 
    SELECT tgname 
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    WHERE c.relname = 'tarefa'
      AND NOT tgisinternal
  LOOP
    EXECUTE format('ALTER TABLE tarefa ENABLE TRIGGER %I', trigger_rec.tgname);
    RAISE NOTICE 'Trigger reabilitado: %', trigger_rec.tgname;
  END LOOP;
END $$;

-- 5. Melhorar função de auto-atribuição
CREATE OR REPLACE FUNCTION fn_auto_assign_executor()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.executor_id IS NULL THEN
    NEW.executor_id := COALESCE(
      (SELECT responsavel_id FROM projetos WHERE id = NEW.projeto_id),
      (SELECT responsavel_id FROM clientes WHERE id = NEW.cliente_id),
      NEW.responsavel_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_auto_assign_executor ON tarefa;
CREATE TRIGGER trg_auto_assign_executor
  BEFORE INSERT OR UPDATE ON tarefa
  FOR EACH ROW
  WHEN (NEW.executor_id IS NULL AND NEW.status NOT IN ('concluido', 'cancelado'))
  EXECUTE FUNCTION fn_auto_assign_executor();