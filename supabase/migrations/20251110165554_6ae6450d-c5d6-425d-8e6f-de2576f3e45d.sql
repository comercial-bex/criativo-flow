-- ================================
-- UNIFICAÇÃO COMPLETA DO CATÁLOGO DE PRODUTOS
-- Expandir estrutura + Migração de dados + VIEWs de compatibilidade
-- ================================

-- ==============================
-- FASE 1: EXPANDIR ESTRUTURA
-- ==============================

-- 1. Expandir ENUM de tipos
ALTER TABLE produtos DROP CONSTRAINT IF EXISTS produtos_tipo_check;
ALTER TABLE produtos 
  ADD CONSTRAINT produtos_tipo_check 
  CHECK (tipo IN ('servico', 'produto', 'plano_assinatura', 'pacote_servico'));

-- 2. Adicionar colunas para Planos de Assinatura
ALTER TABLE produtos
  ADD COLUMN IF NOT EXISTS periodo text,
  ADD COLUMN IF NOT EXISTS posts_mensais integer,
  ADD COLUMN IF NOT EXISTS reels_suporte boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS anuncios_facebook boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS anuncios_google boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS recursos text[];

-- 3. Adicionar colunas para Pacotes de Serviço
ALTER TABLE produtos
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS preco_base numeric,
  ADD COLUMN IF NOT EXISTS duracao_dias integer,
  ADD COLUMN IF NOT EXISTS requer_briefing boolean DEFAULT false;

-- 4. Adicionar campos gerais
ALTER TABLE produtos
  ADD COLUMN IF NOT EXISTS metadados jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ordem_exibicao integer DEFAULT 0;

-- 5. Criar índices
CREATE INDEX IF NOT EXISTS idx_produtos_tipo ON produtos(tipo);
CREATE INDEX IF NOT EXISTS idx_produtos_slug ON produtos(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_produtos_ativo_tipo ON produtos(ativo, tipo);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria) WHERE categoria IS NOT NULL;

-- 6. Adicionar comentários
COMMENT ON COLUMN produtos.periodo IS 'Para planos: mensal, trimestral, anual';
COMMENT ON COLUMN produtos.posts_mensais IS 'Para planos: quantidade de posts inclusos';
COMMENT ON COLUMN produtos.slug IS 'Para pacotes: identificador amigável';
COMMENT ON COLUMN produtos.preco_base IS 'Para pacotes: preço base do pacote';
COMMENT ON COLUMN produtos.metadados IS 'Dados adicionais em formato JSON';

-- ==============================
-- FASE 2: MIGRAR ASSINATURAS
-- ==============================

INSERT INTO produtos (
  id, nome, tipo, preco_padrao, custo, imposto_percent, ativo,
  periodo, posts_mensais, reels_suporte, 
  anuncios_facebook, anuncios_google, recursos,
  sku, categoria, unidade, created_at, updated_at
)
SELECT 
  id,
  nome,
  'plano_assinatura'::text,
  preco,
  0,
  0,
  (status = 'ativo'),
  periodo,
  posts_mensais,
  reels_suporte,
  anuncios_facebook,
  anuncios_google,
  recursos,
  CONCAT('PLANO-', UPPER(REPLACE(nome, ' ', '-'))),
  'Assessoria de Marketing',
  'mensal',
  created_at,
  updated_at
FROM assinaturas
WHERE NOT EXISTS (
  SELECT 1 FROM produtos WHERE produtos.id = assinaturas.id
);

-- ==============================
-- FASE 3: MIGRAR PACOTES
-- ==============================

INSERT INTO produtos (
  id, nome, tipo, preco_padrao, custo, imposto_percent, ativo,
  slug, preco_base, descricao, unidade,
  sku, categoria, created_at, updated_at
)
SELECT 
  id,
  nome,
  'pacote_servico'::text,
  preco_base,
  0,
  0,
  ativo,
  slug,
  preco_base,
  descricao,
  'projeto',
  CONCAT('PKG-', UPPER(slug)),
  CASE tipo
    WHEN 'social' THEN 'Mídias Sociais'
    WHEN 'audiovisual' THEN 'Audiovisual'
    WHEN 'premium' THEN 'Premium'
    ELSE 'Serviços'
  END,
  created_at,
  updated_at
FROM pacotes
WHERE NOT EXISTS (
  SELECT 1 FROM produtos WHERE produtos.id = pacotes.id
);

-- ==============================
-- FASE 4: VIEWS DE COMPATIBILIDADE
-- ==============================

-- VIEW para assinaturas
CREATE OR REPLACE VIEW assinaturas_compat AS
SELECT 
  id,
  nome,
  preco_padrao as preco,
  periodo,
  posts_mensais,
  reels_suporte,
  anuncios_facebook,
  anuncios_google,
  recursos,
  CASE WHEN ativo THEN 'ativo' ELSE 'inativo' END as status,
  created_at,
  updated_at
FROM produtos
WHERE tipo = 'plano_assinatura';

-- VIEW para pacotes
CREATE OR REPLACE VIEW pacotes_compat AS
SELECT 
  id,
  nome,
  slug,
  descricao,
  CASE categoria
    WHEN 'Mídias Sociais' THEN 'social'
    WHEN 'Audiovisual' THEN 'audiovisual'
    WHEN 'Premium' THEN 'premium'
    ELSE 'servicos'
  END as tipo,
  ativo,
  preco_base,
  created_at,
  updated_at
FROM produtos
WHERE tipo = 'pacote_servico';

-- ==============================
-- FASE 5: LOGS E VALIDAÇÃO
-- ==============================

DO $$
DECLARE
  total_planos INT;
  total_pacotes INT;
BEGIN
  SELECT COUNT(*) INTO total_planos 
  FROM produtos WHERE tipo = 'plano_assinatura';
  
  SELECT COUNT(*) INTO total_pacotes 
  FROM produtos WHERE tipo = 'pacote_servico';
  
  RAISE NOTICE '✅ MIGRAÇÃO COMPLETA:';
  RAISE NOTICE '   - % planos de assinatura migrados', total_planos;
  RAISE NOTICE '   - % pacotes de serviço migrados', total_pacotes;
  RAISE NOTICE '   - Total de produtos: %', total_planos + total_pacotes;
END $$;