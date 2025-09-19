-- Criar enum para especialidades
CREATE TYPE public.especialidade_type AS ENUM (
  'videomaker',
  'filmmaker', 
  'design',
  'copywriter',
  'gerente_redes_sociais'
);

-- Adicionar especialidade ao profiles
ALTER TABLE public.profiles 
ADD COLUMN especialidade public.especialidade_type;

-- Criar tabela de especialistas de projeto
CREATE TABLE public.projeto_especialistas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  projeto_id UUID NOT NULL,
  especialista_id UUID NOT NULL,
  especialidade public.especialidade_type NOT NULL,
  is_gerente BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(projeto_id, especialidade)
);

-- Enable RLS
ALTER TABLE public.projeto_especialistas ENABLE ROW LEVEL SECURITY;

-- Políticas para projeto_especialistas
CREATE POLICY "Usuários autenticados podem ver especialistas de projeto"
  ON public.projeto_especialistas FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem criar especialistas de projeto"
  ON public.projeto_especialistas FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem atualizar especialistas de projeto"
  ON public.projeto_especialistas FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Adicionar responsável aos posts baseado na especialidade
ALTER TABLE public.posts_planejamento 
ADD COLUMN responsavel_id UUID;

ALTER TABLE public.posts_gerados_temp 
ADD COLUMN responsavel_id UUID;

-- Adicionar trigger para atualizar updated_at
CREATE TRIGGER update_projeto_especialistas_updated_at
  BEFORE UPDATE ON public.projeto_especialistas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();