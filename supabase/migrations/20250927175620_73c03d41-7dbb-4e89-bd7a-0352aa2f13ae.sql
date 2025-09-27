-- Criar tabelas para integração social
CREATE TABLE public.social_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'facebook', 'instagram', 'google', 'tiktok'
  provider_user_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  account_name TEXT,
  account_data JSONB DEFAULT '{}',
  permissions JSONB DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider, provider_user_id)
);

-- Criar tabela para logs de autenticação social
CREATE TABLE public.social_auth_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  action TEXT NOT NULL, -- 'login', 'token_refresh', 'disconnect'
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para métricas das redes sociais
CREATE TABLE public.social_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES public.social_integrations(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL, -- 'engagement', 'reach', 'impressions', 'followers'
  metric_value BIGINT NOT NULL DEFAULT 0,
  metric_date DATE NOT NULL,
  raw_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(integration_id, metric_type, metric_date)
);

-- Habilitar RLS
ALTER TABLE public.social_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_auth_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_metrics ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para social_integrations
CREATE POLICY "Usuários podem ver suas próprias integrações"
ON public.social_integrations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias integrações"
ON public.social_integrations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias integrações"
ON public.social_integrations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias integrações"
ON public.social_integrations FOR DELETE
USING (auth.uid() = user_id);

-- Políticas RLS para social_auth_logs
CREATE POLICY "Sistema pode criar logs de auth"
ON public.social_auth_logs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Usuários podem ver próprios logs"
ON public.social_auth_logs FOR SELECT
USING (auth.uid() = user_id);

-- Políticas RLS para social_metrics
CREATE POLICY "Usuários podem ver métricas de suas integrações"
ON public.social_metrics FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.social_integrations si
  WHERE si.id = social_metrics.integration_id
  AND si.user_id = auth.uid()
));

CREATE POLICY "Sistema pode criar métricas"
ON public.social_metrics FOR INSERT
WITH CHECK (true);

CREATE POLICY "Sistema pode atualizar métricas"
ON public.social_metrics FOR UPDATE
USING (true);

-- Trigger para updated_at
CREATE TRIGGER update_social_integrations_updated_at
BEFORE UPDATE ON public.social_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_social_integrations_user_provider ON public.social_integrations(user_id, provider);
CREATE INDEX idx_social_auth_logs_user_created ON public.social_auth_logs(user_id, created_at DESC);
CREATE INDEX idx_social_metrics_integration_date ON public.social_metrics(integration_id, metric_date DESC);