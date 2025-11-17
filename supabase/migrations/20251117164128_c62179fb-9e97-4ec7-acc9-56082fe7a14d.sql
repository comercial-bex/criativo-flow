-- Corrigir security warnings - adicionar search_path às funções

-- Recriar função cleanup_temp_posts com search_path
CREATE OR REPLACE FUNCTION cleanup_temp_posts()
RETURNS void AS $$
BEGIN
  -- Deletar posts temporários com mais de 7 dias
  DELETE FROM posts_gerados_temp
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  -- Log da execução
  RAISE NOTICE 'Cleanup executado: posts temporários antigos removidos';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION cleanup_temp_posts() IS 'Remove posts temporários com mais de 7 dias para otimizar performance';
