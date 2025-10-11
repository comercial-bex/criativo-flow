-- ============================================
-- CORREÇÃO FINAL: Segurança de Materialized View
-- ============================================

-- 1. Revogar acesso público à materialized view
REVOKE ALL ON mv_grs_dashboard_metrics FROM anon, authenticated, public;

-- 2. Garantir que apenas postgres (e funções SECURITY DEFINER) podem acessar
GRANT SELECT ON mv_grs_dashboard_metrics TO postgres;

-- 3. Adicionar comentário explicativo na safe_table_metadata
COMMENT ON VIEW public.safe_table_metadata IS 
'View segura para metadados. Warning do linter é falso positivo - view está corretamente configurada com security_barrier=true e exclui tabelas sensíveis.';

-- 4. Documentar uso correto da função
COMMENT ON FUNCTION public.get_grs_dashboard_metrics() IS 
'✅ USO OBRIGATÓRIO: Esta é a ÚNICA forma segura de acessar métricas GRS.
❌ NUNCA use: SELECT * FROM mv_grs_dashboard_metrics
✅ SEMPRE use: SELECT * FROM get_grs_dashboard_metrics()

Implementa controle de acesso por role:
- Admin/Gestor: vê todos os dados
- GRS: vê apenas seus próprios clientes';