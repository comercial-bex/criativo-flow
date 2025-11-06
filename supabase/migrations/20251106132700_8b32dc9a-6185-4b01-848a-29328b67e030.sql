-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS trigger_registrar_mudanca_meta ON cliente_metas;

-- Recriar trigger
CREATE TRIGGER trigger_registrar_mudanca_meta
AFTER UPDATE ON cliente_metas
FOR EACH ROW
EXECUTE FUNCTION registrar_mudanca_meta();