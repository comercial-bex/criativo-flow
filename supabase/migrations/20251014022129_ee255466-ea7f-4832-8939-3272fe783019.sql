-- ==========================================
-- FASE 1: TABELAS DO MONITOR DE CONEXÕES
-- ==========================================

-- 1.1 Tabela de Conexões
CREATE TABLE public.system_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  "group" text NOT NULL CHECK ("group" IN ('database', 'api', 'integration', 'module', 'modal')),
  related_route text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('connected', 'degraded', 'disconnected', 'pending', 'paused')),
  last_ping timestamptz,
  latency_ms int,
  error_code text,
  error_message text,
  severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  deps jsonb DEFAULT '[]'::jsonb,
  monitoring_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_connections_status ON public.system_connections(status);
CREATE INDEX idx_connections_group ON public.system_connections("group");
CREATE INDEX idx_connections_severity ON public.system_connections(severity);

-- 1.2 Tabela de Verificações (Histórico)
CREATE TABLE public.system_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid REFERENCES public.system_connections(id) ON DELETE CASCADE,
  check_type text NOT NULL CHECK (check_type IN ('ping', 'auth', 'rls', 'quota', 'webhook', 'latency')),
  result text NOT NULL CHECK (result IN ('ok', 'warn', 'fail')),
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_checks_connection ON public.system_checks(connection_id);
CREATE INDEX idx_checks_result ON public.system_checks(result);
CREATE INDEX idx_checks_created ON public.system_checks(created_at DESC);

-- 1.3 Tabela de Playbooks (Soluções Guiadas)
CREATE TABLE public.system_playbooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_error text NOT NULL,
  title text NOT NULL,
  steps jsonb NOT NULL,
  doc_url text,
  estimated_effort_min int,
  tags text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_playbooks_tags ON public.system_playbooks USING GIN(tags);

-- 1.4 Tabela de Eventos (Telemetria)
CREATE TABLE public.system_events_bus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid REFERENCES public.system_connections(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('error', 'warn', 'info', 'change_status')),
  payload jsonb DEFAULT '{}'::jsonb,
  acknowledged boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_events_connection ON public.system_events_bus(connection_id);
CREATE INDEX idx_events_type ON public.system_events_bus(event_type);
CREATE INDEX idx_events_ack ON public.system_events_bus(acknowledged) WHERE NOT acknowledged;

-- 1.5 Tabelas de Chat de Suporte
CREATE TABLE public.system_chat_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  tags jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.system_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES public.system_chat_threads(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  attachments jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_messages_thread ON public.system_chat_messages(thread_id);

-- ==========================================
-- FASE 2: RLS POLICIES
-- ==========================================

-- 2.1 system_connections
ALTER TABLE public.system_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_manage_connections" ON public.system_connections
FOR ALL USING (
  is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor'::user_role
);

CREATE POLICY "executors_view_own_module_connections" ON public.system_connections
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND (
      (p.especialidade = 'grs' AND system_connections.name LIKE '%GRS%')
      OR (p.especialidade = 'design' AND system_connections.name LIKE '%Design%')
      OR (p.especialidade = 'audiovisual' AND system_connections.name LIKE '%Audiovisual%')
    )
  )
);

-- 2.2 system_checks
ALTER TABLE public.system_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_view_all_checks" ON public.system_checks
FOR SELECT USING (
  is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor'::user_role
);

-- 2.3 system_events_bus
ALTER TABLE public.system_events_bus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_manage_events" ON public.system_events_bus
FOR ALL USING (
  is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor'::user_role
);

-- 2.4 system_playbooks
ALTER TABLE public.system_playbooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_view_playbooks" ON public.system_playbooks
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "admin_manage_playbooks" ON public.system_playbooks
FOR ALL USING (is_admin(auth.uid()));

-- 2.5 system_chat_*
ALTER TABLE public.system_chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_threads" ON public.system_chat_threads
FOR ALL USING (created_by = auth.uid());

CREATE POLICY "admin_view_all_threads" ON public.system_chat_threads
FOR SELECT USING (
  is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor'::user_role
);

CREATE POLICY "users_manage_messages_in_own_threads" ON public.system_chat_messages
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.system_chat_threads
    WHERE id = system_chat_messages.thread_id
    AND (created_by = auth.uid() OR is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor'::user_role)
  )
);

-- ==========================================
-- FASE 8: SEED INICIAL
-- ==========================================

