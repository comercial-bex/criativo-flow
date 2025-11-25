-- ================================================================
-- CORREÇÃO DEFINITIVA: Dropar views temporariamente para regenerar types.ts
-- Problema: Views criando tipos recursivos no TypeScript
-- Solução: Dropar, regenerar tipos, recriar em schema privado
-- ================================================================

-- 1. Dropar triggers primeiro
DROP TRIGGER IF EXISTS trg_refresh_user_cache_pessoas ON pessoas;
DROP TRIGGER IF EXISTS trg_refresh_user_cache_roles ON user_roles;

-- 2. Dropar função de refresh
DROP FUNCTION IF EXISTS refresh_user_cache();

-- 3. Dropar materialized view
DROP MATERIALIZED VIEW IF EXISTS mv_user_cache;

-- 4. Dropar view
DROP VIEW IF EXISTS vw_user_complete;

-- 5. Dropar função RPC (vamos recriar depois)
DROP FUNCTION IF EXISTS get_user_complete(UUID);

-- Nota: Vamos recriar tudo em um schema privado após regenerar types.ts