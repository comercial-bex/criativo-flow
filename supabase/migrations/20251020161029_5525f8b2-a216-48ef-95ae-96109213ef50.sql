-- Criar tabela de especialidades
CREATE TABLE IF NOT EXISTS public.especialidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  role_sistema user_role NOT NULL,
  cor TEXT NOT NULL DEFAULT '#3B82F6',
  icone TEXT DEFAULT '👤',
  categoria TEXT DEFAULT 'operacional',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adicionar coluna especialidade_id na tabela pessoas
ALTER TABLE public.pessoas 
ADD COLUMN IF NOT EXISTS especialidade_id UUID REFERENCES public.especialidades(id) ON DELETE SET NULL;

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_pessoas_especialidade_id ON public.pessoas(especialidade_id);

-- RLS Policies
ALTER TABLE public.especialidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver especialidades ativas" 
ON public.especialidades 
FOR SELECT 
TO authenticated 
USING (ativo = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Admin pode gerenciar especialidades" 
ON public.especialidades 
FOR ALL 
TO authenticated 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Inserir especialidades padrão
INSERT INTO public.especialidades (nome, role_sistema, cor, icone, categoria) VALUES
  ('GRS - Gestor de Redes Sociais', 'grs', '#10B981', '📱', 'operacional'),
  ('Designer', 'designer', '#8B5CF6', '🎨', 'operacional'),
  ('Filmmaker - Audiovisual', 'filmmaker', '#F59E0B', '🎬', 'operacional'),
  ('Atendimento', 'atendimento', '#3B82F6', '💬', 'operacional'),
  ('Gestor', 'gestor', '#EF4444', '👔', 'gestao'),
  ('Financeiro', 'financeiro', '#059669', '💰', 'administrativo'),
  ('Tráfego', 'trafego', '#EC4899', '📊', 'operacional'),
  ('RH', 'rh', '#6366F1', '👥', 'administrativo')
ON CONFLICT (nome) DO NOTHING;

-- Trigger para sincronizar especialidade_id com user_roles
CREATE OR REPLACE FUNCTION sync_especialidade_to_user_role()
RETURNS TRIGGER AS $$
DECLARE
  role_sistema_value user_role;
BEGIN
  -- Se especialidade_id foi definida, buscar o role_sistema
  IF NEW.especialidade_id IS NOT NULL THEN
    SELECT e.role_sistema INTO role_sistema_value
    FROM public.especialidades e
    WHERE e.id = NEW.especialidade_id;
    
    -- Se a pessoa tem profile_id, sincronizar com user_roles
    IF NEW.profile_id IS NOT NULL AND role_sistema_value IS NOT NULL THEN
      -- Atualizar ou inserir role em user_roles
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.profile_id, role_sistema_value)
      ON CONFLICT (user_id) 
      DO UPDATE SET role = role_sistema_value, updated_at = now();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_sync_especialidade_to_user_role
AFTER INSERT OR UPDATE OF especialidade_id, profile_id ON public.pessoas
FOR EACH ROW
EXECUTE FUNCTION sync_especialidade_to_user_role();