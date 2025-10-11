-- Adicionar coluna tipo_projeto à tabela projetos
ALTER TABLE public.projetos 
ADD COLUMN IF NOT EXISTS tipo_projeto TEXT DEFAULT 'plano_editorial' 
CHECK (tipo_projeto IN ('plano_editorial', 'avulso', 'campanha'));

-- Adicionar índice para performance
CREATE INDEX IF NOT EXISTS idx_projetos_tipo ON public.projetos(tipo_projeto);

-- Comentar coluna para documentação
COMMENT ON COLUMN public.projetos.tipo_projeto IS 
'Tipo do projeto: plano_editorial (vinculado a planos 90/190/360), avulso (job pontual), campanha (ação publicitária)';

-- Atualizar projetos existentes para serem do tipo plano_editorial
UPDATE public.projetos 
SET tipo_projeto = 'plano_editorial' 
WHERE tipo_projeto IS NULL;