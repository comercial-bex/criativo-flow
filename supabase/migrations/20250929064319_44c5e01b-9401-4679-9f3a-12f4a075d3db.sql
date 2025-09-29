-- Corrigir função de validação para permitir login de administradores sem cliente_id
CREATE OR REPLACE FUNCTION public.validate_user_for_login(p_email text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    
    -- Verificar se é admin, gestor ou especialista (não precisam de cliente_id)
    IF profile_data.role IN ('admin', 'gestor', 'design', 'grs', 'audiovisual', 'trafego', 'financeiro', 'atendimento') THEN
        RETURN jsonb_build_object(
            'exists', true,
            'has_client', true, -- Para roles administrativas, consideramos como válido
            'user_id', profile_data.id,
            'nome', profile_data.nome,
            'email', profile_data.email,
            'cliente_id', profile_data.cliente_id,
            'cliente_nome', profile_data.cliente_nome,
            'role', profile_data.role,
            'status', profile_data.status,
            'is_admin_role', true,
            'message', 'Usuário administrativo válido para login'
        );
    END IF;
    
    -- Para role 'cliente', verificar se está vinculado a algum cliente
    IF profile_data.cliente_id IS NULL THEN
        RETURN jsonb_build_object(
            'exists', true,
            'has_client', false,
            'message', 'Usuário cliente existe mas não está vinculado a nenhum cliente'
        );
    END IF;
    
    -- Retornar dados do usuário cliente
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
        'is_admin_role', false,
        'message', 'Usuário cliente válido para login'
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'exists', false,
            'error', SQLERRM,
            'message', 'Erro ao validar usuário'
        );
END;
$function$;