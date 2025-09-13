-- Create table for conteudo_editorial
CREATE TABLE public.conteudo_editorial (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  planejamento_id UUID NOT NULL,
  missao TEXT,
  posicionamento TEXT,
  persona TEXT,
  conteudo_gerado TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.conteudo_editorial ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Usuários autenticados podem ver conteúdo editorial" 
ON public.conteudo_editorial 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem criar conteúdo editorial" 
ON public.conteudo_editorial 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem atualizar conteúdo editorial" 
ON public.conteudo_editorial 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_conteudo_editorial_updated_at
BEFORE UPDATE ON public.conteudo_editorial
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create edge function for content generation
CREATE OR REPLACE FUNCTION public.generate_content_with_openai(prompt_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function will be called by the edge function
  -- It's a placeholder for now
  RETURN 'Content generated successfully';
END;
$$;