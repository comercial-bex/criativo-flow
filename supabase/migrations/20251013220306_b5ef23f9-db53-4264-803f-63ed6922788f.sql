-- ============================================
-- FASE 4: Correção de Políticas RLS - Parte 1
-- CLIENTE_OBJETIVOS
-- ============================================

DROP POLICY IF EXISTS "Usuários podem atualizar objetivos" ON public.cliente_objetivos;
DROP POLICY IF EXISTS "Usuários podem criar objetivos" ON public.cliente_objetivos;

CREATE POLICY "GRS pode gerenciar objetivos de seus clientes"
ON public.cliente_objetivos
FOR ALL
USING (
  is_admin(auth.uid()) 
  OR EXISTS (
    SELECT 1 FROM public.clientes c
    WHERE c.id = cliente_objetivos.cliente_id
    AND c.responsavel_id = auth.uid()
  )
)
WITH CHECK (
  is_admin(auth.uid()) 
  OR EXISTS (
    SELECT 1 FROM public.clientes c
    WHERE c.id = cliente_objetivos.cliente_id
    AND c.responsavel_id = auth.uid()
  )
);