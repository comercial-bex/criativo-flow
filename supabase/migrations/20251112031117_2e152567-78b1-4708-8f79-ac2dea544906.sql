-- Adicionar campo campanha_id na tabela posts_planejamento
ALTER TABLE posts_planejamento 
ADD COLUMN IF NOT EXISTS campanha_id UUID REFERENCES planejamento_campanhas(id) ON DELETE SET NULL;

-- Adicionar campo periodo_campanha para identificar em qual fase do funil o post está
ALTER TABLE posts_planejamento
ADD COLUMN IF NOT EXISTS periodo_campanha TEXT CHECK (periodo_campanha IN ('pre', 'durante', 'pos', 'normal'));

-- Criar índice para consultas mais rápidas
CREATE INDEX IF NOT EXISTS idx_posts_campanha ON posts_planejamento(campanha_id);
CREATE INDEX IF NOT EXISTS idx_posts_periodo ON posts_planejamento(periodo_campanha);

-- Adicionar campo na tabela de posts temporários também
ALTER TABLE posts_gerados_temp
ADD COLUMN IF NOT EXISTS campanha_id UUID;

ALTER TABLE posts_gerados_temp
ADD COLUMN IF NOT EXISTS periodo_campanha TEXT;