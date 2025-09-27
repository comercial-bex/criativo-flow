-- Adicionar campo status na tabela profiles para aprovação de especialistas
ALTER TABLE public.profiles 
ADD COLUMN status TEXT NOT NULL DEFAULT 'pendente_aprovacao';

-- Adicionar constraint para valores válidos
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_status_check 
CHECK (status IN ('pendente_aprovacao', 'aprovado', 'rejeitado', 'suspenso'));

-- Atualizar perfis existentes para aprovado (para não bloquear usuários atuais)
UPDATE public.profiles 
SET status = 'aprovado' 
WHERE status = 'pendente_aprovacao';

-- Adicionar campo para observações de aprovação
ALTER TABLE public.profiles 
ADD COLUMN observacoes_aprovacao TEXT;

-- Adicionar campo para quem aprovou
ALTER TABLE public.profiles 
ADD COLUMN aprovado_por UUID REFERENCES auth.users(id);

-- Adicionar timestamp de aprovação
ALTER TABLE public.profiles 
ADD COLUMN data_aprovacao TIMESTAMP WITH TIME ZONE;

-- Criar índice para melhor performance nas consultas por status
CREATE INDEX idx_profiles_status ON public.profiles(status);

-- Atualizar a função get_filtered_profile para incluir status
CREATE OR REPLACE FUNCTION public.get_filtered_profile(profile_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    CASE 
      -- If requesting own profile or admin, return all data
      WHEN profile_id = auth.uid() OR is_admin(auth.uid()) THEN
        to_jsonb(profiles.*) 
      -- If manager viewing team profile, return limited data (no sensitive info)
      WHEN get_user_role(auth.uid()) IN ('gestor', 'atendimento', 'grs') THEN
        jsonb_build_object(
          'id', profiles.id,
          'nome', profiles.nome,
          'especialidade', profiles.especialidade,
          'avatar_url', profiles.avatar_url,
          'created_at', profiles.created_at,
          'status', profiles.status
          -- Exclude email and telefone for privacy
        )
      ELSE
        NULL -- No access for other roles
    END
  FROM profiles 
  WHERE profiles.id = profile_id;
$function$;

-- Criar função para aprovar especialista
CREATE OR REPLACE FUNCTION public.aprovar_especialista(
  especialista_id UUID,
  observacao TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Verificar se o usuário tem permissão (admin ou gestor)
  IF NOT (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor') THEN
    RAISE EXCEPTION 'Sem permissão para aprovar especialistas';
  END IF;

  -- Atualizar o perfil
  UPDATE public.profiles 
  SET 
    status = 'aprovado',
    observacoes_aprovacao = observacao,
    aprovado_por = auth.uid(),
    data_aprovacao = NOW(),
    updated_at = NOW()
  WHERE id = especialista_id;

  -- Inserir notificação para o especialista
  INSERT INTO public.notificacoes (
    user_id,
    titulo,
    mensagem,
    tipo,
    data_evento
  ) VALUES (
    especialista_id,
    'Perfil Aprovado',
    CASE 
      WHEN observacao IS NOT NULL THEN 
        'Seu perfil foi aprovado! Observação: ' || observacao
      ELSE 
        'Seu perfil foi aprovado! Agora você tem acesso completo ao sistema.'
    END,
    'success',
    NOW()
  );

  RETURN TRUE;
END;
$function$;

-- Criar função para rejeitar especialista
CREATE OR REPLACE FUNCTION public.rejeitar_especialista(
  especialista_id UUID,
  observacao TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Verificar se o usuário tem permissão (admin ou gestor)
  IF NOT (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor') THEN
    RAISE EXCEPTION 'Sem permissão para rejeitar especialistas';
  END IF;

  -- Atualizar o perfil
  UPDATE public.profiles 
  SET 
    status = 'rejeitado',
    observacoes_aprovacao = observacao,
    aprovado_por = auth.uid(),
    data_aprovacao = NOW(),
    updated_at = NOW()
  WHERE id = especialista_id;

  -- Inserir notificação para o especialista
  INSERT INTO public.notificacoes (
    user_id,
    titulo,
    mensagem,
    tipo,
    data_evento
  ) VALUES (
    especialista_id,
    'Perfil Rejeitado',
    CASE 
      WHEN observacao IS NOT NULL THEN 
        'Seu perfil foi rejeitado. Motivo: ' || observacao
      ELSE 
        'Seu perfil foi rejeitado. Entre em contato com a administração para mais informações.'
    END,
    'error',
    NOW()
  );

  RETURN TRUE;
END;
$function$;

-- Trigger para notificar admins sobre novos cadastros
CREATE OR REPLACE FUNCTION public.notificar_novo_especialista()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Inserir notificação para todos os admins
  INSERT INTO public.notificacoes (
    user_id,
    titulo,
    mensagem,
    tipo,
    data_evento
  )
  SELECT 
    ur.user_id,
    'Novo Especialista Cadastrado',
    'Um novo especialista (' || NEW.nome || ') se cadastrou e aguarda aprovação.',
    'info',
    NOW()
  FROM public.user_roles ur
  WHERE ur.role = 'admin';

  RETURN NEW;
END;
$function$;

-- Criar trigger para novos perfis
CREATE TRIGGER trigger_notificar_novo_especialista
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notificar_novo_especialista();