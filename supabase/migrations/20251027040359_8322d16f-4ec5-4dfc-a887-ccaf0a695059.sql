-- Migration: Fix duplicate foreign key between projetos and clientes
-- Issue: Two FKs (projetos_cliente_id_fkey and fk_projetos_cliente) causing PostgREST ambiguity

-- 1. Verificar FKs existentes
DO $$
DECLARE
  fk_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO fk_count
  FROM pg_constraint
  WHERE conrelid = 'projetos'::regclass
    AND confrelid = 'clientes'::regclass
    AND contype = 'f';
  
  RAISE NOTICE '✅ FKs encontradas antes da correção: %', fk_count;
END $$;

-- 2. Remover FK duplicada (padrão do Supabase)
ALTER TABLE projetos 
DROP CONSTRAINT IF EXISTS projetos_cliente_id_fkey;

-- 3. Garantir que fk_projetos_cliente existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_projetos_cliente'
  ) THEN
    ALTER TABLE projetos
    ADD CONSTRAINT fk_projetos_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    ON DELETE SET NULL;
    
    RAISE NOTICE '✅ FK fk_projetos_cliente criada';
  ELSE
    RAISE NOTICE '✅ FK fk_projetos_cliente já existe';
  END IF;
END $$;

-- 4. Validar resultado final
DO $$
DECLARE
  fk_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO fk_count
  FROM pg_constraint
  WHERE conrelid = 'projetos'::regclass
    AND confrelid = 'clientes'::regclass
    AND contype = 'f';
  
  IF fk_count != 1 THEN
    RAISE EXCEPTION '❌ Esperado 1 FK, encontrado %', fk_count;
  END IF;
  
  RAISE NOTICE '✅ Migration concluída: 1 FK única entre projetos e clientes';
END $$;