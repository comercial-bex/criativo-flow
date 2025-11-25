-- ================================================================
-- CORREÇÃO: Remover views do schema público da API
-- Problema: vw_user_complete e mv_user_cache criando tipos recursivos
-- Solução: Mover para schema privado ou revogar acesso via PostgREST
-- ================================================================

-- 1. Remover completamente acesso via PostgREST (mais simples)
-- Isso impede que as views apareçam no types.ts

COMMENT ON VIEW vw_user_complete IS 
'@exclude
View unificada que consolida dados de auth.users, pessoas e user_roles. 
Acesso apenas via RPC get_user_complete()';

COMMENT ON MATERIALIZED VIEW mv_user_cache IS 
'@exclude
Cache materializado da view vw_user_complete. Atualiza automaticamente via triggers. 
Acesso apenas via RPC get_user_complete()';

-- 2. Garantir que apenas service_role e funções internas acessem
-- (já foi feito na migration anterior, mas reforçando)
REVOKE ALL ON vw_user_complete FROM anon, authenticated, PUBLIC;
REVOKE ALL ON mv_user_cache FROM anon, authenticated, PUBLIC;

-- 3. Permitir acesso apenas para o schema functions
GRANT SELECT ON vw_user_complete TO service_role;
GRANT SELECT ON mv_user_cache TO service_role;