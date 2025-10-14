-- FASE 1: Adicionar policy para GRS criar tarefas
CREATE POLICY "GRS pode criar tarefas"
ON public.tarefa
FOR INSERT
WITH CHECK (
  get_user_role(auth.uid()) IN ('grs'::user_role, 'gestor'::user_role, 'admin'::user_role)
);

-- FASE 2: Corrigir permissões dinâmicas no banco

-- REMOVER permissão incorreta de GRS ver Design
DELETE FROM role_permissions 
WHERE role = 'grs' AND module = 'design';

-- REMOVER permissão incorreta de Designer ver módulos de GRS
DELETE FROM role_permissions 
WHERE role = 'designer' AND module IN ('grs', 'projetos');

-- GARANTIR que GRS só vê seus módulos
INSERT INTO role_permissions (role, module, can_view, can_create, can_edit, can_delete)
VALUES 
  ('grs', 'grs', true, true, true, false),
  ('grs', 'projetos', true, true, true, true),
  ('grs', 'clientes', true, true, true, false),
  ('grs', 'crm', true, true, true, false)
ON CONFLICT (role, module) DO UPDATE SET
  can_view = EXCLUDED.can_view,
  can_create = EXCLUDED.can_create,
  can_edit = EXCLUDED.can_edit,
  can_delete = EXCLUDED.can_delete;

-- GARANTIR que Designer só vê Design
INSERT INTO role_permissions (role, module, can_view, can_create, can_edit, can_delete)
VALUES 
  ('designer', 'design', true, true, true, false)
ON CONFLICT (role, module) DO UPDATE SET
  can_view = EXCLUDED.can_view,
  can_create = EXCLUDED.can_create,
  can_edit = EXCLUDED.can_edit,
  can_delete = EXCLUDED.can_delete;