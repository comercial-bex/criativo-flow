-- Marketing Intelligence Hub - Database Structure

-- Intelligence sources configuration
CREATE TABLE public.intelligence_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'trends', 'news', 'demographics', 'weather', 'social'
  endpoint_url TEXT NOT NULL,
  method TEXT DEFAULT 'GET',
  headers JSONB DEFAULT '{}',
  params JSONB DEFAULT '{}',
  ttl_minutes INTEGER DEFAULT 15,
  is_active BOOLEAN DEFAULT true,
  requires_auth BOOLEAN DEFAULT false,
  auth_key_env TEXT, -- environment variable name for API key
  rate_limit_per_hour INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Normalized intelligence data
CREATE TABLE public.intelligence_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES public.intelligence_sources(id),
  external_id TEXT, -- unique identifier from source
  data_type TEXT NOT NULL, -- 'trend', 'news', 'demographic', 'weather'
  title TEXT,
  content TEXT,
  url TEXT,
  region TEXT,
  keywords TEXT[],
  metric_type TEXT,
  metric_value NUMERIC,
  published_at TIMESTAMP WITH TIME ZONE,
  retrieved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  raw_payload JSONB DEFAULT '{}',
  UNIQUE(source_id, external_id)
);

-- Intelligence alerts configuration
CREATE TABLE public.intelligence_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id),
  name TEXT NOT NULL,
  alert_type TEXT NOT NULL, -- 'keyword_trend', 'news_mention', 'demographic_change', 'weather_alert'
  conditions JSONB NOT NULL, -- JSON with thresholds, keywords, etc.
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Connector health monitoring
CREATE TABLE public.connector_status (
  connector_name TEXT PRIMARY KEY,
  last_success_at TIMESTAMP WITH TIME ZONE,
  last_error_at TIMESTAMP WITH TIME ZONE,
  last_error_message TEXT,
  calls_today INTEGER DEFAULT 0,
  calls_this_hour INTEGER DEFAULT 0,
  status TEXT DEFAULT 'healthy', -- 'healthy', 'warning', 'error'
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.intelligence_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intelligence_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intelligence_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connector_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies for intelligence_sources
CREATE POLICY "Admins can manage intelligence sources"
ON public.intelligence_sources
FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Users can view intelligence sources"
ON public.intelligence_sources
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- RLS Policies for intelligence_data
CREATE POLICY "Users can view intelligence data"
ON public.intelligence_data
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can manage intelligence data"
ON public.intelligence_data
FOR ALL
USING (true);

-- RLS Policies for intelligence_alerts
CREATE POLICY "Users can manage their client alerts"
ON public.intelligence_alerts
FOR ALL
USING (
  is_admin(auth.uid()) OR
  (EXISTS (
    SELECT 1 FROM clientes c 
    WHERE c.id = intelligence_alerts.cliente_id 
    AND c.responsavel_id = auth.uid()
  )) OR
  (EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.cliente_id = intelligence_alerts.cliente_id
  ))
);

-- RLS Policies for connector_status
CREATE POLICY "Admins can view connector status"
ON public.connector_status
FOR SELECT
USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor');

CREATE POLICY "System can manage connector status"
ON public.connector_status
FOR ALL
USING (true);

-- Insert default intelligence sources
INSERT INTO public.intelligence_sources (name, type, endpoint_url, ttl_minutes, requires_auth, auth_key_env) VALUES
('Google News RSS', 'news', 'https://news.google.com/rss/search', 15, false, null),
('YouTube Data API', 'social', 'https://www.googleapis.com/youtube/v3/search', 30, true, 'YOUTUBE_API_KEY'),
('IBGE Demographics', 'demographics', 'https://servicodados.ibge.gov.br/api/v1', 1440, false, null),
('OpenWeather', 'weather', 'https://api.openweathermap.org/data/2.5/weather', 60, true, 'OPENWEATHER_API_KEY'),
('Brasil API', 'demographics', 'https://brasilapi.com.br/api', 60, false, null);

-- Function to update connector status
CREATE OR REPLACE FUNCTION public.update_connector_status(
  p_connector_name TEXT,
  p_success BOOLEAN,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.connector_status (
    connector_name,
    last_success_at,
    last_error_at,
    last_error_message,
    calls_today,
    calls_this_hour,
    status,
    updated_at
  )
  VALUES (
    p_connector_name,
    CASE WHEN p_success THEN now() ELSE NULL END,
    CASE WHEN NOT p_success THEN now() ELSE NULL END,
    p_error_message,
    1,
    1,
    CASE WHEN p_success THEN 'healthy' ELSE 'error' END,
    now()
  )
  ON CONFLICT (connector_name) DO UPDATE SET
    last_success_at = CASE WHEN p_success THEN now() ELSE connector_status.last_success_at END,
    last_error_at = CASE WHEN NOT p_success THEN now() ELSE connector_status.last_error_at END,
    last_error_message = CASE WHEN NOT p_success THEN p_error_message ELSE connector_status.last_error_message END,
    calls_today = connector_status.calls_today + 1,
    calls_this_hour = connector_status.calls_this_hour + 1,
    status = CASE WHEN p_success THEN 'healthy' ELSE 'error' END,
    updated_at = now();
END;
$$;

-- Function to create intelligence alerts
CREATE OR REPLACE FUNCTION public.create_intelligence_alert(
  p_cliente_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_severity TEXT DEFAULT 'medium',
  p_source_reference JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  alert_id UUID;
BEGIN
  INSERT INTO public.notificacoes (
    user_id,
    titulo,
    mensagem,
    tipo,
    created_at
  )
  SELECT 
    p.id,
    p_title,
    p_message,
    CASE 
      WHEN p_severity = 'high' THEN 'warning'
      WHEN p_severity = 'low' THEN 'info'
      ELSE 'info'
    END,
    now()
  FROM profiles p
  WHERE p.cliente_id = p_cliente_id
  RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$$;

-- Add triggers for updated_at
CREATE TRIGGER update_intelligence_sources_updated_at
  BEFORE UPDATE ON public.intelligence_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_intelligence_alerts_updated_at
  BEFORE UPDATE ON public.intelligence_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_connector_status_updated_at
  BEFORE UPDATE ON public.connector_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();