-- ============================================
-- FASE 1: MÓDULO PATRIMÔNIO & INVENTÁRIO
-- MVP 1: Database Core (CORRIGIDO)
-- ============================================

-- 1. Categorias de Inventário
CREATE TABLE inventario_categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  icone TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Modelos de Equipamentos
CREATE TABLE inventario_modelos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id UUID REFERENCES inventario_categorias(id) ON DELETE CASCADE,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  especificacoes JSONB DEFAULT '{}',
  foto_capa TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Itens de Inventário
CREATE TABLE inventario_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modelo_id UUID REFERENCES inventario_modelos(id),
  identificacao_interna TEXT UNIQUE NOT NULL,
  numero_serie TEXT,
  condicao TEXT DEFAULT 'bom',
  localizacao_atual TEXT DEFAULT 'sede',
  fornecedor TEXT,
  data_aquisicao DATE,
  valor_aquisicao NUMERIC(10,2),
  vida_util_meses INTEGER,
  garantia_ate DATE,
  observacoes TEXT,
  eh_multiunidade BOOLEAN DEFAULT false,
  quantidade_total INTEGER DEFAULT 1,
  habilitar_aluguel BOOLEAN DEFAULT false,
  preco_diaria NUMERIC(10,2),
  preco_meio_periodo NUMERIC(10,2),
  caucao_sugerida NUMERIC(10,2),
  taxa_atraso_dia NUMERIC(10,2),
  politica_multa_dano TEXT,
  ativo BOOLEAN DEFAULT true,
  criado_por UUID REFERENCES profiles(id),
  atualizado_por UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Unidades individuais
CREATE TABLE inventario_unidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES inventario_itens(id) ON DELETE CASCADE,
  codigo_unidade TEXT NOT NULL,
  numero_serie_unidade TEXT,
  status_unidade TEXT DEFAULT 'disponivel',
  condicao_unidade TEXT DEFAULT 'bom',
  qr_code_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_id, codigo_unidade)
);

-- 5. Imagens e Documentos
CREATE TABLE inventario_imagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES inventario_itens(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  tipo TEXT NOT NULL,
  legenda TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Reservas
CREATE TABLE inventario_reservas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES inventario_itens(id),
  unidade_id UUID REFERENCES inventario_unidades(id),
  tipo_reserva TEXT NOT NULL,
  inicio TIMESTAMPTZ NOT NULL,
  fim TIMESTAMPTZ NOT NULL,
  projeto_id UUID REFERENCES projetos(id),
  tarefa_id UUID REFERENCES tarefas_projeto(id),
  cliente_id UUID REFERENCES clientes(id),
  status_reserva TEXT DEFAULT 'reservado',
  criado_por UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Movimentações
CREATE TABLE inventario_movimentacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,
  origem_contexto TEXT,
  item_id UUID REFERENCES inventario_itens(id),
  unidade_id UUID REFERENCES inventario_unidades(id),
  quantidade INTEGER DEFAULT 1,
  projeto_id UUID REFERENCES projetos(id),
  tarefa_id UUID REFERENCES tarefas_projeto(id),
  cliente_id UUID REFERENCES clientes(id),
  responsavel_id UUID REFERENCES profiles(id),
  termo_assinado_id UUID,
  data_mov_saida TIMESTAMPTZ,
  data_prevista_retorno TIMESTAMPTZ,
  data_mov_entrada TIMESTAMPTZ,
  checklist_saida JSONB DEFAULT '{}',
  checklist_entrada JSONB DEFAULT '{}',
  observacoes TEXT,
  status_mov TEXT DEFAULT 'pendente_saida',
  trace_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Termos
CREATE TABLE inventario_termos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,
  conteudo_html TEXT NOT NULL,
  versao INTEGER DEFAULT 1,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inventario_termos_assinados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  termo_id UUID REFERENCES inventario_termos(id),
  referencia_tipo TEXT NOT NULL,
  referencia_id UUID NOT NULL,
  assinante_nome TEXT NOT NULL,
  assinante_doc TEXT,
  assinante_email TEXT,
  aceite BOOLEAN DEFAULT false,
  ip INET,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Manutenções
CREATE TABLE inventario_manutencoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES inventario_itens(id),
  unidade_id UUID REFERENCES inventario_unidades(id),
  tipo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  custo_estimado NUMERIC(10,2),
  custo_final NUMERIC(10,2),
  data_inicio TIMESTAMPTZ,
  data_fim TIMESTAMPTZ,
  status TEXT DEFAULT 'aberta',
  fornecedor TEXT,
  anexos JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Aluguéis
CREATE TABLE inventario_alugueis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id),
  contato TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  itens JSONB NOT NULL,
  data_retirada TIMESTAMPTZ NOT NULL,
  data_devolucao_prevista TIMESTAMPTZ NOT NULL,
  data_devolucao_real TIMESTAMPTZ,
  financeiro_status TEXT DEFAULT 'rascunho',
  operacional_status TEXT DEFAULT 'reservado',
  caucao_valor NUMERIC(10,2),
  caucao_forma TEXT,
  desconto NUMERIC(10,2),
  total NUMERIC(10,2) NOT NULL,
  termo_assinado_id UUID REFERENCES inventario_termos_assinados(id),
  observacoes TEXT,
  trace_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Ponte Tarefas ↔ Equipamentos
