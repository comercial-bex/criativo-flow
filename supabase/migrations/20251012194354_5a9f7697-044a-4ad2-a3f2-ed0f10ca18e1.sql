-- Adicionar colunas para suporte a múltiplos agentes e frameworks
ALTER TABLE roteiros 
  ADD COLUMN IF NOT EXISTS agentes_ia_ids UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS frameworks_ids UUID[] DEFAULT '{}';

-- Migrar dados existentes para os novos campos de array
UPDATE roteiros 
SET agentes_ia_ids = ARRAY[agente_ia_id]
WHERE agente_ia_id IS NOT NULL AND (agentes_ia_ids IS NULL OR agentes_ia_ids = '{}');

UPDATE roteiros 
SET frameworks_ids = ARRAY[framework_id]
WHERE framework_id IS NOT NULL AND (frameworks_ids IS NULL OR frameworks_ids = '{}');

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_roteiros_agentes_ia_ids ON roteiros USING GIN(agentes_ia_ids);
CREATE INDEX IF NOT EXISTS idx_roteiros_frameworks_ids ON roteiros USING GIN(frameworks_ids);

COMMENT ON COLUMN roteiros.agentes_ia_ids IS 'Array de IDs de agentes de IA para combinação de estilos';
COMMENT ON COLUMN roteiros.frameworks_ids IS 'Array de IDs de frameworks para estrutura narrativa híbrida';