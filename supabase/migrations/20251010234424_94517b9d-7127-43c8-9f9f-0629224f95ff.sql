-- Corrigir Security Warning: Security Definer View
-- Alterar todas as views para SECURITY INVOKER mode
-- Isso faz com que as views respeitem as RLS policies do usuário que as consulta

-- 1. vw_client_metrics
ALTER VIEW public.vw_client_metrics SET (security_invoker = on);

-- 2. vw_colaboradores_especialistas
ALTER VIEW public.vw_colaboradores_especialistas SET (security_invoker = on);

-- 3. vw_credenciais_por_categoria
ALTER VIEW public.vw_credenciais_por_categoria SET (security_invoker = on);

-- 4. vw_planos_publicos
ALTER VIEW public.vw_planos_publicos SET (security_invoker = on);

-- 5. vw_planos_publicos_itens
ALTER VIEW public.vw_planos_publicos_itens SET (security_invoker = on);

-- 6. vw_produtividade_7d
ALTER VIEW public.vw_produtividade_7d SET (security_invoker = on);