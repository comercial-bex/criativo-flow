-- FASE 1.1: Adicionar campos em profiles (sem índices ainda)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS role_requested TEXT;