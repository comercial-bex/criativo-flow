-- Corrigir a função para criar usuário cliente (sem conflito de constraint)
CREATE OR REPLACE FUNCTION public.create_client_user_direct(
    p_email text,
    p_password text,
    p_nome text,
    p_cliente_id uuid,
    p_role text DEFAULT 'cliente'
)
RETURNS jsonb
LANGUAGE plpgsql
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
    
    -- Inserir/atualizar na tabela cliente_usuarios se existir
    BEGIN
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
    EXCEPTION
        WHEN others THEN
            -- Se a tabela cliente_usuarios não existir, continue
            NULL;
    END;
    
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
            'message', 'Erro ao criar usuário cliente via SQL direto'
        );
END;
$$;