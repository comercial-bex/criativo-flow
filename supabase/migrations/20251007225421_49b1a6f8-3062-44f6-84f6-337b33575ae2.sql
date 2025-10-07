-- =====================================================
-- MIGRATION: Expandir Categorias de Credenciais + Brand Assets (FIXED)
-- =====================================================

-- 1) Expandir categorias de credenciais
ALTER TABLE public.credenciais_cliente 
DROP CONSTRAINT IF EXISTS credenciais_cliente_categoria_check;

ALTER TABLE public.credenciais_cliente 
ADD CONSTRAINT credenciais_cliente_categoria_check 
CHECK (categoria IN (
  'social',           -- Redes sociais (Instagram, Facebook, TikTok, etc.)
  'ads',              -- Plataformas de anúncios (Meta Ads, Google Ads, etc.)
  'email_workspace',  -- E-mail e workspace (Gmail, Outlook, SMTP)
  'dominio_dns',      -- Domínio e DNS (Registro.br, Cloudflare, etc.)
  'hosting_cdn',      -- Hosting e CDN (Hostinger, AWS, Vercel, etc.)
  'site_cms',         -- Site e CMS (WordPress, Shopify, etc.)
  'analytics',        -- Analytics (GA4, Hotjar, etc.)
  'tagmanager',       -- Tag Manager (GTM, etc.)
  'mensageria',       -- Mensageria (WhatsApp, Mailchimp, etc.)
  'outros'            -- Outros serviços
));

-- 2) Adicionar campo secrets_cipher para tokens/API keys criptografados
ALTER TABLE public.credenciais_cliente
ADD COLUMN IF NOT EXISTS secrets_cipher TEXT;

COMMENT ON COLUMN public.credenciais_cliente.secrets_cipher IS 
'Campo criptografado para armazenar tokens, API keys, webhooks (pgcrypto)';

-- 3) Criar view para listagem com categorias legíveis
CREATE OR REPLACE VIEW public.vw_credenciais_por_categoria AS
SELECT 
  c.id,
  c.cliente_id,
  c.projeto_id,
  c.categoria,
  CASE c.categoria
    WHEN 'social' THEN '👥 Redes Sociais'
    WHEN 'ads' THEN '📢 Anúncios'
    WHEN 'email_workspace' THEN '📧 E-mail / Workspace'
    WHEN 'dominio_dns' THEN '🌐 Domínio / DNS'
    WHEN 'hosting_cdn' THEN '☁️ Hosting / CDN'
    WHEN 'site_cms' THEN '🖥️ Site / CMS'
    WHEN 'analytics' THEN '📊 Analytics'
    WHEN 'tagmanager' THEN '🏷️ Tag Manager'
    WHEN 'mensageria' THEN '💬 Mensageria'
    ELSE '🔧 Outros'
  END as categoria_label,
  c.plataforma,
  c.usuario_login,
  c.extra,
  c.updated_at,
  p.nome as updated_by_nome,
  COUNT(*) OVER (PARTITION BY c.categoria) as total_na_categoria
FROM public.credenciais_cliente c
LEFT JOIN public.profiles p ON c.updated_by = p.id;

-- 4) DROP e RECRIAR fn_cred_reveal com novo retorno (senha + secrets)
DROP FUNCTION IF EXISTS public.fn_cred_reveal(uuid, text);

