-- Adicionar campo status_aprovacao_cliente em posts_planejamento
ALTER TABLE posts_planejamento 
ADD COLUMN IF NOT EXISTS status_aprovacao_cliente text 
CHECK (status_aprovacao_cliente IN ('pendente', 'aprovado', 'reprovado', 'revisao'));

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_posts_status_aprovacao 
ON posts_planejamento(status_aprovacao_cliente);

-- Comentário
COMMENT ON COLUMN posts_planejamento.status_aprovacao_cliente IS 'Status da aprovação do cliente para este post';