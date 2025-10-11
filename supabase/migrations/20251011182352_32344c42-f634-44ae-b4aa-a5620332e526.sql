-- =====================================================
-- Migration: Correção de Permissões GRS
-- Fases: 1 (RLS credenciais), 2 (fn_cred_reveal), 5 (Storage)
-- =====================================================

-- =====================================================
-- FASE 1: Atualizar RLS de credenciais_cliente
-- =====================================================

-- 1.1 Dropar policies antigas que bloqueiam GRS
DROP POLICY IF EXISTS "Admins e Gestores podem ver metadados de credenciais" ON public.credenciais_cliente;
DROP POLICY IF EXISTS "Admins e Gestores podem gerenciar credenciais" ON public.credenciais_cliente;

-- 1.2 Criar novas policies incluindo GRS
CREATE POLICY "Admins, Gestores e GRS podem ver metadados"
ON public.credenciais_cliente FOR SELECT
TO public
USING (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) IN ('gestor'::user_role, 'grs'::user_role)
);

CREATE POLICY "Admins, Gestores e GRS podem gerenciar credenciais"
ON public.credenciais_cliente FOR ALL
TO public
USING (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) IN ('gestor'::user_role, 'grs'::user_role)
)
WITH CHECK (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) IN ('gestor'::user_role, 'grs'::user_role)
);

-- =====================================================
-- FASE 2: Atualizar Função fn_cred_reveal
-- =====================================================

CREATE OR REPLACE FUNCTION public.fn_cred_reveal(
  p_cred_id UUID,
  p_motivo TEXT DEFAULT 'Acesso para trabalho'::text
)
RETURNS TABLE(senha_plain TEXT, secrets_plain JSONB)
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
  v_user_role user_role;
BEGIN
  -- VALIDAÇÃO ATUALIZADA: Admin, Gestor e GRS podem revelar senhas
  SELECT get_user_role(auth.uid()) INTO v_user_role;
  
  IF NOT (is_admin(auth.uid()) OR v_user_role IN ('gestor'::user_role, 'grs'::user_role)) THEN
    RAISE EXCEPTION 'ACESSO_NEGADO: Apenas administradores, gestores e GRS podem revelar senhas';
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
  FROM credenciais_cliente c
  WHERE c.id = p_cred_id;

  IF v_senha_decrypted IS NULL AND v_secrets_decrypted = '{}'::jsonb THEN
    RAISE EXCEPTION 'CREDENCIAL_NAO_ENCONTRADA: ID inválido ou sem dados criptografados';
  END IF;

  -- Log de auditoria detalhado (CRÍTICO para compliance)
  PERFORM criar_log_atividade(
    v_cliente_id, 
    auth.uid(), 
    'reveal_credential', 
    'credenciais_cliente', 
    p_cred_id,
    '🔓 ACESSO SENSÍVEL: Senha revelada para ' || v_plataforma,
    jsonb_build_object(
      'plataforma', v_plataforma, 
      'motivo', p_motivo,
      'timestamp_utc', NOW() AT TIME ZONE 'UTC',
      'user_role', v_user_role,
      'ip_address', current_setting('request.headers', true)::json->>'x-real-ip'
    )
  );

  RETURN QUERY SELECT v_senha_decrypted, v_secrets_decrypted;
END;
$$;

-- =====================================================
-- FASE 5: Atualizar Policies do Storage task-attachments
-- =====================================================

-- 5.1 Dropar policies antigas genéricas
DROP POLICY IF EXISTS "Users can view task attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload task attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can update task attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete task attachments" ON storage.objects;

-- 5.2 Criar policies granulares por role

-- SELECT: Equipe pode ver arquivos
CREATE POLICY "Equipe pode ver arquivos de tarefas"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'task-attachments' AND
  (
    is_admin(auth.uid()) OR 
    get_user_role(auth.uid()) IN ('gestor'::user_role, 'grs'::user_role, 'designer'::user_role, 'filmmaker'::user_role, 'atendimento'::user_role)
  )
);

-- INSERT: Equipe pode fazer upload
CREATE POLICY "Equipe pode fazer upload de arquivos"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'task-attachments' AND
  (
    is_admin(auth.uid()) OR 
    get_user_role(auth.uid()) IN ('gestor'::user_role, 'grs'::user_role, 'designer'::user_role, 'filmmaker'::user_role, 'atendimento'::user_role)
  )
);

-- UPDATE: Equipe pode atualizar metadados
CREATE POLICY "Equipe pode atualizar arquivos"
ON storage.objects FOR UPDATE
TO public
USING (
  bucket_id = 'task-attachments' AND
  (
    is_admin(auth.uid()) OR 
    get_user_role(auth.uid()) IN ('gestor'::user_role, 'grs'::user_role, 'designer'::user_role, 'filmmaker'::user_role)
  )
);

-- DELETE: Apenas admin, gestor e GRS podem deletar
CREATE POLICY "Admin/Gestor/GRS podem deletar arquivos"
ON storage.objects FOR DELETE
TO public
USING (
  bucket_id = 'task-attachments' AND
  (
    is_admin(auth.uid()) OR 
    get_user_role(auth.uid()) IN ('gestor'::user_role, 'grs'::user_role)
  )
);

-- =====================================================
-- Documentação
-- =====================================================

COMMENT ON POLICY "Admins, Gestores e GRS podem ver metadados" ON public.credenciais_cliente IS 
'GRS precisa acessar credenciais para preencher planejamento estratégico';

COMMENT ON POLICY "Admins, Gestores e GRS podem gerenciar credenciais" ON public.credenciais_cliente IS 
'GRS pode criar/editar credenciais mas acesso é auditado via logs_atividade';

COMMENT ON FUNCTION public.fn_cred_reveal(UUID, TEXT) IS 
'Função SECURITY DEFINER para revelar senhas criptografadas. Permitido para: admin, gestor, grs. Todos os acessos são registrados em logs_atividade para compliance.';