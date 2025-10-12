-- Adicionar campos para análise de links sociais
ALTER TABLE roteiros 
ADD COLUMN IF NOT EXISTS referencias_analisadas JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS insights_visuais TEXT;

-- Índice para busca eficiente
CREATE INDEX IF NOT EXISTS idx_roteiros_referencias_analisadas 
ON roteiros USING GIN (referencias_analisadas);

-- Comentários para documentação
COMMENT ON COLUMN roteiros.referencias_analisadas IS 'Array de objetos com análise detalhada de cada link (plataforma, url, título, descrição, thumbnail, métricas estimadas)';
COMMENT ON COLUMN roteiros.insights_visuais IS 'Insights consolidados extraídos das referências para uso na geração do roteiro';