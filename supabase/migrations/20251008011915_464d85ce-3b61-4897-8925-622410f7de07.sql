-- ============================================
-- FASE 1: ESTRUTURA DE DADOS - MÓDULO ADMINISTRATIVO
-- ============================================

-- 1.1 Criar tabela produtos
CREATE TABLE IF NOT EXISTS public.produtos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE NOT NULL,
  nome text NOT NULL,
  categoria text,
  tipo text CHECK (tipo IN ('servico', 'produto')) DEFAULT 'produto',
  unidade text DEFAULT 'unidade',
  preco_padrao numeric NOT NULL,
  custo numeric,
  imposto_percent numeric DEFAULT 0,
  descricao text,
  observacoes text,
  lead_time_dias integer,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 1.2 Criar tabela produto_componentes (bundles)
CREATE TABLE IF NOT EXISTS public.produto_componentes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_pai_id uuid REFERENCES public.produtos(id) ON DELETE CASCADE,
  produto_filho_id uuid REFERENCES public.produtos(id) ON DELETE CASCADE,
  quantidade numeric DEFAULT 1,
  UNIQUE(produto_pai_id, produto_filho_id)
);

-- 1.3 Atualizar tabela orcamentos (adicionar colunas faltantes)
ALTER TABLE public.orcamentos 
  ADD COLUMN IF NOT EXISTS numero text UNIQUE,
  ADD COLUMN IF NOT EXISTS contato_nome text,
  ADD COLUMN IF NOT EXISTS contato_email text,
  ADD COLUMN IF NOT EXISTS contato_tel text,
  ADD COLUMN IF NOT EXISTS projeto_id uuid REFERENCES public.projetos(id),
  ADD COLUMN IF NOT EXISTS condicoes_pagamento text,
  ADD COLUMN IF NOT EXISTS notas_internas text,
  ADD COLUMN IF NOT EXISTS subtotal numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS impostos numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS outros numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES public.profiles(id);

-- 1.4 Atualizar tabela orcamento_itens
ALTER TABLE public.orcamento_itens
  ADD COLUMN IF NOT EXISTS produto_id uuid REFERENCES public.produtos(id),
  ADD COLUMN IF NOT EXISTS unidade text DEFAULT 'unidade',
  ADD COLUMN IF NOT EXISTS imposto_percent numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subtotal_item numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ordem integer DEFAULT 0;

-- 1.5 Criar tabela proposta_itens
CREATE TABLE IF NOT EXISTS public.proposta_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposta_id uuid REFERENCES public.propostas(id) ON DELETE CASCADE,
  produto_id uuid REFERENCES public.produtos(id),
  descricao text NOT NULL,
  quantidade numeric NOT NULL DEFAULT 1,
  unidade text DEFAULT 'unidade',
  preco_unitario numeric NOT NULL,
  desconto_percent numeric DEFAULT 0,
  imposto_percent numeric DEFAULT 0,
  subtotal_item numeric DEFAULT 0,
  ordem integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 1.6 Atualizar tabela propostas
ALTER TABLE public.propostas
  ADD COLUMN IF NOT EXISTS numero text,
  ADD COLUMN IF NOT EXISTS versao integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS cliente_id uuid REFERENCES public.clientes(id),
  ADD COLUMN IF NOT EXISTS contato_nome text,
  ADD COLUMN IF NOT EXISTS contato_email text,
  ADD COLUMN IF NOT EXISTS contato_tel text,
  ADD COLUMN IF NOT EXISTS projeto_id uuid REFERENCES public.projetos(id),
  ADD COLUMN IF NOT EXISTS validade date,
  ADD COLUMN IF NOT EXISTS condicoes_pagamento text,
  ADD COLUMN IF NOT EXISTS reajuste text,
  ADD COLUMN IF NOT EXISTS multas_juros text,
  ADD COLUMN IF NOT EXISTS observacoes_cliente text,
  ADD COLUMN IF NOT EXISTS notas_internas text,
  ADD COLUMN IF NOT EXISTS subtotal numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS descontos numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS impostos numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS outros numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES public.profiles(id);

