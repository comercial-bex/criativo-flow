-- Corrigir search_path das funções criadas na migração anterior

ALTER FUNCTION update_updated_at_column() SET search_path = public;