-- Adicionar coluna labels na tabela tarefa
ALTER TABLE tarefa 
ADD COLUMN IF NOT EXISTS labels JSONB DEFAULT '[]'::jsonb;

-- Índice para busca por labels (usando GIN para JSONB)
CREATE INDEX IF NOT EXISTS idx_tarefa_labels ON tarefa USING gin(labels);