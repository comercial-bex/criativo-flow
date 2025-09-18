-- Criar tabela para posts gerados temporariamente
CREATE TABLE public.posts_gerados_temp (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  planejamento_id uuid NOT NULL,
  titulo text NOT NULL,
  legenda text,
  hashtags text[],
  persona_alvo text,
  objetivo_postagem text NOT NULL,
  formato_postagem text NOT NULL DEFAULT 'post',
  tipo_criativo text NOT NULL,
  data_postagem date NOT NULL,
  call_to_action text,
  componente_hesec text,
  contexto_estrategico text,
  anexo_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.posts_gerados_temp ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para posts temporários
CREATE POLICY "Usuários podem ver posts temporários de seus planejamentos" 
ON public.posts_gerados_temp 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM planejamentos p 
  WHERE p.id = posts_gerados_temp.planejamento_id 
  AND p.cliente_id IN (
    SELECT c.id FROM clientes c WHERE c.id = p.cliente_id
  )
));

CREATE POLICY "Usuários podem criar posts temporários" 
ON public.posts_gerados_temp 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM planejamentos p 
  WHERE p.id = posts_gerados_temp.planejamento_id 
  AND p.cliente_id IN (
    SELECT c.id FROM clientes c WHERE c.id = p.cliente_id
  )
));

CREATE POLICY "Usuários podem atualizar posts temporários" 
ON public.posts_gerados_temp 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM planejamentos p 
  WHERE p.id = posts_gerados_temp.planejamento_id 
  AND p.cliente_id IN (
    SELECT c.id FROM clientes c WHERE c.id = p.cliente_id
  )
));

CREATE POLICY "Usuários podem deletar posts temporários" 
ON public.posts_gerados_temp 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM planejamentos p 
  WHERE p.id = posts_gerados_temp.planejamento_id 
  AND p.cliente_id IN (
    SELECT c.id FROM clientes c WHERE c.id = p.cliente_id
  )
));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_posts_gerados_temp_updated_at
BEFORE UPDATE ON public.posts_gerados_temp
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();