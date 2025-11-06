-- Verificar se trigger existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_registrar_mudanca_meta'
  ) THEN
    RAISE NOTICE '✅ Trigger trigger_registrar_mudanca_meta existe';
  ELSE
    RAISE NOTICE '❌ Trigger trigger_registrar_mudanca_meta NÃO existe';
  END IF;
END $$;