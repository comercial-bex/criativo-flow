-- ============================================
-- FASE 4: Correção de Políticas RLS - Parte 2
-- CLIENTE_ONBOARDING
-- ============================================

DROP POLICY IF EXISTS "Usuários podem atualizar onboarding" ON public.cliente_onboarding;
DROP POLICY IF EXISTS "Usuários podem criar onboarding" ON public.cliente_onboarding;

CREATE POLICY "GRS pode gerenciar onboarding de seus clientes"
ON public.cliente_onboarding
FOR ALL
USING (
  is_admin(auth.uid()) 
  OR EXISTS (
    SELECT 1 FROM public.clientes c
    WHERE c.id = cliente_onboarding.cliente_id
    AND c.responsavel_id = auth.uid()
  )
)
WITH CHECK (
  is_admin(auth.uid()) 
  OR EXISTS (
    SELECT 1 FROM public.clientes c
    WHERE c.id = cliente_onboarding.cliente_id
    AND c.responsavel_id = auth.uid()
  )
);