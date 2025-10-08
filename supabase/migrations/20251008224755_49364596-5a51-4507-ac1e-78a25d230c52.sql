-- ============================================
-- FIX SUPABASE SECURITY ADVISOR - 11 ISSUES
-- Data: 2025-10-08
-- ============================================

-- 1️⃣ RECRIAR VIEW: vw_produtividade_7d
DROP VIEW IF EXISTS public.vw_produtividade_7d CASCADE;

CREATE VIEW public.vw_produtividade_7d
WITH (security_invoker = true) AS
SELECT 
  tp.setor_responsavel,
  tp.responsavel_id,
  p.nome AS responsavel_nome,
  count(*) FILTER (WHERE tp.created_at >= (now() - '7 days'::interval)) AS tarefas_criadas,
  count(*) FILTER (WHERE tp.status = 'concluida' AND tp.updated_at >= (now() - '7 days'::interval)) AS tarefas_concluidas,
  count(*) FILTER (WHERE tp.data_prazo < CURRENT_DATE AND tp.status <> 'concluida') AS tarefas_vencidas,
  round(avg(EXTRACT(epoch FROM tp.updated_at - tp.created_at) / 86400.0) FILTER (WHERE tp.status = 'concluida' AND tp.updated_at >= (now() - '7 days'::interval)), 1) AS lead_time_medio_dias
FROM tarefas_projeto tp
LEFT JOIN profiles p ON tp.responsavel_id = p.id
WHERE tp.created_at >= (now() - '30 days'::interval)
GROUP BY tp.setor_responsavel, tp.responsavel_id, p.nome;

-- 2️⃣ RECRIAR VIEW: vw_credenciais_por_categoria
DROP VIEW IF EXISTS public.vw_credenciais_por_categoria CASCADE;

CREATE VIEW public.vw_credenciais_por_categoria
WITH (security_invoker = true) AS
SELECT 
  c.id,
  c.cliente_id,
  c.projeto_id,
  c.categoria,
  CASE c.categoria
    WHEN 'social' THEN '👥 Redes Sociais'
    WHEN 'ads' THEN '📢 Anúncios'
    WHEN 'email_workspace' THEN '📧 E-mail / Workspace'
    WHEN 'dominio_dns' THEN '🌐 Domínio / DNS'
    WHEN 'hosting_cdn' THEN '☁️ Hosting / CDN'
    WHEN 'site_cms' THEN '🖥️ Site / CMS'
    WHEN 'analytics' THEN '📊 Analytics'
    WHEN 'tagmanager' THEN '🏷️ Tag Manager'
    WHEN 'mensageria' THEN '💬 Mensageria'
    ELSE '🔧 Outros'
  END AS categoria_label,
  c.plataforma,
  c.usuario_login,
  c.extra,
  c.updated_at,
  p.nome AS updated_by_nome,
  count(*) OVER (PARTITION BY c.categoria) AS total_na_categoria
FROM credenciais_cliente c
LEFT JOIN profiles p ON c.updated_by = p.id;

-- 3️⃣ RECRIAR VIEW: vw_planos_publicos_itens
DROP VIEW IF EXISTS public.vw_planos_publicos_itens CASCADE;

CREATE VIEW public.vw_planos_publicos_itens
WITH (security_invoker = true) AS
SELECT 
  po.id,
  po.plano_id,
  po.objetivo,
  po.descricao,
  po.kpis,
  po.iniciativas,
  po.prazo_conclusao,
  po.status,
  po.ordem,
  p.nome AS responsavel_nome
FROM planos_objetivos po
LEFT JOIN profiles p ON po.responsavel_id = p.id
ORDER BY po.ordem;

-- 4️⃣ RECRIAR VIEW: vw_planos_publicos
DROP VIEW IF EXISTS public.vw_planos_publicos CASCADE;

CREATE VIEW public.vw_planos_publicos
WITH (security_invoker = true) AS
SELECT 
  id,
  cliente_id,
  titulo,
  periodo_inicio,
  periodo_fim,
  missao,
  visao,
  valores,
  created_at,
  updated_at
