-- =====================================================
-- ETAPA 2: RECUPERAÇÃO DOS ESPECIALISTAS
-- =====================================================

-- Migrar especialistas de profiles_deprecated para pessoas
INSERT INTO pessoas (
  nome, 
  email, 
  telefones, 
  profile_id, 
  papeis, 
  status, 
  created_at
)
SELECT 
  pd.nome,
  pd.email,
  CASE 
    WHEN pd.telefone IS NOT NULL THEN ARRAY[pd.telefone]::text[]
    ELSE ARRAY[]::text[]
  END,
  pd.id,
  CASE 
    WHEN pd.especialidade = 'grs' THEN ARRAY['especialista', 'grs']::text[]
    WHEN pd.especialidade = 'design' THEN ARRAY['especialista', 'design']::text[]
    WHEN pd.especialidade = 'audiovisual' THEN ARRAY['especialista', 'audiovisual']::text[]
    ELSE ARRAY['especialista']::text[]
  END,
  'ativo',
  pd.created_at
FROM profiles_deprecated pd
WHERE pd.especialidade IN ('grs', 'design', 'audiovisual')
  AND pd.status = 'aprovado'
  AND pd.id NOT IN (SELECT profile_id FROM pessoas WHERE profile_id IS NOT NULL)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- ETAPA 5: PREVENÇÃO E PROTEÇÃO
-- =====================================================

-- Trigger para prevenir delete acidental de especialistas
CREATE OR REPLACE FUNCTION prevent_especialista_delete()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF 'especialista' = ANY(OLD.papeis) THEN
    RAISE EXCEPTION 'ESPECIALISTA_PROTEGIDO: Não é permitido deletar especialistas. Use soft delete (status=inativo) em vez disso.'
      USING HINT = 'Altere o status para "inativo" ao invés de deletar';
  END IF;
  RETURN OLD;
END;
$$;

-- Criar trigger
DROP TRIGGER IF EXISTS check_especialista_delete ON pessoas;
CREATE TRIGGER check_especialista_delete
  BEFORE DELETE ON pessoas
  FOR EACH ROW
  EXECUTE FUNCTION prevent_especialista_delete();

-- Comentários para documentação
COMMENT ON FUNCTION prevent_especialista_delete() IS 'Previne deleção acidental de especialistas, forçando uso de soft delete';
COMMENT ON TRIGGER check_especialista_delete ON pessoas IS 'Protege especialistas contra deleção acidental';