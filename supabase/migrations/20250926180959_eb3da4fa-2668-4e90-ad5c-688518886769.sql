-- Criar tabela para permissões granulares por função
CREATE TABLE public.role_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role user_role NOT NULL,
  module TEXT NOT NULL,
  can_view BOOLEAN NOT NULL DEFAULT false,
  can_create BOOLEAN NOT NULL DEFAULT false,
  can_edit BOOLEAN NOT NULL DEFAULT false,
  can_delete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role, module)
);

-- Habilitar RLS
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Política para admins gerenciarem permissões
CREATE POLICY "Admins podem gerenciar permissões" 
ON public.role_permissions 
FOR ALL 
USING (is_admin(auth.uid()));

-- Política para usuários visualizarem permissões
CREATE POLICY "Usuários podem ver permissões" 
ON public.role_permissions 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Inserir permissões padrão para cada função
INSERT INTO public.role_permissions (role, module, can_view, can_create, can_edit, can_delete) VALUES
-- Admin - acesso total
('admin', 'dashboard', true, true, true, true),
('admin', 'clientes', true, true, true, true),
('admin', 'crm', true, true, true, true),
('admin', 'financeiro', true, true, true, true),
('admin', 'administrativo', true, true, true, true),
('admin', 'audiovisual', true, true, true, true),
('admin', 'design', true, true, true, true),
('admin', 'configuracoes', true, true, true, true),
('admin', 'especialistas', true, true, true, true),
('admin', 'relatorios', true, true, true, true),
('admin', 'planos', true, true, true, true),

-- GRS - gestão de redes sociais
('grs', 'dashboard', true, false, false, false),
('grs', 'clientes', true, true, true, false),
('grs', 'crm', true, true, true, false),
('grs', 'design', true, true, true, false),
('grs', 'relatorios', true, false, false, false),

-- Atendimento
('atendimento', 'dashboard', true, false, false, false),
('atendimento', 'clientes', true, true, true, false),
('atendimento', 'crm', true, true, true, false),

-- Designer
('designer', 'dashboard', true, false, false, false),
('designer', 'design', true, true, true, false),
('designer', 'clientes', true, false, false, false),

-- Filmmaker
('filmmaker', 'dashboard', true, false, false, false),
('filmmaker', 'audiovisual', true, true, true, false),
('filmmaker', 'clientes', true, false, false, false),

-- Gestor
('gestor', 'dashboard', true, false, false, false),
('gestor', 'clientes', true, true, true, false),
('gestor', 'crm', true, true, true, false),
('gestor', 'financeiro', true, true, true, false),
('gestor', 'administrativo', true, true, true, false),
('gestor', 'audiovisual', true, false, false, false),
('gestor', 'design', true, false, false, false),
('gestor', 'relatorios', true, false, false, false),
('gestor', 'especialistas', true, true, true, false),

-- Financeiro
('financeiro', 'dashboard', true, false, false, false),
('financeiro', 'clientes', true, false, false, false),
('financeiro', 'financeiro', true, true, true, false),
('financeiro', 'administrativo', true, true, true, false),
('financeiro', 'relatorios', true, false, false, false),

-- Cliente
('cliente', 'dashboard', true, false, false, false);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_role_permissions_updated_at
BEFORE UPDATE ON public.role_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();