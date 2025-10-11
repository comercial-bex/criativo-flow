-- ==========================================
-- CORREÇÃO: Permitir deleção de usuários
-- ==========================================

-- 1. Adicionar policy de DELETE para profiles
CREATE POLICY "Admins podem deletar perfis"
ON profiles FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- 2. Adicionar policy de DELETE para user_roles (para limpeza completa)
CREATE POLICY "Admins podem deletar roles"
ON user_roles FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

COMMENT ON POLICY "Admins podem deletar perfis" ON profiles IS 
'Permite que administradores deletem perfis de usuários. Usado pela edge function admin-user-management.';

COMMENT ON POLICY "Admins podem deletar roles" ON user_roles IS 
'Permite que administradores deletem roles de usuários. Usado para limpeza durante deleção de usuários.';