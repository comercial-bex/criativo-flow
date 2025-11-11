-- Corrigir search_path da função update_proposta_assinaturas_updated_at
DROP TRIGGER IF EXISTS trigger_update_proposta_assinaturas_updated_at ON proposta_assinaturas;
DROP FUNCTION IF EXISTS update_proposta_assinaturas_updated_at();

CREATE OR REPLACE FUNCTION update_proposta_assinaturas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SET search_path = public;

CREATE TRIGGER trigger_update_proposta_assinaturas_updated_at
  BEFORE UPDATE ON proposta_assinaturas
  FOR EACH ROW
  EXECUTE FUNCTION update_proposta_assinaturas_updated_at();