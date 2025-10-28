-- ============================================
-- SPRINT 3: CRIAR FERIADOS E FUNCIONALIDADES
-- ============================================

-- 1️⃣ Adicionar tipo 'feriado' ao enum
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'feriado' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tipo_evento')
  ) THEN
    ALTER TYPE tipo_evento ADD VALUE 'feriado';
  END IF;
END $$;

-- 2️⃣ CRIAR TABELA DE FERIADOS
CREATE TABLE IF NOT EXISTS feriados_nacionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  data DATE NOT NULL UNIQUE,
  tipo TEXT NOT NULL DEFAULT 'nacional',
  descricao TEXT,
  is_ponto_facultativo BOOLEAN DEFAULT false,
  estado TEXT,
  cidade TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feriados_data ON feriados_nacionais(data);
CREATE INDEX IF NOT EXISTS idx_feriados_tipo ON feriados_nacionais(tipo);

ALTER TABLE feriados_nacionais ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos podem ver feriados" ON feriados_nacionais;
CREATE POLICY "Todos podem ver feriados" ON feriados_nacionais
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin pode gerenciar feriados" ON feriados_nacionais;
CREATE POLICY "Admin pode gerenciar feriados" ON feriados_nacionais
  FOR ALL USING (is_admin(auth.uid()));

-- 3️⃣ POPULAR FERIADOS 2025
INSERT INTO feriados_nacionais (nome, data, tipo, descricao, is_ponto_facultativo) VALUES
  ('Ano Novo', '2025-01-01', 'nacional', 'Confraternização Universal', false),
  ('Carnaval', '2025-03-03', 'nacional', 'Segunda-feira de Carnaval', false),
  ('Carnaval', '2025-03-04', 'nacional', 'Terça-feira de Carnaval', false),
  ('Quarta-feira de Cinzas', '2025-03-05', 'facultativo', 'Ponto facultativo até 14h', true),
  ('Sexta-feira Santa', '2025-04-18', 'nacional', 'Paixão de Cristo', false),
  ('Tiradentes', '2025-04-21', 'nacional', 'Dia de Tiradentes', false),
  ('Dia do Trabalho', '2025-05-01', 'nacional', 'Dia Mundial do Trabalho', false),
  ('Corpus Christi', '2025-06-19', 'facultativo', 'Corpus Christi', true),
  ('Independência do Brasil', '2025-09-07', 'nacional', 'Sete de Setembro', false),
  ('Nossa Senhora Aparecida', '2025-10-12', 'nacional', 'Padroeira do Brasil', false),
  ('Finados', '2025-11-02', 'nacional', 'Dia de Finados', false),
  ('Proclamação da República', '2025-11-15', 'nacional', 'Quinze de Novembro', false),
  ('Consciência Negra', '2025-11-20', 'facultativo', 'Consciência Negra', true),
  ('Natal', '2025-12-25', 'nacional', 'Nascimento de Jesus Cristo', false),
  ('Véspera de Ano Novo', '2025-12-31', 'facultativo', 'Ponto facultativo', true)
ON CONFLICT (data) DO NOTHING;