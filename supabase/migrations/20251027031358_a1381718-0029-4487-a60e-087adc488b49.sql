-- ============================================
-- COMPLETAR UNIFICAÇÃO - Renomear tabela primeiro
-- ============================================

-- Renomear tabela profiles_deprecated para backup
ALTER TABLE profiles_deprecated RENAME TO profiles_deprecated_backup_2025;

-- FASE 3: CRIAR TRIGGER DE SINCRONIZAÇÃO
CREATE OR REPLACE FUNCTION sync_user_roles_papeis()
RETURNS TRIGGER AS $$
DECLARE
  role_to_papel jsonb;
  papel_to_role text;
BEGIN
  role_to_papel := '{
    "admin": ["admin"],
    "designer": ["colaborador", "design"],
    "filmmaker": ["colaborador", "audiovisual"],
    "rh": ["colaborador", "gestor"],
    "grs": ["colaborador", "grs"],
    "atendimento": ["colaborador", "atendimento"],
    "financeiro": ["colaborador", "financeiro"],
    "gestor": ["colaborador", "gestor"],
    "trafego": ["colaborador", "trafego"],
    "cliente": ["cliente"],
    "fornecedor": ["fornecedor"]
  }'::jsonb;

  IF TG_TABLE_NAME = 'user_roles' THEN
    UPDATE pessoas 
    SET papeis = COALESCE((role_to_papel ->> NEW.role)::text[], ARRAY['cliente'])
    WHERE profile_id = NEW.user_id;
    
  ELSIF TG_TABLE_NAME = 'pessoas' THEN
    IF 'admin' = ANY(NEW.papeis) THEN
      papel_to_role := 'admin';
    ELSIF 'design' = ANY(NEW.papeis) THEN
      papel_to_role := 'designer';
    ELSIF 'audiovisual' = ANY(NEW.papeis) THEN
      papel_to_role := 'filmmaker';
    ELSIF 'grs' = ANY(NEW.papeis) THEN
      papel_to_role := 'grs';
    ELSIF 'gestor' = ANY(NEW.papeis) THEN
      papel_to_role := 'gestor';
    ELSIF 'trafego' = ANY(NEW.papeis) THEN
      papel_to_role := 'trafego';
    ELSIF 'fornecedor' = ANY(NEW.papeis) THEN
      papel_to_role := 'fornecedor';
    ELSE
      papel_to_role := 'cliente';
    END IF;
    
    UPDATE user_roles 
    SET role = papel_to_role::user_role
    WHERE user_id = NEW.profile_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_user_roles ON user_roles;
CREATE TRIGGER trg_sync_user_roles
AFTER INSERT OR UPDATE OF role ON user_roles
FOR EACH ROW EXECUTE FUNCTION sync_user_roles_papeis();

DROP TRIGGER IF EXISTS trg_sync_papeis ON pessoas;
CREATE TRIGGER trg_sync_papeis
AFTER INSERT OR UPDATE OF papeis ON pessoas
FOR EACH ROW EXECUTE FUNCTION sync_user_roles_papeis();

-- FASE 4: CRIAR VIEW DE COMPATIBILIDADE
CREATE OR REPLACE VIEW profiles_deprecated AS
SELECT 
  profile_id AS id,
  nome,
  email,
  telefones[1] AS telefone,
  created_at,
  updated_at,
  NULL::uuid AS cliente_id
FROM pessoas
WHERE profile_id IS NOT NULL;

COMMENT ON VIEW profiles_deprecated IS 
'VIEW DE COMPATIBILIDADE - DEPRECATED! Use tabela pessoas diretamente.';