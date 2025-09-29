-- Create table for CNPJ consultation metadata
CREATE TABLE public.cnpj_consultas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cnpj TEXT NOT NULL,
  dados_receita_ws JSONB,
  dados_brasil_api JSONB,
  fonte_utilizada TEXT NOT NULL CHECK (fonte_utilizada IN ('receitaws', 'brasilapi', 'hibrida')),
  data_consulta TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  situacao_cadastral TEXT,
  data_situacao DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add new columns to clientes table
ALTER TABLE public.clientes 
ADD COLUMN razao_social TEXT,
ADD COLUMN nome_fantasia TEXT,
ADD COLUMN situacao_cadastral TEXT,
ADD COLUMN cnae_principal TEXT,
ADD COLUMN cnpj_fonte TEXT,
ADD COLUMN cnpj_ultima_consulta TIMESTAMP WITH TIME ZONE;

-- Enable RLS on cnpj_consultas table
ALTER TABLE public.cnpj_consultas ENABLE ROW LEVEL SECURITY;

-- Create policies for cnpj_consultas
CREATE POLICY "Usuários autenticados podem ver consultas CNPJ" 
ON public.cnpj_consultas 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Sistema pode criar consultas CNPJ" 
ON public.cnpj_consultas 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create index for performance
CREATE INDEX idx_cnpj_consultas_cnpj ON public.cnpj_consultas(cnpj);
CREATE INDEX idx_cnpj_consultas_data ON public.cnpj_consultas(data_consulta DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_cnpj_consultas_updated_at
BEFORE UPDATE ON public.cnpj_consultas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();