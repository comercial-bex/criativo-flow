-- Criar apenas as tabelas que não existem
CREATE TABLE IF NOT EXISTS public.projetos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES public.clientes(id),
  titulo TEXT NOT NULL,
  descricao TEXT,
  status TEXT NOT NULL DEFAULT 'planejamento',
  prioridade TEXT NOT NULL DEFAULT 'media',
  data_inicio DATE,
  data_prazo DATE,
  created_by UUID REFERENCES public.profiles(id),
  responsavel_grs_id UUID REFERENCES public.profiles(id),
  responsavel_atendimento_id UUID REFERENCES public.profiles(id),
  orcamento_estimado NUMERIC,
  progresso INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tarefas_projeto (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  projeto_id UUID NOT NULL REFERENCES public.projetos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  setor_responsavel TEXT NOT NULL,
  responsavel_id UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'backlog',
  prioridade TEXT NOT NULL DEFAULT 'media',
  data_inicio DATE,
  data_prazo DATE,
  horas_estimadas INTEGER,
  horas_trabalhadas INTEGER DEFAULT 0,
  dependencias UUID[],
  anexos TEXT[],
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.projeto_status_historico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  projeto_id UUID REFERENCES public.projetos(id) ON DELETE CASCADE,
  tarefa_id UUID REFERENCES public.tarefas_projeto(id) ON DELETE CASCADE,
  status_anterior TEXT,
  status_novo TEXT NOT NULL,
  observacao TEXT,
  alterado_por UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS se não estiver habilitado
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas_projeto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projeto_status_historico ENABLE ROW LEVEL SECURITY;

-- Políticas (DROP IF EXISTS para evitar erros)
DROP POLICY IF EXISTS "GRS e Atendimento podem gerenciar projetos" ON public.projetos;
CREATE POLICY "GRS e Atendimento podem gerenciar projetos"
ON public.projetos FOR ALL
USING (
  is_admin(auth.uid()) OR
  get_user_role(auth.uid()) = 'grs' OR
  get_user_role(auth.uid()) = 'atendimento' OR
  get_user_role(auth.uid()) = 'gestor'
);

DROP POLICY IF EXISTS "Todos podem visualizar projetos" ON public.projetos;
CREATE POLICY "Todos podem visualizar projetos"
ON public.projetos FOR SELECT
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "GRS e Atendimento podem gerenciar tarefas" ON public.tarefas_projeto;
CREATE POLICY "GRS e Atendimento podem gerenciar tarefas"
ON public.tarefas_projeto FOR ALL
USING (
  is_admin(auth.uid()) OR
  get_user_role(auth.uid()) = 'grs' OR
  get_user_role(auth.uid()) = 'atendimento' OR
  get_user_role(auth.uid()) = 'gestor'
);

DROP POLICY IF EXISTS "Setores podem ver suas tarefas" ON public.tarefas_projeto;
CREATE POLICY "Setores podem ver suas tarefas"
ON public.tarefas_projeto FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    is_admin(auth.uid()) OR
    get_user_role(auth.uid()) = 'grs' OR
    get_user_role(auth.uid()) = 'atendimento' OR
    get_user_role(auth.uid()) = 'gestor' OR
    (setor_responsavel = 'design' AND get_user_role(auth.uid()) = 'designer') OR
    (setor_responsavel = 'audiovisual' AND get_user_role(auth.uid()) = 'filmmaker') OR
    responsavel_id = auth.uid()
  )
);