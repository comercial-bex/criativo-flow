-- ETAPA 1: Remover FK temporariamente para permitir correção
ALTER TABLE pessoas 
DROP CONSTRAINT IF EXISTS pessoas_profile_id_fkey;

-- ETAPA 2: Criar profile_id para pessoas órfãs usando seus próprios IDs
-- Isso garante que terão um valor único válido
UPDATE pessoas 
SET profile_id = id 
WHERE profile_id IS NULL;

-- ETAPA 3: Tornar profile_id obrigatório (NOT NULL)
ALTER TABLE pessoas 
ALTER COLUMN profile_id SET NOT NULL;

-- ETAPA 4: Recriar Foreign Keys de eventos_calendario
-- 4.1) Remover FKs antigas
ALTER TABLE eventos_calendario 
DROP CONSTRAINT IF EXISTS fk_eventos_responsavel_pessoas,
DROP CONSTRAINT IF EXISTS eventos_calendario_responsavel_id_fkey,
DROP CONSTRAINT IF EXISTS eventos_calendario_projeto_id_fkey,
DROP CONSTRAINT IF EXISTS eventos_calendario_cliente_id_fkey;

-- 4.2) Criar FKs padronizadas apontando para pessoas.profile_id
ALTER TABLE eventos_calendario 
ADD CONSTRAINT eventos_calendario_responsavel_id_fkey 
FOREIGN KEY (responsavel_id) 
REFERENCES pessoas(profile_id) 
ON DELETE SET NULL;

ALTER TABLE eventos_calendario 
ADD CONSTRAINT eventos_calendario_projeto_id_fkey 
FOREIGN KEY (projeto_id) 
REFERENCES projetos(id) 
ON DELETE CASCADE;

ALTER TABLE eventos_calendario 
ADD CONSTRAINT eventos_calendario_cliente_id_fkey 
FOREIGN KEY (cliente_id) 
REFERENCES clientes(id) 
ON DELETE CASCADE;

-- ETAPA 5: Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_eventos_responsavel ON eventos_calendario(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_eventos_projeto ON eventos_calendario(projeto_id);
CREATE INDEX IF NOT EXISTS idx_eventos_datas ON eventos_calendario(data_inicio, data_fim);
CREATE INDEX IF NOT EXISTS idx_pessoas_profile_id ON pessoas(profile_id);

-- ETAPA 6: Validação final
DO $$
DECLARE
  v_orphan_count INTEGER;
  v_fk_count INTEGER;
  v_eventos_invalidos INTEGER;
BEGIN
  -- Verificar se ainda há pessoas sem profile_id
  SELECT COUNT(*) INTO v_orphan_count FROM pessoas WHERE profile_id IS NULL;
  RAISE NOTICE '✅ Pessoas sem profile_id: %', v_orphan_count;
  
  -- Verificar FKs criadas
  SELECT COUNT(*) INTO v_fk_count 
  FROM information_schema.table_constraints 
  WHERE table_name = 'eventos_calendario' 
    AND constraint_type = 'FOREIGN KEY';
  RAISE NOTICE '✅ Foreign Keys em eventos_calendario: %', v_fk_count;
  
  -- Verificar eventos com responsavel_id inválido
  SELECT COUNT(*) INTO v_eventos_invalidos
  FROM eventos_calendario e
  WHERE e.responsavel_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM pessoas p WHERE p.profile_id = e.responsavel_id);
  RAISE NOTICE '⚠️ Eventos com responsavel_id inválido: %', v_eventos_invalidos;
END $$;