-- ============================================================================
-- FASE 1: Infraestrutura de Banco de Dados - Área do Cliente
-- ============================================================================

-- 1. Criar tabela de credenciais do cliente com criptografia
CREATE TABLE IF NOT EXISTS public.credenciais_cliente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  projeto_id UUID REFERENCES public.projetos(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL CHECK (categoria IN ('social', 'email', 'dominio', 'ads', 'outros')),
  plataforma TEXT NOT NULL,
  usuario_login TEXT NOT NULL,
  senha_cipher TEXT NOT NULL, -- Senha criptografada
  extra JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Índices para performance
CREATE INDEX idx_credenciais_cliente_id ON public.credenciais_cliente(cliente_id, updated_at DESC);
CREATE INDEX idx_credenciais_plataforma ON public.credenciais_cliente(plataforma);
CREATE INDEX idx_credenciais_categoria ON public.credenciais_cliente(categoria);

-- Habilitar RLS
ALTER TABLE public.credenciais_cliente ENABLE ROW LEVEL SECURITY;

-- 2. Políticas RLS para credenciais_cliente
-- Admins e Gestores podem ver metadados (sem senha)
CREATE POLICY "Admins e Gestores podem ver metadados de credenciais"
ON public.credenciais_cliente
FOR SELECT
USING (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) = 'gestor'
);

-- Apenas Admin e Gestor podem inserir/atualizar/deletar
CREATE POLICY "Admins e Gestores podem gerenciar credenciais"
ON public.credenciais_cliente
FOR ALL
USING (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) = 'gestor'
);

