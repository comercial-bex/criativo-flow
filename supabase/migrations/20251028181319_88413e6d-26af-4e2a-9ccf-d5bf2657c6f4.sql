-- Criar enums para extratos
CREATE TYPE formato_extrato_enum AS ENUM ('ofx', 'csv');
CREATE TYPE status_extrato_enum AS ENUM ('processando', 'concluido', 'erro');
CREATE TYPE tipo_movimento_enum AS ENUM ('credito', 'debito');
CREATE TYPE status_processamento_enum AS ENUM ('pendente', 'revisado', 'importado', 'descartado');

-- Criar tabela de extratos importados
CREATE TABLE IF NOT EXISTS extratos_importados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conta_bancaria_id UUID NOT NULL REFERENCES contas_bancarias(id) ON DELETE CASCADE,
  arquivo_nome TEXT NOT NULL,
  arquivo_url TEXT NOT NULL,
  formato formato_extrato_enum NOT NULL,
  data_importacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  periodo_inicio DATE,
  periodo_fim DATE,
  total_transacoes INTEGER DEFAULT 0,
  transacoes_processadas INTEGER DEFAULT 0,
  status status_extrato_enum NOT NULL DEFAULT 'processando',
  metadados JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de transações temporárias
CREATE TABLE IF NOT EXISTS extratos_transacoes_temp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  extrato_id UUID NOT NULL REFERENCES extratos_importados(id) ON DELETE CASCADE,
  data_transacao DATE NOT NULL,
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  tipo_movimento tipo_movimento_enum NOT NULL,
  saldo_apos_transacao NUMERIC,
  numero_documento TEXT,
  categoria_sugerida TEXT,
  cliente_sugerido_id UUID,
  fornecedor_sugerido_id UUID,
  confianca_vinculo NUMERIC DEFAULT 0 CHECK (confianca_vinculo >= 0 AND confianca_vinculo <= 100),
  titulo_vinculado_id UUID,
  status_processamento status_processamento_enum NOT NULL DEFAULT 'pendente',
  observacoes_usuario TEXT,
  comprovante_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_extratos_conta ON extratos_importados(conta_bancaria_id);
CREATE INDEX idx_extratos_status ON extratos_importados(status);
CREATE INDEX idx_extratos_created_by ON extratos_importados(created_by);
CREATE INDEX idx_transacoes_extrato ON extratos_transacoes_temp(extrato_id);
CREATE INDEX idx_transacoes_status ON extratos_transacoes_temp(status_processamento);
CREATE INDEX idx_transacoes_data ON extratos_transacoes_temp(data_transacao);

-- Trigger para updated_at
CREATE TRIGGER update_extratos_importados_updated_at
  BEFORE UPDATE ON extratos_importados
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_extratos_transacoes_temp_updated_at
  BEFORE UPDATE ON extratos_transacoes_temp
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies para extratos_importados
ALTER TABLE extratos_importados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem ver seus extratos"
  ON extratos_importados FOR SELECT
  USING (auth.uid() = created_by OR is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'financeiro');

CREATE POLICY "Usuários autenticados podem criar extratos"
  ON extratos_importados FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem atualizar seus extratos"
  ON extratos_importados FOR UPDATE
  USING (auth.uid() = created_by OR is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'financeiro');

CREATE POLICY "Admins podem deletar extratos"
  ON extratos_importados FOR DELETE
  USING (is_admin(auth.uid()));

-- RLS Policies para extratos_transacoes_temp
ALTER TABLE extratos_transacoes_temp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver transações de seus extratos"
  ON extratos_transacoes_temp FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM extratos_importados e
      WHERE e.id = extrato_id 
      AND (e.created_by = auth.uid() OR is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'financeiro')
    )
  );

CREATE POLICY "Usuários podem criar transações temp"
  ON extratos_transacoes_temp FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem atualizar transações de seus extratos"
  ON extratos_transacoes_temp FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM extratos_importados e
      WHERE e.id = extrato_id 
      AND (e.created_by = auth.uid() OR is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'financeiro')
    )
  );

CREATE POLICY "Usuários podem deletar transações de seus extratos"
  ON extratos_transacoes_temp FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM extratos_importados e
      WHERE e.id = extrato_id 
      AND (e.created_by = auth.uid() OR is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'financeiro')
    )
  );

-- Função para sugerir vínculos de transações
CREATE OR REPLACE FUNCTION fn_sugerir_vinculo_transacao(
  p_descricao TEXT,
  p_valor NUMERIC,
  p_data_transacao DATE,
  p_tipo_movimento TEXT
)
RETURNS TABLE (
  entidade_id UUID,
  entidade_tipo TEXT,
  entidade_nome TEXT,
  titulo_id UUID,
  confianca NUMERIC
) AS $$
BEGIN
  -- 1. Buscar títulos financeiros com valor exato e data próxima (±3 dias)
  RETURN QUERY
  SELECT 
    CASE 
      WHEN tf.tipo = 'receber' THEN tf.cliente_id
      WHEN tf.tipo = 'pagar' THEN tf.fornecedor_id
    END as entidade_id,
    CASE 
      WHEN tf.tipo = 'receber' THEN 'cliente'
      WHEN tf.tipo = 'pagar' THEN 'fornecedor'
    END as entidade_tipo,
    COALESCE(c.nome, f.razao_social) as entidade_nome,
    tf.id as titulo_id,
    CASE 
      WHEN tf.valor_original = p_valor AND tf.data_vencimento = p_data_transacao THEN 100.0
      WHEN tf.valor_original = p_valor THEN 80.0
      ELSE 60.0
    END as confianca
  FROM titulos_financeiros tf
  LEFT JOIN clientes c ON c.id = tf.cliente_id
  LEFT JOIN fornecedores f ON f.id = tf.fornecedor_id
  WHERE 
    tf.valor_original = p_valor
    AND tf.data_vencimento BETWEEN (p_data_transacao - INTERVAL '3 days') AND (p_data_transacao + INTERVAL '3 days')
    AND tf.status IN ('pendente', 'vencido')
    AND ((p_tipo_movimento = 'credito' AND tf.tipo = 'receber') OR (p_tipo_movimento = 'debito' AND tf.tipo = 'pagar'))
  ORDER BY 
    CASE 
      WHEN tf.data_vencimento = p_data_transacao THEN 0
      ELSE ABS(EXTRACT(DAY FROM (tf.data_vencimento - p_data_transacao)))
    END
  LIMIT 5;

  -- Se não encontrou por valor/data, buscar por similaridade de texto
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      c.id as entidade_id,
      'cliente'::TEXT as entidade_tipo,
      c.nome as entidade_nome,
      NULL::UUID as titulo_id,
      40.0 as confianca
    FROM clientes c
    WHERE 
      c.ativo = true
      AND (
        LOWER(p_descricao) LIKE '%' || LOWER(c.nome) || '%'
        OR LOWER(c.nome) LIKE '%' || LOWER(p_descricao) || '%'
      )
    LIMIT 3;

    RETURN QUERY
    SELECT 
      f.id as entidade_id,
      'fornecedor'::TEXT as entidade_tipo,
      f.razao_social as entidade_nome,
      NULL::UUID as titulo_id,
      40.0 as confianca
    FROM fornecedores f
    WHERE 
      f.ativo = true
      AND (
        LOWER(p_descricao) LIKE '%' || LOWER(f.razao_social) || '%'
        OR LOWER(f.razao_social) LIKE '%' || LOWER(p_descricao) || '%'
      )
    LIMIT 3;
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;