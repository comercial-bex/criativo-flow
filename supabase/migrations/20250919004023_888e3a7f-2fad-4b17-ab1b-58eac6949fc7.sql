-- Adicionar campos para conteúdo diferenciado na tabela posts_gerados_temp
ALTER TABLE public.posts_gerados_temp 
ADD COLUMN IF NOT EXISTS headline TEXT,
ADD COLUMN IF NOT EXISTS conteudo_completo TEXT;

-- Adicionar campos para conteúdo diferenciado na tabela posts_planejamento
ALTER TABLE public.posts_planejamento 
ADD COLUMN IF NOT EXISTS headline TEXT,
ADD COLUMN IF NOT EXISTS conteudo_completo TEXT;