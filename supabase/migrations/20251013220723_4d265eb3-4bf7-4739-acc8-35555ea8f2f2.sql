-- ============================================
-- FASE 4: Correção de Políticas RLS - Parte 3
-- ANALISE_COMPETITIVA
-- ============================================

DROP POLICY IF EXISTS "Usuários podem atualizar análises" ON public.analise_competitiva;
DROP POLICY IF EXISTS "Usuários podem inserir análises" ON public.analise_competitiva;

CREATE POLICY "GRS pode gerenciar análises de seus clientes"
ON public.analise_competitiva
FOR ALL
USING (
  is_admin(auth.uid()) 
  OR EXISTS (
    SELECT 1 FROM public.clientes c
    WHERE c.id = analise_competitiva.cliente_id
    AND c.responsavel_id = auth.uid()
  )
)
WITH CHECK (
  is_admin(auth.uid()) 
  OR EXISTS (
    SELECT 1 FROM public.clientes c
    WHERE c.id = analise_competitiva.cliente_id
    AND c.responsavel_id = auth.uid()
  )
);