-- Adicionar campos ao planejamentos para Plano Editorial Mensal
ALTER TABLE planejamentos 
ADD COLUMN IF NOT EXISTS status_plano TEXT DEFAULT 'em_andamento' 
  CHECK (status_plano IN ('em_andamento', 'aprovado', 'em_revisao'));

ALTER TABLE planejamentos 
ADD COLUMN IF NOT EXISTS responsavel_id UUID REFERENCES pessoas(id);

ALTER TABLE planejamentos 
ADD COLUMN IF NOT EXISTS observacoes_estrategista TEXT;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_planejamentos_status_plano ON planejamentos(status_plano);
CREATE INDEX IF NOT EXISTS idx_planejamentos_responsavel ON planejamentos(responsavel_id);