CREATE TABLE tarefas_equipamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tarefa_id UUID REFERENCES tarefas_projeto(id) ON DELETE CASCADE,
  item_id UUID REFERENCES inventario_itens(id),
  unidade_id UUID REFERENCES inventario_unidades(id),
  quantidade INTEGER DEFAULT 1,
  inicio TIMESTAMPTZ NOT NULL,
  fim TIMESTAMPTZ NOT NULL,
  status_vinculo TEXT DEFAULT 'reservado',
  checklist_saida JSONB DEFAULT '{}',
  checklist_entrada JSONB DEFAULT '{}',
  termo_assinado_id UUID REFERENCES inventario_termos_assinados(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migração de dados
INSERT INTO inventario_categorias (id, nome, descricao, icone)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Equipamentos Legados',
  'Equipamentos migrados do sistema anterior',
  'archive'
);

INSERT INTO inventario_modelos (id, categoria_id, marca, modelo)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Diversos',
  'Modelo Legado'
);

INSERT INTO inventario_itens (
  modelo_id,
  identificacao_interna,
  condicao,
  observacoes,
  ativo,
  created_at
)
SELECT 
  '00000000-0000-0000-0000-000000000001',
  COALESCE(nome, 'EQUIP-' || id::text),
  'bom',
  observacoes,
  true,
  created_at
FROM equipamentos
WHERE NOT EXISTS (
  SELECT 1 FROM inventario_itens 
  WHERE identificacao_interna = COALESCE(equipamentos.nome, 'EQUIP-' || equipamentos.id::text)
);

-- RLS POLICIES
ALTER TABLE inventario_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin e Patrimônio gerenciam itens" ON inventario_itens FOR ALL
USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) IN ('gestor', 'financeiro'));
CREATE POLICY "Equipe visualiza itens" ON inventario_itens FOR SELECT
USING (auth.uid() IS NOT NULL);

ALTER TABLE inventario_modelos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin gerencia modelos" ON inventario_modelos FOR ALL
USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor');
CREATE POLICY "Todos visualizam modelos" ON inventario_modelos FOR SELECT
USING (auth.uid() IS NOT NULL);

ALTER TABLE inventario_categorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin gerencia categorias" ON inventario_categorias FOR ALL
USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor');
CREATE POLICY "Todos visualizam categorias" ON inventario_categorias FOR SELECT
USING (auth.uid() IS NOT NULL);

ALTER TABLE inventario_reservas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "GRS e Admin criam reservas" ON inventario_reservas FOR INSERT
WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'grs', 'gestor'));
CREATE POLICY "Equipe visualiza reservas" ON inventario_reservas FOR SELECT
USING (auth.uid() IS NOT NULL);
CREATE POLICY "Criador pode cancelar reserva" ON inventario_reservas FOR UPDATE
USING (auth.uid() = criado_por OR is_admin(auth.uid()));

