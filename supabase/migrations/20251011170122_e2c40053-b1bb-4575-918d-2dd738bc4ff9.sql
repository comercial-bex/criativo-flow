-- =====================================================
-- PARTE 2: EXPANSÃO admin_temp_data
-- =====================================================

-- 1. Adicionar colunas para dados de colaborador
ALTER TABLE admin_temp_data 
ADD COLUMN IF NOT EXISTS regime text,
ADD COLUMN IF NOT EXISTS cargo_atual text,
ADD COLUMN IF NOT EXISTS salario_ou_fee numeric;

-- 2. Remover constraint NOT NULL de produto_id (permitir quando origem='rh')
ALTER TABLE admin_temp_data 
ALTER COLUMN produto_id DROP NOT NULL;

-- 3. Atualizar RLS para incluir papel 'rh'
DROP POLICY IF EXISTS "Admin e equipe podem ver dados temporários" ON public.admin_temp_data;
CREATE POLICY "Admin e equipe podem ver dados temporários" ON public.admin_temp_data
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'gestor', 'financeiro', 'atendimento', 'grs', 'rh')
  )
);

-- 4. Comentários para documentação
COMMENT ON COLUMN admin_temp_data.regime IS 'CLT, PJ, Estágio, Freelancer - usado quando origem=rh';
COMMENT ON COLUMN admin_temp_data.cargo_atual IS 'Cargo/função do colaborador - usado quando origem=rh';
COMMENT ON COLUMN admin_temp_data.salario_ou_fee IS 'Salário base ou fee mensal - usado quando origem=rh';
COMMENT ON COLUMN admin_temp_data.origem IS 'Módulo de origem: financeiro, administrativo, rh';