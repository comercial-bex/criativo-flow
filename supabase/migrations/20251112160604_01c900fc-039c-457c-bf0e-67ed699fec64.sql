-- Remover trigger que falhou (coluna não existe)
DROP TRIGGER IF EXISTS trg_notificar_ab_testing ON posts_planejamento;
DROP FUNCTION IF EXISTS public.notificar_ab_testing();
