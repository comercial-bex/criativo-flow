-- Migration 03: Add CASCADE to evento_pai_id and tarefa_id
-- Prevenir eventos órfãos no futuro com CASCADE delete

-- 1. Atualizar foreign key evento_pai_id para CASCADE
ALTER TABLE eventos_calendario
  DROP CONSTRAINT IF EXISTS eventos_calendario_evento_pai_id_fkey;

ALTER TABLE eventos_calendario
  ADD CONSTRAINT eventos_calendario_evento_pai_id_fkey
  FOREIGN KEY (evento_pai_id)
  REFERENCES eventos_calendario(id)
  ON DELETE CASCADE;

-- 2. Atualizar foreign key tarefa_id para CASCADE
ALTER TABLE eventos_calendario
  DROP CONSTRAINT IF EXISTS eventos_calendario_tarefa_id_fkey;

ALTER TABLE eventos_calendario
  ADD CONSTRAINT eventos_calendario_tarefa_id_fkey
  FOREIGN KEY (tarefa_id)
  REFERENCES tarefa(id)
  ON DELETE CASCADE;