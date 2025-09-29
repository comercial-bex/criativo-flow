-- Adicionar políticas que faltam para projeto_status_historico
DROP POLICY IF EXISTS "Todos podem ver histórico" ON public.projeto_status_historico;
CREATE POLICY "Todos podem ver histórico"
ON public.projeto_status_historico FOR SELECT
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Sistema pode criar histórico" ON public.projeto_status_historico;
CREATE POLICY "Sistema pode criar histórico"
ON public.projeto_status_historico FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas de atualização para tarefas (setores podem atualizar status)
DROP POLICY IF EXISTS "Setores podem atualizar suas tarefas" ON public.tarefas_projeto;
CREATE POLICY "Setores podem atualizar suas tarefas"
ON public.tarefas_projeto FOR UPDATE
USING (
  is_admin(auth.uid()) OR
  get_user_role(auth.uid()) = 'grs' OR
  get_user_role(auth.uid()) = 'atendimento' OR
  get_user_role(auth.uid()) = 'gestor' OR
  responsavel_id = auth.uid()
)
WITH CHECK (
  is_admin(auth.uid()) OR
  get_user_role(auth.uid()) = 'grs' OR
  get_user_role(auth.uid()) = 'atendimento' OR
  get_user_role(auth.uid()) = 'gestor' OR
  responsavel_id = auth.uid()
);