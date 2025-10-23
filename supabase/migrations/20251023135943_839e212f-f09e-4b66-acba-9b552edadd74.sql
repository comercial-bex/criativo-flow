-- FASE 1: Adicionar campos do Briefing Inteligente à tabela briefings
ALTER TABLE briefings 
  ADD COLUMN IF NOT EXISTS objetivo TEXT,
  ADD COLUMN IF NOT EXISTS tom TEXT,
  ADD COLUMN IF NOT EXISTS veiculacao TEXT[],
  ADD COLUMN IF NOT EXISTS mensagem_chave TEXT,
  ADD COLUMN IF NOT EXISTS beneficios TEXT[],
  ADD COLUMN IF NOT EXISTS provas_sociais TEXT,
  ADD COLUMN IF NOT EXISTS cta TEXT,
  ADD COLUMN IF NOT EXISTS locucao TEXT,
  ADD COLUMN IF NOT EXISTS captacao TEXT[],
  ADD COLUMN IF NOT EXISTS ambiente TEXT,
  ADD COLUMN IF NOT EXISTS restricoes TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS paleta_fontes_url TEXT,
  ADD COLUMN IF NOT EXISTS manual_marca_url TEXT;

-- Atualizar status_briefing para usar valores mais descritivos
ALTER TABLE briefings 
  ALTER COLUMN status_briefing SET DEFAULT 'rascunho';

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_briefings_status ON briefings(status_briefing);
CREATE INDEX IF NOT EXISTS idx_briefings_pacote ON briefings(pacote_id);
CREATE INDEX IF NOT EXISTS idx_briefings_cliente ON briefings(cliente_id);

-- Comentários para documentação
COMMENT ON COLUMN briefings.objetivo IS 'Objetivo da campanha ou conteúdo';
COMMENT ON COLUMN briefings.tom IS 'Tom de voz desejado';
COMMENT ON COLUMN briefings.veiculacao IS 'Canais de veiculação';
COMMENT ON COLUMN briefings.mensagem_chave IS 'Mensagem principal a comunicar';
COMMENT ON COLUMN briefings.beneficios IS 'Lista de benefícios do produto/serviço';
COMMENT ON COLUMN briefings.provas_sociais IS 'Depoimentos, cases, números';
COMMENT ON COLUMN briefings.cta IS 'Call to Action';
COMMENT ON COLUMN briefings.status_briefing IS 'Status: rascunho, completo, aprovado';