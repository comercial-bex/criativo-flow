-- FASE 1: UNIFICAÇÃO DE PESSOAS (COM NORMALIZAÇÃO DE CPF)

DROP TABLE IF EXISTS public.pessoa_papeis CASCADE;
DROP TABLE IF EXISTS public.pessoas CASCADE;

CREATE TABLE public.pessoas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT,
  cpf TEXT UNIQUE,
  telefones TEXT[] DEFAULT '{}',
  papeis TEXT[] NOT NULL DEFAULT '{}',
  cargo_id UUID,
  cargo_atual TEXT,
  regime TEXT CHECK (regime IN ('clt', 'pj', 'freelancer', 'terceirizado')),
  status TEXT CHECK (status IN ('ativo', 'inativo', 'desligado', 'pendente_aprovacao', 'aprovado')) DEFAULT 'ativo',
  salario_base NUMERIC(10,2),
  fee_mensal NUMERIC(10,2),
  data_admissao DATE,
  data_desligamento DATE,
  dados_bancarios JSONB DEFAULT '{"banco_codigo": null, "agencia": null, "conta": null, "tipo_conta": null, "pix_tipo": null, "pix_chave": null}'::jsonb,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_profile_id UNIQUE (profile_id),
  CONSTRAINT cpf_formato CHECK (cpf IS NULL OR cpf ~ '^\d{11}$')
);

CREATE INDEX idx_pessoas_profile_id ON public.pessoas(profile_id);
CREATE INDEX idx_pessoas_cliente_id ON public.pessoas(cliente_id);
CREATE INDEX idx_pessoas_cpf ON public.pessoas(cpf);
CREATE INDEX idx_pessoas_papeis ON public.pessoas USING GIN(papeis);
CREATE INDEX idx_pessoas_status ON public.pessoas(status);

CREATE TABLE public.pessoa_papeis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  papel TEXT NOT NULL CHECK (papel IN ('colaborador', 'especialista', 'fornecedor', 'cliente')),
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_fim DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_pessoa_papel UNIQUE (pessoa_id, papel, data_inicio)
);

CREATE INDEX idx_pessoa_papeis_pessoa_id ON public.pessoa_papeis(pessoa_id);
CREATE INDEX idx_pessoa_papeis_papel ON public.pessoa_papeis(papel);

CREATE OR REPLACE FUNCTION public.trg_update_pessoas_updated_at() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;
CREATE TRIGGER update_pessoas_updated_at BEFORE UPDATE ON public.pessoas FOR EACH ROW EXECUTE FUNCTION public.trg_update_pessoas_updated_at();

CREATE OR REPLACE FUNCTION public.normalizar_cpf(cpf_input TEXT) RETURNS TEXT LANGUAGE plpgsql IMMUTABLE AS $$ BEGIN IF cpf_input IS NULL THEN RETURN NULL; END IF; RETURN regexp_replace(cpf_input, '\D', '', 'g'); END; $$;

INSERT INTO public.pessoas (id, profile_id, nome, email, telefones, papeis, status, cliente_id, observacoes, created_at, updated_at)
SELECT gen_random_uuid(), pr.id, pr.nome, pr.email, CASE WHEN pr.telefone IS NOT NULL AND pr.telefone != '' THEN ARRAY[pr.telefone] ELSE '{}'::text[] END, CASE WHEN pr.cliente_id IS NOT NULL THEN ARRAY['cliente'] ELSE '{}'::text[] END, pr.status, pr.cliente_id, pr.observacoes_aprovacao, pr.created_at, pr.updated_at FROM public.profiles pr;

INSERT INTO public.pessoas (id, nome, cpf, email, telefones, papeis, cargo_atual, regime, status, salario_base, fee_mensal, data_admissao, data_desligamento, dados_bancarios, created_at, updated_at)
SELECT c.id, c.nome_completo, regexp_replace(c.cpf_cnpj, '\D', '', 'g'), c.email, CASE WHEN c.celular IS NOT NULL AND c.celular != '' THEN ARRAY[c.celular] ELSE '{}'::text[] END, ARRAY['colaborador'], c.cargo_atual, c.regime, c.status, c.salario_base, c.fee_mensal, c.data_admissao, c.data_desligamento, jsonb_build_object('banco_codigo', c.banco_codigo, 'agencia', c.agencia, 'conta', c.conta, 'tipo_conta', c.tipo_conta, 'pix_tipo', c.tipo_chave_pix, 'pix_chave', c.chave_pix), c.created_at, c.updated_at FROM public.rh_colaboradores c ON CONFLICT (id) DO UPDATE SET papeis = CASE WHEN 'colaborador' = ANY(pessoas.papeis) THEN pessoas.papeis ELSE array_append(pessoas.papeis, 'colaborador') END;

INSERT INTO public.pessoa_papeis (pessoa_id, papel, ativo, data_inicio) SELECT p.id, unnest(p.papeis), TRUE, COALESCE(p.data_admissao, p.created_at::date) FROM public.pessoas p WHERE array_length(p.papeis, 1) > 0;

ALTER TABLE public.pessoas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pessoa_papeis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin pode gerenciar pessoas" ON public.pessoas FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Usuários veem pessoas de seus clientes" ON public.pessoas FOR SELECT USING (auth.uid() IS NOT NULL AND (is_admin(auth.uid()) OR profile_id = auth.uid() OR cliente_id IN (SELECT cliente_id FROM public.profiles WHERE id = auth.uid())));
CREATE POLICY "Gestor/RH podem gerenciar pessoas" ON public.pessoas FOR ALL USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) IN ('gestor', 'rh', 'financeiro'));
CREATE POLICY "Admin gerencia papéis" ON public.pessoa_papeis FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Usuários veem papéis" ON public.pessoa_papeis FOR SELECT USING (EXISTS (SELECT 1 FROM public.pessoas p WHERE p.id = pessoa_papeis.pessoa_id AND (p.profile_id = auth.uid() OR is_admin(auth.uid()))));

CREATE OR REPLACE FUNCTION public.adicionar_papel_pessoa(p_pessoa_id UUID, p_papel TEXT, p_data_inicio DATE DEFAULT CURRENT_DATE) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ DECLARE v_papel_id UUID; BEGIN IF p_papel NOT IN ('colaborador', 'especialista', 'fornecedor', 'cliente') THEN RAISE EXCEPTION 'Papel inválido: %', p_papel; END IF; INSERT INTO public.pessoa_papeis (pessoa_id, papel, ativo, data_inicio) VALUES (p_pessoa_id, p_papel, TRUE, p_data_inicio) ON CONFLICT (pessoa_id, papel, data_inicio) DO UPDATE SET ativo = TRUE RETURNING id INTO v_papel_id; UPDATE public.pessoas SET papeis = CASE WHEN p_papel = ANY(papeis) THEN papeis ELSE array_append(papeis, p_papel) END, updated_at = NOW() WHERE id = p_pessoa_id; RETURN v_papel_id; END; $$;
CREATE OR REPLACE FUNCTION public.remover_papel_pessoa(p_pessoa_id UUID, p_papel TEXT) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN UPDATE public.pessoa_papeis SET ativo = FALSE, data_fim = CURRENT_DATE WHERE pessoa_id = p_pessoa_id AND papel = p_papel AND ativo = TRUE; UPDATE public.pessoas SET papeis = array_remove(papeis, p_papel), updated_at = NOW() WHERE id = p_pessoa_id; RETURN TRUE; END; $$;