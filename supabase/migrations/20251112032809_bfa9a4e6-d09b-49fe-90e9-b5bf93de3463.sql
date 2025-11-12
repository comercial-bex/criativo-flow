-- Adicionar colunas para templates de campanhas
ALTER TABLE planejamento_campanhas 
ADD COLUMN IF NOT EXISTS template_id TEXT,
ADD COLUMN IF NOT EXISTS estrutura_posts_sugerida JSONB;

-- Índice para buscar campanhas por template
CREATE INDEX IF NOT EXISTS idx_planejamento_campanhas_template 
ON planejamento_campanhas(template_id);

-- Comentários
COMMENT ON COLUMN planejamento_campanhas.template_id IS 'ID do template de campanha usado (se aplicável)';
COMMENT ON COLUMN planejamento_campanhas.estrutura_posts_sugerida IS 'Estrutura de posts sugerida pelo template (pré, durante, pós campanha)';