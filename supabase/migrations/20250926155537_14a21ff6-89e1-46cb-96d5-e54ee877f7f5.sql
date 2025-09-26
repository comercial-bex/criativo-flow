-- Fix foreign key relationships for audiovisual tables
ALTER TABLE equipamentos 
ADD CONSTRAINT fk_equipamentos_responsavel 
FOREIGN KEY (responsavel_atual) REFERENCES profiles(id);

ALTER TABLE captacoes_agenda 
ADD CONSTRAINT fk_captacoes_especialista 
FOREIGN KEY (especialista_id) REFERENCES profiles(id);

ALTER TABLE captacoes_agenda 
ADD CONSTRAINT fk_captacoes_cliente 
FOREIGN KEY (cliente_id) REFERENCES clientes(id);

ALTER TABLE projetos_audiovisual 
ADD CONSTRAINT fk_projetos_av_especialista 
FOREIGN KEY (especialista_id) REFERENCES profiles(id);

ALTER TABLE projetos_audiovisual 
ADD CONSTRAINT fk_projetos_av_planejamento 
FOREIGN KEY (planejamento_id) REFERENCES planejamentos(id);

-- Create notifications table
CREATE TABLE public.notificacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
  lida BOOLEAN NOT NULL DEFAULT false,
  data_evento TIMESTAMP WITH TIME ZONE,
  link_acao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for notifications
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notificacoes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notificacoes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
ON public.notificacoes 
FOR INSERT 
WITH CHECK (true);

-- Create events/calendar table
CREATE TABLE public.eventos_agenda (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'evento', -- 'evento', 'captacao', 'deadline', 'reuniao'
  cliente_id UUID REFERENCES clientes(id),
  projeto_id UUID REFERENCES projetos(id),
  responsavel_id UUID REFERENCES profiles(id),
  cor TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for events
ALTER TABLE public.eventos_agenda ENABLE ROW LEVEL SECURITY;

-- Create policies for events
CREATE POLICY "Users can view all events" 
ON public.eventos_agenda 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create events" 
ON public.eventos_agenda 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Responsible users can update events" 
ON public.eventos_agenda 
FOR UPDATE 
USING (auth.uid() = responsavel_id OR is_admin(auth.uid()));

-- Create FAQ/Support table
CREATE TABLE public.faq_suporte (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pergunta TEXT NOT NULL,
  resposta TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'geral',
  tags TEXT[] DEFAULT '{}',
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for FAQ
ALTER TABLE public.faq_suporte ENABLE ROW LEVEL SECURITY;

-- Create policies for FAQ
CREATE POLICY "Users can view active FAQ" 
ON public.faq_suporte 
FOR SELECT 
USING (ativo = true AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage FAQ" 
ON public.faq_suporte 
FOR ALL 
USING (is_admin(auth.uid()));

-- Create triggers for updated_at
CREATE TRIGGER update_notificacoes_updated_at
BEFORE UPDATE ON public.notificacoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_eventos_agenda_updated_at
BEFORE UPDATE ON public.eventos_agenda
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_faq_suporte_updated_at
BEFORE UPDATE ON public.faq_suporte
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial FAQ data
INSERT INTO public.faq_suporte (pergunta, resposta, categoria, tags) VALUES 
('Como criar um novo cliente?', 'Acesse o menu CRM e clique em "Novo Cliente". Preencha os dados obrigatórios e salve.', 'crm', '{"cliente", "cadastro"}'),
('Como agendar uma captação?', 'No menu Audiovisual > Captações, clique em "Nova Captação" e preencha os dados.', 'audiovisual', '{"captacao", "agenda"}'),
('Como visualizar equipamentos disponíveis?', 'Acesse Audiovisual > Equipamentos para ver o status de todos os equipamentos.', 'audiovisual', '{"equipamentos", "status"}'),
('Como criar um novo projeto?', 'No dashboard, clique em "Novo Projeto" ou acesse a seção Projetos.', 'projetos', '{"projeto", "criar"}');

-- Insert some sample notifications
INSERT INTO public.notificacoes (user_id, titulo, mensagem, tipo, data_evento, link_acao) 
SELECT 
  p.id,
  'Bem-vindo ao Sistema!',
  'Explore as funcionalidades do sistema de gestão da agência.',
  'info',
  now() + interval '1 hour',
  '/dashboard'
FROM profiles p
LIMIT 5;

-- Insert some sample events
INSERT INTO public.eventos_agenda (titulo, descricao, data_inicio, data_fim, tipo, cor)
VALUES 
('Reunião de Planejamento', 'Reunião semanal de alinhamento', now() + interval '1 day', now() + interval '1 day' + interval '2 hours', 'reuniao', '#10b981'),
('Captação Cliente X', 'Sessão de fotos para novo cliente', now() + interval '3 days', now() + interval '3 days' + interval '4 hours', 'captacao', '#f59e0b'),
('Deadline Projeto Y', 'Entrega final do projeto', now() + interval '7 days', now() + interval '7 days' + interval '1 hour', 'deadline', '#ef4444');