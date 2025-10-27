-- Verificar se colunas existem antes de criar
DO $$
BEGIN
  -- Adicionar is_faturavel
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tarefa' AND column_name = 'is_faturavel'
  ) THEN
    ALTER TABLE tarefa ADD COLUMN is_faturavel BOOLEAN DEFAULT TRUE;
  END IF;
  
  -- Adicionar valor_faturamento
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tarefa' AND column_name = 'valor_faturamento'
  ) THEN
    ALTER TABLE tarefa ADD COLUMN valor_faturamento NUMERIC(10,2) DEFAULT 0;
  END IF;
  
  -- Adicionar custo_execucao
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tarefa' AND column_name = 'custo_execucao'
  ) THEN
    ALTER TABLE tarefa ADD COLUMN custo_execucao NUMERIC(10,2) DEFAULT 0;
  END IF;
  
  -- Adicionar evento_calendario_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tarefa' AND column_name = 'evento_calendario_id'
  ) THEN
    ALTER TABLE tarefa ADD COLUMN evento_calendario_id UUID REFERENCES eventos_calendario(id) ON DELETE SET NULL;
  END IF;
  
  -- Adicionar auto_criar_evento
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tarefa' AND column_name = 'auto_criar_evento'
  ) THEN
    ALTER TABLE tarefa ADD COLUMN auto_criar_evento BOOLEAN DEFAULT FALSE;
  END IF;
  
  RAISE NOTICE '✅ Colunas de tarefa verificadas/criadas';
END $$;

-- Popular is_faturavel nas tarefas existentes
UPDATE tarefa
SET is_faturavel = TRUE
WHERE is_faturavel IS NULL;

-- Script para criptografar credenciais existentes (se houver)
DO $$
DECLARE
  v_cred RECORD;
  v_senha_encrypted BYTEA;
  v_tokens_encrypted BYTEA;
BEGIN
  FOR v_cred IN 
    SELECT id, senha, tokens_api 
    FROM credenciais_cliente 
    WHERE senha IS NOT NULL 
      AND octet_length(senha::bytea) < 100
  LOOP
    BEGIN
      v_senha_encrypted := pgp_sym_encrypt(
        v_cred.senha::text, 
        current_setting('app.encryption_key', true)
      );
      
      IF v_cred.tokens_api IS NOT NULL THEN
        v_tokens_encrypted := pgp_sym_encrypt(
          v_cred.tokens_api::text,
          current_setting('app.encryption_key', true)
        );
      END IF;
      
      UPDATE credenciais_cliente
      SET 
        senha = v_senha_encrypted,
        tokens_api = COALESCE(v_tokens_encrypted, tokens_api),
        updated_at = NOW()
      WHERE id = v_cred.id;
      
      RAISE NOTICE '✅ Credencial % criptografada', v_cred.id;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING '⚠️ Erro ao criptografar credencial %: %', v_cred.id, SQLERRM;
    END;
  END LOOP;
END $$;