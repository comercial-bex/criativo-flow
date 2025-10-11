-- ============================================
-- CORREÇÃO DE ALERTAS DE SEGURANÇA
-- ============================================

-- 1. REMOVER VIEW COM SECURITY DEFINER (se existir)
-- Buscar e corrigir views com SECURITY DEFINER problemáticas

-- 2. CORRIGIR FUNÇÕES SEM search_path CONFIGURADO
-- Adicionar SET search_path = public em todas as funções que não têm

-- Função: update_brand_assets_updated_at
CREATE OR REPLACE FUNCTION public.update_brand_assets_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Função: update_credenciais_updated_at
CREATE OR REPLACE FUNCTION public.update_credenciais_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 3. VERIFICAR E CORRIGIR OUTRAS FUNÇÕES QUE POSSAM ESTAR FALTANDO search_path
-- As funções já existentes que têm SECURITY DEFINER devem ter SET search_path = public

-- Nota sobre o alerta "Leaked Password Protection Disabled":
-- Este alerta precisa ser corrigido manualmente no painel do Supabase:
-- Vá para: Project Settings > Auth > Password Security
-- E habilite "Leaked password protection"

COMMENT ON FUNCTION public.update_brand_assets_updated_at IS 'Corrigido: Adicionado SET search_path = public para segurança';
COMMENT ON FUNCTION public.update_credenciais_updated_at IS 'Corrigido: Adicionado SET search_path = public para segurança';