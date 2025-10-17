-- Criar tabela de status de leitura para mensagens do chat
CREATE TABLE IF NOT EXISTS team_chat_read_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  thread_id UUID NOT NULL REFERENCES team_chat_threads(id) ON DELETE CASCADE,
  last_read_message_id UUID REFERENCES team_chat_messages(id) ON DELETE SET NULL,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, thread_id)
);

-- Enable RLS
ALTER TABLE team_chat_read_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Usuários podem gerenciar próprio status de leitura"
  ON team_chat_read_status
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index para performance
CREATE INDEX idx_read_status_user_thread ON team_chat_read_status(user_id, thread_id);

-- Adicionar à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE team_chat_read_status;