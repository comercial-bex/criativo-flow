-- Corrigir função para ser VOLATILE ao invés de STABLE
CREATE OR REPLACE FUNCTION public.create_client_user_direct(
    p_email text,
    p_password text,
    p_nome text,
    p_cliente_id uuid,
    p_role text DEFAULT 'cliente'
)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE  -- Mudança importante: VOLATILE ao invés de STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    new_user_id uuid;
    existing_profile_id uuid;
    result jsonb;
BEGIN
    -- Verificar se já existe um perfil com este email
    SELECT id INTO existing_profile_id FROM public.profiles WHERE email = p_email;
    
    IF existing_profile_id IS NOT NULL THEN
        -- Atualizar perfil existente
        UPDATE public.profiles SET
            cliente_id = p_cliente_id,
            nome = p_nome,
            status = 'aprovado'
        WHERE id = existing_profile_id;
        
        new_user_id := existing_profile_id;
        
    ELSE
        -- Criar novo perfil
        new_user_id := gen_random_uuid();
        
        INSERT INTO public.profiles (
            id,
            email,
            nome,
            cliente_id,
            status
        ) VALUES (
            new_user_id,
            p_email,
            p_nome,
            p_cliente_id,
            'aprovado'
        );
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
    
    result := jsonb_build_object(
        'success', true,
        'user_id', new_user_id,
        'email', p_email,
        'password', p_password,
        'message', 'Usuário cliente criado com sucesso (SQL direto)',
        'method', 'sql_direct'
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'message', 'Erro ao criar usuário cliente via SQL direto: ' || SQLERRM
        );
END;
$$;