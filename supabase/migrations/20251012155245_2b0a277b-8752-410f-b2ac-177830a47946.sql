-- Adicionar colunas para rastreamento de horas na tabela tarefa
ALTER TABLE tarefa 
ADD COLUMN IF NOT EXISTS horas_estimadas INTEGER NULL,
ADD COLUMN IF NOT EXISTS horas_trabalhadas INTEGER DEFAULT 0;

-- Comentários para documentação
COMMENT ON COLUMN tarefa.horas_estimadas IS 'Horas estimadas para conclusão da tarefa';
COMMENT ON COLUMN tarefa.horas_trabalhadas IS 'Horas efetivamente trabalhadas na tarefa';

-- Refresh do schema cache do PostgREST
NOTIFY pgrst, 'reload schema';