-- Tabela para auditoria de conexões sociais
CREATE TABLE IF NOT EXISTS social_connection_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES social_integrations_cliente(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('connected', 'disconnected', 'reconnected', 'token_expired', 'validation_failed')),
  provider TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index para queries rápidas
CREATE INDEX idx_social_connection_logs_cliente ON social_connection_logs(cliente_id);
CREATE INDEX idx_social_connection_logs_integration ON social_connection_logs(integration_id);
CREATE INDEX idx_social_connection_logs_created ON social_connection_logs(created_at DESC);

-- RLS policies
ALTER TABLE social_connection_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver logs de seus clientes"
  ON social_connection_logs FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      is_admin(auth.uid()) OR
      cliente_id IN (
        SELECT cliente_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Sistema pode criar logs"
  ON social_connection_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);