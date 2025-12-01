-- Adicionar coluna para rastrear sincronização
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS sync_status text DEFAULT 'pending';
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS onboarding_status text DEFAULT 'pending'