-- 1.7 Criar tabela contrato_itens
CREATE TABLE IF NOT EXISTS public.contrato_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id uuid REFERENCES public.contratos(id) ON DELETE CASCADE,
  produto_id uuid REFERENCES public.produtos(id),
  descricao text NOT NULL,
  quantidade numeric NOT NULL DEFAULT 1,
  unidade text DEFAULT 'unidade',
  preco_unitario numeric NOT NULL,
  imposto_percent numeric DEFAULT 0,
  subtotal_item numeric DEFAULT 0,
  ordem integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 1.8 Atualizar tabela contratos
ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS numero text UNIQUE,
  ADD COLUMN IF NOT EXISTS proposta_id uuid REFERENCES public.propostas(id),
  ADD COLUMN IF NOT EXISTS projeto_id uuid REFERENCES public.projetos(id),
  ADD COLUMN IF NOT EXISTS renovacao text DEFAULT 'nenhuma',
  ADD COLUMN IF NOT EXISTS escopo text,
  ADD COLUMN IF NOT EXISTS sla text,
  ADD COLUMN IF NOT EXISTS confidencialidade boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS propriedade_intelectual text,
  ADD COLUMN IF NOT EXISTS rescisao text,
  ADD COLUMN IF NOT EXISTS foro text,
  ADD COLUMN IF NOT EXISTS condicoes_comerciais text,
  ADD COLUMN IF NOT EXISTS valor_recorrente numeric,
  ADD COLUMN IF NOT EXISTS valor_avulso numeric,
  ADD COLUMN IF NOT EXISTS reajuste_indice text,
  ADD COLUMN IF NOT EXISTS anexo_pdf_url text,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES public.profiles(id);

-- 1.9 Criar tabela contrato_templates
CREATE TABLE IF NOT EXISTS public.contrato_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  categoria text,
  corpo_html text NOT NULL,
  variaveis_disponiveis jsonb DEFAULT '[]'::jsonb,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 1.10 Criar tabela faturas
CREATE TABLE IF NOT EXISTS public.faturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero text UNIQUE,
  cliente_id uuid REFERENCES public.clientes(id),
  projeto_id uuid REFERENCES public.projetos(id),
  contrato_id uuid REFERENCES public.contratos(id),
  proposta_id uuid REFERENCES public.propostas(id),
  descricao text NOT NULL,
  valor numeric NOT NULL,
  vencimento date NOT NULL,
  status text CHECK (status IN ('pendente','pago','atrasado','cancelado')) DEFAULT 'pendente',
  pago_em timestamptz,
  comprovante_url text,
  observacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 1.11 Criar tabela pagamentos
CREATE TABLE IF NOT EXISTS public.pagamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fatura_id uuid REFERENCES public.faturas(id) ON DELETE CASCADE,
  valor numeric NOT NULL,
  data_pagamento date NOT NULL,
  metodo text,
  comprovante_url text,
  observacoes text,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- TRIGGERS DE ATUALIZAÇÃO
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_produtos_updated_at ON public.produtos;
CREATE TRIGGER update_produtos_updated_at
  BEFORE UPDATE ON public.produtos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_faturas_updated_at ON public.faturas;
CREATE TRIGGER update_faturas_updated_at
  BEFORE UPDATE ON public.faturas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_contrato_templates_updated_at ON public.contrato_templates;
CREATE TRIGGER update_contrato_templates_updated_at
  BEFORE UPDATE ON public.contrato_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- RLS POLICIES
-- ============================================

-- Produtos
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin e Gestor podem gerenciar produtos"
  ON public.produtos FOR ALL
  USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor');

CREATE POLICY "Equipe pode ver produtos"
  ON public.produtos FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Produto Componentes
ALTER TABLE public.produto_componentes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin e Gestor podem gerenciar componentes"
  ON public.produto_componentes FOR ALL
  USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor');

CREATE POLICY "Equipe pode ver componentes"
  ON public.produto_componentes FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Proposta Itens
ALTER TABLE public.proposta_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Equipe pode gerenciar itens de propostas"
  ON public.proposta_itens FOR ALL
  USING (
    is_admin(auth.uid()) OR 
    get_user_role(auth.uid()) IN ('gestor', 'grs', 'atendimento', 'financeiro')
  );

-- Contrato Itens
ALTER TABLE public.contrato_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Equipe pode gerenciar itens de contratos"
  ON public.contrato_itens FOR ALL
  USING (
    is_admin(auth.uid()) OR 
    get_user_role(auth.uid()) IN ('gestor', 'grs', 'atendimento')
  );

-- Templates de Contrato
ALTER TABLE public.contrato_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin e Gestor podem gerenciar templates"
  ON public.contrato_templates FOR ALL
  USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor');

CREATE POLICY "Equipe pode ver templates"
  ON public.contrato_templates FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Faturas
ALTER TABLE public.faturas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin e Financeiro podem gerenciar faturas"
  ON public.faturas FOR ALL
  USING (
    is_admin(auth.uid()) OR 
    get_user_role(auth.uid()) IN ('gestor', 'financeiro')
  );

