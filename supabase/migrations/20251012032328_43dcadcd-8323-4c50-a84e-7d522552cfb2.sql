-- Criar tabela de logs de eventos para Event Bus
CREATE TABLE IF NOT EXISTS public.event_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_event_logs_type ON public.event_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_event_logs_created ON public.event_logs(created_at DESC);

-- RLS policies
ALTER TABLE public.event_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin e Gestor podem ver event logs"
  ON public.event_logs FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor');

CREATE POLICY "Sistema pode criar event logs"
  ON public.event_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);