-- Trigger bidirecional: produtos <-> assinaturas
-- Sincroniza alterações entre as tabelas automaticamente

-- Função: Sincronizar de produtos -> assinaturas
CREATE OR REPLACE FUNCTION sync_produtos_to_assinaturas()
RETURNS TRIGGER AS $$
BEGIN
  -- Se for INSERT ou UPDATE em produtos com tipo plano_assinatura
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.tipo = 'plano_assinatura' THEN
    INSERT INTO assinaturas (
      id,
      nome,
      preco,
      periodo,
      posts_mensais,
      reels_suporte,
      anuncios_facebook,
      anuncios_google,
      recursos,
      status,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      NEW.nome,
      NEW.preco_padrao,
      COALESCE(NEW.periodo, 'mensal'),
      COALESCE(NEW.posts_mensais, 0),
      COALESCE(NEW.reels_suporte, false),
      COALESCE(NEW.anuncios_facebook, false),
      COALESCE(NEW.anuncios_google, false),
      COALESCE(NEW.recursos, ARRAY[]::text[]),
      CASE WHEN NEW.ativo THEN 'ativo' ELSE 'inativo' END,
      NEW.created_at,
      NEW.updated_at
    )
    ON CONFLICT (id) DO UPDATE SET
      nome = EXCLUDED.nome,
      preco = EXCLUDED.preco,
      periodo = EXCLUDED.periodo,
      posts_mensais = EXCLUDED.posts_mensais,
      reels_suporte = EXCLUDED.reels_suporte,
      anuncios_facebook = EXCLUDED.anuncios_facebook,
      anuncios_google = EXCLUDED.anuncios_google,
      recursos = EXCLUDED.recursos,
      status = EXCLUDED.status,
      updated_at = EXCLUDED.updated_at;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: Sincronizar de assinaturas -> produtos
CREATE OR REPLACE FUNCTION sync_assinaturas_to_produtos()
RETURNS TRIGGER AS $$
BEGIN
  -- Se for INSERT ou UPDATE em assinaturas
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    INSERT INTO produtos (
      id,
      sku,
      nome,
      tipo,
      preco_padrao,
      periodo,
      posts_mensais,
      reels_suporte,
      anuncios_facebook,
      anuncios_google,
      recursos,
      ativo,
      unidade,
      imposto_percent,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      'PLANO-' || NEW.id::text,
      NEW.nome,
      'plano_assinatura',
      NEW.preco,
      NEW.periodo,
      NEW.posts_mensais,
      NEW.reels_suporte,
      NEW.anuncios_facebook,
      NEW.anuncios_google,
      NEW.recursos,
      CASE WHEN NEW.status = 'ativo' THEN true ELSE false END,
      'mes',
      0,
      NEW.created_at,
      NEW.updated_at
    )
    ON CONFLICT (id) DO UPDATE SET
      nome = EXCLUDED.nome,
      preco_padrao = EXCLUDED.preco_padrao,
      periodo = EXCLUDED.periodo,
      posts_mensais = EXCLUDED.posts_mensais,
      reels_suporte = EXCLUDED.reels_suporte,
      anuncios_facebook = EXCLUDED.anuncios_facebook,
      anuncios_google = EXCLUDED.anuncios_google,
      recursos = EXCLUDED.recursos,
      ativo = EXCLUDED.ativo,
      updated_at = EXCLUDED.updated_at;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar triggers
DROP TRIGGER IF EXISTS trigger_sync_produtos_to_assinaturas ON produtos;
CREATE TRIGGER trigger_sync_produtos_to_assinaturas
  AFTER INSERT OR UPDATE ON produtos
  FOR EACH ROW
  EXECUTE FUNCTION sync_produtos_to_assinaturas();

DROP TRIGGER IF EXISTS trigger_sync_assinaturas_to_produtos ON assinaturas;
CREATE TRIGGER trigger_sync_assinaturas_to_produtos
  AFTER INSERT OR UPDATE ON assinaturas
  FOR EACH ROW
  EXECUTE FUNCTION sync_assinaturas_to_produtos();

-- Comentários
COMMENT ON FUNCTION sync_produtos_to_assinaturas() IS 'Sincroniza automaticamente produtos tipo plano_assinatura para tabela assinaturas';
COMMENT ON FUNCTION sync_assinaturas_to_produtos() IS 'Sincroniza automaticamente assinaturas para tabela produtos';
COMMENT ON TRIGGER trigger_sync_produtos_to_assinaturas ON produtos IS 'Trigger bidirecional: mantém assinaturas sincronizada com produtos';
COMMENT ON TRIGGER trigger_sync_assinaturas_to_produtos ON assinaturas IS 'Trigger bidirecional: mantém produtos sincronizada com assinaturas';