ALTER TABLE inventario_unidades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin gerencia unidades" ON inventario_unidades FOR ALL
USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor');
CREATE POLICY "Equipe visualiza unidades" ON inventario_unidades FOR SELECT
USING (auth.uid() IS NOT NULL);

ALTER TABLE inventario_imagens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipe gerencia imagens" ON inventario_imagens FOR ALL
USING (auth.uid() IS NOT NULL);

ALTER TABLE inventario_movimentacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Responsável gerencia movimentações" ON inventario_movimentacoes FOR ALL
USING (auth.uid() = responsavel_id OR is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor');

ALTER TABLE tarefas_equipamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipe gerencia equipamentos de tarefas" ON tarefas_equipamentos FOR ALL
USING (auth.uid() IS NOT NULL);

ALTER TABLE inventario_termos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin gerencia termos" ON inventario_termos FOR ALL
USING (is_admin(auth.uid()));
CREATE POLICY "Todos visualizam termos ativos" ON inventario_termos FOR SELECT
USING (ativo = true);

ALTER TABLE inventario_termos_assinados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sistema cria assinaturas" ON inventario_termos_assinados FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admin visualiza assinaturas" ON inventario_termos_assinados FOR SELECT
USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor');

ALTER TABLE inventario_manutencoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin gerencia manutenções" ON inventario_manutencoes FOR ALL
USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor');
CREATE POLICY "Equipe visualiza manutenções" ON inventario_manutencoes FOR SELECT
USING (auth.uid() IS NOT NULL);

ALTER TABLE inventario_alugueis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Financeiro gerencia aluguéis" ON inventario_alugueis FOR ALL
USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) IN ('gestor', 'financeiro'));

