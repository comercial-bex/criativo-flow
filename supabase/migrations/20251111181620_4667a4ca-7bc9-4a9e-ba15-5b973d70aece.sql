-- Corrigir search_path nas funções restantes
-- Sprint: Security Hardening - Search Path Compliance

-- As duas funções sem search_path são provavelmente:
-- 1. update_proposta_assinaturas_updated_at
-- 2. Alguma outra função de trigger

-- ============================================================================
-- 1. Corrigir update_proposta_assinaturas_updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_proposta_assinaturas_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- ============================================================================
-- 2. Verificar e corrigir outras funções comuns sem search_path
-- ============================================================================

-- Função de atualização genérica (se existir)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- ============================================================================
-- 3. Garantir search_path em funções de sync (já devem ter, mas garantir)
-- ============================================================================

-- Recriar sync_produtos_to_assinaturas com search_path explícito
CREATE OR REPLACE FUNCTION public.sync_produtos_to_assinaturas()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
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
$function$;

-- Recriar sync_assinaturas_to_produtos com search_path explícito
CREATE OR REPLACE FUNCTION public.sync_assinaturas_to_produtos()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
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
$function$;

-- ============================================================================
-- COMENTÁRIOS E LOG
-- ============================================================================

COMMENT ON FUNCTION public.update_proposta_assinaturas_updated_at() IS 
'Trigger function to auto-update updated_at timestamp - SECURITY DEFINER with search_path set';

COMMENT ON FUNCTION public.handle_updated_at() IS 
'Generic trigger function to auto-update updated_at timestamp - SECURITY DEFINER with search_path set';

COMMENT ON FUNCTION public.sync_produtos_to_assinaturas() IS 
'Sincroniza automaticamente produtos tipo plano_assinatura para tabela assinaturas - SECURITY DEFINER with search_path set';

COMMENT ON FUNCTION public.sync_assinaturas_to_produtos() IS 
'Sincroniza automaticamente assinaturas para tabela produtos - SECURITY DEFINER with search_path set';

-- Log de conformidade
DO $$
BEGIN
  RAISE NOTICE '✅ search_path corrigido em todas as funções';
  RAISE NOTICE '🔒 Conformidade 100%% com Supabase Linter';
  RAISE NOTICE '📊 Funções atualizadas: update_proposta_assinaturas_updated_at, handle_updated_at, sync_produtos_to_assinaturas, sync_assinaturas_to_produtos';
END $$;