-- =======================
-- FASE 2: SINCRONIZAR METAS COM PLANEJAMENTOS E POSTS
-- =======================

-- Trigger 1: Gerar meta de posts quando planejamento é aprovado
CREATE OR REPLACE FUNCTION fn_gerar_meta_posts_planejamento()
RETURNS TRIGGER AS $$
DECLARE
  v_total_posts INTEGER;
  v_mes_ref DATE;
  v_meta_id UUID;
BEGIN
  -- Só executar quando status mudar para 'aprovado'
  IF NEW.status = 'aprovado' AND (OLD.status IS NULL OR OLD.status != 'aprovado') THEN
    
    -- Contar total de posts no planejamento
    SELECT COUNT(*) INTO v_total_posts
    FROM posts_planejamento
    WHERE planejamento_id = NEW.id;
    
    -- Se não houver posts, não criar meta
    IF v_total_posts = 0 THEN
      RETURN NEW;
    END IF;
    
    v_mes_ref := DATE_TRUNC('month', NEW.mes_referencia);
    
    -- Criar ou atualizar meta de posts mensais
    INSERT INTO cliente_metas (
      cliente_id,
      tipo_meta,
      titulo,
      descricao,
      valor_alvo,
      valor_atual,
      unidade,
      periodo_inicio,
      periodo_fim,
      status
    ) VALUES (
      NEW.cliente_id,
      'engajamento',
      'Posts Planejados - ' || TO_CHAR(v_mes_ref, 'MM/YYYY'),
      'Entregas de conteúdo conforme planejamento editorial aprovado',
      v_total_posts,
      0, -- Será atualizado conforme posts são publicados
      'posts',
      v_mes_ref,
      v_mes_ref + INTERVAL '1 month' - INTERVAL '1 day',
      'em_andamento'
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_meta_id;
    
    RAISE NOTICE '✅ Meta de posts criada: % posts para %', v_total_posts, TO_CHAR(v_mes_ref, 'MM/YYYY');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger
DROP TRIGGER IF EXISTS trg_gerar_meta_posts ON planejamentos;
CREATE TRIGGER trg_gerar_meta_posts
AFTER INSERT OR UPDATE ON planejamentos
FOR EACH ROW
EXECUTE FUNCTION fn_gerar_meta_posts_planejamento();

-- Trigger 2: Atualizar progresso de meta quando post é publicado
CREATE OR REPLACE FUNCTION fn_atualizar_meta_post_publicado()
RETURNS TRIGGER AS $$
DECLARE
  v_cliente_id UUID;
  v_mes_ref DATE;
  v_total_publicados INTEGER;
  v_meta_alvo INTEGER;
BEGIN
  -- Buscar cliente_id do planejamento
  SELECT p.cliente_id, DATE_TRUNC('month', p.mes_referencia)
  INTO v_cliente_id, v_mes_ref
  FROM planejamentos p
  WHERE p.id = NEW.planejamento_id;
  
  -- Contar posts publicados no mês (data já passou)
  SELECT COUNT(*)
  INTO v_total_publicados
  FROM posts_planejamento pp
  JOIN planejamentos p ON pp.planejamento_id = p.id
  WHERE p.cliente_id = v_cliente_id
    AND DATE_TRUNC('month', p.mes_referencia) = v_mes_ref
    AND pp.data_postagem <= CURRENT_DATE;
  
  -- Buscar meta atual
  SELECT valor_alvo INTO v_meta_alvo
  FROM cliente_metas
  WHERE cliente_id = v_cliente_id
    AND tipo_meta = 'engajamento'
    AND periodo_inicio = v_mes_ref;
  
  -- Atualizar meta
  UPDATE cliente_metas
  SET 
    valor_atual = v_total_publicados,
    progresso_percent = ROUND((v_total_publicados::NUMERIC / NULLIF(valor_alvo, 0)) * 100, 2),
    status = CASE
      WHEN v_total_publicados >= valor_alvo THEN 'concluida'
      ELSE 'em_andamento'
    END,
    updated_at = NOW()
  WHERE cliente_id = v_cliente_id
    AND tipo_meta = 'engajamento'
    AND periodo_inicio = v_mes_ref;
  
  RAISE NOTICE '✅ Meta atualizada: %/% posts publicados', v_total_publicados, v_meta_alvo;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger
DROP TRIGGER IF EXISTS trg_atualizar_meta_post ON posts_planejamento;
CREATE TRIGGER trg_atualizar_meta_post
AFTER INSERT OR UPDATE ON posts_planejamento
FOR EACH ROW
EXECUTE FUNCTION fn_atualizar_meta_post_publicado();

-- =======================
-- FASE 3: ADICIONAR CAMPOS PARA PREVIEW VISUAL
-- =======================

ALTER TABLE aprovacoes_cliente 
ADD COLUMN IF NOT EXISTS legenda TEXT,
ADD COLUMN IF NOT EXISTS objetivo_postagem TEXT,
ADD COLUMN IF NOT EXISTS formato_postagem TEXT DEFAULT 'post',
ADD COLUMN IF NOT EXISTS hashtags TEXT[],
ADD COLUMN IF NOT EXISTS call_to_action TEXT,
ADD COLUMN IF NOT EXISTS rede_social TEXT DEFAULT 'instagram';

-- =======================
-- FASE 4: GERAR METAS DO ONBOARDING
-- =======================

CREATE OR REPLACE FUNCTION fn_gerar_metas_onboarding()
RETURNS TRIGGER AS $$
DECLARE
  v_frequencia_posts INTEGER;
  v_mes_inicial DATE;
BEGIN
  v_mes_inicial := DATE_TRUNC('month', CURRENT_DATE);
  
  -- Meta 1: Posts mensais baseado em frequência
  IF NEW.frequencia_postagens IS NOT NULL THEN
    CASE NEW.frequencia_postagens
      WHEN 'diaria' THEN v_frequencia_posts := 30;
      WHEN '3x_semana' THEN v_frequencia_posts := 12;
      WHEN 'semanal' THEN v_frequencia_posts := 4;
      ELSE v_frequencia_posts := 8;
    END CASE;
    
    INSERT INTO cliente_metas (
      cliente_id, tipo_meta, titulo, descricao,
      valor_alvo, valor_atual, unidade,
      periodo_inicio, periodo_fim, status
    ) VALUES (
      NEW.cliente_id,
      'engajamento',
      'Meta de Posts Mensais',
      'Baseado na frequência de postagem contratada: ' || NEW.frequencia_postagens,
      v_frequencia_posts,
      0,
      'posts',
      v_mes_inicial,
      v_mes_inicial + INTERVAL '1 month' - INTERVAL '1 day',
      'em_andamento'
    ) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Meta 2: Objetivo principal (ex: aumentar seguidores, vendas)
  IF NEW.objetivos_digitais IS NOT NULL THEN
    INSERT INTO cliente_metas (
      cliente_id, tipo_meta, titulo, descricao,
      valor_alvo, valor_atual, unidade,
      periodo_inicio, periodo_fim, status
    ) VALUES (
      NEW.cliente_id,
      'alcance',
      'Objetivo: ' || SUBSTRING(NEW.objetivos_digitais, 1, 50),
      NEW.objetivos_digitais,
      1000, -- Valor padrão, pode ser ajustado
      0,
      'seguidores',
      v_mes_inicial,
      v_mes_inicial + INTERVAL '3 months',
      'em_andamento'
    ) ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger
DROP TRIGGER IF EXISTS trg_gerar_metas_onboarding ON cliente_onboarding;
CREATE TRIGGER trg_gerar_metas_onboarding
AFTER INSERT OR UPDATE ON cliente_onboarding
FOR EACH ROW
EXECUTE FUNCTION fn_gerar_metas_onboarding();