-- Adicionar nova coluna para tipo de postagem
ALTER TABLE public.posts_planejamento 
ADD COLUMN formato_postagem TEXT NOT NULL DEFAULT 'post' CHECK (formato_postagem IN ('post', 'story', 'carrossel', 'reel'));

-- Adicionar comentário para documentar a coluna
COMMENT ON COLUMN public.posts_planejamento.formato_postagem IS 'Formato da postagem: post, story, carrossel ou reel';