-- Fase 1: Correção do Schema da tabela projetos

-- 1. Renomear coluna nome → titulo
ALTER TABLE public.projetos RENAME COLUMN nome TO titulo;

-- 2. Adicionar colunas faltantes que existem no código
ALTER TABLE public.projetos 
ADD COLUMN IF NOT EXISTS prioridade TEXT DEFAULT 'media',
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS responsavel_grs_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS responsavel_atendimento_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS orcamento_estimado NUMERIC,
ADD COLUMN IF NOT EXISTS progresso INTEGER DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
ADD COLUMN IF NOT EXISTS data_prazo DATE;

-- 3. Adicionar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_projetos_cliente_id ON public.projetos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_projetos_status ON public.projetos(status);
CREATE INDEX IF NOT EXISTS idx_projetos_responsavel_grs ON public.projetos(responsavel_grs_id);

-- 4. Adicionar comentários para documentação
COMMENT ON COLUMN public.projetos.titulo IS 'Título do projeto';
COMMENT ON COLUMN public.projetos.prioridade IS 'Prioridade do projeto: baixa, media, alta, urgente';
COMMENT ON COLUMN public.projetos.progresso IS 'Percentual de progresso do projeto (0-100)';
COMMENT ON COLUMN public.projetos.orcamento_estimado IS 'Orçamento estimado do projeto em reais';