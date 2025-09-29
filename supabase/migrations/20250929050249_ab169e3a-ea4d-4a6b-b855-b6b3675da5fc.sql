-- FASE 1: Corrigir dados inconsistentes e FASE 2: Sistema Multi-usuário

-- Primeiro, criar novos tipos para roles de cliente
CREATE TYPE cliente_role AS ENUM (
  'proprietario',
  'gerente_financeiro', 
  'gestor_marketing',
  'social_media'
);

-- Criar tabela para múltiplos usuários por cliente
CREATE TABLE public.cliente_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_cliente cliente_role NOT NULL DEFAULT 'proprietario',
  permissoes JSONB DEFAULT '{
    "financeiro": {"ver": false, "editar": false},
    "marketing": {"ver": false, "aprovar": false},
    "projetos": {"ver": false, "criar": false, "editar": false},
    "relatorios": {"ver": false}
  }'::jsonb,
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_por UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(cliente_id, user_id)
);

-- Habilitar RLS
ALTER TABLE public.cliente_usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para cliente_usuarios
CREATE POLICY "Admins podem gerenciar usuários de clientes"
ON public.cliente_usuarios
FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Proprietários podem gerenciar usuários de sua empresa"
ON public.cliente_usuarios  
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.cliente_usuarios cu
    WHERE cu.cliente_id = cliente_usuarios.cliente_id 
    AND cu.user_id = auth.uid()
    AND cu.role_cliente = 'proprietario'
    AND cu.ativo = true
  )
);

CREATE POLICY "Usuários podem ver outros usuários da mesma empresa"
ON public.cliente_usuarios
FOR SELECT
USING (
  cliente_id IN (
    SELECT cu.cliente_id FROM public.cliente_usuarios cu
    WHERE cu.user_id = auth.uid() AND cu.ativo = true
  )
);

-- Trigger para updated_at
CREATE TRIGGER update_cliente_usuarios_updated_at
  BEFORE UPDATE ON public.cliente_usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Migrar dados existentes - vincular clientes existentes que têm profiles
INSERT INTO public.cliente_usuarios (cliente_id, user_id, role_cliente, permissoes, criado_por)
SELECT 
  p.cliente_id,
  p.id,
  'proprietario'::cliente_role,
  '{
    "financeiro": {"ver": true, "editar": true},
    "marketing": {"ver": true, "aprovar": true}, 
    "projetos": {"ver": true, "criar": true, "editar": true},
    "relatorios": {"ver": true}
  }'::jsonb,
  p.id
FROM public.profiles p
WHERE p.cliente_id IS NOT NULL
ON CONFLICT (cliente_id, user_id) DO NOTHING;