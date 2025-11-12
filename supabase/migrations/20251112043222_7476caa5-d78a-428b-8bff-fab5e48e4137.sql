-- Adicionar coluna ordem na tabela posts_planejamento
ALTER TABLE posts_planejamento 
ADD COLUMN IF NOT EXISTS ordem INTEGER DEFAULT 0;

-- Atualizar ordens existentes com base na data de postagem
UPDATE posts_planejamento 
SET ordem = subquery.row_number 
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY planejamento_id ORDER BY data_postagem, created_at) - 1 as row_number
  FROM posts_planejamento
) subquery
WHERE posts_planejamento.id = subquery.id;