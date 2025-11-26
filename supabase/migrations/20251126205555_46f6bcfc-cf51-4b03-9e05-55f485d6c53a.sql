-- ========================================
-- MIGRATION: Corrigir function e sincronizar usuário órfão
-- ========================================

-- ✅ 1. CORRIGIR function validate_pessoa_cliente_fields para usar 'cpf' ao invés de 'cpf_cnpj'
CREATE OR REPLACE FUNCTION public.validate_pessoa_cliente_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Validar CPF obrigatório para clientes aprovados
  IF 'cliente' = ANY(NEW.papeis) AND NEW.status = 'aprovado' 
     AND (NEW.cpf IS NULL OR NEW.cpf = '') THEN
    RAISE EXCEPTION 'CPF obrigatório para clientes aprovados';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- ✅ 2. SINCRONIZAR usuário órfão
DO $$
DECLARE
  v_user_id UUID;
  v_user_exists BOOLEAN;
BEGIN
  -- Buscar ID do usuário órfão
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = 'xgabrielb634@gmail.com'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Usuário xgabrielb634@gmail.com não encontrado em auth.users';
    RETURN;
  END IF;

  -- Verificar se já existe em pessoas
  SELECT EXISTS(
    SELECT 1 FROM pessoas WHERE profile_id = v_user_id
  ) INTO v_user_exists;

  IF v_user_exists THEN
    RAISE NOTICE 'Usuário já existe em pessoas';
    
    -- Garantir que tem role (constraint em user_id apenas)
    INSERT INTO user_roles (user_id, role)
    VALUES (v_user_id, 'cliente')
    ON CONFLICT (user_id) DO NOTHING;
    
  ELSE
    -- Inserir em pessoas
    INSERT INTO pessoas (
      profile_id, 
      email, 
      nome, 
      status, 
      papeis
    ) VALUES (
      v_user_id,
      'xgabrielb634@gmail.com',
      'Gabriel',
      'pendente_aprovacao',
      ARRAY['especialista']::text[]
    );

    -- Inserir role (constraint em user_id apenas)
    INSERT INTO user_roles (user_id, role)
    VALUES (v_user_id, 'cliente')
    ON CONFLICT (user_id) DO NOTHING;

    RAISE NOTICE '✅ Usuário xgabrielb634@gmail.com sincronizado';
  END IF;
END $$;

-- ✅ 3. Log de auditoria
INSERT INTO audit_trail (
  entidade_tipo,
  entidade_id,
  acao,
  acao_detalhe,
  user_id,
  dados_depois,
  trace_id
) VALUES (
  'system',
  gen_random_uuid(),
  'fix_validation_and_sync_user',
  'Function validate_pessoa_cliente_fields corrigida e usuário órfão sincronizado',
  NULL,
  jsonb_build_object(
    'function_corrigida', true,
    'usuario_sincronizado', 'xgabrielb634@gmail.com',
    'timestamp', NOW()
  ),
  gen_random_uuid()
);
