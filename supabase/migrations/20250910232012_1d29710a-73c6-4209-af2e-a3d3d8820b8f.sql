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

-- Habilitar RLS
ALTER TABLE public.planejamentos ENABLE ROW LEVEL SECURITY;

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

-- Trigger para updated_at
CREATE TRIGGER update_planejamentos_updated_at
  BEFORE UPDATE ON public.planejamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();