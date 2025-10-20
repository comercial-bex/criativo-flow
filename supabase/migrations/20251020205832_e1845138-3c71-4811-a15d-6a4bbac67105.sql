-- =====================================================
-- PRIORIDADE 2: Corrigir RLS para /usuarios
-- =====================================================
-- Permite que admin/gestor/rh visualizem TODA a equipe interna

-- Adicionar política para visualização completa por gestores
CREATE POLICY "admin_gestor_rh_view_all_pessoas"
ON pessoas FOR SELECT
TO authenticated
USING (
  is_admin(auth.uid()) 
  OR get_user_role(auth.uid()) IN ('gestor'::user_role, 'rh'::user_role)
);

-- Registrar no audit trail
INSERT INTO audit_trail (
  acao,
  entidade_tipo,
  entidade_id,
  dados_antes,
  dados_depois,
  metadata,
  user_id,
  user_role,
  acao_detalhe,
  entidades_afetadas,
  impacto_tipo
) VALUES (
  'RLS_UPDATE',
  'pessoas',
  gen_random_uuid(),
  '{}'::jsonb,
  '{}'::jsonb,
  jsonb_build_object(
    'prioridade', 'PRIORIDADE 2',
    'acao', 'Adicionar política RLS para visualização completa',
    'roles_afetados', ARRAY['admin', 'gestor', 'rh']
  ),
  NULL,
  'system',
  'Corrigir RLS para /usuarios - permite visualização completa da equipe',
  to_jsonb(ARRAY['pessoas']),
  'acesso'
);

-- Verificação
DO $$
DECLARE
  v_policies_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_policies_count
  FROM pg_policies
  WHERE tablename = 'pessoas' 
    AND policyname = 'admin_gestor_rh_view_all_pessoas';
  
  RAISE NOTICE 'Política RLS criada: % (1 = sucesso)', v_policies_count;
END $$;