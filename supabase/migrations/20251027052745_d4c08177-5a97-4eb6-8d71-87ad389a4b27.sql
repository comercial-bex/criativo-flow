-- Adicionar campo origem à tabela eventos_calendario
ALTER TABLE eventos_calendario 
ADD COLUMN IF NOT EXISTS origem text CHECK (origem IN ('design', 'audiovisual', 'comercial', 'grs'));

-- Criar índice para melhor performance em filtros
CREATE INDEX IF NOT EXISTS idx_eventos_origem ON eventos_calendario(origem);

-- Atualizar eventos existentes com origem padrão baseado no tipo
UPDATE eventos_calendario 
SET origem = CASE 
  WHEN tipo IN ('captacao_interna', 'captacao_externa', 'edicao_curta', 'edicao_longa', 'backup') THEN 'audiovisual'
  WHEN tipo IN ('criacao_avulso', 'criacao_lote') THEN 'design'
  WHEN tipo = 'planejamento' THEN 'grs'
  WHEN tipo = 'reuniao' THEN 'comercial'
  ELSE 'grs'
END
WHERE origem IS NULL;