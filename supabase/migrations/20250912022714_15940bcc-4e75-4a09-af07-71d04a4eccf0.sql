-- Adicionar campo assinatura_id na tabela clientes
ALTER TABLE public.clientes 
ADD COLUMN assinatura_id uuid;

-- Adicionar índice para melhor performance
CREATE INDEX idx_clientes_assinatura_id ON public.clientes(assinatura_id);