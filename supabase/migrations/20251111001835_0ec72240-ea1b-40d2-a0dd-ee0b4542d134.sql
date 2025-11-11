-- Criar tabela de assinaturas de propostas
CREATE TABLE IF NOT EXISTS proposta_assinaturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposta_id UUID NOT NULL REFERENCES propostas(id) ON DELETE CASCADE,
  nome_assinante TEXT NOT NULL,
  email_assinante TEXT NOT NULL,
  cargo TEXT,
  status TEXT NOT NULL DEFAULT 'pendente', 
  token_assinatura UUID UNIQUE DEFAULT gen_random_uuid(),
  ip_assinatura TEXT,
  data_envio TIMESTAMPTZ,
  data_assinatura TIMESTAMPTZ,
  data_visualizacao TIMESTAMPTZ,
  assinatura_base64 TEXT,
  certificado_digital TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE proposta_assinaturas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem visualizar assinaturas de propostas"
  ON proposta_assinaturas FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem criar assinaturas"
  ON proposta_assinaturas FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem atualizar assinaturas"
  ON proposta_assinaturas FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Acesso público por token"
  ON proposta_assinaturas FOR SELECT
  USING (true);

-- Criar índices para melhor performance
CREATE INDEX idx_proposta_assinaturas_proposta_id ON proposta_assinaturas(proposta_id);
CREATE INDEX idx_proposta_assinaturas_token ON proposta_assinaturas(token_assinatura);
CREATE INDEX idx_proposta_assinaturas_status ON proposta_assinaturas(status);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_proposta_assinaturas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_proposta_assinaturas_updated_at
  BEFORE UPDATE ON proposta_assinaturas
  FOR EACH ROW
  EXECUTE FUNCTION update_proposta_assinaturas_updated_at();

-- Comentários
COMMENT ON TABLE proposta_assinaturas IS 'Controla assinaturas individuais de propostas comerciais';
COMMENT ON COLUMN proposta_assinaturas.status IS 'pendente | enviado | assinado | recusado';
COMMENT ON COLUMN proposta_assinaturas.token_assinatura IS 'Token único para link público de assinatura';