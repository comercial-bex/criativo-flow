-- Remover policies antigas conflitantes do anexo
DROP POLICY IF EXISTS "Responsáveis podem gerenciar anexos" ON public.anexo;
DROP POLICY IF EXISTS "Usuários podem ver anexos de tarefas que acessam" ON public.anexo;

-- Criar policies atualizadas para anexo
CREATE POLICY "Responsáveis e executores podem gerenciar anexos"
ON public.anexo
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tarefa t
    WHERE t.id = anexo.tarefa_id
      AND (
        t.responsavel_id = auth.uid()
        OR t.executor_id = auth.uid()
        OR is_admin(auth.uid())
        OR get_user_role(auth.uid()) IN ('gestor', 'grs')
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tarefa t
    WHERE t.id = anexo.tarefa_id
      AND (
        t.responsavel_id = auth.uid()
        OR t.executor_id = auth.uid()
        OR is_admin(auth.uid())
        OR get_user_role(auth.uid()) IN ('gestor', 'grs')
      )
  )
);

CREATE POLICY "Usuários podem ver anexos de suas tarefas"
ON public.anexo
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tarefa t
    WHERE t.id = anexo.tarefa_id
      AND (
        t.responsavel_id = auth.uid()
        OR t.executor_id = auth.uid()
        OR is_admin(auth.uid())
        OR get_user_role(auth.uid()) IN ('gestor', 'grs')
        OR t.cliente_id IN (
          SELECT cliente_id FROM public.profiles WHERE id = auth.uid()
        )
      )
  )
);

-- Remover policies antigas do storage
DROP POLICY IF EXISTS "Usuários podem fazer upload de anexos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem ver anexos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar anexos" ON storage.objects;

-- Criar policies atualizadas para storage bucket anexos-tarefas
CREATE POLICY "Upload de anexos permitido"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'anexos-tarefas'
  AND EXISTS (
    SELECT 1 FROM public.tarefa t
    WHERE t.id::text = (storage.foldername(name))[1]
      AND (
        t.responsavel_id = auth.uid()
        OR t.executor_id = auth.uid()
        OR is_admin(auth.uid())
        OR get_user_role(auth.uid()) IN ('gestor', 'grs')
      )
  )
);

CREATE POLICY "Visualização de anexos permitida"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'anexos-tarefas'
  AND EXISTS (
    SELECT 1 FROM public.tarefa t
    WHERE t.id::text = (storage.foldername(name))[1]
      AND (
        t.responsavel_id = auth.uid()
        OR t.executor_id = auth.uid()
        OR is_admin(auth.uid())
        OR get_user_role(auth.uid()) IN ('gestor', 'grs')
        OR t.cliente_id IN (
          SELECT cliente_id FROM public.profiles WHERE id = auth.uid()
        )
      )
  )
);

CREATE POLICY "Deleção de anexos permitida"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'anexos-tarefas'
  AND EXISTS (
    SELECT 1 FROM public.tarefa t
    WHERE t.id::text = (storage.foldername(name))[1]
      AND (
        t.responsavel_id = auth.uid()
        OR t.executor_id = auth.uid()
        OR is_admin(auth.uid())
        OR get_user_role(auth.uid()) IN ('gestor', 'grs')
      )
  )
);