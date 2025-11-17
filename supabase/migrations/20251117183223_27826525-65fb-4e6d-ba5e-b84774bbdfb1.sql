-- Criar tabela para emails agendados
CREATE TABLE IF NOT EXISTS emails_agendados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL CHECK (tipo IN ('orcamento', 'contrato', 'proposta')),
  entidade_id uuid NOT NULL,
  destinatarios jsonb NOT NULL,
  assunto text NOT NULL,
  mensagem text NOT NULL,
  template_html text,
  anexo_url text,
  agendar_para timestamptz NOT NULL,
  status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviado', 'erro', 'cancelado')),
  enviado_em timestamptz,
  erro_mensagem text,
  criado_por uuid REFERENCES auth.users(id),
  criado_em timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index para melhorar performance de queries de emails pendentes
CREATE INDEX IF NOT EXISTS idx_emails_status_agendamento ON emails_agendados(status, agendar_para) WHERE status = 'pendente';

-- RLS Policies
ALTER TABLE emails_agendados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios emails agendados"
  ON emails_agendados FOR SELECT
  USING (auth.uid() = criado_por);

CREATE POLICY "Usuários podem criar emails agendados"
  ON emails_agendados FOR INSERT
  WITH CHECK (auth.uid() = criado_por);

CREATE POLICY "Usuários podem atualizar seus próprios emails"
  ON emails_agendados FOR UPDATE
  USING (auth.uid() = criado_por);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_emails_agendados_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER emails_agendados_updated_at
  BEFORE UPDATE ON emails_agendados
  FOR EACH ROW
  EXECUTE FUNCTION update_emails_agendados_updated_at();