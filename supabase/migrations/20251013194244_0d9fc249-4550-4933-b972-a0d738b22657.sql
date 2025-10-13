-- FASE 1: Corrigir RLS Policies para tabela pessoas

-- 1. Remover política SELECT restritiva atual
DROP POLICY IF EXISTS "Staff can view pessoas" ON public.pessoas;

-- 2. Criar nova política SELECT que permite Admin, Gestor, RH, Financeiro e GRS verem TUDO
CREATE POLICY "Staff can view all pessoas"
ON public.pessoas
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'gestor', 'rh', 'financeiro', 'grs')
  )
);

-- 3. Criar política INSERT para RH
CREATE POLICY "RH can create pessoas"
ON public.pessoas
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'gestor', 'rh')
  )
);

-- 4. Criar política UPDATE para RH
CREATE POLICY "RH can update pessoas"
ON public.pessoas
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'gestor', 'rh')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'gestor', 'rh')
  )
);