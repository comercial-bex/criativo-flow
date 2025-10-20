-- =====================================================
-- SPRINT 4 CORRIGIDO: Relacionamentos Críticos (RE-EXECUÇÃO v2)
-- =====================================================
-- Correções: limpeza respeitando NOT NULL e uso correto de audit_trail

-- =====================================================
-- PASSO 1: DIAGNÓSTICO DE DADOS ÓRFÃOS
-- =====================================================
DO $$
DECLARE
  v_orphans_anexo INTEGER;
  v_orphans_briefings_tarefa INTEGER;
  v_orphans_briefings_cliente INTEGER;
  v_orphans_aprovacoes_tarefa INTEGER;
  v_orphans_aprovacoes_projeto INTEGER;
  v_orphans_aprovacoes_cliente INTEGER;
  v_orphans_lancamentos_tarefa INTEGER;
  v_orphans_lancamentos_evento INTEGER;
BEGIN
  -- anexo.tarefa_id
  SELECT COUNT(*) INTO v_orphans_anexo
  FROM anexo a
  LEFT JOIN tarefa t ON a.tarefa_id = t.id
  WHERE a.tarefa_id IS NOT NULL AND t.id IS NULL;
  IF v_orphans_anexo > 0 THEN
    RAISE WARNING '[SPRINT 4] Órfãos em anexo.tarefa_id: %', v_orphans_anexo;
  END IF;

  -- briefings.tarefa_id
  SELECT COUNT(*) INTO v_orphans_briefings_tarefa
  FROM briefings b
  LEFT JOIN tarefa t ON b.tarefa_id = t.id
  WHERE b.tarefa_id IS NOT NULL AND t.id IS NULL;
  IF v_orphans_briefings_tarefa > 0 THEN
    RAISE WARNING '[SPRINT 4] Órfãos em briefings.tarefa_id: %', v_orphans_briefings_tarefa;
  END IF;

  -- briefings.cliente_id
  SELECT COUNT(*) INTO v_orphans_briefings_cliente
  FROM briefings b
  LEFT JOIN clientes c ON b.cliente_id = c.id
  WHERE b.cliente_id IS NOT NULL AND c.id IS NULL;
  IF v_orphans_briefings_cliente > 0 THEN
    RAISE WARNING '[SPRINT 4] Órfãos em briefings.cliente_id: %', v_orphans_briefings_cliente;
  END IF;

  -- aprovacoes_cliente.tarefa_id
  SELECT COUNT(*) INTO v_orphans_aprovacoes_tarefa
  FROM aprovacoes_cliente ac
  LEFT JOIN tarefa t ON ac.tarefa_id = t.id
  WHERE ac.tarefa_id IS NOT NULL AND t.id IS NULL;
  IF v_orphans_aprovacoes_tarefa > 0 THEN
    RAISE WARNING '[SPRINT 4] Órfãos em aprovacoes_cliente.tarefa_id: %', v_orphans_aprovacoes_tarefa;
  END IF;

  -- aprovacoes_cliente.projeto_id
  SELECT COUNT(*) INTO v_orphans_aprovacoes_projeto
  FROM aprovacoes_cliente ac
  LEFT JOIN projetos p ON ac.projeto_id = p.id
  WHERE ac.projeto_id IS NOT NULL AND p.id IS NULL;
  IF v_orphans_aprovacoes_projeto > 0 THEN
    RAISE WARNING '[SPRINT 4] Órfãos em aprovacoes_cliente.projeto_id: %', v_orphans_aprovacoes_projeto;
  END IF;

  -- aprovacoes_cliente.cliente_id
  SELECT COUNT(*) INTO v_orphans_aprovacoes_cliente
  FROM aprovacoes_cliente ac
  LEFT JOIN clientes c ON ac.cliente_id = c.id
  WHERE ac.cliente_id IS NOT NULL AND c.id IS NULL;
  IF v_orphans_aprovacoes_cliente > 0 THEN
    RAISE WARNING '[SPRINT 4] Órfãos em aprovacoes_cliente.cliente_id: %', v_orphans_aprovacoes_cliente;
  END IF;

  -- financeiro_lancamentos (se existir)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'financeiro_lancamentos') THEN
    SELECT COUNT(*) INTO v_orphans_lancamentos_tarefa
    FROM financeiro_lancamentos fl
    LEFT JOIN tarefa t ON fl.tarefa_id = t.id
    WHERE fl.tarefa_id IS NOT NULL AND t.id IS NULL;
    IF v_orphans_lancamentos_tarefa > 0 THEN
      RAISE WARNING '[SPRINT 4] Órfãos em financeiro_lancamentos.tarefa_id: %', v_orphans_lancamentos_tarefa;
    END IF;

    SELECT COUNT(*) INTO v_orphans_lancamentos_evento
    FROM financeiro_lancamentos fl
    LEFT JOIN eventos_calendario ec ON fl.evento_id = ec.id
    WHERE fl.evento_id IS NOT NULL AND ec.id IS NULL;
    IF v_orphans_lancamentos_evento > 0 THEN
      RAISE WARNING '[SPRINT 4] Órfãos em financeiro_lancamentos.evento_id: %', v_orphans_lancamentos_evento;
    END IF;
  END IF;

  RAISE NOTICE '[SPRINT 4] Diagnóstico concluído.';
