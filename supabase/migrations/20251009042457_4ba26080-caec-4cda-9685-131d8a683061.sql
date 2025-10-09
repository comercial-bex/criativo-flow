-- FASE 1.2: Criar tabela de tokens de verificação
CREATE TABLE IF NOT EXISTS public.email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_email_verif_user ON public.email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verif_token ON public.email_verification_tokens(token) WHERE used_at IS NULL;

-- RLS
ALTER TABLE public.email_verification_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sistema pode gerenciar tokens de verificação"
ON public.email_verification_tokens
FOR ALL
USING (true);