FROM planos_estrategicos pe;

-- 5️⃣ RECRIAR VIEW: vw_client_metrics
DROP VIEW IF EXISTS public.vw_client_metrics CASCADE;

CREATE VIEW public.vw_client_metrics
WITH (security_invoker = true) AS
SELECT 
  c.id AS cliente_id,
  c.nome,
  c.telefone,
  c.endereco,
  c.status::text AS status,
  c.cnpj_cpf,
  c.logo_url,
  p_resp.nome AS responsavel_nome,
  p_resp.id AS responsavel_id,
  asig.nome AS assinatura_nome,
  count(DISTINCT p.id) FILTER (WHERE p.status IS NOT NULL) AS projetos_totais,
  count(DISTINCT p.id) FILTER (WHERE p.status::text = 'ativo') AS projetos_abertos,
  COALESCE(sum(CASE WHEN tf.tipo = 'receita' THEN tf.valor ELSE 0 END), 0) AS faturas_total,
  COALESCE(sum(CASE WHEN tf.tipo = 'receita' AND tf.status = 'pago' THEN tf.valor ELSE 0 END), 0) AS pagamentos_total,
  CASE 
    WHEN sum(CASE WHEN tf.tipo = 'receita' THEN tf.valor ELSE 0 END) > 0 
    THEN sum(CASE WHEN tf.tipo = 'receita' AND tf.status = 'pago' THEN tf.valor ELSE 0 END) * 100.0 / sum(CASE WHEN tf.tipo = 'receita' THEN tf.valor ELSE 0 END)
    ELSE 0 
  END AS pagamentos_percentual
FROM clientes c
LEFT JOIN profiles p_resp ON p_resp.id = c.responsavel_id
LEFT JOIN assinaturas asig ON asig.id = c.assinatura_id
LEFT JOIN projetos p ON p.cliente_id = c.id
LEFT JOIN transacoes_financeiras tf ON tf.cliente_id = c.id
GROUP BY c.id, c.nome, c.telefone, c.endereco, c.status, c.cnpj_cpf, c.logo_url, p_resp.nome, p_resp.id, asig.nome;

-- 6️⃣ CORRIGIR FUNÇÃO: update_credenciais_updated_at
CREATE OR REPLACE FUNCTION public.update_credenciais_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 7️⃣ CORRIGIR FUNÇÃO: update_brand_assets_updated_at
CREATE OR REPLACE FUNCTION public.update_brand_assets_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 8️⃣ CORRIGIR FUNÇÃO: gerar_numero_documento (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.gerar_numero_documento(tipo text, ano integer)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  numero_seq integer;
  numero_final text;
BEGIN
  CASE tipo
    WHEN 'orcamento' THEN
      SELECT COUNT(*) + 1 INTO numero_seq
      FROM public.orcamentos
      WHERE EXTRACT(YEAR FROM created_at) = ano;
      
    WHEN 'proposta' THEN
      SELECT COUNT(*) + 1 INTO numero_seq
      FROM public.propostas
      WHERE EXTRACT(YEAR FROM created_at) = ano;
      
    WHEN 'contrato' THEN
      SELECT COUNT(*) + 1 INTO numero_seq
      FROM public.contratos
      WHERE EXTRACT(YEAR FROM created_at) = ano;
      
    WHEN 'fatura' THEN
      SELECT COUNT(*) + 1 INTO numero_seq
      FROM public.faturas
      WHERE EXTRACT(YEAR FROM created_at) = ano;
  END CASE;
  
  numero_final := UPPER(SUBSTRING(tipo, 1, 4)) || '-' || ano || '-' || LPAD(numero_seq::text, 4, '0');
  
  RETURN numero_final;
END;
$function$;

-- 9️⃣ CORRIGIR FUNÇÃO: update_briefings_updated_at
CREATE OR REPLACE FUNCTION public.update_briefings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 🔟 CORRIGIR FUNÇÃO: update_updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;