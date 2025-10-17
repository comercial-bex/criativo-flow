-- ============================================
-- CORREÇÃO COMPLETA DOS CONECTORES DE INTELIGÊNCIA
-- ============================================

-- 1. CORRIGIR ENDPOINTS DAS FONTES
UPDATE intelligence_sources 
SET 
  endpoint_url = 'https://brasilapi.com.br/api/ibge/municipios/v1/SP',
  params = '{"orderBy": "nome"}'::jsonb,
  updated_at = NOW()
WHERE name = 'Brasil API';

UPDATE intelligence_sources 
SET 
  endpoint_url = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados',
  params = '{"orderBy": "nome"}'::jsonb,
  updated_at = NOW()
WHERE name = 'IBGE Demographics';

-- 2. HABILITAR EXTENSÕES NECESSÁRIAS PARA CRON
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 3. CRIAR CRON JOB PARA EXECUTAR INTELLIGENCE-COLLECTOR A CADA 6 HORAS
SELECT cron.schedule(
  'intelligence-collector-job',
  '0 */6 * * *', -- A cada 6 horas
  $$
  SELECT net.http_post(
    url := 'https://xvpqgwbktpfodbuhwqhh.supabase.co/functions/v1/intelligence-collector',
    headers := jsonb_build_object(
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cHFnd2JrdHBmb2RidWh3cWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NDA0MzUsImV4cCI6MjA3MzExNjQzNX0.slj0vNEGfgTFv_vB_4ieLH1zuHSP_A6dAZsMmHVWnto',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- 4. ADICIONAR COLUNAS DE HEALTH CHECK NO CONNECTOR_STATUS
ALTER TABLE connector_status 
ADD COLUMN IF NOT EXISTS error_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_items_collected INTEGER DEFAULT 0;

-- 5. ADICIONAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_intelligence_data_retrieved_at ON intelligence_data(retrieved_at DESC);
CREATE INDEX IF NOT EXISTS idx_intelligence_data_source_id ON intelligence_data(source_id);
CREATE INDEX IF NOT EXISTS idx_intelligence_data_data_type ON intelligence_data(data_type);
CREATE INDEX IF NOT EXISTS idx_connector_status_updated ON connector_status(updated_at DESC);

-- 6. COMENTÁRIOS INFORMATIVOS
COMMENT ON EXTENSION pg_cron IS 'Extensão para agendar tarefas automáticas no PostgreSQL';
COMMENT ON EXTENSION pg_net IS 'Extensão para fazer requisições HTTP do PostgreSQL';
COMMENT ON INDEX idx_intelligence_data_retrieved_at IS 'Índice para acelerar queries por data de coleta';
COMMENT ON INDEX idx_intelligence_data_source_id IS 'Índice para acelerar queries por fonte de dados';