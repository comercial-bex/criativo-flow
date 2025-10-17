-- =====================================================
-- OTIMIZAÇÃO DE PERFORMANCE - ÍNDICES COMPOSTOS (CORRIGIDO)
-- Criado para reduzir table scans e melhorar queries
-- =====================================================

-- 1️⃣ FINANCEIRO: Lançamentos por data e tipo
CREATE INDEX IF NOT EXISTS idx_financeiro_lancamentos_data_tipo 
ON financeiro_lancamentos(data_lancamento DESC, tipo_origem);

-- 2️⃣ FINANCEIRO: Lançamentos por conta débito
CREATE INDEX IF NOT EXISTS idx_financeiro_lancamentos_conta_debito 
ON financeiro_lancamentos(conta_debito_id);

-- 3️⃣ FINANCEIRO: Lançamentos por conta crédito
CREATE INDEX IF NOT EXISTS idx_financeiro_lancamentos_conta_credito 
ON financeiro_lancamentos(conta_credito_id);

-- 4️⃣ RH: Folha de ponto por colaborador e competência
CREATE INDEX IF NOT EXISTS idx_rh_folha_ponto_colaborador_competencia 
ON rh_folha_ponto(colaborador_id, competencia DESC);

-- 5️⃣ RH: Adiantamentos por pessoa e competência
CREATE INDEX IF NOT EXISTS idx_financeiro_adiantamentos_pessoa_competencia 
ON financeiro_adiantamentos(pessoa_id, competencia DESC) 
WHERE status != 'cancelado';

-- 6️⃣ EVENTOS: Calendário por responsável e data
CREATE INDEX IF NOT EXISTS idx_eventos_calendario_responsavel_data 
ON eventos_calendario(responsavel_id, data_inicio DESC);

-- 7️⃣ EVENTOS: Calendário por projeto
CREATE INDEX IF NOT EXISTS idx_eventos_calendario_projeto 
ON eventos_calendario(projeto_id) 
WHERE projeto_id IS NOT NULL;

-- 8️⃣ TAREFAS: Por executor e status (CORRIGIDO: status ao invés de status_tarefa)
CREATE INDEX IF NOT EXISTS idx_tarefa_executor_status 
ON tarefa(executor_id, status) 
WHERE executor_id IS NOT NULL;

-- 9️⃣ TAREFAS: Por responsável e prazo
CREATE INDEX IF NOT EXISTS idx_tarefa_responsavel_prazo 
ON tarefa(responsavel_id, prazo_executor DESC);

-- 🔟 PROJETOS: Por cliente e status
CREATE INDEX IF NOT EXISTS idx_projetos_cliente_status 
ON projetos(cliente_id, status);

-- 1️⃣1️⃣ PLANEJAMENTOS: Por cliente e mês referência
CREATE INDEX IF NOT EXISTS idx_planejamentos_cliente_mes 
ON planejamentos(cliente_id, mes_referencia DESC);

-- 1️⃣2️⃣ POSTS: Por planejamento e data
CREATE INDEX IF NOT EXISTS idx_posts_planejamento_data 
ON posts_planejamento(planejamento_id, data_postagem DESC);

-- 1️⃣3️⃣ APROVAÇÕES: Por cliente e status
CREATE INDEX IF NOT EXISTS idx_aprovacoes_cliente_status 
ON aprovacoes_cliente(cliente_id, status);

-- 1️⃣4️⃣ NOTIFICAÇÕES: Por usuário e lida
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_lida 
ON notificacoes(user_id, lida, created_at DESC);

-- 1️⃣5️⃣ PROFILES: Por cliente_id (para queries de time)
CREATE INDEX IF NOT EXISTS idx_profiles_cliente 
ON profiles(cliente_id) 
WHERE cliente_id IS NOT NULL;

COMMENT ON INDEX idx_financeiro_lancamentos_data_tipo IS 'Otimiza filtros por período e tipo de lançamento';
COMMENT ON INDEX idx_rh_folha_ponto_colaborador_competencia IS 'Otimiza busca de ponto por colaborador e mês';
COMMENT ON INDEX idx_eventos_calendario_responsavel_data IS 'Otimiza agenda por responsável';
COMMENT ON INDEX idx_tarefa_executor_status IS 'Otimiza minhas tarefas por status';
COMMENT ON INDEX idx_notificacoes_usuario_lida IS 'Otimiza busca de notificações não lidas';
