-- Adicionar coluna avatar_url na tabela pessoas
ALTER TABLE pessoas 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_pessoas_avatar_url ON pessoas(avatar_url);

-- Comentário para documentação
COMMENT ON COLUMN pessoas.avatar_url IS 'URL do avatar do usuário - migrado de profiles';