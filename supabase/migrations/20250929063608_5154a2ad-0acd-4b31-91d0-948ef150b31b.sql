-- SOLUÇÃO 2 E 3 CORRIGIDA: Criar usuário comercial@agenciabex.com.br usando apenas public schema
-- e implementar sistema de backup para criação de usuários

-- Criar função de backup para criação de usuários clientes (sem mexer no auth schema diretamente)
CREATE OR REPLACE FUNCTION public.create_client_user_sql(
    p_email text,
    p_password text,
    p_nome text,
    p_cliente_id uuid,
    p_role text DEFAULT 'cliente'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_user_id uuid;
    result jsonb;
    supabase_url text;
    service_key text;
    create_user_response jsonb;
BEGIN
    -- Verificar se o usuário já existe no perfil
    SELECT id INTO new_user_id FROM public.profiles WHERE email = p_email;
    
    IF new_user_id IS NOT NULL THEN
        -- Usuário já existe, apenas atualizar vínculos
        UPDATE public.profiles 
        SET cliente_id = p_cliente_id,
            nome = p_nome,
            status = 'aprovado'
        WHERE id = new_user_id;
    ELSE
        -- Para novos usuários, vamos retornar instruções para usar a edge function
        result := jsonb_build_object(
            'success', false,
            'use_edge_function', true,
            'message', 'Use a edge function create-client-user para criar novos usuários'
        );
        RETURN result;
    END IF;
    
    -- Inserir role se não existir
    INSERT INTO public.user_roles (
        user_id,
        role
    )
    VALUES (
        new_user_id,
        p_role::user_role
    )
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Inserir/atualizar na tabela cliente_usuarios se existir
    INSERT INTO public.cliente_usuarios (
        cliente_id,
        user_id,
        role_cliente,
        permissoes,
        is_active
    )
    VALUES (
        p_cliente_id,
        new_user_id,
        CASE WHEN p_role = 'cliente' THEN 'proprietario' ELSE p_role END,
        '{
            "financeiro": {"ver": true, "editar": true},
            "marketing": {"ver": true, "aprovar": true}, 
            "projetos": {"ver": true, "criar": true, "editar": true},
            "relatorios": {"ver": true}
        }'::jsonb,
        true
    )
    ON CONFLICT (cliente_id, user_id) DO UPDATE SET
        role_cliente = EXCLUDED.role_cliente,
        permissoes = EXCLUDED.permissoes,
        is_active = EXCLUDED.is_active;
    
    result := jsonb_build_object(
        'success', true,
        'user_id', new_user_id,
        'email', p_email,
        'message', 'Usuário existente atualizado com sucesso via SQL'
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'message', 'Erro ao processar usuário via SQL'
        );
END;
$$;

-- Criar função para validar se usuário existe antes do login
CREATE OR REPLACE FUNCTION public.validate_user_for_login(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_data jsonb;
    profile_data record;
    client_data record;
BEGIN
    -- Buscar dados do perfil
    SELECT p.*, c.nome as cliente_nome, ur.role
    INTO profile_data
    FROM public.profiles p
    LEFT JOIN public.clientes c ON p.cliente_id = c.id
    LEFT JOIN public.user_roles ur ON p.id = ur.user_id
    WHERE p.email = p_email;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'exists', false,
            'message', 'Usuário não encontrado no sistema'
        );
    END IF;
    
    -- Verificar se está vinculado a algum cliente
    IF profile_data.cliente_id IS NULL THEN
        RETURN jsonb_build_object(
            'exists', true,
            'has_client', false,
            'message', 'Usuário existe mas não está vinculado a nenhum cliente'
        );
    END IF;
    
    -- Retornar dados do usuário
    RETURN jsonb_build_object(
        'exists', true,
        'has_client', true,
        'user_id', profile_data.id,
        'nome', profile_data.nome,
        'email', profile_data.email,
        'cliente_id', profile_data.cliente_id,
        'cliente_nome', profile_data.cliente_nome,
        'role', profile_data.role,
        'status', profile_data.status,
        'message', 'Usuário válido para login'
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'exists', false,
            'error', SQLERRM,
            'message', 'Erro ao validar usuário'
        );
END;
$$;