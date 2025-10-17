-- ================================================================
-- MIGRATION: Executar Triggers para Gerar Metas Retroativas
-- ================================================================
-- Objetivo: Disparar triggers em dados existentes para criar metas
--           automaticamente para clientes que já possuem onboarding
--           e planejamentos aprovados
-- ================================================================

-- 1️⃣ Gerar metas de onboarding para clientes existentes
-- Atualizar updated_at para disparar o trigger fn_gerar_metas_onboarding()
UPDATE cliente_onboarding 
SET updated_at = NOW()
WHERE cliente_id IN (
  -- Apenas clientes que ainda não têm metas
  SELECT DISTINCT co.cliente_id 
  FROM cliente_onboarding co
  LEFT JOIN cliente_metas cm ON co.cliente_id = cm.cliente_id
  WHERE cm.id IS NULL
    AND co.frequencia_postagens IS NOT NULL
);

-- 2️⃣ Gerar metas de posts mensais para planejamentos com status aprovado_cliente
-- Atualizar updated_at para disparar o trigger fn_gerar_meta_posts_planejamento()
UPDATE planejamentos 
SET updated_at = NOW()
WHERE status = 'aprovado_cliente'
  AND cliente_id IN (
    -- Apenas planejamentos cujos clientes não têm metas de posts
    SELECT DISTINCT p.cliente_id 
    FROM planejamentos p
    LEFT JOIN cliente_metas cm ON (
      p.cliente_id = cm.cliente_id 
      AND cm.tipo_meta = 'engajamento'
      AND cm.titulo LIKE 'Posts Planejados%'
    )
    WHERE p.status = 'aprovado_cliente'
      AND cm.id IS NULL
  );

-- 3️⃣ Log de execução
DO $$
DECLARE
  v_metas_criadas INTEGER;
  v_onboarding_updated INTEGER;
  v_planejamentos_updated INTEGER;
BEGIN
  -- Contar onboardings atualizados
  SELECT COUNT(*) INTO v_onboarding_updated
  FROM cliente_onboarding co
  WHERE co.frequencia_postagens IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM cliente_metas cm 
      WHERE cm.cliente_id = co.cliente_id
    );
  
  -- Contar planejamentos atualizados
  SELECT COUNT(*) INTO v_planejamentos_updated
  FROM planejamentos p
  WHERE p.status = 'aprovado_cliente'
    AND NOT EXISTS (
      SELECT 1 FROM cliente_metas cm 
      WHERE cm.cliente_id = p.cliente_id 
        AND cm.tipo_meta = 'engajamento'
        AND cm.titulo LIKE 'Posts Planejados%'
    );
  
  -- Contar total de metas
  SELECT COUNT(*) INTO v_metas_criadas FROM cliente_metas;
  
  RAISE NOTICE '✅ Triggers executados com sucesso!';
  RAISE NOTICE '📊 Onboardings processados: %', v_onboarding_updated;
  RAISE NOTICE '📊 Planejamentos processados: %', v_planejamentos_updated;
  RAISE NOTICE '📊 Total de metas no sistema: %', v_metas_criadas;
END $$;