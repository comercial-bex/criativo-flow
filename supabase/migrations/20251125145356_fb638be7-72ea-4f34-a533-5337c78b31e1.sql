-- =====================================================
-- FIX: Corrigir Constraints CHECK - Posts Planejamento
-- =====================================================
-- Problema: Constraints muito restritivas impedindo migração de posts temporários
-- Solução: Expandir valores aceitos para tipo_criativo e formato_postagem

-- 1. Remover constraints antigas
ALTER TABLE posts_planejamento 
DROP CONSTRAINT IF EXISTS posts_planejamento_tipo_criativo_check;

ALTER TABLE posts_planejamento 
DROP CONSTRAINT IF EXISTS posts_planejamento_formato_postagem_check;

-- 2. Adicionar novas constraints flexíveis
ALTER TABLE posts_planejamento 
ADD CONSTRAINT posts_planejamento_tipo_criativo_check 
CHECK (tipo_criativo = ANY (ARRAY[
  'post',
  'carrossel', 
  'stories',
  'story',
  'reel',
  'reels',
  'foto',
  'video',
  'infografico',
  'imagem',
  'arte'
]::text[]));

ALTER TABLE posts_planejamento 
ADD CONSTRAINT posts_planejamento_formato_postagem_check 
CHECK (formato_postagem = ANY (ARRAY[
  'post',
  'story',
  'stories', 
  'carrossel',
  'reel',
  'reels',
  'feed',
  'igtv'
]::text[]));

-- 3. Criar índices para performance (se não existirem)
CREATE INDEX IF NOT EXISTS idx_posts_planejamento_tipo_criativo 
ON posts_planejamento(tipo_criativo);

CREATE INDEX IF NOT EXISTS idx_posts_planejamento_formato 
ON posts_planejamento(formato_postagem);

COMMENT ON CONSTRAINT posts_planejamento_tipo_criativo_check ON posts_planejamento IS 
'Permite múltiplos tipos de criativos: post, carrossel, stories, foto, video, infografico, etc';

COMMENT ON CONSTRAINT posts_planejamento_formato_postagem_check ON posts_planejamento IS 
'Permite múltiplos formatos: post, story, stories, carrossel, reel, feed, igtv';