-- Adicionar coluna observacoes na tabela tarefa para registrar histórico de mudanças
ALTER TABLE tarefa ADD COLUMN IF NOT EXISTS observacoes text;

-- Adicionar comentário para documentação
COMMENT ON COLUMN tarefa.observacoes IS 'Observações e notas sobre mudanças de status da tarefa';