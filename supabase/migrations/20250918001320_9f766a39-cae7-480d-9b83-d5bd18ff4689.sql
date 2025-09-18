-- Corrigir constraint do tipo_criativo para aceitar os valores corretos
ALTER TABLE public.posts_planejamento 
DROP CONSTRAINT IF EXISTS posts_planejamento_tipo_criativo_check;

ALTER TABLE public.posts_planejamento 
ADD CONSTRAINT posts_planejamento_tipo_criativo_check 
CHECK (tipo_criativo IN ('post', 'carrossel', 'stories'));

-- Adicionar novos campos para conteúdo completo gerado pela IA
ALTER TABLE public.posts_planejamento 
ADD COLUMN IF NOT EXISTS legenda TEXT,
ADD COLUMN IF NOT EXISTS componente_hesec TEXT,
ADD COLUMN IF NOT EXISTS persona_alvo TEXT,
ADD COLUMN IF NOT EXISTS call_to_action TEXT,
ADD COLUMN IF NOT EXISTS hashtags TEXT[],
ADD COLUMN IF NOT EXISTS contexto_estrategico TEXT;