-- 3. Função para salvar credencial (criptografa senha)
CREATE OR REPLACE FUNCTION public.fn_cred_save(
  p_cliente_id UUID,
  p_projeto_id UUID,
  p_categoria TEXT,
  p_plataforma TEXT,
  p_usuario_login TEXT,
  p_senha_plain TEXT,
  p_extra_json JSONB DEFAULT '{}'::jsonb,
  p_cred_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cred_id UUID;
  v_senha_encrypted TEXT;
  v_encryption_key TEXT := 'BexCommunication2025!SecureKey#*';
BEGIN
  -- Verificar permissão
  IF NOT (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor') THEN
    RAISE EXCEPTION 'Sem permissão para salvar credenciais';
  END IF;

  -- Criptografar senha
  v_senha_encrypted := encode(
    pgp_sym_encrypt(p_senha_plain, v_encryption_key),
    'base64'
  );

  -- Inserir ou atualizar
  IF p_cred_id IS NULL THEN
    -- Inserir nova credencial
    INSERT INTO public.credenciais_cliente (
      cliente_id, projeto_id, categoria, plataforma, 
      usuario_login, senha_cipher, extra, created_by
    ) VALUES (
      p_cliente_id, p_projeto_id, p_categoria, p_plataforma,
      p_usuario_login, v_senha_encrypted, p_extra_json, auth.uid()
    ) RETURNING id INTO v_cred_id;

    -- Log de criação
    PERFORM criar_log_atividade(
      p_cliente_id,
      auth.uid(),
      'insert',
      'credenciais_cliente',
      v_cred_id,
      'Credencial criada: ' || p_plataforma || ' (' || p_categoria || ')',
      jsonb_build_object('plataforma', p_plataforma, 'categoria', p_categoria)
    );
  ELSE
    -- Atualizar credencial existente
    UPDATE public.credenciais_cliente
    SET 
      categoria = p_categoria,
      plataforma = p_plataforma,
      usuario_login = p_usuario_login,
      senha_cipher = v_senha_encrypted,
      extra = p_extra_json,
      updated_by = auth.uid(),
      updated_at = now()
    WHERE id = p_cred_id
    RETURNING id INTO v_cred_id;

    -- Log de atualização
    PERFORM criar_log_atividade(
      p_cliente_id,
      auth.uid(),
      'update',
      'credenciais_cliente',
      v_cred_id,
      'Credencial atualizada: ' || p_plataforma,
      jsonb_build_object('plataforma', p_plataforma)
    );
  END IF;

  RETURN v_cred_id;
END;
$$;

-- 4. Função para listar metadados (sem senha)
CREATE OR REPLACE FUNCTION public.fn_cred_get_metadata(
  p_cliente_id UUID,
  p_projeto_id UUID DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  cliente_id UUID,
  projeto_id UUID,
  categoria TEXT,
  plataforma TEXT,
  usuario_login TEXT,
  extra JSONB,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_by_nome TEXT,
  updated_by_nome TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar permissão
  IF NOT (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor' OR get_user_role(auth.uid()) = 'atendimento') THEN
    RAISE EXCEPTION 'Sem permissão para visualizar credenciais';
  END IF;

  RETURN QUERY
  SELECT 
    c.id,
    c.cliente_id,
    c.projeto_id,
    c.categoria,
    c.plataforma,
    c.usuario_login,
    c.extra,
    c.created_by,
    c.updated_by,
    c.created_at,
    c.updated_at,
    p1.nome as created_by_nome,
    p2.nome as updated_by_nome
  FROM public.credenciais_cliente c
  LEFT JOIN public.profiles p1 ON c.created_by = p1.id
  LEFT JOIN public.profiles p2 ON c.updated_by = p2.id
  WHERE c.cliente_id = p_cliente_id
    AND (p_projeto_id IS NULL OR c.projeto_id = p_projeto_id)
  ORDER BY c.updated_at DESC;
END;
$$;

-- 5. Função para revelar senha (com log de acesso)
CREATE OR REPLACE FUNCTION public.fn_cred_reveal(
  p_cred_id UUID,
  p_motivo TEXT DEFAULT 'Acesso para trabalho'
)
RETURNS TABLE(
  senha_plain TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_encryption_key TEXT := 'BexCommunication2025!SecureKey#*';
  v_senha_decrypted TEXT;
  v_cliente_id UUID;
  v_plataforma TEXT;
BEGIN
  -- Verificar permissão (apenas Admin e Gestor podem revelar)
  IF NOT (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor') THEN
    RAISE EXCEPTION 'Sem permissão para revelar senhas';
  END IF;

  -- Buscar credencial e descriptografar
  SELECT 
    c.cliente_id,
    c.plataforma,
    pgp_sym_decrypt(decode(c.senha_cipher, 'base64'), v_encryption_key)
  INTO v_cliente_id, v_plataforma, v_senha_decrypted
  FROM public.credenciais_cliente c
  WHERE c.id = p_cred_id;

  IF v_senha_decrypted IS NULL THEN
    RAISE EXCEPTION 'Credencial não encontrada';
  END IF;

  -- Log de acesso (CRÍTICO para auditoria)
  PERFORM criar_log_atividade(
    v_cliente_id,
    auth.uid(),
    'reveal',
    'credenciais_cliente',
    p_cred_id,
    'Senha revelada: ' || v_plataforma || ' - Motivo: ' || p_motivo,
    jsonb_build_object(
      'plataforma', v_plataforma,
      'motivo', p_motivo,
      'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for'
    )
  );

  RETURN QUERY SELECT v_senha_decrypted;
END;
$$;

-- 6. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_credenciais_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_credenciais_updated_at
BEFORE UPDATE ON public.credenciais_cliente
FOR EACH ROW
EXECUTE FUNCTION public.update_credenciais_updated_at();

-- 7. Garantir que extensão pgcrypto está habilitada
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 8. Comentários de documentação
COMMENT ON TABLE public.credenciais_cliente IS 'Armazena credenciais de acesso dos clientes com criptografia (redes sociais, emails, domínios, anúncios)';
COMMENT ON FUNCTION public.fn_cred_save IS 'Salva ou atualiza credencial com senha criptografada (apenas Admin/Gestor)';
COMMENT ON FUNCTION public.fn_cred_get_metadata IS 'Lista metadados de credenciais sem expor senhas';
COMMENT ON FUNCTION public.fn_cred_reveal IS 'Revela senha descriptografada com log de auditoria (apenas Admin/Gestor)';