-- Inserir permissões RH para admin, gestor e financeiro
INSERT INTO public.role_permissions (role, module, can_view, can_create, can_edit, can_delete)
VALUES 
  ('admin', 'rh', true, true, true, true),
  ('gestor', 'rh', true, true, true, false),
  ('financeiro', 'rh', true, true, true, false)
ON CONFLICT (role, module) DO UPDATE SET
  can_view = EXCLUDED.can_view,
  can_create = EXCLUDED.can_create,
  can_edit = EXCLUDED.can_edit,
  can_delete = EXCLUDED.can_delete;