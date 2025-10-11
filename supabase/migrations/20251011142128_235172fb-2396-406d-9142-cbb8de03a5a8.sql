-- ============================================
-- MIGRAR DADOS - Conversão Correta de ENUMs
-- ============================================

-- 1. Adicionar colunas
ALTER TABLE public.pessoas 
ADD COLUMN IF NOT EXISTS cargo_atual TEXT,
ADD COLUMN IF NOT EXISTS profile_id UUID,
ADD COLUMN IF NOT EXISTS cliente_id UUID;

-- 2. Constraints
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pessoas_profile_id_key') THEN
    ALTER TABLE public.pessoas ADD CONSTRAINT pessoas_profile_id_key UNIQUE (profile_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pessoas_cliente_id_fkey') THEN
    ALTER TABLE public.pessoas ADD CONSTRAINT pessoas_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id);
  END IF;
END $$;

-- 3. Migrar profiles
INSERT INTO public.pessoas (id, nome, email, telefones, papeis, status, cliente_id, created_at, updated_at)
SELECT 
  p.id, COALESCE(p.nome, p.email), p.email,
  CASE WHEN p.telefone IS NOT NULL THEN to_jsonb(ARRAY[p.telefone]) ELSE '[]'::jsonb END,
  CASE 
    WHEN p.especialidade IS NOT NULL THEN ARRAY['especialista']::pessoa_papel[]
    WHEN p.cliente_id IS NOT NULL THEN ARRAY['cliente']::pessoa_papel[]
    ELSE ARRAY['colaborador']::pessoa_papel[]
  END,
  COALESCE(p.status, 'aprovado')::pessoa_status,
  p.cliente_id, p.created_at, p.updated_at
FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.pessoas WHERE id = p.id)
ON CONFLICT (id) DO NOTHING;

-- 4. Atualizar profile_id
UPDATE public.pessoas SET profile_id = id 
WHERE id IN (SELECT id FROM public.profiles) AND profile_id IS NULL;

-- 5. Migrar rh_colaboradores (com conversão de regime)
INSERT INTO public.pessoas (
  nome, email, cpf, telefones, papeis, cargo_id, cargo_atual, regime, status,
  salario_base, fee_mensal, data_admissao, data_desligamento, dados_bancarios,
  observacoes, created_at, updated_at
)
SELECT 
  c.nome_completo, c.email, c.cpf_cnpj,
  CASE WHEN c.celular IS NOT NULL THEN to_jsonb(ARRAY[c.celular]) ELSE '[]'::jsonb END,
  ARRAY['colaborador']::pessoa_papel[],
  c.cargo_id, c.cargo_atual,
  (c.regime::text)::pessoa_regime, -- Conversão via text
  CASE 
    WHEN c.status = 'ativo' THEN 'ativo'::pessoa_status
    WHEN c.status = 'inativo' THEN 'inativo'::pessoa_status
    WHEN c.status = 'ferias' THEN 'ferias'::pessoa_status
    WHEN c.status = 'afastado' THEN 'afastado'::pessoa_status
    WHEN c.status = 'desligado' THEN 'desligado'::pessoa_status
    ELSE 'ativo'::pessoa_status
  END,
  c.salario_base, c.fee_mensal, c.data_admissao::date, c.data_desligamento::date,
  jsonb_build_object('banco_codigo', c.banco_codigo, 'agencia', c.agencia, 'conta', c.conta, 'tipo_conta', c.tipo_conta, 'pix_tipo', c.tipo_chave_pix, 'pix_chave', c.chave_pix),
  c.observacoes, c.created_at, c.updated_at
FROM public.rh_colaboradores c
WHERE c.email IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.pessoas WHERE email = c.email)
ON CONFLICT (email) DO NOTHING;

-- 6. RLS
ALTER TABLE public.pessoas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pessoas_admin_all" ON public.pessoas;
CREATE POLICY "pessoas_admin_all" ON public.pessoas FOR ALL TO authenticated
USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor'::user_role);

DROP POLICY IF EXISTS "pessoas_self_view" ON public.pessoas;
CREATE POLICY "pessoas_self_view" ON public.pessoas FOR SELECT TO authenticated
USING (profile_id = auth.uid());

-- 7. Índices
CREATE INDEX IF NOT EXISTS idx_pessoas_profile_id ON public.pessoas(profile_id);
CREATE INDEX IF NOT EXISTS idx_pessoas_cliente_id ON public.pessoas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pessoas_email ON public.pessoas(email);
CREATE INDEX IF NOT EXISTS idx_pessoas_cpf ON public.pessoas(cpf);
CREATE INDEX IF NOT EXISTS idx_pessoas_papeis ON public.pessoas USING GIN(papeis);
CREATE INDEX IF NOT EXISTS idx_pessoas_status ON public.pessoas(status);