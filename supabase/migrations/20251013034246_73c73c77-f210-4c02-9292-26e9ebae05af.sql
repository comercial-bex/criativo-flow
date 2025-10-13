-- Adicionar coluna metadata à tabela notificacoes
ALTER TABLE notificacoes 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Criar índice GIN para melhorar performance de buscas em metadata
CREATE INDEX IF NOT EXISTS idx_notificacoes_metadata 
ON notificacoes USING gin(metadata);