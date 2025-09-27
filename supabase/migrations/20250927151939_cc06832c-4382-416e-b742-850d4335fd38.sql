-- Remove the remaining security definer view that's causing the linter warning
DROP VIEW IF EXISTS public.secure_clientes;