CREATE POLICY "GRS e Atendimento podem ver faturas dos seus clientes"
  ON public.faturas FOR SELECT
  USING (
    is_admin(auth.uid()) OR 
    get_user_role(auth.uid()) IN ('gestor', 'financeiro', 'grs', 'atendimento')
  );

-- Pagamentos
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin e Financeiro podem gerenciar pagamentos"
  ON public.pagamentos FOR ALL
  USING (
    is_admin(auth.uid()) OR 
    get_user_role(auth.uid()) IN ('gestor', 'financeiro')
  );

CREATE POLICY "Equipe pode ver pagamentos"
  ON public.pagamentos FOR SELECT
  USING (
    is_admin(auth.uid()) OR 
    get_user_role(auth.uid()) IN ('gestor', 'financeiro', 'grs', 'atendimento')
  );

-- ============================================
-- FUNÇÃO PARA GERAR NÚMERO SEQUENCIAL
-- ============================================

CREATE OR REPLACE FUNCTION public.gerar_numero_documento(tipo text, ano integer)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  numero_seq integer;
  numero_final text;
BEGIN
  -- Contar documentos do tipo no ano
  CASE tipo
    WHEN 'orcamento' THEN
      SELECT COUNT(*) + 1 INTO numero_seq
      FROM public.orcamentos
      WHERE EXTRACT(YEAR FROM created_at) = ano;
      
    WHEN 'proposta' THEN
      SELECT COUNT(*) + 1 INTO numero_seq
      FROM public.propostas
      WHERE EXTRACT(YEAR FROM created_at) = ano;
      
    WHEN 'contrato' THEN
      SELECT COUNT(*) + 1 INTO numero_seq
      FROM public.contratos
      WHERE EXTRACT(YEAR FROM created_at) = ano;
      
    WHEN 'fatura' THEN
      SELECT COUNT(*) + 1 INTO numero_seq
      FROM public.faturas
      WHERE EXTRACT(YEAR FROM created_at) = ano;
  END CASE;
  
  -- Formato: ORC-2025-0001, PROP-2025-0001, etc.
  numero_final := UPPER(SUBSTRING(tipo, 1, 4)) || '-' || ano || '-' || LPAD(numero_seq::text, 4, '0');
  
  RETURN numero_final;
END;
$$;

-- ============================================
-- INSERIR TEMPLATE PADRÃO DE CONTRATO
-- ============================================

INSERT INTO public.contrato_templates (nome, categoria, corpo_html, variaveis_disponiveis, ativo)
VALUES (
  'Contrato Padrão de Prestação de Serviços',
  'Serviços',
  '<h1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h1>
  <p><strong>CONTRATANTE:</strong> {{cliente_nome}}, inscrito no CNPJ sob nº {{cliente_cnpj}}, com sede em {{cliente_endereco}}.</p>
  <p><strong>CONTRATADA:</strong> Bex Communication, inscrita no CNPJ sob nº XX.XXX.XXX/0001-XX.</p>
  
  <h2>CLÁUSULA 1ª - DO OBJETO</h2>
  <p>{{escopo}}</p>
  
  <h2>CLÁUSULA 2ª - DO VALOR E PAGAMENTO</h2>
  <p>O valor total do contrato é de R$ {{valor_total}}, pago da seguinte forma:</p>
  <p>{{condicoes_pagamento}}</p>
  
  <h2>CLÁUSULA 3ª - DO PRAZO</h2>
  <p>Vigência de {{data_inicio}} até {{data_fim}}.</p>
  <p>Renovação: {{renovacao}}</p>
  
  <h2>CLÁUSULA 4ª - DA CONFIDENCIALIDADE</h2>
  <p>As partes se comprometem a manter sigilo sobre informações confidenciais.</p>
  
  <h2>CLÁUSULA 5ª - DA RESCISÃO</h2>
  <p>{{rescisao}}</p>
  
  <h2>CLÁUSULA 6ª - DO FORO</h2>
  <p>{{foro}}</p>
  
  <p>Data: {{data_atual}}</p>
  <p>______________________________<br>CONTRATANTE</p>
  <p>______________________________<br>CONTRATADA</p>',
  '["cliente_nome", "cliente_cnpj", "cliente_endereco", "escopo", "valor_total", "condicoes_pagamento", "data_inicio", "data_fim", "renovacao", "rescisao", "foro", "data_atual"]'::jsonb,
  true
)
ON CONFLICT DO NOTHING;