-- Criar tabela para armazenar objetivos dos clientes
CREATE TABLE public.cliente_objetivos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL,
  objetivos JSONB NOT NULL DEFAULT '{}',
  analise_swot JSONB,
  analise_estrategica TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cliente_objetivos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Usuários autenticados podem ver objetivos" 
ON public.cliente_objetivos 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem criar objetivos" 
ON public.cliente_objetivos 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem atualizar objetivos" 
ON public.cliente_objetivos 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_cliente_objetivos_updated_at
BEFORE UPDATE ON public.cliente_objetivos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar coluna de assinatura_id na tabela cliente_onboarding se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cliente_onboarding' 
                   AND column_name = 'assinatura_id') THEN
        ALTER TABLE public.cliente_onboarding 
        ADD COLUMN assinatura_id UUID;
    END IF;
END $$;