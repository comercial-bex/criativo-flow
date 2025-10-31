-- =====================================================
-- FUNÇÃO PARA CRIAR USUÁRIO ADMINISTRADOR
-- =====================================================
-- Execute após a migração: SELECT create_admin_user();
-- =====================================================

CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS jsonb AS $$
DECLARE
  v_user_id UUID;
  v_result jsonb;
BEGIN
  -- Tentar buscar usuário existente
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = 'admin@sistema.com';
  
  -- Se não existe, precisamos criá-lo manualmente via Supabase Dashboard
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Usuário não encontrado. Crie via Supabase Dashboard:',
      'instructions', jsonb_build_object(
        'step1', 'Acesse: Authentication > Users',
        'step2', 'Clique em "Add user" > "Create new user"',
        'step3', 'Email: admin@sistema.com',
        'step4', 'Password: Agencia@2026',
        'step5', 'Marque "Auto Confirm User"',
        'step6', 'Execute novamente: SELECT create_admin_user();'
      )
    );
  END IF;
  
  -- Inserir na tabela pessoas com papéis de admin
  INSERT INTO pessoas (
    id,
    profile_id,
    nome,
    sobrenome,
    email,
    papeis,
    ativo,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_user_id,
    'Administrador',
    'Sistema',
    'admin@sistema.com',
    '["admin", "gestor", "colaborador"]'::jsonb,
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (profile_id) 
  DO UPDATE SET 
    papeis = '["admin", "gestor", "colaborador"]'::jsonb,
    ativo = true,
    updated_at = NOW();
  
  -- Adicionar role na tabela user_roles
  INSERT INTO user_roles (
    user_id,
    role
  ) VALUES (
    v_user_id,
    'admin'
  )
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', '✅ Usuário administrador configurado com sucesso!',
    'credentials', jsonb_build_object(
      'email', 'admin@sistema.com',
      'password', 'Agencia@2026'
    ),
    'warning', '⚠️ Altere a senha após o primeiro login!',
    'user_id', v_user_id
  );
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Executar a função automaticamente
SELECT create_admin_user();