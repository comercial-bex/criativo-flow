-- Correção DEFINITIVA das views com estrutura correta

-- 1. assinaturas_compat (baseada em produtos)
DROP VIEW IF EXISTS public.assinaturas_compat CASCADE;

CREATE VIEW public.assinaturas_compat 
WITH (security_invoker=on)
AS
SELECT 
  id,
  nome,
  preco_padrao AS preco,
  periodo,
  posts_mensais,
  reels_suporte,
  anuncios_facebook,
  anuncios_google,
  recursos,
  CASE
    WHEN ativo THEN 'ativo'::text
    ELSE 'inativo'::text
  END AS status,
  created_at,
  updated_at
FROM produtos
WHERE tipo = 'plano_assinatura'::text;

-- 2. pacotes_compat (baseada em pacotes real)
DROP VIEW IF EXISTS public.pacotes_compat CASCADE;

CREATE VIEW public.pacotes_compat 
WITH (security_invoker=on)
AS
SELECT 
  id,
  nome,
  slug,
  descricao,
  tipo,
  ativo,
  preco_base,
  created_at,
  updated_at
FROM public.pacotes;

-- 3. vw_health_check_pessoas
DROP VIEW IF EXISTS public.vw_health_check_pessoas CASCADE;

CREATE VIEW public.vw_health_check_pessoas
WITH (security_invoker=on)
AS
SELECT 
  COUNT(*) as total_pessoas,
  COUNT(*) FILTER (WHERE profile_id IS NOT NULL) as com_profile_id,
  COUNT(*) FILTER (WHERE profile_id IS NULL) as sem_profile_id,
  COUNT(*) FILTER (WHERE status = 'aprovado') as aprovados,
  COUNT(*) FILTER (WHERE status = 'pendente_aprovacao') as pendentes,
  COUNT(*) FILTER (WHERE status = 'rejeitado') as rejeitados,
  COUNT(*) FILTER (WHERE status = 'suspenso') as suspensos,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE profile_id IS NOT NULL) / NULLIF(COUNT(*), 0),
    2
  ) as percentual_com_profile
FROM public.pessoas;

COMMENT ON VIEW public.assinaturas_compat IS 'View com security_invoker=on - RLS via produtos - 2025-11-11';
COMMENT ON VIEW public.pacotes_compat IS 'View com security_invoker=on - RLS via pacotes - 2025-11-11';  
COMMENT ON VIEW public.vw_health_check_pessoas IS 'View com security_invoker=on - RLS via pessoas - 2025-11-11';