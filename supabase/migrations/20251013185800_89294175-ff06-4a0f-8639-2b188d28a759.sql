-- ============================================
-- FASE 1: PERFORMANCE OPTIMIZATION INDEXES
-- Objetivo: Reduzir 40-50% da lentidão via índices compostos
-- ============================================

-- Índices para transacoes_financeiras (queries financeiras mais frequentes)
CREATE INDEX IF NOT EXISTS idx_transacoes_data_tipo 
  ON transacoes_financeiras(data_vencimento, tipo);

CREATE INDEX IF NOT EXISTS idx_transacoes_cliente_data 
  ON transacoes_financeiras(cliente_id, data_vencimento);

CREATE INDEX IF NOT EXISTS idx_transacoes_categoria_tipo 
  ON transacoes_financeiras(categoria_id, tipo);

-- Índices para projetos (dashboard GRS e filtros)
CREATE INDEX IF NOT EXISTS idx_projetos_cliente_status 
  ON projetos(cliente_id, status);

CREATE INDEX IF NOT EXISTS idx_projetos_responsavel_status 
  ON projetos(responsavel_grs_id, status);

-- Índices para tarefas (visões de execução por módulo)
CREATE INDEX IF NOT EXISTS idx_tarefa_executor_status 
  ON tarefa(executor_id, status);

CREATE INDEX IF NOT EXISTS idx_tarefa_projeto_status 
  ON tarefa(projeto_id, status);

-- Índices para aprovações (área do cliente)
CREATE INDEX IF NOT EXISTS idx_aprovacoes_cliente_status 
  ON aprovacoes_cliente(cliente_id, status);

-- Índices para posts (calendário editorial)
CREATE INDEX IF NOT EXISTS idx_posts_planejamento_data 
  ON posts_planejamento(planejamento_id, data_postagem);

-- Atualizar estatísticas do otimizador para uso imediato
ANALYZE transacoes_financeiras;
ANALYZE projetos;
ANALYZE tarefa;
ANALYZE aprovacoes_cliente;
ANALYZE posts_planejamento;