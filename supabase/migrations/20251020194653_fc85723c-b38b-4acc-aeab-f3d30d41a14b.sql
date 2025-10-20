-- ============================================================
-- SPRINT 4: RELACIONAMENTOS CRÍTICOS
-- Adiciona 8 Foreign Keys essenciais para integridade operacional
-- ============================================================

-- ============================================================
-- PARTE 1: ANEXOS E BRIEFINGS
-- ============================================================

-- Validar dados existentes antes de adicionar FKs
DO $$ 
BEGIN
  -- Verificar anexos órfãos (sem tarefa válida)
  IF EXISTS (
    SELECT 1 FROM anexo a 
    WHERE NOT EXISTS (SELECT 1 FROM tarefa t WHERE t.id = a.tarefa_id)
  ) THEN
    RAISE WARNING 'Existem anexos órfãos sem tarefa válida';
  END IF;

  -- Verificar briefings órfãos
  IF EXISTS (
    SELECT 1 FROM briefings b 
    WHERE b.tarefa_id IS NOT NULL 
    AND NOT EXISTS (SELECT 1 FROM tarefa t WHERE t.id = b.tarefa_id)
  ) THEN
    RAISE WARNING 'Existem briefings órfãos sem tarefa válida';
  END IF;

  IF EXISTS (
    SELECT 1 FROM briefings b 
    WHERE NOT EXISTS (SELECT 1 FROM clientes c WHERE c.id = b.cliente_id)
  ) THEN
    RAISE WARNING 'Existem briefings sem cliente válido';
  END IF;
END $$;

-- FK 1: anexo.tarefa_id → tarefa(id) ON DELETE CASCADE
ALTER TABLE anexo
DROP CONSTRAINT IF EXISTS fk_anexo_tarefa;

ALTER TABLE anexo
ADD CONSTRAINT fk_anexo_tarefa
FOREIGN KEY (tarefa_id) REFERENCES tarefa(id)
ON DELETE CASCADE;

-- FK 2: briefings.tarefa_id → tarefa(id) ON DELETE SET NULL
ALTER TABLE briefings
DROP CONSTRAINT IF EXISTS fk_briefings_tarefa;

ALTER TABLE briefings
ADD CONSTRAINT fk_briefings_tarefa
FOREIGN KEY (tarefa_id) REFERENCES tarefa(id)
ON DELETE SET NULL;

-- FK 3: briefings.cliente_id → clientes(id) ON DELETE CASCADE
ALTER TABLE briefings
DROP CONSTRAINT IF EXISTS fk_briefings_cliente;

ALTER TABLE briefings
ADD CONSTRAINT fk_briefings_cliente
FOREIGN KEY (cliente_id) REFERENCES clientes(id)
ON DELETE CASCADE;

-- ============================================================
-- PARTE 2: APROVAÇÕES DE CLIENTE
-- ============================================================

-- Validar dados existentes
DO $$ 
BEGIN
  -- Verificar aprovações órfãs
  IF EXISTS (
    SELECT 1 FROM aprovacoes_cliente a 
    WHERE a.tarefa_id IS NOT NULL 
    AND NOT EXISTS (SELECT 1 FROM tarefa t WHERE t.id = a.tarefa_id)
  ) THEN
    RAISE WARNING 'Existem aprovações órfãs sem tarefa válida';
  END IF;

  IF EXISTS (
    SELECT 1 FROM aprovacoes_cliente a 
    WHERE a.projeto_id IS NOT NULL 
    AND NOT EXISTS (SELECT 1 FROM projetos p WHERE p.id = a.projeto_id)
  ) THEN
    RAISE WARNING 'Existem aprovações órfãs sem projeto válido';
  END IF;

  IF EXISTS (
    SELECT 1 FROM aprovacoes_cliente a 
    WHERE NOT EXISTS (SELECT 1 FROM clientes c WHERE c.id = a.cliente_id)
  ) THEN
    RAISE WARNING 'Existem aprovações sem cliente válido';
  END IF;
END $$;

-- FK 4: aprovacoes_cliente.tarefa_id → tarefa(id) ON DELETE CASCADE
ALTER TABLE aprovacoes_cliente
DROP CONSTRAINT IF EXISTS fk_aprovacoes_tarefa;

ALTER TABLE aprovacoes_cliente
ADD CONSTRAINT fk_aprovacoes_tarefa
FOREIGN KEY (tarefa_id) REFERENCES tarefa(id)
ON DELETE CASCADE;

-- FK 5: aprovacoes_cliente.projeto_id → projetos(id) ON DELETE CASCADE
ALTER TABLE aprovacoes_cliente
DROP CONSTRAINT IF EXISTS fk_aprovacoes_projeto;

ALTER TABLE aprovacoes_cliente
ADD CONSTRAINT fk_aprovacoes_projeto
FOREIGN KEY (projeto_id) REFERENCES projetos(id)
ON DELETE CASCADE;

-- FK 6: aprovacoes_cliente.cliente_id → clientes(id) ON DELETE CASCADE
ALTER TABLE aprovacoes_cliente
DROP CONSTRAINT IF EXISTS fk_aprovacoes_cliente;

ALTER TABLE aprovacoes_cliente
ADD CONSTRAINT fk_aprovacoes_cliente
FOREIGN KEY (cliente_id) REFERENCES clientes(id)
ON DELETE CASCADE;

-- ============================================================
-- PARTE 3: INTEGRAÇÃO FINANCEIRA OPERACIONAL
-- ============================================================

