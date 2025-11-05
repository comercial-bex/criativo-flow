-- Migration 1: Adicionar campos em cliente_onboarding
ALTER TABLE cliente_onboarding
ADD COLUMN IF NOT EXISTS duracao_contrato_meses INTEGER,
ADD COLUMN IF NOT EXISTS campanhas_mensais JSONB,
ADD COLUMN IF NOT EXISTS areas_foco TEXT[],
ADD COLUMN IF NOT EXISTS relatorio_ia_gerado TEXT,
ADD COLUMN IF NOT EXISTS relatorio_gerado_em TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS plano_estrategico_id UUID REFERENCES planos_estrategicos(id) ON DELETE SET NULL;

-- Migration 2: Adicionar campos em cliente_metas
ALTER TABLE cliente_metas
ADD COLUMN IF NOT EXISTS origem_onboarding_id UUID REFERENCES cliente_onboarding(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS area_foco TEXT,
ADD COLUMN IF NOT EXISTS mes_referencia INTEGER;

-- Migration 3: Adicionar campos em campanha
ALTER TABLE campanha
ADD COLUMN IF NOT EXISTS origem_onboarding BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_id UUID REFERENCES cliente_onboarding(id) ON DELETE SET NULL;

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_cliente_metas_onboarding ON cliente_metas(origem_onboarding_id);
CREATE INDEX IF NOT EXISTS idx_campanha_onboarding ON campanha(onboarding_id);
CREATE INDEX IF NOT EXISTS idx_cliente_onboarding_plano ON cliente_onboarding(plano_estrategico_id);