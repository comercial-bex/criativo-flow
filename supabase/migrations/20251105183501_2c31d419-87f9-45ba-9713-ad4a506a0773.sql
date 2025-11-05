-- Adicionar campos de links de redes sociais no cliente_onboarding (FASE 2)
ALTER TABLE cliente_onboarding 
ADD COLUMN IF NOT EXISTS link_instagram TEXT,
ADD COLUMN IF NOT EXISTS link_facebook TEXT,
ADD COLUMN IF NOT EXISTS link_linkedin TEXT,
ADD COLUMN IF NOT EXISTS link_tiktok TEXT,
ADD COLUMN IF NOT EXISTS link_youtube TEXT,
ADD COLUMN IF NOT EXISTS link_site TEXT,
ADD COLUMN IF NOT EXISTS link_google_maps TEXT;