-- Seed de Conexões
INSERT INTO public.system_connections (name, "group", related_route, monitoring_enabled) VALUES
-- Database & Storage
('Supabase DB', 'database', '/configuracoes/monitor', true),
('Supabase Storage', 'integration', '/configuracoes/monitor', true),

-- APIs Externas
('WhatsApp API', 'api', NULL, true),
('Google Drive API', 'integration', NULL, true),
('IA de Roteiro (GPT-4.1)', 'api', NULL, true),
('Transcrição de Áudio', 'api', NULL, true),
('E-mail SMTP', 'api', NULL, true),

-- Módulos
('GRS / Tarefas (criação)', 'module', '/grs/tarefas', true),
('Calendário / Sincronização', 'module', '/calendario', true),
('Design / Minhas Tarefas', 'module', '/design/minhas-tarefas', true),
('Audiovisual / Minhas Tarefas', 'module', '/audiovisual/minhas-tarefas', true),
('Financeiro / Folha + Adiantamento', 'module', '/financeiro/folha', true),
('Inventário / Equipamentos + Captação', 'module', '/audiovisual/equipamentos', true),
('Painel do Cliente / Aprovação', 'module', '/cliente/aprovacoes', true),

-- Modais Críticos
('Modal Criar Tarefa (GRS)', 'modal', '/grs/tarefas', true),
('Modal Agendar Captação', 'modal', '/audiovisual/tarefas', true),
('Modal Equipamentos', 'modal', '/audiovisual/equipamentos', true),
('Modal Pagamento/Adiantamento', 'modal', '/financeiro/folha', true),
('Modal Contratos', 'modal', '/admin/contratos', true);

-- Seed de Playbooks
INSERT INTO public.system_playbooks (match_error, title, steps, doc_url, estimated_effort_min, tags) VALUES
(
  'JWT|auth',
  'Falha de Autenticação Supabase',
  '[
    {"step": 1, "action": "Verificar variáveis SUPABASE_URL/ANON/SERVICE", "expected": "Valores corretos no .env"},
    {"step": 2, "action": "Rodar POST /api/monitor/test/supabase-db", "expected": "Status 200"},
    {"step": 3, "action": "Checar horário do server (skew)", "expected": "Diferença < 5min"},
    {"step": 4, "action": "Renovar token e recarregar Lovable Secrets", "expected": "Autenticação OK"}
  ]'::jsonb,
  'https://supabase.com/docs/guides/auth',
  15,
  ARRAY['auth', 'supabase', 'jwt']
),
(
  '429|rate.?limit',
  'Limite de Requisições (WhatsApp/Drive)',
  '[
    {"step": 1, "action": "Implementar backoff exponencial", "expected": "Delays: 1s, 2s, 4s, 8s"},
    {"step": 2, "action": "Criar fila de mensagens (150 chars)", "expected": "Split automático"},
    {"step": 3, "action": "Distribuir por janela 1–5 min", "expected": "< 100 req/min"},
    {"step": 4, "action": "Rever paralelismo e quotas", "expected": "Sem 429"}
  ]'::jsonb,
  NULL,
  20,
  ARRAY['rate-limit', 'whatsapp', 'drive', '429']
),
(
  'RLS.*denied|permission',
  'RLS/RBAC Bloqueando Modais',
  '[
    {"step": 1, "action": "Verificar policies para roles executor/gestor", "expected": "SELECT permitido"},
    {"step": 2, "action": "Rodar probe RLS em tabelas críticas", "expected": "PASS em tarefas, agendamentos"},
    {"step": 3, "action": "Aplicar migração segura de policies", "expected": "Sem downtime"},
    {"step": 4, "action": "Testar modais em ambiente staging", "expected": "CRUD funcional"}
  ]'::jsonb,
  'https://supabase.com/docs/guides/auth/row-level-security',
  30,
  ARRAY['rls', 'rbac', 'permissions', 'security']
),
(
  'webhook|signature|invalid',
  'Webhook Inválido',
  '[
    {"step": 1, "action": "Verificar segredo do webhook", "expected": "Secret key correto"},
    {"step": 2, "action": "Girar token se comprometido", "expected": "Novo token gerado"},
    {"step": 3, "action": "Revalidar endpoint público", "expected": "URL acessível"},
    {"step": 4, "action": "Replay do último evento", "expected": "Webhook processado"}
  ]'::jsonb,
  NULL,
  10,
  ARRAY['webhook', 'integration', 'security']
);