-- Verificar se tabela financeiro_lancamentos existe
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'financeiro_lancamentos') THEN
    
    -- Validar dados existentes
    IF EXISTS (
      SELECT 1 FROM financeiro_lancamentos f 
      WHERE f.tarefa_id IS NOT NULL 
      AND NOT EXISTS (SELECT 1 FROM tarefa t WHERE t.id = f.tarefa_id)
    ) THEN
      RAISE WARNING 'Existem lançamentos financeiros órfãos sem tarefa válida';
    END IF;

    -- FK 7: financeiro_lancamentos.tarefa_id → tarefa(id) ON DELETE SET NULL
    EXECUTE 'ALTER TABLE financeiro_lancamentos DROP CONSTRAINT IF EXISTS fk_financeiro_tarefa';
    
    EXECUTE 'ALTER TABLE financeiro_lancamentos
    ADD CONSTRAINT fk_financeiro_tarefa
    FOREIGN KEY (tarefa_id) REFERENCES tarefa(id)
    ON DELETE SET NULL';

  ELSE
    RAISE NOTICE 'Tabela financeiro_lancamentos não existe, FK não criada';
  END IF;

  -- Verificar se eventos_calendario existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'eventos_calendario') 
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'financeiro_lancamentos') THEN
    
    -- Validar dados existentes
    IF EXISTS (
      SELECT 1 FROM financeiro_lancamentos f 
      WHERE f.evento_id IS NOT NULL 
      AND NOT EXISTS (SELECT 1 FROM eventos_calendario e WHERE e.id = f.evento_id)
    ) THEN
      RAISE WARNING 'Existem lançamentos financeiros órfãos sem evento válido';
    END IF;

    -- FK 8: financeiro_lancamentos.evento_id → eventos_calendario(id) ON DELETE SET NULL
    EXECUTE 'ALTER TABLE financeiro_lancamentos DROP CONSTRAINT IF EXISTS fk_financeiro_evento';
    
    EXECUTE 'ALTER TABLE financeiro_lancamentos
    ADD CONSTRAINT fk_financeiro_evento
    FOREIGN KEY (evento_id) REFERENCES eventos_calendario(id)
    ON DELETE SET NULL';

  ELSE
    RAISE NOTICE 'Tabela eventos_calendario não existe, FK não criada';
  END IF;
END $$;

-- ============================================================
-- ÍNDICES DE PERFORMANCE PARA JOINS
-- ============================================================

-- Índices para anexos
CREATE INDEX IF NOT EXISTS idx_anexo_tarefa_id ON anexo(tarefa_id);

-- Índices para briefings
CREATE INDEX IF NOT EXISTS idx_briefings_tarefa_id ON briefings(tarefa_id);
CREATE INDEX IF NOT EXISTS idx_briefings_cliente_id ON briefings(cliente_id);

-- Índices para aprovações
CREATE INDEX IF NOT EXISTS idx_aprovacoes_tarefa_id ON aprovacoes_cliente(tarefa_id);
CREATE INDEX IF NOT EXISTS idx_aprovacoes_projeto_id ON aprovacoes_cliente(projeto_id);
CREATE INDEX IF NOT EXISTS idx_aprovacoes_cliente_id ON aprovacoes_cliente(cliente_id);

-- Índices financeiros (se existirem)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'financeiro_lancamentos') THEN
    CREATE INDEX IF NOT EXISTS idx_financeiro_tarefa_id ON financeiro_lancamentos(tarefa_id);
    CREATE INDEX IF NOT EXISTS idx_financeiro_evento_id ON financeiro_lancamentos(evento_id);
  END IF;
END $$;

-- ============================================================
-- COMENTÁRIOS DE DOCUMENTAÇÃO
-- ============================================================

COMMENT ON CONSTRAINT fk_anexo_tarefa ON anexo IS 
'Sprint 4: Garante que anexos sempre pertencem a tarefas válidas';

COMMENT ON CONSTRAINT fk_briefings_tarefa ON briefings IS 
'Sprint 4: Vincula briefings a tarefas, permite null se tarefa deletada';

COMMENT ON CONSTRAINT fk_briefings_cliente ON briefings IS 
'Sprint 4: Garante integridade entre briefings e clientes';

COMMENT ON CONSTRAINT fk_aprovacoes_tarefa ON aprovacoes_cliente IS 
'Sprint 4: Remove aprovações quando tarefa é deletada';

COMMENT ON CONSTRAINT fk_aprovacoes_projeto ON aprovacoes_cliente IS 
'Sprint 4: Remove aprovações quando projeto é deletado';

COMMENT ON CONSTRAINT fk_aprovacoes_cliente ON aprovacoes_cliente IS 
'Sprint 4: Remove aprovações quando cliente é deletado';

-- ============================================================
-- LOG DE AUDITORIA
-- ============================================================

INSERT INTO audit_trail (
  entidade_tipo,
  entidade_id,
  acao,
  acao_detalhe,
  user_id,
  dados_depois
) VALUES (
  'sistema',
  gen_random_uuid(),
  'migration',
  'Sprint 4: Adicionados 8 Foreign Keys críticos para integridade operacional',
  NULL,
  jsonb_build_object(
    'fks_adicionados', 8,
    'tabelas_afetadas', ARRAY['anexo', 'briefings', 'aprovacoes_cliente', 'financeiro_lancamentos'],
    'indices_criados', 8,
    'sprint', 4
  )
);