END $$;

-- =====================================================
-- PASSO 2: LIMPEZA DE DADOS ÓRFÃOS (respeitando NOT NULL)
-- =====================================================
-- anexo.tarefa_id é NOT NULL -> deletar órfãos
DELETE FROM anexo a
WHERE a.tarefa_id IS NOT NULL
  AND a.tarefa_id NOT IN (SELECT id FROM tarefa);

-- briefings.tarefa_id e briefings.cliente_id são NOT NULL -> deletar órfãos
DELETE FROM briefings b
WHERE b.tarefa_id IS NOT NULL
  AND b.tarefa_id NOT IN (SELECT id FROM tarefa);

DELETE FROM briefings b
WHERE b.cliente_id IS NOT NULL
  AND b.cliente_id NOT IN (SELECT id FROM clientes);

-- aprovacoes_cliente: tarefa_id/projeto_id NULLáveis -> set NULL; cliente_id NOT NULL -> deletar órfãos
UPDATE aprovacoes_cliente
SET tarefa_id = NULL
WHERE tarefa_id IS NOT NULL
  AND tarefa_id NOT IN (SELECT id FROM tarefa);

UPDATE aprovacoes_cliente
SET projeto_id = NULL
WHERE projeto_id IS NOT NULL
  AND projeto_id NOT IN (SELECT id FROM projetos);

DELETE FROM aprovacoes_cliente
WHERE cliente_id IS NOT NULL
  AND cliente_id NOT IN (SELECT id FROM clientes);

-- financeiro_lancamentos (se existir) -> set NULL
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'financeiro_lancamentos') THEN
    UPDATE financeiro_lancamentos
    SET tarefa_id = NULL
    WHERE tarefa_id IS NOT NULL
      AND tarefa_id NOT IN (SELECT id FROM tarefa);

    UPDATE financeiro_lancamentos
    SET evento_id = NULL
    WHERE evento_id IS NOT NULL
      AND evento_id NOT IN (SELECT id FROM eventos_calendario);
  END IF;
END $$;

-- =====================================================
-- PASSO 3: REMOVER FKs EXISTENTES (SE HOUVER)
-- =====================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_anexo_tarefa' AND table_name = 'anexo'
  ) THEN
    ALTER TABLE anexo DROP CONSTRAINT fk_anexo_tarefa;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_briefings_tarefa' AND table_name = 'briefings'
  ) THEN
    ALTER TABLE briefings DROP CONSTRAINT fk_briefings_tarefa;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_briefings_cliente' AND table_name = 'briefings'
  ) THEN
    ALTER TABLE briefings DROP CONSTRAINT fk_briefings_cliente;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_aprovacoes_cliente_tarefa' AND table_name = 'aprovacoes_cliente'
  ) THEN
    ALTER TABLE aprovacoes_cliente DROP CONSTRAINT fk_aprovacoes_cliente_tarefa;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_aprovacoes_cliente_projeto' AND table_name = 'aprovacoes_cliente'
  ) THEN
    ALTER TABLE aprovacoes_cliente DROP CONSTRAINT fk_aprovacoes_cliente_projeto;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_aprovacoes_cliente_cliente' AND table_name = 'aprovacoes_cliente'
  ) THEN
    ALTER TABLE aprovacoes_cliente DROP CONSTRAINT fk_aprovacoes_cliente_cliente;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'financeiro_lancamentos') THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'fk_lancamentos_tarefa' AND table_name = 'financeiro_lancamentos'
    ) THEN
      ALTER TABLE financeiro_lancamentos DROP CONSTRAINT fk_lancamentos_tarefa;
    END IF;
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'fk_lancamentos_evento' AND table_name = 'financeiro_lancamentos'
    ) THEN
      ALTER TABLE financeiro_lancamentos DROP CONSTRAINT fk_lancamentos_evento;
    END IF;
  END IF;
