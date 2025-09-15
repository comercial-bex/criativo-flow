-- Criar tabela de assinaturas
CREATE TABLE public.assinaturas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  preco NUMERIC(10,2) NOT NULL,
  periodo TEXT NOT NULL DEFAULT 'mensal',
  posts_mensais INTEGER NOT NULL,
  reels_suporte BOOLEAN NOT NULL DEFAULT false,
  anuncios_facebook BOOLEAN NOT NULL DEFAULT false,
  anuncios_google BOOLEAN NOT NULL DEFAULT false,
  recursos TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.assinaturas ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Usuários autenticados podem ver assinaturas" 
ON public.assinaturas 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins podem atualizar assinaturas" 
ON public.assinaturas 
FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins podem criar assinaturas" 
ON public.assinaturas 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins podem deletar assinaturas" 
ON public.assinaturas 
FOR DELETE 
USING (is_admin(auth.uid()));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_assinaturas_updated_at
BEFORE UPDATE ON public.assinaturas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados dos planos existentes
INSERT INTO public.assinaturas (nome, preco, posts_mensais, reels_suporte, anuncios_facebook, anuncios_google, recursos) VALUES
('Básico', 297.00, 12, false, false, false, ARRAY['Planejamento estratégico', 'Cronograma de postagens', '12 posts/mês']),
('Padrão', 497.00, 20, true, false, false, ARRAY['Planejamento estratégico', 'Cronograma de postagens', '20 posts/mês', 'Reels/vídeos inclusos', 'Stories básicos']),
('Premium', 897.00, 30, true, true, true, ARRAY['Planejamento estratégico', 'Cronograma de postagens', '30 posts/mês', 'Reels/vídeos inclusos', 'Stories avançados', 'Anúncios Facebook/Instagram', 'Anúncios Google Ads', 'Relatórios mensais']);

-- Adicionar constraint de foreign key para clientes.assinatura_id
ALTER TABLE public.clientes 
ADD CONSTRAINT fk_clientes_assinatura 
FOREIGN KEY (assinatura_id) REFERENCES public.assinaturas(id);