-- Adicionar campo de valor personalizado para assinaturas
ALTER TABLE public.clientes 
ADD COLUMN valor_personalizado DECIMAL(10,2);

-- Comentário descritivo
COMMENT ON COLUMN public.clientes.valor_personalizado IS 
  'Valor customizado da assinatura para este cliente específico. Se NULL, usa o valor padrão do plano.';

-- Criar índice para consultas
CREATE INDEX idx_clientes_valor_personalizado 
ON public.clientes(valor_personalizado) 
WHERE valor_personalizado IS NOT NULL;