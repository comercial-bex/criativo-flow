-- ================================
-- CONFIGURAÇÃO CRON JOB SEMANAL
-- Atualização automática de métricas de concorrentes
-- ================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Agendar job para executar toda segunda-feira às 6h da manhã
SELECT cron.schedule(
  'update-competitor-metrics-weekly',
  '0 6 * * 1', -- Toda segunda-feira às 6h (formato cron: minuto hora dia_mes mes dia_semana)
  $$
  SELECT
    net.http_post(
      url := 'https://xvpqgwbktpfodbuhwqhh.supabase.co/functions/v1/update-competitor-metrics',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cHFnd2JrdHBmb2RidWh3cWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NDA0MzUsImV4cCI6MjA3MzExNjQzNX0.slj0vNEGfgTFv_vB_4ieLH1zuHSP_A6dAZsMmHVWnto'
      ),
      body := jsonb_build_object(
        'force_refresh', false,
        'notify_changes', true
      )
    ) as request_id;
  $$
);

-- Comentário para documentação
COMMENT ON EXTENSION pg_cron IS 'Agendador de tarefas recorrentes do PostgreSQL';

-- Log de confirmação
DO $$
BEGIN
  RAISE NOTICE '✅ Cron job configurado: update-competitor-metrics-weekly';
  RAISE NOTICE '📅 Agendamento: Toda segunda-feira às 6h';
  RAISE NOTICE '🔄 Ação: Atualização automática de métricas de concorrentes';
END $$;