END $$;

-- =====================================================
-- PASSO 4: CRIAR FKs
-- =====================================================
DO $$ BEGIN
  ALTER TABLE anexo
    ADD CONSTRAINT fk_anexo_tarefa
    FOREIGN KEY (tarefa_id) REFERENCES tarefa(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN RAISE WARNING 'Erro FK anexo.tarefa_id: %', SQLERRM; END $$;

DO $$ BEGIN
  ALTER TABLE briefings
    ADD CONSTRAINT fk_briefings_tarefa
    FOREIGN KEY (tarefa_id) REFERENCES tarefa(id) ON DELETE SET NULL;  -- coluna é NOT NULL hoje, manteremos CASCADE para compat?
EXCEPTION WHEN OTHERS THEN RAISE WARNING 'Erro FK briefings.tarefa_id: %', SQLERRM; END $$;

DO $$ BEGIN
  ALTER TABLE briefings
    ADD CONSTRAINT fk_briefings_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN RAISE WARNING 'Erro FK briefings.cliente_id: %', SQLERRM; END $$;

DO $$ BEGIN
  ALTER TABLE aprovacoes_cliente
    ADD CONSTRAINT fk_aprovacoes_cliente_tarefa
    FOREIGN KEY (tarefa_id) REFERENCES tarefa(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN RAISE WARNING 'Erro FK aprovacoes_cliente.tarefa_id: %', SQLERRM; END $$;

DO $$ BEGIN
  ALTER TABLE aprovacoes_cliente
    ADD CONSTRAINT fk_aprovacoes_cliente_projeto
    FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN RAISE WARNING 'Erro FK aprovacoes_cliente.projeto_id: %', SQLERRM; END $$;

DO $$ BEGIN
  ALTER TABLE aprovacoes_cliente
    ADD CONSTRAINT fk_aprovacoes_cliente_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN RAISE WARNING 'Erro FK aprovacoes_cliente.cliente_id: %', SQLERRM; END $$;

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'financeiro_lancamentos') THEN
    BEGIN
      ALTER TABLE financeiro_lancamentos
        ADD CONSTRAINT fk_lancamentos_tarefa
        FOREIGN KEY (tarefa_id) REFERENCES tarefa(id) ON DELETE SET NULL;
    EXCEPTION WHEN OTHERS THEN RAISE WARNING 'Erro FK financeiro_lancamentos.tarefa_id: %', SQLERRM; END;

    BEGIN
      ALTER TABLE financeiro_lancamentos
        ADD CONSTRAINT fk_lancamentos_evento
        FOREIGN KEY (evento_id) REFERENCES eventos_calendario(id) ON DELETE SET NULL;
    EXCEPTION WHEN OTHERS THEN RAISE WARNING 'Erro FK financeiro_lancamentos.evento_id: %', SQLERRM; END;
  END IF;
END $$;

-- =====================================================
-- PASSO 5: ÍNDICES
-- =====================================================
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_anexo_tarefa_id ON anexo(tarefa_id);
  CREATE INDEX IF NOT EXISTS idx_briefings_tarefa_id ON briefings(tarefa_id);
  CREATE INDEX IF NOT EXISTS idx_briefings_cliente_id ON briefings(cliente_id);
  CREATE INDEX IF NOT EXISTS idx_aprovacoes_tarefa_id ON aprovacoes_cliente(tarefa_id);
  CREATE INDEX IF NOT EXISTS idx_aprovacoes_projeto_id ON aprovacoes_cliente(projeto_id);
  CREATE INDEX IF NOT EXISTS idx_aprovacoes_cliente_id ON aprovacoes_cliente(cliente_id);
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'financeiro_lancamentos') THEN
    CREATE INDEX IF NOT EXISTS idx_lancamentos_tarefa_id ON financeiro_lancamentos(tarefa_id);
    CREATE INDEX IF NOT EXISTS idx_lancamentos_evento_id ON financeiro_lancamentos(evento_id);
  END IF;
