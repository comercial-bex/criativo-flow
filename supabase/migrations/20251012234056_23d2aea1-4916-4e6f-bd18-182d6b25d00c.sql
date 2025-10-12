-- Adicionar campos checklist e checklist_progress na tabela tarefa
ALTER TABLE tarefa 
ADD COLUMN IF NOT EXISTS checklist JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS checklist_progress INTEGER DEFAULT 0;

-- Adicionar comentário explicativo
COMMENT ON COLUMN tarefa.checklist IS 'Array de items do checklist: [{id, text, completed, ordem}]';
COMMENT ON COLUMN tarefa.checklist_progress IS 'Porcentagem de progresso do checklist (0-100)';