-- ========================================
-- CORREÇÃO: Papeis vazios em especialistas (v2)
-- ========================================

-- 1. Remover constraint que está bloqueando
ALTER TABLE pessoas DROP CONSTRAINT IF EXISTS pessoas_papeis_validos;

-- 2. Atualizar papeis com base no profile_id vinculado
UPDATE pessoas p
SET papeis = CASE 
  WHEN pd.especialidade = 'grs' THEN ARRAY['grs']::text[]
  WHEN pd.especialidade = 'design' THEN ARRAY['design']::text[]
  WHEN pd.especialidade IN ('audiovisual', 'filmmaker', 'videomaker') THEN ARRAY['audiovisual']::text[]
  WHEN pd.especialidade = 'atendimento' THEN ARRAY['atendimento']::text[]
  WHEN pd.especialidade = 'financeiro' THEN ARRAY['financeiro']::text[]
  WHEN pd.especialidade = 'gestor' THEN ARRAY['gestor']::text[]
  ELSE ARRAY['especialista']::text[]
END,
updated_at = NOW()
FROM profiles_deprecated pd
WHERE p.profile_id = pd.id
  AND p.profile_id IS NOT NULL
  AND (p.papeis IS NULL OR p.papeis = '{}');

-- 3. Recriar constraint permitindo os papeis corretos
ALTER TABLE pessoas
ADD CONSTRAINT pessoas_papeis_validos 
CHECK (
  papeis IS NOT NULL 
  AND array_length(papeis, 1) > 0
  AND papeis <@ ARRAY['colaborador', 'especialista', 'cliente', 'grs', 'design', 'audiovisual', 'atendimento', 'financeiro', 'gestor', 'admin']::text[]
);

-- 4. Função para auto-popular papeis
CREATE OR REPLACE FUNCTION auto_populate_papeis()
RETURNS TRIGGER AS $$
BEGIN
  -- Se papeis estiver vazio e tiver profile_id, buscar de profiles_deprecated
  IF (NEW.papeis IS NULL OR NEW.papeis = '{}') AND NEW.profile_id IS NOT NULL THEN
    SELECT 
      CASE 
        WHEN especialidade = 'grs' THEN ARRAY['grs']::text[]
        WHEN especialidade = 'design' THEN ARRAY['design']::text[]
        WHEN especialidade IN ('audiovisual', 'filmmaker', 'videomaker') THEN ARRAY['audiovisual']::text[]
        WHEN especialidade = 'atendimento' THEN ARRAY['atendimento']::text[]
        WHEN especialidade = 'financeiro' THEN ARRAY['financeiro']::text[]
        WHEN especialidade = 'gestor' THEN ARRAY['gestor']::text[]
        ELSE ARRAY['especialista']::text[]
      END
    INTO NEW.papeis
    FROM profiles_deprecated
    WHERE id = NEW.profile_id;
  END IF;
  
  -- Se ainda estiver vazio, definir como especialista genérico
  IF NEW.papeis IS NULL OR NEW.papeis = '{}' THEN
    NEW.papeis := ARRAY['especialista']::text[];
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Criar trigger para garantir papeis populado
DROP TRIGGER IF EXISTS ensure_papeis_populated ON pessoas;
CREATE TRIGGER ensure_papeis_populated
  BEFORE INSERT OR UPDATE ON pessoas
  FOR EACH ROW
  EXECUTE FUNCTION auto_populate_papeis();