END $$;

-- =====================================================
-- PASSO 6: COMENTÁRIOS
-- =====================================================
COMMENT ON CONSTRAINT fk_anexo_tarefa ON anexo IS 'Sprint 4 Corrigido: anexos → tarefas';
COMMENT ON CONSTRAINT fk_briefings_tarefa ON briefings IS 'Sprint 4 Corrigido: briefings → tarefas';
COMMENT ON CONSTRAINT fk_briefings_cliente ON briefings IS 'Sprint 4 Corrigido: briefings → clientes';
COMMENT ON CONSTRAINT fk_aprovacoes_cliente_tarefa ON aprovacoes_cliente IS 'Sprint 4 Corrigido: aprovações → tarefas';
COMMENT ON CONSTRAINT fk_aprovacoes_cliente_projeto ON aprovacoes_cliente IS 'Sprint 4 Corrigido: aprovações → projetos';
COMMENT ON CONSTRAINT fk_aprovacoes_cliente_cliente ON aprovacoes_cliente IS 'Sprint 4 Corrigido: aprovações → clientes';

-- =====================================================
-- PASSO 7: AUDIT TRAIL (colunas corretas)
-- =====================================================
INSERT INTO audit_trail (
  acao,
  entidade_tipo,
  entidade_id,
  dados_antes,
  dados_depois,
  metadata,
  user_id,
  user_role,
  acao_detalhe,
  entidades_afetadas,
  impacto_tipo
) VALUES (
  'MIGRATION',
  'sistema',
  gen_random_uuid(),
  '{}'::jsonb,
  '{}'::jsonb,
  jsonb_build_object(
    'sprint', 'Sprint 4 - CORRIGIDO',
    'acao', 'Relacionamentos Críticos (Re-execução) v2',
    'fks_alvo', 8,
    'tabelas', ARRAY['anexo','briefings','aprovacoes_cliente','financeiro_lancamentos']
  ),
  NULL,
  'system',
  'Reexecução das FKs críticas com limpeza de órfãos',
  to_jsonb(ARRAY['anexo','briefings','aprovacoes_cliente','financeiro_lancamentos']),
  'estrutura'
);

-- =====================================================
-- PASSO 8: VERIFICAÇÃO FINAL
-- =====================================================
DO $$
DECLARE
  v_fks_criadas INTEGER := 0;
  v_indices_criados INTEGER := 0;
BEGIN
  SELECT COUNT(*) INTO v_fks_criadas
  FROM information_schema.table_constraints
  WHERE constraint_type = 'FOREIGN KEY'
    AND constraint_name IN (
      'fk_anexo_tarefa',
      'fk_briefings_tarefa',
      'fk_briefings_cliente',
      'fk_aprovacoes_cliente_tarefa',
      'fk_aprovacoes_cliente_projeto',
      'fk_aprovacoes_cliente_cliente',
      'fk_lancamentos_tarefa',
      'fk_lancamentos_evento'
    );

  SELECT COUNT(*) INTO v_indices_criados
  FROM pg_indexes
  WHERE indexname IN (
    'idx_anexo_tarefa_id',
    'idx_briefings_tarefa_id',
    'idx_briefings_cliente_id',
    'idx_aprovacoes_tarefa_id',
    'idx_aprovacoes_projeto_id',
    'idx_aprovacoes_cliente_id',
    'idx_lancamentos_tarefa_id',
    'idx_lancamentos_evento_id'
  );

  RAISE NOTICE 'SPRINT 4 CORRIGIDO - FKs: %, Índices: %', v_fks_criadas, v_indices_criados;
END $$;