CREATE OR REPLACE FUNCTION public.fn_cred_reveal(
  p_cred_id UUID,
  p_motivo TEXT DEFAULT 'Acesso para trabalho'
)
RETURNS TABLE(
  senha_plain TEXT,
  secrets_plain JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_encryption_key TEXT := 'BexCommunication2025!SecureKey#*';
  v_senha_decrypted TEXT;
  v_secrets_decrypted JSONB;
  v_cliente_id UUID;
  v_plataforma TEXT;
BEGIN
  -- Verificar permissão
  IF NOT (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor') THEN
    RAISE EXCEPTION 'Sem permissão para revelar senhas';
  END IF;

  -- Buscar e descriptografar
  SELECT 
    c.cliente_id,
    c.plataforma,
    CASE 
      WHEN c.senha_cipher IS NOT NULL THEN
        pgp_sym_decrypt(decode(c.senha_cipher, 'base64'), v_encryption_key)
      ELSE NULL
    END,
    CASE 
      WHEN c.secrets_cipher IS NOT NULL THEN
        pgp_sym_decrypt(decode(c.secrets_cipher, 'base64'), v_encryption_key)::jsonb
      ELSE '{}'::jsonb
    END
  INTO v_cliente_id, v_plataforma, v_senha_decrypted, v_secrets_decrypted
  FROM public.credenciais_cliente c
  WHERE c.id = p_cred_id;

  IF v_senha_decrypted IS NULL AND v_secrets_decrypted = '{}'::jsonb THEN
    RAISE EXCEPTION 'Credencial não encontrada ou sem dados criptografados';
  END IF;

  -- Log de auditoria
  PERFORM criar_log_atividade(
    v_cliente_id, 
    auth.uid(), 
    'reveal', 
    'credenciais_cliente', 
    p_cred_id,
    '🔓 Senha revelada: ' || v_plataforma || ' - Motivo: ' || p_motivo,
    jsonb_build_object('plataforma', v_plataforma, 'motivo', p_motivo)
  );

  RETURN QUERY SELECT v_senha_decrypted, v_secrets_decrypted;
END;
$$;

-- 5) Atualizar fn_cred_save para suportar secrets_cipher
CREATE OR REPLACE FUNCTION public.fn_cred_save(
  p_cliente_id UUID,
  p_projeto_id UUID,
  p_categoria TEXT,
  p_plataforma TEXT,
  p_usuario_login TEXT,
  p_senha_plain TEXT,
  p_extra_json JSONB DEFAULT '{}'::jsonb,
  p_secrets_json JSONB DEFAULT '{}'::jsonb,  -- NOVO: tokens/API keys
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
  v_secrets_encrypted TEXT;
  v_encryption_key TEXT := 'BexCommunication2025!SecureKey#*';
BEGIN
  -- Verificar permissão
  IF NOT (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor') THEN
    RAISE EXCEPTION 'Sem permissão para salvar credenciais';
  END IF;

  -- Criptografar senha (se fornecida)
  IF p_senha_plain IS NOT NULL AND p_senha_plain != '' THEN
    v_senha_encrypted := encode(
      pgp_sym_encrypt(p_senha_plain, v_encryption_key),
      'base64'
    );
  END IF;

  -- Criptografar secrets (tokens/API keys)
  IF p_secrets_json IS NOT NULL AND p_secrets_json != '{}'::jsonb THEN
    v_secrets_encrypted := encode(
      pgp_sym_encrypt(p_secrets_json::text, v_encryption_key),
      'base64'
    );
  END IF;

  -- Inserir ou atualizar
  IF p_cred_id IS NULL THEN
    INSERT INTO public.credenciais_cliente (
      cliente_id, projeto_id, categoria, plataforma, 
      usuario_login, senha_cipher, secrets_cipher, extra, created_by
    ) VALUES (
      p_cliente_id, p_projeto_id, p_categoria, p_plataforma,
      p_usuario_login, v_senha_encrypted, v_secrets_encrypted, p_extra_json, auth.uid()
    ) RETURNING id INTO v_cred_id;

    PERFORM criar_log_atividade(
      p_cliente_id, auth.uid(), 'insert', 'credenciais_cliente', v_cred_id,
      'Credencial criada: ' || p_plataforma || ' (' || p_categoria || ')',
      jsonb_build_object('plataforma', p_plataforma, 'categoria', p_categoria, 'usuario_login', p_usuario_login)
    );
  ELSE
    UPDATE public.credenciais_cliente
    SET 
      categoria = p_categoria,
      plataforma = p_plataforma,
      usuario_login = p_usuario_login,
      senha_cipher = COALESCE(v_senha_encrypted, senha_cipher),
      secrets_cipher = COALESCE(v_secrets_encrypted, secrets_cipher),
      extra = p_extra_json,
      updated_by = auth.uid(),
      updated_at = now()
    WHERE id = p_cred_id
    RETURNING id INTO v_cred_id;

    PERFORM criar_log_atividade(
      p_cliente_id, auth.uid(), 'update', 'credenciais_cliente', v_cred_id,
      'Credencial atualizada: ' || p_plataforma,
      jsonb_build_object('plataforma', p_plataforma)
    );
  END IF;

  RETURN v_cred_id;
END;
$$;

-- =====================================================
-- 6) Criar tabela brand_assets
-- =====================================================
CREATE TABLE IF NOT EXISTS public.brand_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('logo', 'guia_marca', 'paleta', 'outro')),
  nome TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT,
  mime_type TEXT,
  tamanho_kb INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brand_assets_cliente ON public.brand_assets(cliente_id, tipo);

ALTER TABLE public.brand_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin/Gestor gerenciam brand assets" ON public.brand_assets;
CREATE POLICY "Admin/Gestor gerenciam brand assets"
ON public.brand_assets FOR ALL
USING (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) = 'gestor' OR
  EXISTS (SELECT 1 FROM public.clientes c WHERE c.id = cliente_id AND c.responsavel_id = auth.uid())
);

DROP POLICY IF EXISTS "Equipe visualiza brand assets" ON public.brand_assets;
CREATE POLICY "Equipe visualiza brand assets"
ON public.brand_assets FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    is_admin(auth.uid()) OR
    get_user_role(auth.uid()) IN ('gestor', 'grs', 'designer', 'atendimento', 'filmmaker')
  )
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_brand_assets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_brand_assets_updated_at ON public.brand_assets;
CREATE TRIGGER trigger_brand_assets_updated_at
BEFORE UPDATE ON public.brand_assets
FOR EACH ROW
EXECUTE FUNCTION public.update_brand_assets_updated_at();