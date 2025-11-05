-- 🔧 Limpar funções duplicadas encrypt_credential
-- Dropar TODAS as versões (com diferentes assinaturas)
DROP FUNCTION IF EXISTS encrypt_credential(text) CASCADE;
DROP FUNCTION IF EXISTS encrypt_credential(text, text) CASCADE;
DROP FUNCTION IF EXISTS public.encrypt_credential(text) CASCADE;
DROP FUNCTION IF EXISTS public.encrypt_credential(text, text) CASCADE;

-- ✅ Recriar apenas UMA versão correta
CREATE OR REPLACE FUNCTION public.encrypt_credential(credential_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  -- Usar chave de ambiente ou chave padrão
  encryption_key := COALESCE(
    current_setting('app.encryption_key', true),
    'CHANGE_THIS_TO_YOUR_256_BIT_SECRET_KEY_IN_PRODUCTION_ENV'
  );
  
  -- Retornar texto criptografado em base64
  RETURN encode(
    encrypt(
      credential_text::bytea,
      encryption_key::bytea,
      'aes'
    ),
    'base64'
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao criptografar: %', SQLERRM;
END;
$$;

-- Verificar se ficou apenas 1 função
DO $$
DECLARE
  func_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO func_count
  FROM pg_proc
  WHERE proname = 'encrypt_credential';
  
  RAISE NOTICE '✅ Funções encrypt_credential encontradas: %', func_count;
  
  IF func_count != 1 THEN
    RAISE EXCEPTION 'ERRO: Ainda existem % funções encrypt_credential. Esperado: 1', func_count;
  END IF;
END;
$$;