-- FUNÇÕES BACKEND (Parâmetros corrigidos)
CREATE OR REPLACE FUNCTION fn_verificar_disponibilidade(
  p_item_id UUID,
  p_inicio TIMESTAMPTZ,
  p_fim TIMESTAMPTZ,
  p_unidade_id UUID DEFAULT NULL,
  p_quantidade INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_disponivel BOOLEAN := false;
  v_conflitos JSONB;
  v_qtd_disponivel INTEGER := 0;
BEGIN
  IF p_unidade_id IS NOT NULL THEN
    SELECT NOT EXISTS (
      SELECT 1 FROM inventario_reservas
      WHERE unidade_id = p_unidade_id
        AND status_reserva IN ('reservado', 'em_uso')
        AND (
          (p_inicio >= inicio AND p_inicio < fim) OR
          (p_fim > inicio AND p_fim <= fim) OR
          (p_inicio <= inicio AND p_fim >= fim)
        )
    ) INTO v_disponivel;
    v_qtd_disponivel := CASE WHEN v_disponivel THEN 1 ELSE 0 END;
  ELSE
    SELECT 
      COALESCE(i.quantidade_total, 1) - COALESCE(COUNT(r.id), 0)
    INTO v_qtd_disponivel
    FROM inventario_itens i
    LEFT JOIN inventario_reservas r ON r.item_id = i.id
      AND r.status_reserva IN ('reservado', 'em_uso')
      AND (
        (p_inicio >= r.inicio AND p_inicio < r.fim) OR
        (p_fim > r.inicio AND p_fim <= r.fim) OR
        (p_inicio <= r.inicio AND p_fim >= r.fim)
      )
    WHERE i.id = p_item_id
    GROUP BY i.id, i.quantidade_total;
    v_disponivel := (v_qtd_disponivel >= p_quantidade);
  END IF;
  
  SELECT jsonb_agg(
    jsonb_build_object(
      'reserva_id', r.id,
      'inicio', r.inicio,
      'fim', r.fim,
      'projeto', p.titulo
    )
  )
  INTO v_conflitos
  FROM inventario_reservas r
  LEFT JOIN projetos p ON r.projeto_id = p.id
  WHERE r.item_id = p_item_id
    AND (p_unidade_id IS NULL OR r.unidade_id = p_unidade_id)
    AND r.status_reserva IN ('reservado', 'em_uso')
    AND (
      (p_inicio >= r.inicio AND p_inicio < r.fim) OR
      (p_fim > r.inicio AND p_fim <= r.fim) OR
      (p_inicio <= r.inicio AND p_fim >= r.fim)
    );
  
  RETURN jsonb_build_object(
    'disponivel', v_disponivel,
    'quantidade_disponivel', v_qtd_disponivel,
    'conflitos', COALESCE(v_conflitos, '[]'::jsonb)
  );
END;
$$;

CREATE OR REPLACE FUNCTION fn_criar_reserva_equipamento(
  p_item_id UUID,
  p_tipo_reserva TEXT,
  p_inicio TIMESTAMPTZ,
  p_fim TIMESTAMPTZ,
  p_unidade_id UUID DEFAULT NULL,
  p_tarefa_id UUID DEFAULT NULL,
  p_projeto_id UUID DEFAULT NULL,
  p_quantidade INTEGER DEFAULT 1
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reserva_id UUID;
  v_disponibilidade JSONB;
  v_trace_id UUID := gen_random_uuid();
  v_cliente_id UUID;
BEGIN
  v_disponibilidade := fn_verificar_disponibilidade(
    p_item_id, p_inicio, p_fim, p_unidade_id, p_quantidade
  );
  
  IF NOT (v_disponibilidade->>'disponivel')::BOOLEAN THEN
    RAISE EXCEPTION 'Equipamento indisponível no período solicitado';
  END IF;
  
  IF p_projeto_id IS NOT NULL THEN
    SELECT cliente_id INTO v_cliente_id FROM projetos WHERE id = p_projeto_id;
  END IF;
  
  INSERT INTO inventario_reservas (
    item_id, unidade_id, tipo_reserva,
    inicio, fim,
    tarefa_id, projeto_id, cliente_id,
    status_reserva, criado_por
  ) VALUES (
    p_item_id, p_unidade_id, p_tipo_reserva,
    p_inicio, p_fim,
    p_tarefa_id, p_projeto_id, v_cliente_id,
    'reservado', auth.uid()
  )
  RETURNING id INTO v_reserva_id;
  
  IF v_cliente_id IS NOT NULL THEN
    PERFORM criar_log_atividade(
      v_cliente_id, auth.uid(), 'insert', 'inventario_reservas', v_reserva_id,
      '📅 Equipamento reservado para ' || p_tipo_reserva,
      jsonb_build_object('item_id', p_item_id, 'trace_id', v_trace_id)
    );
  END IF;
  
  RETURN v_reserva_id;
END;
$$;

CREATE OR REPLACE FUNCTION trg_atualizar_status_unidade()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status_mov = 'em_uso' AND NEW.unidade_id IS NOT NULL THEN
    UPDATE inventario_unidades SET status_unidade = 'em_uso' WHERE id = NEW.unidade_id;
  ELSIF NEW.status_mov = 'concluida' AND NEW.unidade_id IS NOT NULL THEN
    UPDATE inventario_unidades SET status_unidade = 'disponivel' WHERE id = NEW.unidade_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_mov_atualiza_status
AFTER INSERT OR UPDATE ON inventario_movimentacoes
FOR EACH ROW EXECUTE FUNCTION trg_atualizar_status_unidade();

INSERT INTO inventario_termos (tipo, conteudo_html, versao, ativo) VALUES (
  'responsabilidade',
  '<h2>Termo de Responsabilidade - Equipamentos</h2><p>Eu, <strong>[NOME]</strong>, portador do CPF <strong>[CPF]</strong>, declaro que estou recebendo o equipamento descrito em perfeitas condições de uso e me comprometo a:</p><ul><li>Utilizar o equipamento apenas para os fins profissionais da empresa</li><li>Zelar pela conservação e segurança do equipamento</li><li>Devolver o equipamento nas mesmas condições em que foi recebido</li><li>Comunicar imediatamente qualquer problema ou avaria</li><li>Ressarcir eventuais danos causados por mau uso</li></ul><p>Estou ciente de que sou responsável pelo equipamento até a devolução formal.</p>',
  1, true
);