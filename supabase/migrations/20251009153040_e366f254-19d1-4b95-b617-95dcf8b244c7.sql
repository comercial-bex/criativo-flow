-- PARTE 1: Tabelas e Enums

CREATE TABLE calendario_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  especialidade TEXT NOT NULL UNIQUE,
  seg_sex_manha_inicio TIME NOT NULL DEFAULT '09:00',
  seg_sex_manha_fim TIME NOT NULL DEFAULT '12:30',
  seg_sex_tarde_inicio TIME NOT NULL DEFAULT '14:00',
  seg_sex_tarde_fim TIME NOT NULL DEFAULT '18:00',
  sabado_inicio TIME NOT NULL DEFAULT '09:00',
  sabado_fim TIME NOT NULL DEFAULT '13:00',
  flex_manha_inicio TIME NOT NULL DEFAULT '06:00',
  flex_manha_fim TIME NOT NULL DEFAULT '09:00',
  flex_noite_inicio TIME NOT NULL DEFAULT '18:00',
  flex_noite_fim TIME NOT NULL DEFAULT '21:00',
  capacidade_manha_avulso INTEGER DEFAULT 6,
  capacidade_tarde_avulso INTEGER DEFAULT 6,
  capacidade_manha_lote INTEGER DEFAULT 12,
  capacidade_tarde_lote INTEGER DEFAULT 12,
  capacidade_sabado_lote INTEGER DEFAULT 12,
  pausa_foco INTEGER DEFAULT 20,
  tempo_criacao_avulso INTEGER DEFAULT 35,
  tempo_criacao_lote INTEGER DEFAULT 210,
  tempo_edicao_curta INTEGER DEFAULT 120,
  tempo_edicao_longa INTEGER DEFAULT 240,
  tempo_planejamento INTEGER DEFAULT 120,
  tempo_preparacao_captacao INTEGER DEFAULT 30,
  tempo_descarga_backup INTEGER DEFAULT 75,
  deslocamento_curto INTEGER DEFAULT 30,
  deslocamento_medio INTEGER DEFAULT 45,
  deslocamento_longo INTEGER DEFAULT 60,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO calendario_config (especialidade) VALUES
('criativo'), ('audiovisual'), ('grs');

CREATE TYPE tipo_evento AS ENUM (
  'criacao_avulso', 'criacao_lote', 'edicao_curta', 'edicao_longa',
  'captacao_interna', 'captacao_externa', 'planejamento', 'reuniao',
  'pausa_automatica', 'deslocamento', 'preparacao', 'backup'
);

CREATE TYPE status_evento AS ENUM (
  'agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado'
);

CREATE TABLE eventos_calendario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id UUID REFERENCES projetos(id),
  cliente_id UUID REFERENCES clientes(id),
  tarefa_id UUID REFERENCES tarefas_projeto(id),
  responsavel_id UUID REFERENCES profiles(id) NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo tipo_evento NOT NULL,
  status status_evento DEFAULT 'agendado',
  data_inicio TIMESTAMPTZ NOT NULL,
  data_fim TIMESTAMPTZ NOT NULL,
  duracao_minutos INTEGER GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (data_fim - data_inicio)) / 60
  ) STORED,
  is_extra BOOLEAN DEFAULT FALSE,
  is_bloqueante BOOLEAN DEFAULT TRUE,
  is_automatico BOOLEAN DEFAULT FALSE,
  modo_criativo TEXT,
  quantidade_pecas INTEGER,
  local TEXT,
  tipo_deslocamento TEXT,
  evento_pai_id UUID REFERENCES eventos_calendario(id),
  equipamentos_ids UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  CONSTRAINT check_data_fim_maior CHECK (data_fim > data_inicio),
  CONSTRAINT check_lote_quantidade CHECK (
    modo_criativo != 'lote' OR quantidade_pecas > 0
  )
);

CREATE INDEX idx_eventos_data ON eventos_calendario(data_inicio, data_fim);
CREATE INDEX idx_eventos_responsavel ON eventos_calendario(responsavel_id);
CREATE INDEX idx_eventos_projeto ON eventos_calendario(projeto_id);
CREATE INDEX idx_eventos_cliente ON eventos_calendario(cliente_id);