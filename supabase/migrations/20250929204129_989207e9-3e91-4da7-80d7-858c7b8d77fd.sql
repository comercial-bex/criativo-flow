-- Melhorar função validate_user_for_login para ser mais flexível
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
            'message', 'Usuário não encontrado no sistema - será criado automaticamente no primeiro login'
        );
    END IF;
    
    -- Verificar se é admin, gestor ou especialista
    IF profile_data.role IN ('admin', 'gestor', 'designer', 'grs', 'filmmaker', 'trafego', 'financeiro', 'atendimento') THEN
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
            'is_admin_role', true,
            'message', 'Usuário administrativo válido para login'
        );
    END IF;
    
    -- Para role 'cliente', ser mais flexível com vínculo
    RETURN jsonb_build_object(
        'exists', true,
        'has_client', CASE WHEN profile_data.cliente_id IS NOT NULL THEN true ELSE false END,
        'user_id', profile_data.id,
        'nome', profile_data.nome,
        'email', profile_data.email,
        'cliente_id', profile_data.cliente_id,
        'cliente_nome', profile_data.cliente_nome,
        'role', COALESCE(profile_data.role, 'cliente'),
        'status', profile_data.status,
        'is_admin_role', false,
        'message', CASE 
            WHEN profile_data.cliente_id IS NOT NULL THEN 'Usuário cliente válido para login'
            ELSE 'Usuário cliente sem vínculo - poderá ser configurado após login'
        END
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'exists', false,
            'error', SQLERRM,
            'message', 'Erro ao validar usuário - login permitido para diagnóstico'
        );
END;
$function$;