-- Corrigir RLS para permitir comentários de seguidores
BEGIN;

-- Dropar política antiga
DROP POLICY IF EXISTS "Usuários podem criar atividades" ON tarefa_atividades;

-- Criar política corrigida com verificação de seguidores
CREATE POLICY "Usuários podem criar atividades"
ON tarefa_atividades
FOR INSERT
WITH CHECK (
  (user_id = auth.uid()) 
  AND (
    EXISTS (
      SELECT 1 FROM tarefa t
      WHERE t.id = tarefa_atividades.tarefa_id 
      AND (
        t.responsavel_id = auth.uid() 
        OR t.executor_id = auth.uid() 
        OR is_admin(auth.uid()) 
        OR get_user_role(auth.uid()) IN ('gestor', 'grs')
        OR t.cliente_id IN (SELECT cliente_id FROM profiles WHERE id = auth.uid())
        OR EXISTS (
          SELECT 1 FROM tarefa_seguidores ts
          WHERE ts.tarefa_id = t.id 
          AND ts.user_id = auth.uid()
        )
      )
    )
  )
);

COMMIT;