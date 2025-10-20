-- ============================================
-- NÍVEL 3: Sistema de Categorias Financeiras
-- ============================================

-- Adicionar campo categoria_id em titulos_financeiros (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'titulos_financeiros' AND column_name = 'categoria_id'
  ) THEN
    ALTER TABLE titulos_financeiros 
    ADD COLUMN categoria_id UUID REFERENCES categorias_financeiras(id);
    
    COMMENT ON COLUMN titulos_financeiros.categoria_id IS 'Categoria financeira do título para classificação e análise';
  END IF;
END $$;

-- Criar índice para melhor performance em queries por categoria
CREATE INDEX IF NOT EXISTS idx_titulos_categoria 
ON titulos_financeiros(categoria_id);

-- Criar índice composto para queries comuns
CREATE INDEX IF NOT EXISTS idx_titulos_tipo_status_vencimento 
ON titulos_financeiros(tipo, status, data_vencimento);

-- View materializada para análise por categoria (atualizada a cada hora)
CREATE MATERIALIZED VIEW IF NOT EXISTS vw_fluxo_por_categoria AS
SELECT 
  c.id as categoria_id,
  c.nome as categoria_nome,
  c.tipo as categoria_tipo,
  c.cor as categoria_cor,
  t.tipo as titulo_tipo,
  DATE_TRUNC('month', t.data_vencimento) as mes_competencia,
  COUNT(t.id) as qtd_titulos,
  SUM(t.valor_liquido) as valor_total,
  SUM(CASE WHEN t.status = 'pago' THEN t.valor_pago ELSE 0 END) as valor_pago,
  SUM(CASE WHEN t.status IN ('pendente', 'vencido') THEN t.valor_liquido ELSE 0 END) as valor_pendente
FROM titulos_financeiros t
LEFT JOIN categorias_financeiras c ON t.categoria_id = c.id
WHERE t.data_vencimento >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months')
GROUP BY c.id, c.nome, c.tipo, c.cor, t.tipo, DATE_TRUNC('month', t.data_vencimento);

-- Índice único para refresh concorrente
CREATE UNIQUE INDEX IF NOT EXISTS idx_vw_fluxo_categoria_unique 
ON vw_fluxo_por_categoria(COALESCE(categoria_id, '00000000-0000-0000-0000-000000000000'::uuid), titulo_tipo, mes_competencia);

-- Função para categorização inteligente automática
CREATE OR REPLACE FUNCTION fn_sugerir_categoria(
  p_descricao TEXT,
  p_tipo TEXT,
  p_fornecedor_id UUID DEFAULT NULL,
  p_cliente_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_categoria_id UUID;
  v_keywords TEXT[];
BEGIN
  -- Palavras-chave para categorização automática
  v_keywords := string_to_array(lower(p_descricao), ' ');
  
  -- Regras de categorização para CONTAS A PAGAR
  IF p_tipo = 'pagar' THEN
    -- Salários e Pessoal
    IF p_descricao ~* '(salario|salário|folha|pagamento|holerite|inss|fgts)' THEN
      SELECT id INTO v_categoria_id FROM categorias_financeiras 
      WHERE tipo = 'despesa' AND nome ILIKE '%pessoal%' LIMIT 1;
      
    -- Marketing e Publicidade  
    ELSIF p_descricao ~* '(marketing|anuncio|anúncio|ads|facebook|google|instagram|trafego|tráfego)' THEN
      SELECT id INTO v_categoria_id FROM categorias_financeiras 
      WHERE tipo = 'despesa' AND nome ILIKE '%marketing%' LIMIT 1;
      
    -- Aluguel e Condomínio
    ELSIF p_descricao ~* '(aluguel|condominio|condomínio|iptu|energia|agua|água|internet)' THEN
      SELECT id INTO v_categoria_id FROM categorias_financeiras 
      WHERE tipo = 'despesa' AND nome ILIKE '%operacional%' LIMIT 1;
      
    -- Equipamentos e Tecnologia
    ELSIF p_descricao ~* '(equipamento|camera|câmera|computador|software|licença|licenca|assinatura)' THEN
      SELECT id INTO v_categoria_id FROM categorias_financeiras 
      WHERE tipo = 'despesa' AND nome ILIKE '%tecnologia%' LIMIT 1;
      
    -- Impostos
    ELSIF p_descricao ~* '(imposto|tributo|das|mei|simples|nacional)' THEN
      SELECT id INTO v_categoria_id FROM categorias_financeiras 
      WHERE tipo = 'despesa' AND nome ILIKE '%imposto%' LIMIT 1;
    END IF;
  
  -- Regras de categorização para CONTAS A RECEBER  
  ELSIF p_tipo = 'receber' THEN
    -- Serviços de Design
    IF p_descricao ~* '(design|arte|criacao|criação|posts|banner|flyer)' THEN
      SELECT id INTO v_categoria_id FROM categorias_financeiras 
      WHERE tipo = 'receita' AND nome ILIKE '%design%' LIMIT 1;
      
    -- Audiovisual
    ELSIF p_descricao ~* '(video|vídeo|captacao|captação|edicao|edição|filmagem|reels)' THEN
      SELECT id INTO v_categoria_id FROM categorias_financeiras 
      WHERE tipo = 'receita' AND nome ILIKE '%audiovisual%' LIMIT 1;
      
    -- Gestão de Redes
    ELSIF p_descricao ~* '(gestao|gestão|redes|sociais|planejamento|calendario|calendário)' THEN
      SELECT id INTO v_categoria_id FROM categorias_financeiras 
      WHERE tipo = 'receita' AND nome ILIKE '%gestao%' OR nome ILIKE '%redes%' LIMIT 1;
      
    -- Consultoria
    ELSIF p_descricao ~* '(consultoria|estrategia|estratégia|mentoria|treinamento)' THEN
      SELECT id INTO v_categoria_id FROM categorias_financeiras 
      WHERE tipo = 'receita' AND nome ILIKE '%consultoria%' LIMIT 1;
    END IF;
  END IF;
  
  -- Se não encontrou categoria específica, retorna categoria padrão
  IF v_categoria_id IS NULL THEN
    SELECT id INTO v_categoria_id FROM categorias_financeiras 
    WHERE tipo = p_tipo AND nome ILIKE '%outros%' LIMIT 1;
  END IF;
  
  RETURN v_categoria_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para categorização automática ao inserir título
CREATE OR REPLACE FUNCTION trg_categorizar_titulo_auto()
RETURNS TRIGGER AS $$
BEGIN
  -- Se não foi informada categoria, tenta categorizar automaticamente
  IF NEW.categoria_id IS NULL THEN
    NEW.categoria_id := fn_sugerir_categoria(
      NEW.descricao,
      NEW.tipo,
      NEW.fornecedor_id,
      NEW.cliente_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_categorizar_titulo ON titulos_financeiros;
CREATE TRIGGER trigger_categorizar_titulo
  BEFORE INSERT ON titulos_financeiros
  FOR EACH ROW
  EXECUTE FUNCTION trg_categorizar_titulo_auto();

COMMENT ON FUNCTION fn_sugerir_categoria IS 'Sugere categoria financeira baseada em palavras-chave na descrição';
COMMENT ON TRIGGER trigger_categorizar_titulo ON titulos_financeiros IS 'Categoriza automaticamente títulos financeiros ao inserir';