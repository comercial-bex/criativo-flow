-- Migration: Limpeza automática de dados temporários
-- Objetivo: Criar função e cron job para limpar posts_gerados_temp antigos

-- Função de limpeza de posts temporários
CREATE OR REPLACE FUNCTION cleanup_temp_posts()
RETURNS void AS $$
BEGIN
  -- Deletar posts temporários com mais de 7 dias
  DELETE FROM posts_gerados_temp
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  -- Log da execução
  RAISE NOTICE 'Cleanup executado: posts temporários antigos removidos';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir que pg_cron está habilitado
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Agendar limpeza diária às 3h da manhã
SELECT cron.schedule(
  'cleanup-temp-posts-daily',
  '0 3 * * *',
  $$SELECT cleanup_temp_posts()$$
);

-- Comentários para documentação
COMMENT ON FUNCTION cleanup_temp_posts() IS 'Remove posts temporários com mais de 7 dias para otimizar performance';
