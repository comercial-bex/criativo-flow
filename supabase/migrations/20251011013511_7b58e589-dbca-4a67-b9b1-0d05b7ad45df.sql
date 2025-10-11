-- Remove trigger e função que causam erro com schema 'net'
-- Motivo: schema 'net' não existe, bloqueando INSERT em profiles com status pendente_aprovacao

-- 1. Remover trigger se existir
DROP TRIGGER IF EXISTS trigger_email_novo_especialista ON public.profiles;

-- 2. Remover função se existir
DROP FUNCTION IF EXISTS public.enviar_email_novo_especialista();

-- 3. Comentário para auditoria
COMMENT ON TABLE public.email_logs IS 'Logs de emails enviados via Edge Function (não mais via trigger DB)';
COMMENT ON TABLE public.email_templates IS 'Templates de email usados via Edge Function';