-- 🔧 Corrigir encrypt_credential para usar extensions.encrypt

DROP FUNCTION IF EXISTS public.encrypt_credential(text) CASCADE;

CREATE OR REPLACE FUNCTION public.encrypt_credential(credential_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'extensions', 'public'
AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  encryption_key := COALESCE(
    current_setting('app.encryption_key', true),
    'CHANGE_THIS_TO_YOUR_256_BIT_SECRET_KEY_IN_PRODUCTION_ENV'
  );
  
  -- ✅ Usar extensions.encrypt explicitamente
  RETURN encode(
    extensions.encrypt(
      credential_text::bytea,
      encryption_key::bytea,
      'aes'::text
    ),
    'base64'
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao criptografar: %', SQLERRM;
END;
$$;

-- Testar
DO $$
DECLARE
  test_encrypted TEXT;
  test_decrypted TEXT;
BEGIN
  test_encrypted := encrypt_credential('senha_teste_123');
  RAISE NOTICE '✅ Criptografia funcionou: %', LENGTH(test_encrypted);
  
  test_decrypted := decrypt_credential(test_encrypted);
  
  IF test_decrypted = 'senha_teste_123' THEN
    RAISE NOTICE '✅ Encrypt/Decrypt compatíveis!';
  ELSE
    RAISE EXCEPTION 'ERRO: Valores não batem. Original: senha_teste_123, Decriptado: %', test_decrypted;
  END IF;
END;
$$;