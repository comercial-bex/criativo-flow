-- Adicionar APIs sociais ao sistema de monitoramento
INSERT INTO public.system_connections (
  "group", name, status, config, monitoring_enabled, severity, related_route
) VALUES
(
  'integration',
  'Meta API (Facebook)',
  'disconnected',
  '{
    "provider": "facebook",
    "oauth_required": true,
    "scopes": ["pages_read_engagement", "pages_manage_posts", "instagram_basic", "instagram_manage_insights"],
    "docs_url": "https://developers.facebook.com/docs/graph-api",
    "description": "API do Facebook para autenticação OAuth e acesso a dados de páginas e anúncios"
  }'::jsonb,
  true,
  'high',
  '/configuracoes/monitor'
),
(
  'integration',
  'Instagram Graph API',
  'disconnected',
  '{
    "provider": "instagram",
    "oauth_required": true,
    "scopes": ["instagram_basic", "instagram_manage_insights", "instagram_manage_comments"],
    "docs_url": "https://developers.facebook.com/docs/instagram-api",
    "description": "API do Instagram para gestão de contas business e coleta de métricas"
  }'::jsonb,
  true,
  'high',
  '/configuracoes/monitor'
),
(
  'integration',
  'Google Analytics 4',
  'disconnected',
  '{
    "provider": "google_analytics",
    "oauth_required": true,
    "scopes": ["https://www.googleapis.com/auth/analytics.readonly"],
    "docs_url": "https://developers.google.com/analytics/devguides/reporting/data/v1",
    "description": "Google Analytics para tracking e análise de métricas web e sociais"
  }'::jsonb,
  true,
  'medium',
  '/configuracoes/monitor'
);