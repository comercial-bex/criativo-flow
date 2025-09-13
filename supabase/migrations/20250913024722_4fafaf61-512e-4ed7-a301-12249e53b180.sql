-- Criar tabela para posts do planejamento
CREATE TABLE public.posts_planejamento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  planejamento_id UUID NOT NULL REFERENCES public.planejamentos(id) ON DELETE CASCADE,
  data_postagem DATE NOT NULL,
  titulo TEXT NOT NULL,
  objetivo_postagem TEXT NOT NULL,
  anexo_url TEXT,
  tipo_criativo TEXT NOT NULL CHECK (tipo_criativo IN ('imagem', 'video')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.posts_planejamento ENABLE ROW LEVEL SECURITY;

-- Create policies para posts_planejamento
CREATE POLICY "Usuários podem ver posts de seus planejamentos" 
ON public.posts_planejamento 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.planejamentos p 
    WHERE p.id = posts_planejamento.planejamento_id 
    AND p.cliente_id IN (
      SELECT c.id FROM public.clientes c 
      WHERE c.id = p.cliente_id
    )
  )
);

CREATE POLICY "Usuários podem criar posts de seus planejamentos" 
ON public.posts_planejamento 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.planejamentos p 
    WHERE p.id = posts_planejamento.planejamento_id 
    AND p.cliente_id IN (
      SELECT c.id FROM public.clientes c 
      WHERE c.id = p.cliente_id
    )
  )
);

CREATE POLICY "Usuários podem atualizar posts de seus planejamentos" 
ON public.posts_planejamento 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.planejamentos p 
    WHERE p.id = posts_planejamento.planejamento_id 
    AND p.cliente_id IN (
      SELECT c.id FROM public.clientes c 
      WHERE c.id = p.cliente_id
    )
  )
);

CREATE POLICY "Usuários podem deletar posts de seus planejamentos" 
ON public.posts_planejamento 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.planejamentos p 
    WHERE p.id = posts_planejamento.planejamento_id 
    AND p.cliente_id IN (
      SELECT c.id FROM public.clientes c 
      WHERE c.id = p.cliente_id
    )
  )
);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_posts_planejamento_updated_at
BEFORE UPDATE ON public.posts_planejamento
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();