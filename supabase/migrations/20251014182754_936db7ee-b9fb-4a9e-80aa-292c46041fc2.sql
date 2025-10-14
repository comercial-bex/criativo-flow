-- FASE 7: Índices no banco de dados (APENAS COLUNAS EXISTENTES)
-- Criando índices apenas em colunas que sabemos que existem

-- ============================================================================
-- ÍNDICES BÁSICOS E ESSENCIAIS
-- ============================================================================

-- Índice para clientes por status
CREATE INDEX IF NOT EXISTS idx_clientes_status ON clientes(status);

-- Índice para projetos por status
CREATE INDEX IF NOT EXISTS idx_projetos_status ON projetos(status);

-- Índice para projetos por cliente
CREATE INDEX IF NOT EXISTS idx_projetos_cliente ON projetos(cliente_id);

-- Índice para tarefas por cliente
CREATE INDEX IF NOT EXISTS idx_tarefa_cliente ON tarefa(cliente_id);

-- Índice para tarefas por projeto
CREATE INDEX IF NOT EXISTS idx_tarefa_projeto ON tarefa(projeto_id);

-- Índice para tarefas por responsável
CREATE INDEX IF NOT EXISTS idx_tarefa_responsavel ON tarefa(responsavel_id);

-- Índice para tarefas por executor
CREATE INDEX IF NOT EXISTS idx_tarefa_executor ON tarefa(executor_id);

-- Índice para tarefas por status
CREATE INDEX IF NOT EXISTS idx_tarefa_status ON tarefa(status);

-- Índice para aprovações por cliente
CREATE INDEX IF NOT EXISTS idx_aprovacoes_cliente ON aprovacoes_cliente(cliente_id);

-- Índice para aprovações por status
CREATE INDEX IF NOT EXISTS idx_aprovacoes_status ON aprovacoes_cliente(status);

-- Índice para planejamentos por cliente
CREATE INDEX IF NOT EXISTS idx_planejamentos_cliente ON planejamentos(cliente_id);

-- Índice para posts por planejamento
CREATE INDEX IF NOT EXISTS idx_posts_planejamento ON posts_planejamento(planejamento_id);

-- Índice para profiles por especialidade
CREATE INDEX IF NOT EXISTS idx_profiles_especialidade ON profiles(especialidade) WHERE especialidade IS NOT NULL;

-- Índice para profiles por cliente
CREATE INDEX IF NOT EXISTS idx_profiles_cliente ON profiles(cliente_id) WHERE cliente_id IS NOT NULL;

-- Índice para user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles ON user_roles(user_id, role);

-- Índice para eventos por responsável
CREATE INDEX IF NOT EXISTS idx_eventos_responsavel ON eventos_calendario(responsavel_id);

-- Índice para eventos por projeto
CREATE INDEX IF NOT EXISTS idx_eventos_projeto ON eventos_calendario(projeto_id);

-- Índice para logs por cliente
CREATE INDEX IF NOT EXISTS idx_logs_cliente ON logs_atividade(cliente_id);

-- Índice para logs por trace_id
CREATE INDEX IF NOT EXISTS idx_logs_trace ON logs_atividade(trace_id) WHERE trace_id IS NOT NULL;

-- ============================================================================
-- ANÁLISE E OTIMIZAÇÃO
-- ============================================================================

ANALYZE clientes;
ANALYZE projetos;
ANALYZE tarefa;
ANALYZE aprovacoes_cliente;
ANALYZE planejamentos;
ANALYZE posts_planejamento;
ANALYZE profiles;
ANALYZE eventos_calendario;
ANALYZE logs_atividade;

INSERT INTO system_health_logs (check_type, status, details)
VALUES (
  'database_indexes',
  'ok',
  jsonb_build_object(
    'action', 'created_performance_indexes',
    'timestamp', NOW(),
    'indexes_created', 20,
    'fase', 7
  )
);