-- Adicionar tipos de tarefa faltantes ao enum tipo_tarefa_enum
-- Valores a adicionar: feed_post, criativo_vt, reels_instagram, stories_interativo, criativo_cartela

ALTER TYPE tipo_tarefa_enum ADD VALUE IF NOT EXISTS 'feed_post';
ALTER TYPE tipo_tarefa_enum ADD VALUE IF NOT EXISTS 'criativo_vt';
ALTER TYPE tipo_tarefa_enum ADD VALUE IF NOT EXISTS 'reels_instagram';
ALTER TYPE tipo_tarefa_enum ADD VALUE IF NOT EXISTS 'stories_interativo';
ALTER TYPE tipo_tarefa_enum ADD VALUE IF NOT EXISTS 'criativo_cartela';

-- Log de confirmação
DO $$
BEGIN
  RAISE NOTICE '✅ Tipos adicionados ao enum tipo_tarefa_enum: feed_post, criativo_vt, reels_instagram, stories_interativo, criativo_cartela';
END $$;