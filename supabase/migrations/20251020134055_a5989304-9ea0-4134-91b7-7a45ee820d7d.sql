-- ============================================
-- FIX: update_user_role não pode atualizar VIEW profiles
-- SOLUÇÃO: Atualizar pessoas.papeis ao invés de profiles.especialidade
-- ============================================

CREATE OR REPLACE FUNCTION public.update_user_role(
  p_user_id UUID,
  p_new_role user_role
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_papeis_atualizados text[];
BEGIN
  -- 1️⃣ Validar permissão
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar roles';
  END IF;

  -- 2️⃣ Atualizar user_roles (tabela de permissões)
  DELETE FROM public.user_roles WHERE user_id = p_user_id;
  INSERT INTO public.user_roles (user_id, role) VALUES (p_user_id, p_new_role);

  -- 3️⃣ Atualizar pessoas.papeis (fonte de dados)
  -- Mapear role → papeis correspondentes
  CASE p_new_role::text
    WHEN 'designer' THEN
      v_papeis_atualizados := ARRAY['designer', 'especialista'];
    WHEN 'filmmaker' THEN
      v_papeis_atualizados := ARRAY['filmmaker', 'audiovisual', 'especialista'];
    WHEN 'grs' THEN
      v_papeis_atualizados := ARRAY['grs', 'especialista'];
    WHEN 'atendimento' THEN
      v_papeis_atualizados := ARRAY['atendimento', 'especialista'];
    WHEN 'financeiro' THEN
      v_papeis_atualizados := ARRAY['financeiro', 'especialista'];
    WHEN 'gestor' THEN
      v_papeis_atualizados := ARRAY['gestor', 'especialista'];
    WHEN 'rh' THEN
      v_papeis_atualizados := ARRAY['rh', 'especialista'];
    WHEN 'trafego' THEN
      v_papeis_atualizados := ARRAY['trafego', 'especialista'];
    WHEN 'admin' THEN
      v_papeis_atualizados := ARRAY['admin'];
    WHEN 'cliente' THEN
      v_papeis_atualizados := ARRAY['cliente'];
    WHEN 'fornecedor' THEN
      v_papeis_atualizados := ARRAY['fornecedor'];
    ELSE
      v_papeis_atualizados := ARRAY['especialista'];
  END CASE;

  -- 4️⃣ Atualizar tabela pessoas (se existir registro)
  UPDATE public.pessoas 
  SET 
    papeis = v_papeis_atualizados,
    updated_at = NOW()
  WHERE profile_id = p_user_id;

  -- 5️⃣ Log de auditoria
  RAISE NOTICE 'Role atualizada: user=% role=% papeis=%', p_user_id, p_new_role, v_papeis_atualizados;

  RETURN TRUE;
END;
$function$;

-- ============================================
-- COMENTÁRIO EXPLICATIVO
-- ============================================
COMMENT ON FUNCTION public.update_user_role(uuid, user_role) IS 
'Atualiza role do usuário em user_roles e sincroniza papeis na tabela pessoas. 
 Corrigido para não tentar atualizar a VIEW profiles.';