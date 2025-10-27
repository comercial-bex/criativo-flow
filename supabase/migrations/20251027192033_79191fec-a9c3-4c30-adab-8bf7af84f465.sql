-- Sprint 1 Migration 02 FINAL: Fix users without role
-- Desabilitar apenas triggers customizados

-- 1. Desabilitar triggers customizados de user_roles e pessoas
DO $$
DECLARE
  trigger_rec record;
BEGIN
  FOR trigger_rec IN 
    SELECT c.relname as table_name, t.tgname as trigger_name
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    WHERE c.relname IN ('user_roles', 'pessoas')
      AND NOT tgisinternal
  LOOP
    EXECUTE format('ALTER TABLE %I DISABLE TRIGGER %I', trigger_rec.table_name, trigger_rec.trigger_name);
    RAISE NOTICE 'Trigger desabilitado: %.%', trigger_rec.table_name, trigger_rec.trigger_name;
  END LOOP;
END $$;

-- 2. Corrigir função de sincronização
CREATE OR REPLACE FUNCTION sync_user_roles_papeis()
RETURNS TRIGGER AS $$
DECLARE
  role_to_papel jsonb := '{
    "admin": ["admin"],
    "gestor": ["gestor"],
    "grs": ["grs"],
    "atendimento": ["atendimento"],
    "designer": ["designer"],
    "filmmaker": ["filmmaker"],
    "trafego": ["trafego"],
    "financeiro": ["financeiro"],
    "rh": ["rh"],
    "cliente": ["cliente"]
  }'::jsonb;
  new_papeis text[];
BEGIN
  new_papeis := CASE 
    WHEN role_to_papel ? NEW.role::text THEN
      ARRAY(SELECT jsonb_array_elements_text(role_to_papel -> NEW.role::text))
    ELSE
      ARRAY['cliente']
  END;
  
  UPDATE pessoas 
  SET papeis = new_papeis
  WHERE profile_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 3. Corrigir usuários sem role
DO $$
DECLARE
  v_user_id uuid;
  v_email text;
  v_default_role user_role;
  v_pessoa_record record;
BEGIN
  FOR v_user_id, v_email IN
    SELECT u.id, u.email
    FROM auth.users u
    LEFT JOIN user_roles ur ON ur.user_id = u.id
    WHERE ur.role IS NULL AND u.email NOT LIKE '%@supabase%'
  LOOP
    SELECT * INTO v_pessoa_record FROM pessoas WHERE profile_id = v_user_id;
    
    IF v_pessoa_record IS NOT NULL THEN
      v_default_role := CASE 
        WHEN v_pessoa_record.cliente_id IS NOT NULL THEN 'cliente'::user_role
        WHEN 'admin' = ANY(v_pessoa_record.papeis) THEN 'admin'::user_role
        WHEN 'grs' = ANY(v_pessoa_record.papeis) THEN 'grs'::user_role
        ELSE 'cliente'::user_role
      END;
    ELSE
      v_default_role := 'cliente'::user_role;
    END IF;
    
    INSERT INTO user_roles (user_id, role) VALUES (v_user_id, v_default_role);
    RAISE NOTICE '✅ Role: % → %', v_email, v_default_role;
  END LOOP;
END $$;

-- 4. Reabilitar triggers
DO $$
DECLARE
  trigger_rec record;
BEGIN
  FOR trigger_rec IN 
    SELECT c.relname as table_name, t.tgname as trigger_name
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    WHERE c.relname IN ('user_roles', 'pessoas')
      AND NOT tgisinternal
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE TRIGGER %I', trigger_rec.table_name, trigger_rec.trigger_name);
    RAISE NOTICE 'Trigger reabilitado: %.%', trigger_rec.table_name, trigger_rec.trigger_name;
  END LOOP;
END $$;

-- 5. Definir valor padrão
ALTER TABLE user_roles ALTER COLUMN role SET DEFAULT 'cliente'::user_role;