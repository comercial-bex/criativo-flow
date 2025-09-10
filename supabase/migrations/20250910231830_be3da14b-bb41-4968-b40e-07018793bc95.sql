-- Atualizar enum de roles para incluir todos os perfis da agência
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'grs';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'atendimento';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'designer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'filmmaker';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'gestor';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'cliente';

-- Criar enum para status padrão do sistema
CREATE TYPE status_padrao AS ENUM (
  'rascunho',
  'em_revisao', 
  'aprovado_cliente',
  'em_producao',
  'em_aprovacao_final',
  'finalizado',
  'reprovado'
);

-- Criar tabela de planejamentos mensais
CREATE TABLE public.planejamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES public.clientes(id),
  responsavel_grs_id UUID REFERENCES public.profiles(id),
  mes_referencia DATE NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  status status_padrao DEFAULT 'rascunho',
  data_envio_cliente TIMESTAMP WITH TIME ZONE,
  data_aprovacao_cliente TIMESTAMP WITH TIME ZONE,
  observacoes_cliente TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de peças/items do planejamento
CREATE TABLE public.pecas_planejamento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  planejamento_id UUID REFERENCES public.planejamentos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL, -- 'post', 'story', 'video', 'reels'
  descricao TEXT,
  data_publicacao DATE,
  copy_texto TEXT,
  referencias_anexos TEXT[],
  status status_padrao DEFAULT 'rascunho',
  arquivo_url TEXT,
  aprovado_por_cliente BOOLEAN DEFAULT FALSE,
  comentarios_cliente TEXT,
  data_aprovacao TIMESTAMP WITH TIME ZONE,
  responsavel_designer_id UUID REFERENCES public.profiles(id),
  responsavel_filmmaker_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de comentários/histórico
CREATE TABLE public.comentarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entidade_tipo TEXT NOT NULL, -- 'planejamento', 'peca', 'projeto'
  entidade_id UUID NOT NULL,
  autor_id UUID REFERENCES public.profiles(id),
  comentario TEXT NOT NULL,
  tipo TEXT DEFAULT 'comentario', -- 'comentario', 'aprovacao', 'reprovacao', 'ajuste'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.planejamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pecas_planejamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para planejamentos
CREATE POLICY "Usuários autenticados podem ver planejamentos" 
ON public.planejamentos FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "GRS e gestores podem criar planejamentos" 
ON public.planejamentos FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND (
  get_user_role(auth.uid()) = 'grs' OR 
  get_user_role(auth.uid()) = 'gestor' OR
  is_admin(auth.uid())
));

CREATE POLICY "GRS, atendimento e gestores podem atualizar planejamentos" 
ON public.planejamentos FOR UPDATE 
USING (auth.uid() IS NOT NULL AND (
  get_user_role(auth.uid()) = 'grs' OR 
  get_user_role(auth.uid()) = 'atendimento' OR
  get_user_role(auth.uid()) = 'gestor' OR
  is_admin(auth.uid())
));

-- Políticas RLS para peças
CREATE POLICY "Usuários autenticados podem ver peças" 
ON public.pecas_planejamento FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Equipe pode criar/editar peças" 
ON public.pecas_planejamento FOR ALL 
USING (auth.uid() IS NOT NULL AND get_user_role(auth.uid()) != 'cliente');

-- Políticas RLS para comentários
CREATE POLICY "Usuários autenticados podem ver comentários" 
ON public.comentarios FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem criar comentários" 
ON public.comentarios FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Trigger para updated_at
CREATE TRIGGER update_planejamentos_updated_at
  BEFORE UPDATE ON public.planejamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pecas_updated_at
  BEFORE UPDATE ON public.pecas_planejamento
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();