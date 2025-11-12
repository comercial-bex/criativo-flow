-- FASE 1: Tabela de métricas de performance para ML
CREATE TABLE IF NOT EXISTS post_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts_planejamento(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  
  -- Dados do post
  tipo_conteudo TEXT NOT NULL,
  formato_postagem TEXT,
  dia_semana INTEGER NOT NULL, -- 0=domingo, 6=sábado
  hora_publicacao INTEGER NOT NULL, -- 0-23
  data_publicacao TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Métricas de engajamento
  impressoes INTEGER DEFAULT 0,
  alcance INTEGER DEFAULT 0,
  curtidas INTEGER DEFAULT 0,
  comentarios INTEGER DEFAULT 0,
  compartilhamentos INTEGER DEFAULT 0,
  salvamentos INTEGER DEFAULT 0,
  cliques_link INTEGER DEFAULT 0,
  
  -- Métricas calculadas
  taxa_engajamento DECIMAL(5,2) DEFAULT 0,
  taxa_cliques DECIMAL(5,2) DEFAULT 0,
  score_performance DECIMAL(5,2) DEFAULT 0, -- 0-100
  
  -- Dados adicionais
  plataforma TEXT, -- instagram, facebook, linkedin
  texto_estruturado TEXT,
  tinha_cta BOOLEAN DEFAULT false,
  tinha_hashtags BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para ML e queries rápidas
CREATE INDEX idx_metrics_cliente_tipo ON post_performance_metrics(cliente_id, tipo_conteudo);
CREATE INDEX idx_metrics_horario ON post_performance_metrics(dia_semana, hora_publicacao);
CREATE INDEX idx_metrics_performance ON post_performance_metrics(score_performance DESC);
CREATE INDEX idx_metrics_data ON post_performance_metrics(data_publicacao DESC);

-- FASE 2: Fila de publicação automática
CREATE TABLE IF NOT EXISTS publicacao_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts_planejamento(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  
  -- Configuração de publicação
  plataformas JSONB NOT NULL, -- ["instagram", "facebook", "linkedin"]
  data_agendamento TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'pendente', -- pendente, processando, publicado, erro
  tentativas INTEGER DEFAULT 0,
  max_tentativas INTEGER DEFAULT 3,
  
  -- Resultados
  resultado JSONB, -- {platform: {success: bool, post_id: string, error: string}}
  erro_mensagem TEXT,
  
  -- Dados do post para publicação
  texto_publicacao TEXT,
  imagem_url TEXT,
  video_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  publicado_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_queue_status ON publicacao_queue(status, data_agendamento);
CREATE INDEX idx_queue_cliente ON publicacao_queue(cliente_id);

-- FASE 3: Sistema de A/B Testing
CREATE TABLE IF NOT EXISTS post_ab_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts_planejamento(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  
  -- Configuração do teste
  teste_nome TEXT NOT NULL,
  variacao_letra TEXT NOT NULL, -- 'A', 'B', 'C'
  
  -- Conteúdo da variação
  texto_estruturado TEXT NOT NULL,
  abordagem TEXT, -- 'emocional', 'racional', 'urgencia', 'social_proof'
  framework_usado TEXT, -- 'AIDA', 'PAS', 'CTA'
  
  -- Métricas da variação
  impressoes INTEGER DEFAULT 0,
  engajamentos INTEGER DEFAULT 0,
  conversoes INTEGER DEFAULT 0,
  taxa_conversao DECIMAL(5,2) DEFAULT 0,
  
  -- Status
  is_vencedora BOOLEAN DEFAULT false,
  is_ativa BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ab_post ON post_ab_variations(post_id);
CREATE INDEX idx_ab_teste ON post_ab_variations(teste_nome);
CREATE INDEX idx_ab_performance ON post_ab_variations(taxa_conversao DESC);

-- Comentários
COMMENT ON TABLE post_performance_metrics IS 'Métricas históricas para ML preditivo';
COMMENT ON TABLE publicacao_queue IS 'Fila de publicação automática em redes sociais';
COMMENT ON TABLE post_ab_variations IS 'Variações de texto para testes A/B';
