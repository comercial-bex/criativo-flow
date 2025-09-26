-- Create audiovisual department tables

-- Metas dos especialistas audiovisuais
CREATE TABLE public.audiovisual_metas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  especialista_id UUID NOT NULL,
  mes_ano DATE NOT NULL,
  meta_projetos INTEGER NOT NULL DEFAULT 0,
  meta_horas INTEGER NOT NULL DEFAULT 0,
  projetos_concluidos INTEGER NOT NULL DEFAULT 0,
  horas_trabalhadas INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agenda de captações
CREATE TABLE public.captacoes_agenda (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  cliente_id UUID,
  especialista_id UUID NOT NULL,
  data_captacao TIMESTAMP WITH TIME ZONE NOT NULL,
  local TEXT,
  equipamentos TEXT[],
  status TEXT NOT NULL DEFAULT 'agendado',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Equipamentos audiovisuais
CREATE TABLE public.equipamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'disponivel',
  responsavel_atual UUID,
  data_reserva TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Projetos audiovisuais específicos
CREATE TABLE public.projetos_audiovisual (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  planejamento_id UUID,
  titulo TEXT NOT NULL,
  tipo_projeto TEXT NOT NULL,
  deadline DATE,
  assets_url TEXT,
  status_review TEXT NOT NULL DEFAULT 'aguardando',
  feedback_cliente TEXT,
  especialista_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.audiovisual_metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.captacoes_agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projetos_audiovisual ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audiovisual_metas
CREATE POLICY "Usuários autenticados podem ver metas audiovisuais" 
ON public.audiovisual_metas 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Especialistas podem atualizar suas próprias metas" 
ON public.audiovisual_metas 
FOR UPDATE 
USING (auth.uid() = especialista_id OR is_admin(auth.uid()));

CREATE POLICY "Gestores podem criar metas" 
ON public.audiovisual_metas 
FOR INSERT 
WITH CHECK (get_user_role(auth.uid()) = 'gestor' OR is_admin(auth.uid()));

-- RLS Policies for captacoes_agenda
CREATE POLICY "Usuários autenticados podem ver captações" 
ON public.captacoes_agenda 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Especialistas podem criar e atualizar suas captações" 
ON public.captacoes_agenda 
FOR ALL 
USING (auth.uid() = especialista_id OR is_admin(auth.uid()));

CREATE POLICY "Usuários podem criar captações" 
ON public.captacoes_agenda 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for equipamentos
CREATE POLICY "Usuários autenticados podem ver equipamentos" 
ON public.equipamentos 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem atualizar equipamentos" 
ON public.equipamentos 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem criar equipamentos" 
ON public.equipamentos 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for projetos_audiovisual
CREATE POLICY "Usuários autenticados podem ver projetos audiovisuais" 
ON public.projetos_audiovisual 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Especialistas podem atualizar seus projetos" 
ON public.projetos_audiovisual 
FOR UPDATE 
USING (auth.uid() = especialista_id OR is_admin(auth.uid()));

CREATE POLICY "Usuários podem criar projetos audiovisuais" 
ON public.projetos_audiovisual 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create triggers for updated_at
CREATE TRIGGER update_audiovisual_metas_updated_at
BEFORE UPDATE ON public.audiovisual_metas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_captacoes_agenda_updated_at
BEFORE UPDATE ON public.captacoes_agenda
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_equipamentos_updated_at
BEFORE UPDATE ON public.equipamentos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projetos_audiovisual_updated_at
BEFORE UPDATE ON public.projetos_audiovisual
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();