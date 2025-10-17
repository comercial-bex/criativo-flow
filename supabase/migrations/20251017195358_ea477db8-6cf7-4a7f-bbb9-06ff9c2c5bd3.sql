-- ==========================================
-- CHAT INTERNO DA EQUIPE
-- ==========================================

-- 1. Tabela de Threads (Conversas)
CREATE TABLE IF NOT EXISTS public.team_chat_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  participants uuid[] NOT NULL DEFAULT ARRAY[]::uuid[],
  is_group boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_team_chat_threads_participants ON public.team_chat_threads USING GIN(participants);
CREATE INDEX idx_team_chat_threads_last_message ON public.team_chat_threads(last_message_at DESC);

-- 2. Tabela de Mensagens
CREATE TABLE IF NOT EXISTS public.team_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES public.team_chat_threads(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  attachments jsonb DEFAULT '[]'::jsonb,
  mentioned_users uuid[] DEFAULT ARRAY[]::uuid[],
  reactions jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_team_chat_messages_thread ON public.team_chat_messages(thread_id);
CREATE INDEX idx_team_chat_messages_sender ON public.team_chat_messages(sender_id);
CREATE INDEX idx_team_chat_messages_created ON public.team_chat_messages(created_at DESC);
CREATE INDEX idx_team_chat_messages_mentioned ON public.team_chat_messages USING GIN(mentioned_users);

-- ==========================================
-- RLS POLICIES
-- ==========================================

-- Threads: Usuários só veem threads em que participam
ALTER TABLE public.team_chat_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_threads" ON public.team_chat_threads
FOR SELECT USING (
  auth.uid() = ANY(participants)
);

CREATE POLICY "users_create_threads" ON public.team_chat_threads
FOR INSERT WITH CHECK (
  auth.uid() = created_by AND
  auth.uid() = ANY(participants)
);

CREATE POLICY "participants_update_threads" ON public.team_chat_threads
FOR UPDATE USING (
  auth.uid() = ANY(participants)
);

-- Mensagens: Usuários só veem mensagens de threads em que participam
ALTER TABLE public.team_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_thread_messages" ON public.team_chat_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.team_chat_threads t
    WHERE t.id = thread_id
    AND auth.uid() = ANY(t.participants)
  )
);

CREATE POLICY "participants_create_messages" ON public.team_chat_messages
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_chat_threads t
    WHERE t.id = thread_id
    AND auth.uid() = ANY(t.participants)
  ) AND
  auth.uid() = sender_id
);

CREATE POLICY "sender_update_own_messages" ON public.team_chat_messages
FOR UPDATE USING (
  auth.uid() = sender_id OR
  EXISTS (
    SELECT 1 FROM public.team_chat_threads t
    WHERE t.id = thread_id
    AND auth.uid() = ANY(t.participants)
  )
);

-- ==========================================
-- REALTIME
-- ==========================================

-- Habilitar realtime para threads e mensagens
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_chat_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_chat_messages;

ALTER TABLE public.team_chat_threads REPLICA IDENTITY FULL;
ALTER TABLE public.team_chat_messages REPLICA IDENTITY FULL;
