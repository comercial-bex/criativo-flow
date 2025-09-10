-- Criar enum para tipos de usuário
CREATE TYPE public.user_role AS ENUM ('admin', 'atendimento', 'designer', 'trafego', 'financeiro', 'cliente', 'fornecedor');

-- Criar enum para status geral
CREATE TYPE public.status_type AS ENUM ('ativo', 'inativo', 'pendente', 'arquivado');

-- Criar enum para prioridades
CREATE TYPE public.priority_type AS ENUM ('baixa', 'media', 'alta', 'urgente');

-- Tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de papéis de usuário
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Tabela de clientes
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  cnpj_cpf TEXT,
  endereco TEXT,
  responsavel_id UUID REFERENCES public.profiles(id),
  status status_type DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de projetos
CREATE TABLE public.projetos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
  responsavel_id UUID REFERENCES public.profiles(id),
  data_inicio DATE,
  data_fim DATE,
  orcamento DECIMAL(10,2),
  status status_type DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de leads/oportunidades (CRM)
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  empresa TEXT,
  cargo TEXT,
  origem TEXT,
  responsavel_id UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'pre_qualificacao',
  valor_estimado DECIMAL(10,2),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de tarefas/demandas
CREATE TABLE public.tarefas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  projeto_id UUID REFERENCES public.projetos(id) ON DELETE CASCADE,
  responsavel_id UUID REFERENCES public.profiles(id),
  solicitante_id UUID REFERENCES public.profiles(id),
  tipo TEXT, -- 'card', 'video', 'roteiro', 'trafego', etc.
  prioridade priority_type DEFAULT 'media',
  status TEXT DEFAULT 'backlog',
  data_prazo DATE,
  tempo_estimado INTEGER, -- em horas
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;

-- Função para verificar papel do usuário
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = user_uuid LIMIT 1;
$$;

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid AND role = 'admin'
  );
$$;

-- Políticas RLS para profiles
CREATE POLICY "Usuários podem ver todos os perfis"
ON public.profiles FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem atualizar próprio perfil"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Admins podem atualizar qualquer perfil"
ON public.profiles FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Políticas RLS para user_roles
CREATE POLICY "Usuários podem ver todos os papéis"
ON public.user_roles FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Apenas admins podem gerenciar papéis"
ON public.user_roles FOR ALL
USING (public.is_admin(auth.uid()));

-- Políticas RLS para clientes
CREATE POLICY "Usuários autenticados podem ver clientes"
ON public.clientes FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem criar clientes"
ON public.clientes FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Responsáveis e admins podem atualizar clientes"
ON public.clientes FOR UPDATE
USING (
  auth.uid() = responsavel_id OR 
  public.is_admin(auth.uid())
);

-- Políticas RLS para projetos
CREATE POLICY "Usuários autenticados podem ver projetos"
ON public.projetos FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem criar projetos"
ON public.projetos FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Responsáveis e admins podem atualizar projetos"
ON public.projetos FOR UPDATE
USING (
  auth.uid() = responsavel_id OR 
  public.is_admin(auth.uid())
);

-- Políticas RLS para leads
CREATE POLICY "Usuários autenticados podem ver leads"
ON public.leads FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem criar leads"
ON public.leads FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Responsáveis e admins podem atualizar leads"
ON public.leads FOR UPDATE
USING (
  auth.uid() = responsavel_id OR 
  public.is_admin(auth.uid())
);

-- Políticas RLS para tarefas
CREATE POLICY "Usuários autenticados podem ver tarefas"
ON public.tarefas FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem criar tarefas"
ON public.tarefas FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Responsáveis, solicitantes e admins podem atualizar tarefas"
ON public.tarefas FOR UPDATE
USING (
  auth.uid() = responsavel_id OR 
  auth.uid() = solicitante_id OR
  public.is_admin(auth.uid())
);

-- Trigger para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projetos_updated_at
  BEFORE UPDATE ON public.projetos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tarefas_updated_at
  BEFORE UPDATE ON public.tarefas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();