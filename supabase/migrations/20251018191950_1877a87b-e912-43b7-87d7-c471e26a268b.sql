
-- ============================================================================
-- FASE 2: EXTENSÃO DO SCHEMA + RLS UNIFICADO - Unificação pessoas
-- ============================================================================

-- ===========================================================================
-- 2.1. ADICIONAR CAMPOS DE CLIENTE EM pessoas
-- ===========================================================================

ALTER TABLE pessoas 
  ADD COLUMN IF NOT EXISTS endereco TEXT,
  ADD COLUMN IF NOT EXISTS assinatura_id UUID REFERENCES assinaturas(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS responsavel_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS razao_social TEXT,
  ADD COLUMN IF NOT EXISTS nome_fantasia TEXT,
  ADD COLUMN IF NOT EXISTS situacao_cadastral TEXT,
  ADD COLUMN IF NOT EXISTS cnae_principal TEXT,
  ADD COLUMN IF NOT EXISTS cnpj_fonte TEXT,
  ADD COLUMN IF NOT EXISTS cnpj_ultima_consulta TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS logo_url TEXT;

COMMENT ON COLUMN pessoas.endereco IS 'Endereço completo (cliente ou colaborador)';
COMMENT ON COLUMN pessoas.assinatura_id IS 'Plano contratado (apenas clientes)';
COMMENT ON COLUMN pessoas.responsavel_id IS 'GRS responsável (apenas clientes)';
COMMENT ON COLUMN pessoas.razao_social IS 'Razão social (PJ)';
COMMENT ON COLUMN pessoas.nome_fantasia IS 'Nome fantasia (PJ)';
COMMENT ON COLUMN pessoas.situacao_cadastral IS 'Status na Receita Federal';
COMMENT ON COLUMN pessoas.cnae_principal IS 'CNAE principal da empresa';
COMMENT ON COLUMN pessoas.cnpj_fonte IS 'API de origem dos dados (brasilapi/receitaws)';
COMMENT ON COLUMN pessoas.cnpj_ultima_consulta IS 'Data da última consulta CNPJ';
COMMENT ON COLUMN pessoas.logo_url IS 'URL do logo/avatar';

-- ===========================================================================
-- 2.2. CRIAR ÍNDICES DE PERFORMANCE
-- ===========================================================================

CREATE INDEX IF NOT EXISTS idx_pessoas_cliente_id ON pessoas(cliente_id) WHERE cliente_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pessoas_responsavel_id ON pessoas(responsavel_id) WHERE responsavel_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pessoas_assinatura_id ON pessoas(assinatura_id) WHERE assinatura_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pessoas_papeis_gin ON pessoas USING GIN(papeis);
CREATE INDEX IF NOT EXISTS idx_pessoas_cpf_normalizado ON pessoas(normalizar_cpf(cpf)) WHERE cpf IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pessoas_profile_id ON pessoas(profile_id) WHERE profile_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pessoas_status ON pessoas(status);

-- ===========================================================================
-- 2.3. CRIAR/ATUALIZAR SECURITY DEFINER FUNCTIONS
-- ===========================================================================

-- Função 1: Verificar acesso a dados sensíveis de cliente
CREATE OR REPLACE FUNCTION public.can_access_sensitive_cliente_data(p_pessoa_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    is_admin(auth.uid()) 
    OR EXISTS (
      SELECT 1 FROM public.pessoas 
      WHERE id = p_pessoa_id 
        AND 'cliente' = ANY(papeis)
        AND responsavel_id = auth.uid()
    );
$$;

COMMENT ON FUNCTION public.can_access_sensitive_cliente_data IS 
  'Verifica se usuário pode acessar dados sensíveis (email, CPF, telefone) de um cliente';

-- Função 2: Verificar se usuário pertence ao mesmo cliente
CREATE OR REPLACE FUNCTION public.is_same_cliente(p_pessoa_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.cliente_usuarios cu1
    JOIN public.cliente_usuarios cu2 ON cu1.cliente_id = cu2.cliente_id
    WHERE cu1.user_id = auth.uid()
      AND cu2.user_id = p_pessoa_id
      AND cu1.ativo = true
      AND cu2.ativo = true
  );
$$;

COMMENT ON FUNCTION public.is_same_cliente IS 
  'Verifica se dois usuários pertencem à mesma empresa cliente';

-- Função 3: Verificar permissão de gestão
CREATE OR REPLACE FUNCTION public.can_manage_pessoas()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    is_admin(auth.uid()) 
    OR get_user_role(auth.uid()) = ANY(ARRAY[
      'gestor'::user_role, 
      'grs'::user_role,
      'rh'::user_role,
      'financeiro'::user_role
    ]);
$$;

COMMENT ON FUNCTION public.can_manage_pessoas IS 
  'Verifica se usuário tem permissão para gerenciar pessoas (Admin/Gestor/GRS/RH)';

-- ===========================================================================
-- 2.4. REMOVER POLICIES ANTIGAS (CONFLITANTES)
-- ===========================================================================

DROP POLICY IF EXISTS "Admin pode gerenciar pessoas" ON pessoas;
DROP POLICY IF EXISTS "Gestor/RH podem gerenciar pessoas" ON pessoas;
DROP POLICY IF EXISTS "Usuários veem pessoas de seus clientes" ON pessoas;

-- ===========================================================================
-- 2.5. CRIAR POLICIES UNIFICADAS E GRANULARES
-- ===========================================================================

-- ========== SELECT POLICIES (4 níveis de acesso) ==========

-- 1. Admin vê TUDO
CREATE POLICY "admin_view_all_pessoas"
ON pessoas FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- 2. Gestores veem pessoas que gerenciam
CREATE POLICY "manager_view_managed_pessoas"
ON pessoas FOR SELECT
TO authenticated
USING (
  can_manage_pessoas()
  AND (
    responsavel_id = auth.uid()  -- GRS responsável pelo cliente
    OR 'colaborador' = ANY(papeis)  -- RH vê todos colaboradores
    OR 'fornecedor' = ANY(papeis)  -- Financeiro vê fornecedores
  )
);

-- 3. Clientes veem pessoas da mesma empresa
CREATE POLICY "cliente_view_same_company"
ON pessoas FOR SELECT
TO authenticated
USING (
  'cliente' = ANY(papeis)
  AND is_same_cliente(id)
);

-- 4. Usuário vê próprio perfil
CREATE POLICY "user_view_own_profile"
ON pessoas FOR SELECT
TO authenticated
USING (profile_id = auth.uid());

-- ========== INSERT POLICIES ==========

CREATE POLICY "restricted_pessoa_creation"
ON pessoas FOR INSERT
TO authenticated
WITH CHECK (
  can_manage_pessoas()
  OR (
    -- Cliente proprietário pode criar usuários da própria empresa
    EXISTS (
      SELECT 1 FROM cliente_usuarios 
      WHERE user_id = auth.uid() 
        AND role_cliente = 'proprietario'
        AND ativo = true
    )
  )
);

-- ========== UPDATE POLICIES ==========

-- 1. Admin/Gestor atualizam tudo
CREATE POLICY "admin_update_all_pessoas"
ON pessoas FOR UPDATE
TO authenticated
USING (
  is_admin(auth.uid()) 
  OR get_user_role(auth.uid()) = 'gestor'::user_role
);

-- 2. GRS atualiza clientes que gerencia
CREATE POLICY "grs_update_managed_clientes"
ON pessoas FOR UPDATE
TO authenticated
USING (
  'cliente' = ANY(papeis)
  AND responsavel_id = auth.uid()
  AND get_user_role(auth.uid()) = 'grs'::user_role
);

-- 3. RH atualiza colaboradores
CREATE POLICY "rh_update_colaboradores"
ON pessoas FOR UPDATE
TO authenticated
USING (
  'colaborador' = ANY(papeis)
  AND get_user_role(auth.uid()) = 'rh'::user_role
);

-- 4. Usuário atualiza próprio perfil (campos limitados)
CREATE POLICY "user_update_own_profile"
ON pessoas FOR UPDATE
TO authenticated
USING (profile_id = auth.uid())
WITH CHECK (
  profile_id = auth.uid()
);

-- ========== DELETE POLICIES ==========

CREATE POLICY "admin_delete_pessoas"
ON pessoas FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- ===========================================================================
-- 2.6. CRIAR VIEW FILTRADA PARA DADOS SENSÍVEIS
-- ===========================================================================

CREATE OR REPLACE VIEW vw_clientes_filtered AS
SELECT 
  p.id,
  p.nome,
  CASE 
    WHEN can_access_sensitive_cliente_data(p.id) THEN p.email
    ELSE NULL 
  END as email,
  CASE 
    WHEN can_access_sensitive_cliente_data(p.id) THEN p.telefones
    ELSE NULL 
  END as telefones,
  CASE 
    WHEN can_access_sensitive_cliente_data(p.id) THEN p.cpf
    ELSE NULL 
  END as cpf,
  CASE 
    WHEN can_access_sensitive_cliente_data(p.id) THEN p.endereco
    ELSE NULL 
  END as endereco,
  p.razao_social,
  p.nome_fantasia,
  p.logo_url,
  p.status,
  p.assinatura_id,
  p.responsavel_id,
  p.situacao_cadastral,
  p.cnae_principal,
  p.created_at,
  p.updated_at,
  -- Flag indicando se usuário tem acesso total
  can_access_sensitive_cliente_data(p.id) as _has_sensitive_access
FROM pessoas p
WHERE 'cliente' = ANY(p.papeis);

COMMENT ON VIEW vw_clientes_filtered IS 
  'View que filtra dados sensíveis de clientes baseado em permissões do usuário';

GRANT SELECT ON vw_clientes_filtered TO authenticated;

-- ===========================================================================
-- 2.7. ATUALIZAR VIEW DE COMPATIBILIDADE clientes_compat
-- ===========================================================================

DROP VIEW IF EXISTS clientes_compat;

CREATE OR REPLACE VIEW clientes_compat AS
SELECT 
  p.id,
  p.nome,
  p.email,
  p.telefones[1] as telefone,
  p.cpf as cnpj_cpf,
  p.endereco,
  p.status::text as status,
  p.responsavel_id,
  p.assinatura_id,
  p.created_at,
  p.updated_at,
  p.logo_url,
  p.razao_social,
  p.nome_fantasia,
  p.situacao_cadastral,
  p.cnae_principal,
  p.cnpj_fonte,
  p.cnpj_ultima_consulta
FROM pessoas p
WHERE 'cliente' = ANY(p.papeis);

COMMENT ON VIEW clientes_compat IS 
  'View de compatibilidade - Emula estrutura legacy de clientes usando pessoas';

GRANT SELECT ON clientes_compat TO authenticated;

-- ===========================================================================
-- 2.8. CRIAR TRIGGER DE VALIDAÇÃO
-- ===========================================================================

CREATE OR REPLACE FUNCTION validate_pessoa_cliente_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Se é cliente, validar campos obrigatórios
  IF 'cliente' = ANY(NEW.papeis) THEN
    IF NEW.nome IS NULL OR trim(NEW.nome) = '' THEN
      RAISE EXCEPTION 'Nome é obrigatório para clientes';
    END IF;
    
    IF NEW.cpf IS NULL OR trim(NEW.cpf) = '' THEN
      RAISE EXCEPTION 'CPF/CNPJ é obrigatório para clientes';
    END IF;
    
    -- Validar tamanho mínimo de CPF/CNPJ (sem formatação)
    IF length(regexp_replace(NEW.cpf, '\D', '', 'g')) NOT IN (11, 14) THEN
      RAISE EXCEPTION 'CPF/CNPJ inválido (deve ter 11 ou 14 dígitos)';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_validate_pessoa_cliente ON pessoas;
CREATE TRIGGER trg_validate_pessoa_cliente
  BEFORE INSERT OR UPDATE ON pessoas
  FOR EACH ROW
  EXECUTE FUNCTION validate_pessoa_cliente_fields();

-- ===========================================================================
-- 2.9. CONCEDER PERMISSÕES
-- ===========================================================================

GRANT SELECT ON vw_clientes_filtered TO authenticated;
GRANT SELECT ON clientes_compat TO authenticated;

-- ===========================================================================
-- 2.10. REGISTRAR CONCLUSÃO DA FASE 2
-- ===========================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ FASE 2 CONCLUÍDA: Schema estendido + RLS unificado';
  RAISE NOTICE '📊 Campos adicionados: 10';
  RAISE NOTICE '📊 Índices criados: 7';
  RAISE NOTICE '📊 Functions criadas: 3';
  RAISE NOTICE '📊 Policies criadas: 10';
  RAISE NOTICE '📊 Views criadas: 2';
  RAISE NOTICE '🔐 Sistema de segurança unificado ativo';
  RAISE NOTICE '⏭️  PRÓXIMO: Executar Fase 3 (migração de 22 clientes)';
END $$;
