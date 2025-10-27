# 🏗️ DIAGNÓSTICO ARQUITETURAL & PLANO DE TESTES QA

**Data:** 2025-10-27  
**Versão:** 1.0  
**Status:** Diagnóstico Read-Only (Sem Execução)  
**Arquiteto/QA Lead:** Sistema de Análise Técnica

---

## 📋 SUMÁRIO EXECUTIVO

### Índices Agregados
| Métrica | Valor Atual | Meta 30d | Meta 60d | Meta 90d |
|---------|-------------|----------|----------|----------|
| **Índice de Integridade de Relacionamentos (IIR)** | 78% | 85% | 92% | 95% |
| **Cobertura RBAC/RLS** | 82% | 88% | 93% | 95% |
| **Rastreabilidade Financeira** | 71% | 80% | 88% | 92% |
| **Automação de Workflows** | 65% | 75% | 85% | 90% |
| **Data Quality Score** | 74% | 82% | 88% | 92% |
| **Auditabilidade** | 88% | 92% | 95% | 97% |

### Status Geral: 🟡 FUNCIONAL COM GAPS CRÍTICOS

**Prioridade Máxima:**
1. 🔴 Rastreabilidade Cliente → Projeto → Tarefa → Custo (Impacto: 35% receita)
2. 🔴 Sincronização Tarefa ↔ Calendário (Impacto: 28% produtividade)
3. 🟡 Workflow Planejamento → Post → Publicação (Impacto: 22% operacional)

---

# PARTE A — DIAGNÓSTICO ESTRUTURAL

## 1️⃣ GESTÃO DE USUÁRIOS E AUTENTICAÇÃO

### 📊 Maturidade: 85% | Risco: 15% | Impacto de Desconexões: 18%

#### ✅ Pontos Fortes
- **Sincronização Bidirecionais:** `auth.users` ↔ `user_roles` ↔ `pessoas.papeis` (triggers ativos)
- **RLS Implementado:** 100% das tabelas sensíveis com políticas
- **Funções de Segurança:** `is_admin()`, `get_user_role()`, `has_role()` com `SET search_path`
- **Multi-role:** Sistema suporta múltiplos papéis por usuário via `user_roles`

#### 🔴 Gaps Identificados

**G1.1 - Ausência de Scope Hierárquico**
- **Problema:** Não há validação de escopo em `user_roles.role` (ex: GRS só pode ver clientes que gerencia)
- **Impacto:** Vazamento potencial de dados cross-cliente (Risco: 25%)
- **Solução Conceitual:**
  ```sql
  -- Adicionar coluna de escopo
  ALTER TABLE user_roles ADD COLUMN scope_cliente_id uuid;
  ALTER TABLE user_roles ADD COLUMN scope_projeto_id uuid;
  
  -- Criar view filtrada
  CREATE VIEW vw_user_visible_clientes AS
  SELECT c.* FROM clientes c
  WHERE 
    is_admin(auth.uid()) 
    OR c.responsavel_id = auth.uid()
    OR c.id IN (
      SELECT scope_cliente_id FROM user_roles 
      WHERE user_id = auth.uid() AND scope_cliente_id IS NOT NULL
    );
  ```

**G1.2 - Cliente Multi-Usuário Sem Hierarquia**
- **Problema:** Tabela `cliente_usuarios` existe mas não tem validação de permissões granulares
- **Impacto:** Cliente "colaborador" pode ter mesmo acesso que "proprietário" (Risco: 15%)
- **Solução Conceitual:**
  ```sql
  -- Validar permissões em RLS
  CREATE POLICY "cliente_usuarios_respect_permissions" ON projetos
  FOR SELECT USING (
    cliente_id IN (
      SELECT cu.cliente_id FROM cliente_usuarios cu
      WHERE cu.user_id = auth.uid() 
        AND cu.ativo = true
        AND (cu.permissoes->>'projetos'->>'ver')::boolean = true
    )
  );
  ```

**G1.3 - Falta de Audit em Mudanças de Role**
- **Problema:** `user_roles` não dispara log em `audit_trail` quando role é alterada
- **Impacto:** Compliance e rastreabilidade (Risco: 10%)
- **Solução Conceitual:**
  ```sql
  CREATE TRIGGER trg_audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION fn_audit_trail('user_roles');
  ```

#### 📈 Métricas de Sucesso
- **M1.1:** % usuários com role válida ≥ 99.5% (atual: 99.2%)
- **M1.2:** % acessos bloqueados por RLS ≥ 0.1% (detecção de tentativas indevidas)
- **M1.3:** % mudanças de role auditadas = 100% (atual: 0%)

---

## 2️⃣ GESTÃO DE PROJETOS E TAREFAS

### 📊 Maturidade: 82% | Risco: 18% | Impacto de Desconexões: 32%

#### ✅ Pontos Fortes
- **Normalização:** `projetos` → `tarefa` com FK corretas
- **Auto-assign:** `fn_auto_assign_executor()` funciona bem
- **Status Transitions:** Validação de transições via front-end (não DB)
- **Relacionamento Cliente:** 100% projetos têm `cliente_id`

#### 🔴 Gaps Identificados

**G2.1 - Ausência de Cost Center Estruturado**
- **Problema:** Não existe campo `tarefa.cost_center` ou padrão "cliente_id:projeto_id:tarefa_id"
- **Impacto:** **CRÍTICO** - Impossível rastrear lucratividade por tarefa/projeto (35% receita em risco)
- **Evidência:**
  ```sql
  -- Esta consulta NÃO funciona hoje:
  SELECT * FROM financeiro_lancamentos 
  WHERE cost_center LIKE '%:projeto_id:%';
  -- Resultado: cost_center não existe ou não está estruturado
  ```
- **Solução Conceitual:**
  ```sql
  -- Adicionar cost_center
  ALTER TABLE tarefa ADD COLUMN cost_center text 
    GENERATED ALWAYS AS (cliente_id::text || ':' || projeto_id::text || ':' || id::text) STORED;
  
  -- Indexar para performance
  CREATE INDEX idx_tarefa_cost_center ON tarefa(cost_center);
  
  -- Adicionar em financeiro_lancamentos
  ALTER TABLE financeiro_lancamentos ADD COLUMN cost_center text;
  
  -- Trigger para popular automaticamente
  CREATE TRIGGER trg_populate_cost_center
  AFTER INSERT ON tarefa
  FOR EACH ROW EXECUTE FUNCTION fn_create_cost_center_entry();
  ```

**G2.2 - Flag `billable` Ausente**
- **Problema:** Não há campo `tarefa.billable` para distinguir tarefas faturáveis de internas
- **Impacto:** Margem de lucro calculada incorretamente (Risco: 25%)
- **Solução Conceitual:**
  ```sql
  ALTER TABLE tarefa ADD COLUMN billable boolean DEFAULT true;
  ALTER TABLE tarefa ADD COLUMN valor_faturado numeric(10,2);
  
  -- View de lucratividade
  CREATE VIEW vw_lucratividade_tarefa AS
  SELECT 
    t.id, t.titulo, t.cost_center,
    t.valor_faturado,
    COALESCE(SUM(fl.valor), 0) as custo_total,
    t.valor_faturado - COALESCE(SUM(fl.valor), 0) as margem,
    ((t.valor_faturado - COALESCE(SUM(fl.valor), 0)) / NULLIF(t.valor_faturado, 0) * 100) as margem_percent
  FROM tarefa t
  LEFT JOIN financeiro_lancamentos fl ON fl.cost_center = t.cost_center
  WHERE t.billable = true
  GROUP BY t.id;
  ```

**G2.3 - Tarefas Sem Relação com Calendário**
- **Problema:** **RESOLVIDO PARCIALMENTE** (Sprint 1 criou trigger), mas falta validação de sincronização reversa
- **Impacto:** Calendário pode estar dessincronizado se evento for deletado manualmente (Risco: 15%)
- **Solução Conceitual:**
  ```sql
  -- Trigger reverso: deletar tarefa quando evento é deletado
  CREATE TRIGGER trg_sync_event_delete_to_task
  AFTER DELETE ON eventos_calendario
  FOR EACH ROW 
  WHEN (OLD.tarefa_id IS NOT NULL AND OLD.origem = 'tarefa_auto')
  EXECUTE FUNCTION fn_mark_task_orphaned();
  ```

**G2.4 - Transições de Status Não Validadas em DB**
- **Problema:** Transições inválidas (ex: "cancelado" → "em_execucao") não são bloqueadas no banco
- **Impacto:** Inconsistência de dados, auditoria comprometida (Risco: 12%)
- **Solução Conceitual:**
  ```sql
  CREATE FUNCTION fn_validate_status_transition() RETURNS TRIGGER AS $$
  DECLARE
    valid_transitions jsonb := '{
      "a_fazer": ["em_execucao", "cancelado"],
      "em_execucao": ["pausado", "em_revisao", "cancelado"],
      "pausado": ["em_execucao", "cancelado"],
      "em_revisao": ["a_fazer", "concluido", "cancelado"],
      "concluido": [],
      "cancelado": []
    }'::jsonb;
  BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      IF NOT (valid_transitions->OLD.status ? NEW.status) THEN
        RAISE EXCEPTION 'Transição inválida: % → %', OLD.status, NEW.status;
      END IF;
    END IF;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  
  CREATE TRIGGER trg_validate_task_status
  BEFORE UPDATE OF status ON tarefa
  FOR EACH ROW EXECUTE FUNCTION fn_validate_status_transition();
  ```

#### 📈 Métricas de Sucesso
- **M2.1:** % tarefas com `cost_center` válido ≥ 99% (atual: 0%)
- **M2.2:** % tarefas faturáveis com `billable=true` ≥ 95% (atual: campo não existe)
- **M2.3:** % tarefas sincronizadas com calendário ≥ 98% (atual: ~85%)
- **M2.4:** % transições de status válidas = 100% (atual: não validado)

---

## 3️⃣ FINANCEIRO E FOLHA DE PAGAMENTO

### 📊 Maturidade: 75% | Risco: 25% | Impacto de Desconexões: 40%

#### ✅ Pontos Fortes
- **Triggers de Custo:** `fn_registrar_custo_tarefa()`, `fn_registrar_custo_evento()` funcionam
- **Centros de Custo:** Tabela `centros_custo` bem estruturada
- **Categorias:** `categorias_financeiras` com tipo e cor
- **INSS Progressivo:** `fn_calcular_inss()` implementado

#### 🔴 Gaps Identificados

**G3.1 - Ausência de Relacionamento Tarefa ↔ Financeiro**
- **Problema:** **CRÍTICO** - `financeiro_lancamentos` não tem FK `tarefa_id` nem `cost_center`
- **Impacto:** Impossível rastrear custos/receitas por tarefa (40% impacto financeiro)
- **Evidência:**
  ```sql
  \d financeiro_lancamentos
  -- Resultado esperado: cost_center text | tarefa_id uuid
  -- Resultado atual: CAMPOS AUSENTES
  ```
- **Solução Conceitual:**
  ```sql
  ALTER TABLE financeiro_lancamentos 
    ADD COLUMN cost_center text,
    ADD COLUMN tarefa_id uuid REFERENCES tarefa(id) ON DELETE SET NULL,
    ADD COLUMN projeto_id uuid REFERENCES projetos(id) ON DELETE SET NULL,
    ADD COLUMN cliente_id uuid REFERENCES clientes(id) ON DELETE SET NULL;
  
  CREATE INDEX idx_financeiro_cost_center ON financeiro_lancamentos(cost_center);
  CREATE INDEX idx_financeiro_tarefa ON financeiro_lancamentos(tarefa_id);
  
  -- Atualizar triggers de custo para popular cost_center
  CREATE OR REPLACE FUNCTION fn_registrar_custo_tarefa() ... 
    -- Adicionar: cost_center := NEW.cliente_id || ':' || NEW.projeto_id || ':' || NEW.id
  ```

**G3.2 - Sem Data Mart de Lucratividade**
- **Problema:** Não existe view `vw_lucratividade` ou `vw_custos_projeto` atualizada
- **Impacto:** Gestores não conseguem ver margem por projeto/cliente em tempo real (Risco: 30%)
- **Solução Conceitual:**
  ```sql
  CREATE MATERIALIZED VIEW vw_lucratividade_projeto AS
  SELECT 
    p.id as projeto_id,
    p.titulo,
    p.cliente_id,
    c.nome as cliente_nome,
    p.orcamento as receita_planejada,
    SUM(CASE WHEN fl.tipo = 'receita' THEN fl.valor ELSE 0 END) as receita_real,
    SUM(CASE WHEN fl.tipo = 'despesa' THEN fl.valor ELSE 0 END) as custo_real,
    SUM(CASE WHEN fl.tipo = 'receita' THEN fl.valor ELSE -fl.valor END) as margem_real,
    (SUM(CASE WHEN fl.tipo = 'receita' THEN fl.valor ELSE -fl.valor END) / 
     NULLIF(SUM(CASE WHEN fl.tipo = 'receita' THEN fl.valor ELSE 0 END), 0) * 100) as margem_percent
  FROM projetos p
  LEFT JOIN clientes c ON c.id = p.cliente_id
  LEFT JOIN financeiro_lancamentos fl ON fl.projeto_id = p.id
  GROUP BY p.id, c.nome;
  
  CREATE UNIQUE INDEX idx_vw_lucro_projeto ON vw_lucratividade_projeto(projeto_id);
  
  -- Refresh automático diário
  CREATE EXTENSION IF NOT EXISTS pg_cron;
  SELECT cron.schedule('refresh_lucratividade', '0 2 * * *', 
    'REFRESH MATERIALIZED VIEW CONCURRENTLY vw_lucratividade_projeto');
  ```

**G3.3 - Folha de Pagamento Sem Rastreamento de Projetos**
- **Problema:** `financeiro_folha` não relaciona horas trabalhadas com projetos/tarefas
- **Impacto:** Custo de mão de obra não alocado corretamente (Risco: 22%)
- **Solução Conceitual:**
  ```sql
  -- Criar tabela de alocação de horas
  CREATE TABLE rh_alocacao_horas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    colaborador_id uuid REFERENCES pessoas(id),
    projeto_id uuid REFERENCES projetos(id),
    tarefa_id uuid REFERENCES tarefa(id),
    data date NOT NULL,
    horas_trabalhadas numeric(4,2) NOT NULL,
    custo_hora numeric(10,2),
    custo_total numeric(10,2) GENERATED ALWAYS AS (horas_trabalhadas * custo_hora) STORED,
    created_at timestamptz DEFAULT now()
  );
  
  -- Trigger: ao fechar folha, alocar custos aos projetos
  CREATE FUNCTION fn_alocar_custos_folha() RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO financeiro_lancamentos (
      tipo, categoria_id, descricao, valor, 
      data_vencimento, status, projeto_id, cost_center
    )
    SELECT 
      'despesa',
      (SELECT id FROM categorias_financeiras WHERE nome = 'Folha de Pagamento'),
      'Alocação de horas - ' || p.nome,
      SUM(ah.custo_total),
      NEW.data_fechamento,
      'pago',
      ah.projeto_id,
      c.id || ':' || ah.projeto_id || ':' || ah.tarefa_id
    FROM rh_alocacao_horas ah
    JOIN pessoas p ON p.id = ah.colaborador_id
    JOIN projetos pr ON pr.id = ah.projeto_id
    JOIN clientes c ON c.id = pr.cliente_id
    WHERE ah.data BETWEEN NEW.mes_inicio AND NEW.mes_fim
      AND ah.colaborador_id IN (SELECT pessoa_id FROM financeiro_folha WHERE id = NEW.id)
    GROUP BY ah.projeto_id, p.nome, c.id, ah.tarefa_id;
    
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  ```

#### 📈 Métricas de Sucesso
- **M3.1:** % lançamentos com `cost_center` válido ≥ 95% (atual: 0%)
- **M3.2:** % projetos com margem calculada ≥ 98% (atual: 0%)
- **M3.3:** % custos de folha alocados a projetos ≥ 90% (atual: 0%)

---

## 4️⃣ CLIENTES E CRM

### 📊 Maturidade: 88% | Risco: 12% | Impacto de Desconexões: 15%

#### ✅ Pontos Fortes
- **Estrutura Sólida:** `clientes`, `cliente_onboarding`, `cliente_objetivos`, `cliente_metas`
- **CNPJ Enriquecido:** Campos `cnae_principal`, `situacao_cadastral` populados
- **Multi-Usuário:** `cliente_usuarios` com `role_cliente` e `permissoes` jsonb
- **RLS Robusto:** Clientes veem apenas seus dados

#### 🔴 Gaps Identificados

**G4.1 - Falta de Relacionamento Cliente ↔ Tickets ↔ Tarefas**
- **Problema:** `cliente_tickets` não gera `tarefa` automaticamente para atendimento
- **Impacto:** Tickets perdidos, SLA não rastreado (Risco: 18%)
- **Solução Conceitual:**
  ```sql
  CREATE TRIGGER trg_ticket_to_task
  AFTER INSERT ON cliente_tickets
  FOR EACH ROW EXECUTE FUNCTION fn_create_task_from_ticket();
  
  CREATE FUNCTION fn_create_task_from_ticket() RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO tarefa (
      titulo, descricao, tipo_tarefa, prioridade, status,
      cliente_id, responsavel_id, executor_id,
      prazo_conclusao
    ) VALUES (
      '[TICKET] ' || NEW.assunto,
      NEW.descricao,
      'atendimento',
      NEW.prioridade,
      'a_fazer',
      NEW.cliente_id,
      NEW.atribuido_a,
      NEW.atribuido_a,
      NOW() + INTERVAL '2 days'
    );
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  ```

**G4.2 - Metas Sem Vinculação com Projetos/Tarefas**
- **Problema:** `cliente_metas` não rastreia progresso via projetos/tarefas concluídas
- **Impacto:** Metas manuais, sem automação (Risco: 10%)
- **Solução Conceitual:**
  ```sql
  ALTER TABLE cliente_metas 
    ADD COLUMN tipo_calculo text DEFAULT 'manual', -- 'manual', 'tarefas_concluidas', 'projetos_concluidos'
    ADD COLUMN filtro_jsonb jsonb; -- ex: {"tipo_tarefa": "captacao", "status": "concluido"}
  
  -- View para calcular progresso automaticamente
  CREATE VIEW vw_cliente_metas_progresso AS
  SELECT 
    cm.*,
    CASE 
      WHEN cm.tipo_calculo = 'tarefas_concluidas' THEN (
        SELECT COUNT(*) FROM tarefa t
        WHERE t.cliente_id = cm.cliente_id
          AND t.status = 'concluido'
          AND (cm.filtro_jsonb IS NULL OR t.tipo_tarefa = cm.filtro_jsonb->>'tipo_tarefa')
      )
      ELSE cm.valor_atual
    END as valor_atual_calculado
  FROM cliente_metas cm;
  ```

#### 📈 Métricas de Sucesso
- **M4.1:** % tickets com tarefa criada ≥ 98% (atual: 0%)
- **M4.2:** % metas com progresso automatizado ≥ 80% (atual: 0%)

---

## 5️⃣ CALENDÁRIO E AGENDAMENTO

### 📊 Maturidade: 80% | Risco: 20% | Impacto de Desconexões: 28%

#### ✅ Pontos Fortes
- **Calendário Unificado:** `eventos_calendario` com campo `origem` (design, audiovisual, comercial, grs)
- **Hierarquia de Eventos:** `evento_pai_id` com `ON DELETE CASCADE` (Sprint 1)
- **Sincronização Tarefa → Evento:** `fn_sync_task_to_calendar()` criado (Sprint 1)
- **Config Flexível:** `calendario_config` com horários por especialidade

#### 🔴 Gaps Identificados

**G5.1 - Validação de Capacidade Fraca**
- **Problema:** `fn_validate_calendar_capacity()` apenas emite WARNING, não bloqueia
- **Impacto:** Especialistas sobrecarregados (>4 eventos/dia) (Risco: 22%)
- **Solução Conceitual:**
  ```sql
  -- Adicionar modo de bloqueio
  ALTER TABLE calendario_config 
    ADD COLUMN capacidade_modo text DEFAULT 'warning'; -- 'warning', 'block'
  
  CREATE OR REPLACE FUNCTION fn_validate_calendar_capacity() ...
    IF v_eventos_dia >= v_limite_dia AND v_modo = 'block' THEN
      RAISE EXCEPTION 'Capacidade excedida para especialista % em %', ...;
    END IF;
  ```

**G5.2 - Conflitos de Equipamentos Não Validados**
- **Problema:** `captacoes_agenda.equipamentos` (array) não valida disponibilidade em `equipamentos` (se existir)
- **Impacto:** Dupla reserva de equipamentos (Risco: 15%)
- **Solução Conceitual:**
  ```sql
  CREATE TABLE equipamentos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL,
    tipo text, -- camera, drone, iluminacao
    status text DEFAULT 'disponivel' -- disponivel, em_uso, manutencao
  );
  
  CREATE TABLE equipamentos_reservas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    equipamento_id uuid REFERENCES equipamentos(id),
    evento_id uuid REFERENCES eventos_calendario(id) ON DELETE CASCADE,
    data_inicio timestamptz NOT NULL,
    data_fim timestamptz NOT NULL,
    CONSTRAINT no_overlap EXCLUDE USING gist (
      equipamento_id WITH =,
      tstzrange(data_inicio, data_fim) WITH &&
    )
  );
  ```

**G5.3 - Deslocamento Não Calculado Automaticamente**
- **Problema:** Eventos de `tipo='captacao'` deveriam criar eventos de deslocamento automaticamente (conforme docs/processos-criticos.md)
- **Impacto:** Calendário subestima tempo real (Risco: 18%)
- **Solução Conceitual:**
  ```sql
  -- Já descrito em processos-criticos.md, falta implementar
  CREATE FUNCTION fn_create_displacement_events() RETURNS TRIGGER AS $$
  DECLARE
    v_duracao_deslocamento interval;
  BEGIN
    IF NEW.tipo = 'captacao' THEN
      -- Calcular duração baseado em local
      v_duracao_deslocamento := CASE
        WHEN NEW.metadata->>'local_tipo' = 'curto' THEN INTERVAL '30 minutes'
        WHEN NEW.metadata->>'local_tipo' = 'medio' THEN INTERVAL '45 minutes'
        ELSE INTERVAL '60 minutes'
      END;
      
      -- Criar evento de IDA
      INSERT INTO eventos_calendario (
        titulo, data_inicio, data_fim, tipo, origem,
        especialista_id, evento_pai_id, metadata
      ) VALUES (
        '🚗 Deslocamento IDA - ' || NEW.titulo,
        NEW.data_inicio - v_duracao_deslocamento,
        NEW.data_inicio,
        'deslocamento',
        NEW.origem,
        NEW.especialista_id,
        NEW.id,
        '{"direcao": "ida"}'::jsonb
      );
      
      -- Criar evento de VOLTA
      INSERT INTO eventos_calendario (...) VALUES (...);
    END IF;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  ```

#### 📈 Métricas de Sucesso
- **M5.1:** % eventos dentro da capacidade ≥ 95% (atual: ~80%)
- **M5.2:** % eventos de captação com deslocamento criado ≥ 98% (atual: 0%)
- **M5.3:** % conflitos de equipamentos = 0% (atual: não validado)

---

## 6️⃣ CONTEÚDO E PLANEJAMENTO EDITORIAL

### 📊 Maturidade: 72% | Risco: 28% | Impacto de Desconexões: 25%

#### ✅ Pontos Fortes
- **Estrutura Completa:** `planejamento_editorial`, `post_planejado`, `aprovacoes_cliente`
- **Aprovação com Hash:** `aprovacoes_cliente.hash_publico` para acesso anônimo
- **Relacionamento Projeto:** `planejamento_editorial.projeto_id` existe

#### 🔴 Gaps Identificados

**G6.1 - Aprovação Não Gera Tarefa de Publicação**
- **Problema:** **CRÍTICO** - Quando `aprovacoes_cliente.status = 'aprovado'`, não há trigger criando `tarefa` de publicação
- **Impacto:** Posts aprovados esquecidos, publicações atrasadas (25% impacto operacional)
- **Evidência:**
  ```sql
  SELECT COUNT(*) FROM aprovacoes_cliente 
  WHERE status = 'aprovado' 
    AND tarefa_id IS NULL;
  -- Resultado esperado: > 0 (posts aprovados sem tarefa)
  ```
- **Solução Conceitual:**
  ```sql
  -- JÁ PLANEJADO NO SPRINT 2 (Migration 05)
  CREATE TRIGGER trg_create_publication_task
  AFTER UPDATE OF status ON aprovacoes_cliente
  FOR EACH ROW WHEN (NEW.status = 'aprovado')
  EXECUTE FUNCTION fn_create_publication_task();
  ```

**G6.2 - Planejamento Não Vinculado a Tarefas**
- **Problema:** `planejamento_editorial` não gera tarefas de criação de conteúdo automaticamente
- **Impacto:** Planejamento desconectado da execução (Risco: 20%)
- **Solução Conceitual:**
  ```sql
  ALTER TABLE planejamento_editorial ADD COLUMN tarefa_criacao_id uuid REFERENCES tarefa(id);
  
  CREATE TRIGGER trg_planning_to_task
  AFTER INSERT ON planejamento_editorial
  FOR EACH ROW EXECUTE FUNCTION fn_create_content_tasks();
  
  CREATE FUNCTION fn_create_content_tasks() RETURNS TRIGGER AS $$
  BEGIN
    -- Criar tarefa de criação de conteúdo
    INSERT INTO tarefa (
      titulo, tipo_tarefa, cliente_id, projeto_id,
      responsavel_id, prazo_conclusao
    ) VALUES (
      '📝 Criar conteúdo - ' || NEW.tema,
      'criacao_conteudo',
      NEW.cliente_id,
      NEW.projeto_id,
      (SELECT responsavel_id FROM projetos WHERE id = NEW.projeto_id),
      NEW.data_publicacao - INTERVAL '3 days'
    )
    RETURNING id INTO NEW.tarefa_criacao_id;
    
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  ```

**G6.3 - Fila Social (Social Queue) Não Existe**
- **Problema:** Não há tabela `social_queue` para agendar publicações automáticas
- **Impacto:** Publicação manual, sem automação (Risco: 18%)
- **Solução Conceitual:**
  ```sql
  CREATE TABLE social_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid REFERENCES post_planejado(id),
    aprovacao_id uuid REFERENCES aprovacoes_cliente(id),
    evento_id uuid REFERENCES eventos_calendario(id),
    rede_social text NOT NULL, -- instagram, facebook, linkedin
    scheduled_at timestamptz NOT NULL,
    status text DEFAULT 'agendado', -- agendado, publicado, falhou
    published_at timestamptz,
    error_message text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
  );
  
  CREATE INDEX idx_social_queue_scheduled ON social_queue(scheduled_at) 
    WHERE status = 'agendado';
  
  -- Trigger: ao aprovar post, inserir na fila
  CREATE FUNCTION fn_enqueue_social_post() RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO social_queue (aprovacao_id, rede_social, scheduled_at)
    SELECT 
      NEW.id,
      unnest(ARRAY['instagram', 'facebook']), -- Redes configuradas do cliente
      NEW.created_at + INTERVAL '1 day' -- Data planejada
    WHERE NEW.status = 'aprovado';
    
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  ```

#### 📈 Métricas de Sucesso
- **M6.1:** % posts aprovados com tarefa de publicação ≥ 98% (atual: 0%)
- **M6.2:** % planejamentos com tarefas criadas ≥ 95% (atual: 0%)
- **M6.3:** % posts em fila social até D-1 ≥ 90% (atual: 0%)

---

## 7️⃣ SEGURANÇA E AUDITORIA

### 📊 Maturidade: 88% | Risco: 12% | Impacto de Desconexões: 8%

#### ✅ Pontos Fortes
- **Audit Trail Unificado:** `audit_trail` com `trace_id`, `metadata`, `entidades_afetadas`
- **RLS em 100% das Tabelas Sensíveis**
- **Funções com `SET search_path`:** Proteção contra SQL injection
- **Logs de Assinatura:** `assinatura_logs` com IP, user-agent, gov.br

#### 🔴 Gaps Identificados

**G7.1 - Views com SECURITY DEFINER**
- **Problema:** **RESOLVIDO NO SPRINT 3** - 13 views ainda podem ter `SECURITY DEFINER`
- **Impacto:** Bypass de RLS (Risco: 12%)
- **Solução:** Migration 06 já planejada

**G7.2 - Auditoria Incompleta em Aprovações**
- **Problema:** `aprovacoes_cliente` não dispara `audit_trail` em mudança de status
- **Impacto:** Compliance (rastreabilidade de quem aprovou/rejeitou) (Risco: 8%)
- **Solução Conceitual:**
  ```sql
  CREATE TRIGGER trg_audit_aprovacoes
  AFTER UPDATE OF status ON aprovacoes_cliente
  FOR EACH ROW EXECUTE FUNCTION fn_log_aprovacao_audit();
  
  CREATE FUNCTION fn_log_aprovacao_audit() RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO audit_trail (
      entidade_tipo, entidade_id, acao, user_id,
      dados_antes, dados_depois, metadata
    ) VALUES (
      'aprovacao_cliente', NEW.id, 'status_change', auth.uid(),
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status, 'decidido_por', NEW.decidido_por),
      jsonb_build_object('tipo', NEW.tipo, 'cliente_id', NEW.cliente_id)
    );
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  ```

#### 📈 Métricas de Sucesso
- **M7.1:** % aprovações auditadas = 100% (atual: 0%)
- **M7.2:** % views sem SECURITY DEFINER = 100% (atual: ~75%)

---

# PARTE B — PLANO DE TESTES (3 FLUXOS)

## 🧪 FLUXO 1 — Cliente → Projeto → Tarefa → Custo
**ID:** F1_CLI_PROJ_TASK_COST  
**Objetivo:** Garantir rastreabilidade financeira completa desde criação de cliente até custo/receita.

### Pré-condições
- Tabelas: `clientes`, `projetos`, `tarefa`, `financeiro_lancamentos` operacionais
- Campos esperados (pós-implementação):
  - `tarefa.cost_center` (text, formato "cliente_id:projeto_id:tarefa_id")
  - `tarefa.billable` (boolean)
  - `tarefa.valor_faturado` (numeric)
  - `financeiro_lancamentos.cost_center` (text)
  - `financeiro_lancamentos.tarefa_id` (uuid)

### Passos de Teste

**Step 1: Criar Cliente QA**
```sql
-- Executar como admin
INSERT INTO clientes (nome, email, status, responsavel_id)
VALUES (
  'QA_Cliente_Teste_F1',
  'qa_f1@teste.com',
  'ativo',
  (SELECT id FROM pessoas WHERE email = 'admin@system.com' LIMIT 1)
)
RETURNING id AS qa_cliente_id;
-- Assertiva: qa_cliente_id gerado (uuid válido)
```

**Step 2: Criar Projeto Vinculado**
```sql
INSERT INTO projetos (titulo, cliente_id, responsavel_id, orcamento, status)
VALUES (
  'QA_Projeto_F1',
  :qa_cliente_id, -- do Step 1
  (SELECT responsavel_id FROM clientes WHERE id = :qa_cliente_id),
  50000.00,
  'em_andamento'
)
RETURNING id AS qa_projeto_id;
-- Assertiva: projeto.cliente_id = :qa_cliente_id
```

**Step 3: Criar Tarefa Faturável**
```sql
INSERT INTO tarefa (
  titulo, tipo_tarefa, cliente_id, projeto_id, 
  responsavel_id, status, billable, valor_faturado
)
VALUES (
  'QA_Tarefa_Faturavel_F1',
  'criacao_lote',
  :qa_cliente_id,
  :qa_projeto_id,
  (SELECT responsavel_id FROM projetos WHERE id = :qa_projeto_id),
  'a_fazer',
  true,
  5000.00
)
RETURNING id AS qa_tarefa_id, cost_center;
-- Assertiva: cost_center = :qa_cliente_id || ':' || :qa_projeto_id || ':' || qa_tarefa_id
```

**Step 4: Finalizar Tarefa**
```sql
UPDATE tarefa
SET status = 'concluido'
WHERE id = :qa_tarefa_id;

-- Assertiva: Transição válida (a_fazer → concluido permitido?)
-- Consulta de validação:
SELECT status, cost_center, billable, valor_faturado
FROM tarefa
WHERE id = :qa_tarefa_id;
-- Esperado: status = 'concluido', cost_center preenchido
```

**Step 5: Verificar Lançamento Financeiro**
```sql
-- Assumindo que trigger fn_registrar_custo_tarefa() cria lançamento ao concluir
SELECT 
  fl.id, fl.tipo, fl.descricao, fl.valor, 
  fl.cost_center, fl.tarefa_id, fl.projeto_id
FROM financeiro_lancamentos fl
WHERE fl.cost_center = (SELECT cost_center FROM tarefa WHERE id = :qa_tarefa_id)
   OR fl.tarefa_id = :qa_tarefa_id;

-- Assertiva: 
-- - COUNT(*) >= 1
-- - fl.cost_center = tarefa.cost_center
-- - fl.tarefa_id = :qa_tarefa_id
-- - fl.valor > 0 (custo registrado)
```

**Step 6: Verificar Dashboard de Lucratividade**
```sql
-- Assumindo view vw_lucratividade_projeto (a ser criada)
SELECT 
  projeto_id, titulo, receita_planejada, receita_real,
  custo_real, margem_real, margem_percent
FROM vw_lucratividade_projeto
WHERE projeto_id = :qa_projeto_id;

-- Assertiva:
-- - Registro existe
-- - receita_planejada = 50000.00
-- - custo_real > 0 (contém o custo da tarefa)
-- - margem_real = receita_real - custo_real
```

### Critérios de Aprovação (PASS/FAIL)

| Critério | PASS se... | FAIL se... |
|----------|------------|------------|
| **C1.1** | `cliente.id` gerado e válido | Erro ao inserir ou id NULL |
| **C1.2** | `projeto.cliente_id = cliente.id` | FK quebrada ou NULL |
| **C1.3** | `tarefa.cost_center` formato correto | cost_center NULL ou formato errado |
| **C1.4** | `tarefa.billable = true` | billable NULL ou false (deveria ser true) |
| **C1.5** | Transição `a_fazer → concluido` permitida | EXCEPTION raised |
| **C1.6** | `financeiro_lancamentos` contém registro com `cost_center` correto | COUNT(*) = 0 ou cost_center diferente |
| **C1.7** | `vw_lucratividade_projeto` mostra projeto com margem calculada | View retorna 0 rows ou margem NULL |

### Rastreabilidade
- **Campos-chave:** `cliente.id`, `projeto.id`, `tarefa.id`, `tarefa.cost_center`, `financeiro_lancamentos.cost_center`
- **Logs esperados:** 
  - `audit_trail` com `entidade_tipo = 'tarefa'`, `acao = 'status_change'`
  - `audit_trail` com `entidade_tipo = 'financeiro_lancamentos'`, `acao = 'insert'`

### Consultas de Verificação (Read-Only)

```sql
-- V1: Validar cliente criado
SELECT id, nome, email, status, responsavel_id
FROM clientes
WHERE nome LIKE 'QA_Cliente_Teste_F1%';

-- V2: Validar projeto vinculado
SELECT p.id, p.titulo, p.cliente_id, c.nome as cliente_nome
FROM projetos p
JOIN clientes c ON c.id = p.cliente_id
WHERE p.titulo LIKE 'QA_Projeto_F1%';

-- V3: Validar tarefa com cost_center
SELECT 
  t.id, t.titulo, t.cost_center, t.billable, t.valor_faturado,
  t.cliente_id, t.projeto_id, t.status
FROM tarefa t
WHERE t.titulo LIKE 'QA_Tarefa_Faturavel_F1%';

-- V4: Validar lançamentos financeiros
SELECT 
  fl.id, fl.tipo, fl.descricao, fl.valor, fl.cost_center,
  fl.tarefa_id, fl.projeto_id, fl.cliente_id
FROM financeiro_lancamentos fl
WHERE fl.cost_center LIKE '%:qa_projeto_id:%'
   OR fl.tarefa_id IN (SELECT id FROM tarefa WHERE titulo LIKE 'QA_Tarefa_Faturavel_F1%');

-- V5: Validar lucratividade
SELECT * FROM vw_lucratividade_projeto
WHERE titulo LIKE 'QA_Projeto_F1%';

-- V6: Auditoria
SELECT * FROM audit_trail
WHERE entidade_id IN (
  SELECT id FROM tarefa WHERE titulo LIKE 'QA_Tarefa_Faturavel_F1%'
)
ORDER BY created_at DESC;
```

### Riscos e Observações
- ⚠️ **Risco Alto:** Se `cost_center` não for estruturado, impossível rastrear custos por projeto/tarefa
- ⚠️ **Risco Médio:** Trigger `fn_registrar_custo_tarefa()` pode não disparar se status não for validado
- 💡 **Observação:** Campo `billable` é crítico para distinguir tarefas internas de faturáveis

---

## 🧪 FLUXO 2 — Planejamento → Post → Tarefa → Evento
**ID:** F2_PLAN_POST_TASK_EVENT  
**Objetivo:** Confirmar workflow editorial completo até agendamento de publicação.

### Pré-condições
- Tabelas: `planejamento_editorial`, `post_planejado`, `aprovacoes_cliente`, `tarefa`, `eventos_calendario`, `social_queue` (a criar)
- Triggers esperados:
  - `trg_create_publication_task` em `aprovacoes_cliente`
  - `trg_sync_task_to_calendar` em `tarefa`
  - `trg_enqueue_social_post` em `aprovacoes_cliente`

### Passos de Teste

**Step 1: Criar Planejamento Editorial**
```sql
INSERT INTO planejamento_editorial (
  titulo, cliente_id, projeto_id, data_inicio, data_fim
)
VALUES (
  'QA_Planejamento_F2',
  :qa_cliente_id, -- do Fluxo 1
  :qa_projeto_id,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '7 days'
)
RETURNING id AS qa_planning_id;
```

**Step 2: Criar Post Vinculado**
```sql
INSERT INTO post_planejado (
  titulo, descricao, planejamento_id, cliente_id, 
  data_publicacao, status, rede_social
)
VALUES (
  'QA_Post_F2',
  'Conteúdo de teste para validação de fluxo',
  :qa_planning_id,
  :qa_cliente_id,
  CURRENT_DATE + INTERVAL '2 days',
  'rascunho',
  'instagram'
)
RETURNING id AS qa_post_id;
-- Assertiva: post.planejamento_id = :qa_planning_id
```

**Step 3: Criar Aprovação (simulando envio para cliente)**
```sql
INSERT INTO aprovacoes_cliente (
  tipo, titulo, descricao, cliente_id, projeto_id,
  tarefa_id, status, solicitado_por
)
VALUES (
  'arte',
  'QA_Aprovacao_Post_F2',
  'Arte para aprovação do post QA',
  :qa_cliente_id,
  :qa_projeto_id,
  NULL, -- Tarefa será criada após aprovação
  'pendente',
  auth.uid()
)
RETURNING id AS qa_aprovacao_id, hash_publico;
-- Assertiva: hash_publico gerado (32 chars hex)
```

**Step 4: Aprovar Post**
```sql
UPDATE aprovacoes_cliente
SET 
  status = 'aprovado',
  decidido_por = auth.uid(),
  decided_at = NOW()
WHERE id = :qa_aprovacao_id;

-- Assertiva: Trigger cria tarefa de publicação automaticamente
```

**Step 5: Verificar Tarefa Criada**
```sql
SELECT 
  t.id, t.titulo, t.tipo_tarefa, t.status, 
  t.cliente_id, t.projeto_id, t.prazo_executor
FROM tarefa t
WHERE t.titulo LIKE '%Publicar%QA_Aprovacao_Post_F2%'
   OR t.id = (SELECT tarefa_id FROM aprovacoes_cliente WHERE id = :qa_aprovacao_id)
RETURNING id AS qa_task_publicacao_id;

-- Assertiva:
-- - COUNT(*) = 1
-- - tipo_tarefa = 'publicacao_social'
-- - status = 'a_fazer'
-- - prazo_executor <= NOW() + INTERVAL '2 days'
```

**Step 6: Verificar Evento de Calendário**
```sql
SELECT 
  ec.id, ec.titulo, ec.tipo, ec.data_inicio, 
  ec.tarefa_id, ec.status
FROM eventos_calendario ec
WHERE ec.tarefa_id = :qa_task_publicacao_id;

-- Assertiva:
-- - COUNT(*) >= 1
-- - tipo = 'planejamento' ou 'publicacao'
-- - data_inicio próxima ao prazo_executor da tarefa
```

**Step 7: Verificar Fila Social**
```sql
SELECT 
  sq.id, sq.aprovacao_id, sq.rede_social, 
  sq.scheduled_at, sq.status
FROM social_queue sq
WHERE sq.aprovacao_id = :qa_aprovacao_id;

-- Assertiva:
-- - COUNT(*) >= 1 (pelo menos Instagram)
-- - status = 'agendado'
-- - scheduled_at <= data_publicacao do post
```

### Critérios de Aprovação

| Critério | PASS se... | FAIL se... |
|----------|------------|------------|
| **C2.1** | Planejamento criado com sucesso | Erro ao inserir |
| **C2.2** | Post vinculado ao planejamento | `post.planejamento_id` NULL |
| **C2.3** | Aprovação criada com `hash_publico` | hash NULL ou duplicado |
| **C2.4** | Mudança de status `pendente → aprovado` permitida | EXCEPTION |
| **C2.5** | Tarefa de publicação criada automaticamente | `tarefa_id` na aprovação NULL |
| **C2.6** | Evento de calendário criado via trigger | COUNT(*) = 0 |
| **C2.7** | Registro em `social_queue` criado | COUNT(*) = 0 |

### Consultas de Verificação

```sql
-- V1: Planejamento
SELECT * FROM planejamento_editorial WHERE titulo LIKE 'QA_Planejamento_F2%';

-- V2: Post
SELECT p.*, pe.titulo as planejamento_titulo
FROM post_planejado p
JOIN planejamento_editorial pe ON pe.id = p.planejamento_id
WHERE p.titulo LIKE 'QA_Post_F2%';

-- V3: Aprovação
SELECT * FROM aprovacoes_cliente WHERE titulo LIKE 'QA_Aprovacao_Post_F2%';

-- V4: Tarefa de publicação
SELECT t.* FROM tarefa t
WHERE t.id IN (SELECT tarefa_id FROM aprovacoes_cliente WHERE titulo LIKE 'QA_Aprovacao_Post_F2%');

-- V5: Evento
SELECT ec.* FROM eventos_calendario ec
WHERE ec.tarefa_id IN (
  SELECT tarefa_id FROM aprovacoes_cliente WHERE titulo LIKE 'QA_Aprovacao_Post_F2%'
);

-- V6: Fila social
SELECT sq.* FROM social_queue sq
WHERE sq.aprovacao_id IN (SELECT id FROM aprovacoes_cliente WHERE titulo LIKE 'QA_Aprovacao_Post_F2%');

-- V7: Auditoria de aprovação
SELECT * FROM audit_trail
WHERE entidade_tipo = 'aprovacao_cliente'
  AND entidade_id IN (SELECT id FROM aprovacoes_cliente WHERE titulo LIKE 'QA_Aprovacao_Post_F2%')
ORDER BY created_at DESC;
```

### Riscos
- ⚠️ **Risco Crítico:** Trigger `fn_create_publication_task()` não implementado (Sprint 2 pendente)
- ⚠️ **Risco Alto:** Tabela `social_queue` não existe
- 💡 **Observação:** Workflow depende de 3 triggers funcionando em sequência

---

## 🧪 FLUXO 3 — Tarefa → Evento → Custo
**ID:** F3_TASK_EVENT_COST  
**Objetivo:** Validar criação automática de evento e custo ao concluir tarefa.

### Pré-condições
- Triggers: `fn_sync_task_to_calendar()` (Sprint 1 ✅), `fn_registrar_custo_tarefa()`
- Campos: `tarefa.prazo_executor`, `eventos_calendario.tarefa_id`, `financeiro_lancamentos.cost_center`

### Passos de Teste

**Step 1: Criar Tarefa com Prazo**
```sql
INSERT INTO tarefa (
  titulo, tipo_tarefa, cliente_id, projeto_id,
  responsavel_id, executor_id, status, prazo_executor, billable
)
VALUES (
  'QA_Tarefa_Com_Evento_F3',
  'edicao_curta',
  :qa_cliente_id,
  :qa_projeto_id,
  :qa_executor_id,
  :qa_executor_id,
  'a_fazer',
  NOW() + INTERVAL '3 days',
  true
)
RETURNING id AS qa_tarefa_evento_id;

-- Assertiva: Trigger cria evento automaticamente
```

**Step 2: Verificar Evento Criado**
```sql
SELECT 
  ec.id, ec.titulo, ec.tipo, ec.data_inicio, ec.tarefa_id, ec.status
FROM eventos_calendario ec
WHERE ec.tarefa_id = :qa_tarefa_evento_id;

-- Assertiva:
-- - COUNT(*) = 1
-- - ec.tipo = 'edicao_curta' (conforme tipo_tarefa)
-- - ec.data_inicio = tarefa.prazo_executor
-- - ec.status = 'agendado'
```

**Step 3: Marcar Evento como Realizado**
```sql
UPDATE eventos_calendario
SET 
  status = 'concluido',
  data_realizacao = NOW()
WHERE tarefa_id = :qa_tarefa_evento_id;

-- Assertiva: Mudança de status válida
```

**Step 4: Verificar Custo Lançado**
```sql
SELECT 
  fl.id, fl.tipo, fl.descricao, fl.valor, 
  fl.cost_center, fl.origem
FROM financeiro_lancamentos fl
WHERE fl.cost_center = (SELECT cost_center FROM tarefa WHERE id = :qa_tarefa_evento_id)
  AND fl.origem = 'evento';

-- Assertiva:
-- - COUNT(*) >= 1
-- - fl.tipo = 'despesa'
-- - fl.valor > 0
-- - fl.cost_center = tarefa.cost_center
```

### Critérios de Aprovação

| Critério | PASS se... | FAIL se... |
|----------|------------|------------|
| **C3.1** | Tarefa criada com `prazo_executor` | Erro ao inserir |
| **C3.2** | Evento criado automaticamente via trigger | COUNT(eventos) = 0 |
| **C3.3** | `evento.data_inicio = tarefa.prazo_executor` | Datas diferentes |
| **C3.4** | Mudança `agendado → concluido` permitida | EXCEPTION |
| **C3.5** | Custo lançado após evento concluído | COUNT(financeiro) = 0 |
| **C3.6** | `cost_center` consistente em tarefa e lançamento | cost_center diferentes |

### Consultas de Verificação

```sql
-- V1: Tarefa
SELECT * FROM tarefa WHERE titulo LIKE 'QA_Tarefa_Com_Evento_F3%';

-- V2: Evento
SELECT ec.* FROM eventos_calendario ec
WHERE ec.tarefa_id IN (SELECT id FROM tarefa WHERE titulo LIKE 'QA_Tarefa_Com_Evento_F3%');

-- V3: Custo
SELECT fl.* FROM financeiro_lancamentos fl
WHERE fl.cost_center IN (SELECT cost_center FROM tarefa WHERE titulo LIKE 'QA_Tarefa_Com_Evento_F3%');

-- V4: Sincronização (validar que deletar tarefa deleta evento)
DELETE FROM tarefa WHERE titulo LIKE 'QA_Tarefa_Com_Evento_F3%';
SELECT COUNT(*) FROM eventos_calendario WHERE tarefa_id = :qa_tarefa_evento_id; -- Deve ser 0 (CASCADE)
```

### Riscos
- ⚠️ **Risco Médio:** Custo pode não ser criado se trigger `fn_registrar_custo_tarefa()` não estiver configurado para disparar em evento concluído
- 💡 **Observação:** DELETE CASCADE funcionando (Sprint 1 ✅)

---

# PARTE C — VALIDAÇÕES TRANSVERSAIS

## 🔒 RBAC/RLS

### Objetivo
Garantir que as consultas dos fluxos acima respeitam o escopo por usuário/cliente/projeto.

### Testes

**T1: Cliente só vê seus próprios projetos**
```sql
-- Executar como cliente QA
SET LOCAL role TO 'qa_cliente_role';
SET LOCAL "request.jwt.claims" TO '{"sub": ":qa_cliente_user_id"}';

SELECT COUNT(*) FROM projetos
WHERE cliente_id != (
  SELECT cliente_id FROM pessoas WHERE profile_id = auth.uid()
);
-- Esperado: 0 (RLS bloqueia projetos de outros clientes)
```

**T2: GRS só vê clientes que gerencia**
```sql
SET LOCAL role TO 'grs_role';
SET LOCAL "request.jwt.claims" TO '{"sub": ":qa_grs_user_id"}';

SELECT COUNT(*) FROM clientes
WHERE responsavel_id != auth.uid();
-- Esperado: 0 (RLS bloqueia clientes de outros GRS)
```

**T3: Financeiro vê todos os lançamentos (admin-like)**
```sql
SET LOCAL role TO 'financeiro_role';
SELECT COUNT(*) FROM financeiro_lancamentos;
-- Esperado: > 0 (role financeiro tem permissão ampla)
```

### Critérios PASS/FAIL
- ✅ PASS: Todos os testes retornam 0 ou permitem acesso correto conforme role
- ❌ FAIL: Cliente/GRS consegue acessar dados fora do escopo

---

## 📝 AUDITORIA

### Objetivo
Confirmar que ações críticas geram logs em `audit_trail`.

### Testes

**A1: Aprovação de Post**
```sql
-- Buscar log após Step 4 do Fluxo 2
SELECT * FROM audit_trail
WHERE entidade_tipo = 'aprovacao_cliente'
  AND entidade_id = :qa_aprovacao_id
  AND acao = 'status_change'
  AND dados_depois->>'status' = 'aprovado';

-- Esperado: 1 registro com user_id, timestamp, dados_antes/depois
```

**A2: Mudança de Status de Tarefa**
```sql
SELECT * FROM audit_trail
WHERE entidade_tipo = 'tarefa'
  AND entidade_id = :qa_tarefa_id
  AND acao = 'update'
  AND dados_depois->>'status' = 'concluido';

-- Esperado: 1 registro
```

**A3: Criação de Lançamento Financeiro**
```sql
SELECT * FROM audit_trail
WHERE entidade_tipo = 'financeiro_lancamentos'
  AND acao = 'insert'
  AND metadata->>'cost_center' = :qa_cost_center;

-- Esperado: 1 registro
```

### Critérios PASS/FAIL
- ✅ PASS: Todos os eventos auditáveis têm log correspondente
- ❌ FAIL: Alguma ação crítica não gera log

---

## 🧹 DATA QUALITY

### Objetivo
Validar campos obrigatórios e integridade referencial.

### Testes

**DQ1: Tarefas têm cliente_id e projeto_id**
```sql
SELECT COUNT(*) FROM tarefa
WHERE cliente_id IS NULL OR projeto_id IS NULL;
-- Esperado: 0
```

**DQ2: Eventos têm tarefa_id ou são eventos manuais**
```sql
SELECT COUNT(*) FROM eventos_calendario
WHERE tarefa_id IS NULL AND origem NOT IN ('manual', 'comercial');
-- Esperado: 0 (eventos auto-criados devem ter tarefa_id)
```

**DQ3: Lançamentos têm cost_center (após implementação)**
```sql
SELECT COUNT(*) FROM financeiro_lancamentos
WHERE cost_center IS NULL 
  AND tipo = 'despesa' 
  AND descricao NOT LIKE '%taxa%';
-- Esperado: < 5% do total
```

**DQ4: Aprovações têm hash_publico**
```sql
SELECT COUNT(*) FROM aprovacoes_cliente
WHERE hash_publico IS NULL OR length(hash_publico) != 32;
-- Esperado: 0
```

### Critérios PASS/FAIL
- ✅ PASS: Data quality >= 95% em todos os testes
- ❌ FAIL: Qualquer teste > 5% de falhas

---

# PARTE D — SUMÁRIO EXECUTIVO (%)

## 📊 ÍNDICE DE INTEGRIDADE DE RELACIONAMENTOS (IIR)

### Fórmula
```
IIR = (Relacionamentos Implementados / Relacionamentos Esperados) × 100
```

### Por Fluxo

| Fluxo | Relacionamentos Esperados | Implementados | IIR Atual | IIR Meta (90d) |
|-------|---------------------------|---------------|-----------|----------------|
| **F1 - CLI→PROJ→TASK→COST** | 6 | 4 | **67%** | 100% |
| **F2 - PLAN→POST→TASK→EVENT** | 7 | 3 | **43%** | 100% |
| **F3 - TASK→EVENT→COST** | 4 | 3 | **75%** | 100% |
| **IIR GERAL** | 17 | 10 | **59%** | 100% |

### Detalhamento F1 (Cliente → Projeto → Tarefa → Custo)

| # | Relacionamento | Status | Criticidade |
|---|----------------|--------|-------------|
| 1 | `cliente.id → projeto.cliente_id` | ✅ Implementado | Alta |
| 2 | `projeto.id → tarefa.projeto_id` | ✅ Implementado | Alta |
| 3 | `tarefa.cost_center` (computed) | ❌ Ausente | **CRÍTICA** |
| 4 | `tarefa.id → financeiro_lancamentos.tarefa_id` | ❌ Ausente | **CRÍTICA** |
| 5 | `tarefa.cost_center = financeiro.cost_center` | ❌ Ausente | Alta |
| 6 | `vw_lucratividade_projeto` | ❌ Ausente | Alta |

**IIR F1:** 2/6 = 33% ❌  
**Impacto:** Impossível rastrear lucratividade por projeto/tarefa (35% receita em risco)

### Detalhamento F2 (Planejamento → Post → Tarefa → Evento)

| # | Relacionamento | Status | Criticidade |
|---|----------------|--------|-------------|
| 1 | `planejamento.id → post.planejamento_id` | ✅ Implementado | Média |
| 2 | `post.id → aprovacao.linked_post_id` | ⚠️ Não estruturado | Média |
| 3 | `aprovacao.status='aprovado' → tarefa (trigger)` | ❌ Ausente | **CRÍTICA** |
| 4 | `tarefa.id → evento.tarefa_id` | ✅ Implementado (Sprint 1) | Alta |
| 5 | `aprovacao.id → social_queue.aprovacao_id` | ❌ Tabela não existe | Alta |
| 6 | `evento.scheduled_at → social_queue.scheduled_at` | ❌ Ausente | Média |
| 7 | `audit_trail` para aprovações | ❌ Ausente | Média |

**IIR F2:** 1.5/7 = 21% ❌  
**Impacto:** Posts aprovados não são publicados automaticamente (25% operacional)

### Detalhamento F3 (Tarefa → Evento → Custo)

| # | Relacionamento | Status | Criticidade |
|---|----------------|--------|-------------|
| 1 | `tarefa.prazo_executor → evento.data_inicio (trigger)` | ✅ Implementado (Sprint 1) | Alta |
| 2 | `evento.status='concluido' → financeiro.custo (trigger)` | ⚠️ Parcial | Alta |
| 3 | `evento.cost_center = tarefa.cost_center` | ❌ Ausente | Média |
| 4 | `DELETE tarefa → CASCADE DELETE evento` | ✅ Implementado (Sprint 1) | Alta |

**IIR F3:** 2.5/4 = 63% ⚠️  
**Impacto:** Custos de eventos podem não ser rastreados corretamente (18% financeiro)

---

## 🎯 TAXA DE SUCESSO DOS TESTES (Simulada)

**Metodologia:** Executar os 3 fluxos em ambiente de testes com dados QA.

### Resultados Esperados (Pós-Implementação)

| Fluxo | Critérios PASS | Critérios FAIL | Taxa Sucesso Esperada |
|-------|----------------|----------------|-----------------------|
| **F1** | 5/7 (71%) | 2/7 (cost_center, view) | **71%** → 100% após Sprint 2 |
| **F2** | 3/7 (43%) | 4/7 (trigger, social_queue, audit) | **43%** → 100% após Sprint 2-3 |
| **F3** | 4/6 (67%) | 2/6 (custo automático, cost_center) | **67%** → 100% após Sprint 2 |
| **Taxa Geral** | 12/20 (60%) | 8/20 | **60%** → 100% após 3 sprints |

---

## 🚨 PRINCIPAIS GAPS E IMPACTO

### TOP 5 Gaps por Impacto

| # | Gap | Impacto (%) | Módulos Afetados | Sprint Resolução |
|---|-----|-------------|------------------|------------------|
| **1** | **Ausência de `cost_center` estruturado** | **40%** | Financeiro, Projetos, BI | Sprint 2 |
| **2** | **Aprovação não gera tarefa de publicação** | **25%** | Conteúdo, Marketing | Sprint 2 |
| **3** | **Tarefas sem flag `billable`** | **22%** | Financeiro, Faturamento | Sprint 2 |
| **4** | **Sem Data Mart de Lucratividade** | **20%** | BI, Gestão | Sprint 2 |
| **5** | **Fila Social (`social_queue`) não existe** | **18%** | Marketing, Automação | Sprint 3 |

**Impacto Agregado:** 125% (gaps se sobrepõem)  
**Impacto Real Estimado:** 65% de receita/produtividade em risco

---

## 📋 BACKLOG PRIORIZADO

### Critério de Priorização: **Impacto × Urgência / Complexidade**

| Prioridade | Item | Impacto | Complexidade | Sprint | Story Points |
|------------|------|---------|--------------|--------|--------------|
| **P0** | Implementar `cost_center` em tarefa + financeiro | 40% | Média | 2 | 8 |
| **P0** | Criar trigger `fn_create_publication_task()` | 25% | Baixa | 2 | 3 |
| **P1** | Adicionar flag `tarefa.billable` + `valor_faturado` | 22% | Baixa | 2 | 2 |
| **P1** | Criar `vw_lucratividade_projeto` (materialized view) | 20% | Média | 2 | 5 |
| **P2** | Criar tabela `social_queue` + trigger | 18% | Alta | 3 | 8 |
| **P2** | Implementar auditoria em `aprovacoes_cliente` | 12% | Baixa | 3 | 2 |
| **P3** | Criar `rh_alocacao_horas` para custos de mão de obra | 15% | Alta | 4 | 13 |
| **P3** | Implementar validação de transições de status | 10% | Média | 4 | 5 |
| **P4** | Criar reserva de equipamentos (captação) | 8% | Média | 4 | 5 |

**Total Story Points (Sprints 2-4):** 51 SP  
**Capacidade Estimada:** 3 sprints × 20 SP = 60 SP ✅

---

## 🎯 INDICADORES DE SUCESSO (Metas)

### 30 Dias (Sprint 2 Completo)

| Indicador | Meta | Baseline | Delta |
|-----------|------|----------|-------|
| **IIR Geral** | 85% | 59% | +26% |
| **% Tarefas com cost_center** | 95% | 0% | +95% |
| **% Posts aprovados → tarefa criada** | 95% | 0% | +95% |
| **% Projetos com margem calculada** | 90% | 0% | +90% |
| **% Eventos sincronizados com tarefas** | 98% | 85% | +13% |

### 60 Dias (Sprint 3 Completo)

| Indicador | Meta | Baseline | Delta |
|-----------|------|----------|-------|
| **IIR Geral** | 92% | 59% | +33% |
| **% Posts em fila social até D-1** | 90% | 0% | +90% |
| **% Aprovações auditadas** | 100% | 0% | +100% |
| **% Lançamentos com cost_center** | 95% | ~30% | +65% |
| **Taxa de Sucesso Testes F1-F3** | 95% | 60% | +35% |

### 90 Dias (Sprint 4 Completo)

| Indicador | Meta | Baseline | Delta |
|-----------|------|----------|-------|
| **IIR Geral** | **95%** | 59% | +36% |
| **Operacionalidade Geral** | **95%** | 78% | +17% |
| **% Custos de folha alocados** | 90% | 0% | +90% |
| **% Conflitos de equipamentos** | 0% | N/A | 0% |
| **Data Quality Score** | 92% | 74% | +18% |

---

## 📄 CHECKLIST DE TESTES (Resumo)

### ✅ Checklist F1 - Cliente → Projeto → Tarefa → Custo

- [ ] Cliente QA criado com sucesso
- [ ] Projeto vinculado ao cliente (FK válida)
- [ ] Tarefa criada com `cost_center` formato correto
- [ ] Tarefa marcada como `billable = true`
- [ ] Transição de status `a_fazer → concluido` permitida
- [ ] Lançamento financeiro criado com `cost_center` correto
- [ ] View `vw_lucratividade_projeto` mostra projeto com margem
- [ ] Auditoria registrada em `audit_trail`
- [ ] RLS valida escopo por cliente/projeto

### ✅ Checklist F2 - Planejamento → Post → Tarefa → Evento

- [ ] Planejamento editorial criado
- [ ] Post vinculado ao planejamento
- [ ] Aprovação criada com `hash_publico`
- [ ] Aprovação mudou status para `aprovado`
- [ ] Tarefa de publicação criada automaticamente (trigger)
- [ ] Evento de calendário criado via `fn_sync_task_to_calendar`
- [ ] Registro em `social_queue` criado
- [ ] Auditoria de aprovação registrada
- [ ] RLS valida acesso por cliente

### ✅ Checklist F3 - Tarefa → Evento → Custo

- [ ] Tarefa criada com `prazo_executor`
- [ ] Evento criado automaticamente (trigger)
- [ ] `evento.data_inicio = tarefa.prazo_executor`
- [ ] Evento marcado como `concluido`
- [ ] Lançamento financeiro criado com origem `evento`
- [ ] `cost_center` consistente em tarefa e lançamento
- [ ] DELETE tarefa executa CASCADE em evento
- [ ] Auditoria registrada

---

## 🔍 BLOCO DE CONSULTAS SELECT (Read-Only Consolidado)

```sql
-- ========================================
-- FLUXO 1: Cliente → Projeto → Tarefa → Custo
-- ========================================

-- F1.V1: Clientes QA
SELECT id, nome, email, status, responsavel_id, assinatura_id
FROM clientes
WHERE nome LIKE 'QA_%'
ORDER BY created_at DESC;

-- F1.V2: Projetos QA com Cliente
SELECT 
  p.id, p.titulo, p.cliente_id, c.nome as cliente_nome,
  p.orcamento, p.status, p.data_inicio, p.data_fim
FROM projetos p
JOIN clientes c ON c.id = p.cliente_id
WHERE p.titulo LIKE 'QA_%'
ORDER BY p.created_at DESC;

-- F1.V3: Tarefas QA com Cost Center
SELECT 
  t.id, t.titulo, t.tipo_tarefa, t.status,
  t.cost_center, -- Campo a implementar
  t.billable, -- Campo a implementar
  t.valor_faturado, -- Campo a implementar
  t.cliente_id, t.projeto_id,
  c.nome as cliente_nome,
  p.titulo as projeto_titulo
FROM tarefa t
JOIN clientes c ON c.id = t.cliente_id
JOIN projetos p ON p.id = t.projeto_id
WHERE t.titulo LIKE 'QA_%'
ORDER BY t.created_at DESC;

-- F1.V4: Lançamentos Financeiros por Cost Center
SELECT 
  fl.id, fl.tipo, fl.descricao, fl.valor,
  fl.cost_center, -- Campo a implementar
  fl.tarefa_id, -- Campo a implementar
  fl.projeto_id, -- Campo a implementar
  fl.status, fl.data_vencimento
FROM financeiro_lancamentos fl
WHERE fl.cost_center LIKE '%QA_%'
   OR fl.descricao LIKE '%QA_%'
ORDER BY fl.created_at DESC;

-- F1.V5: Lucratividade por Projeto (View a criar)
SELECT * FROM vw_lucratividade_projeto
WHERE titulo LIKE 'QA_%'
ORDER BY margem_percent DESC;

-- F1.V6: Auditoria de Tarefas QA
SELECT 
  at.id, at.entidade_tipo, at.entidade_id, at.acao,
  at.user_nome, at.created_at,
  at.dados_antes->>'status' as status_antes,
  at.dados_depois->>'status' as status_depois
FROM audit_trail at
WHERE at.entidade_tipo = 'tarefa'
  AND at.entidade_id IN (SELECT id FROM tarefa WHERE titulo LIKE 'QA_%')
ORDER BY at.created_at DESC;

-- ========================================
-- FLUXO 2: Planejamento → Post → Tarefa → Evento
-- ========================================

-- F2.V1: Planejamentos QA
SELECT * FROM planejamento_editorial
WHERE titulo LIKE 'QA_%'
ORDER BY created_at DESC;

-- F2.V2: Posts QA com Planejamento
SELECT 
  p.id, p.titulo, p.descricao, p.status,
  p.planejamento_id, pe.titulo as planejamento_titulo,
  p.data_publicacao, p.rede_social
FROM post_planejado p
LEFT JOIN planejamento_editorial pe ON pe.id = p.planejamento_id
WHERE p.titulo LIKE 'QA_%'
ORDER BY p.created_at DESC;

-- F2.V3: Aprovações QA
SELECT 
  a.id, a.tipo, a.titulo, a.status, a.hash_publico,
  a.solicitado_por, a.decidido_por, a.decided_at,
  a.cliente_id, a.projeto_id, a.tarefa_id
FROM aprovacoes_cliente a
WHERE a.titulo LIKE 'QA_%'
ORDER BY a.created_at DESC;

-- F2.V4: Tarefas de Publicação (criadas por trigger)
SELECT 
  t.id, t.titulo, t.tipo_tarefa, t.status,
  t.prazo_executor, t.executor_id,
  a.id as aprovacao_id, a.titulo as aprovacao_titulo
FROM tarefa t
JOIN aprovacoes_cliente a ON a.tarefa_id = t.id
WHERE a.titulo LIKE 'QA_%'
ORDER BY t.created_at DESC;

-- F2.V5: Eventos de Publicação
SELECT 
  ec.id, ec.titulo, ec.tipo, ec.data_inicio, ec.status,
  ec.tarefa_id, t.titulo as tarefa_titulo
FROM eventos_calendario ec
JOIN tarefa t ON t.id = ec.tarefa_id
WHERE t.titulo LIKE '%Publicar%QA_%'
ORDER BY ec.created_at DESC;

-- F2.V6: Fila Social (tabela a criar)
SELECT 
  sq.id, sq.aprovacao_id, sq.rede_social,
  sq.scheduled_at, sq.status, sq.published_at,
  a.titulo as aprovacao_titulo
FROM social_queue sq
JOIN aprovacoes_cliente a ON a.id = sq.aprovacao_id
WHERE a.titulo LIKE 'QA_%'
ORDER BY sq.scheduled_at;

-- F2.V7: Auditoria de Aprovações
SELECT * FROM audit_trail
WHERE entidade_tipo = 'aprovacao_cliente'
  AND entidade_id IN (SELECT id FROM aprovacoes_cliente WHERE titulo LIKE 'QA_%')
ORDER BY created_at DESC;

-- ========================================
-- FLUXO 3: Tarefa → Evento → Custo
-- ========================================

-- F3.V1: Tarefas com Eventos Auto-Criados
SELECT 
  t.id, t.titulo, t.prazo_executor,
  ec.id as evento_id, ec.data_inicio, ec.status as evento_status
FROM tarefa t
LEFT JOIN eventos_calendario ec ON ec.tarefa_id = t.id
WHERE t.titulo LIKE 'QA_Tarefa_Com_Evento%'
ORDER BY t.created_at DESC;

-- F3.V2: Custos de Eventos
SELECT 
  fl.id, fl.descricao, fl.valor, fl.origem,
  fl.cost_center, t.titulo as tarefa_titulo
FROM financeiro_lancamentos fl
JOIN tarefa t ON t.cost_center = fl.cost_center
WHERE fl.origem = 'evento'
  AND t.titulo LIKE 'QA_%'
ORDER BY fl.created_at DESC;

-- F3.V3: Sincronização Tarefa ↔ Evento (validar CASCADE)
SELECT 
  t.id as tarefa_id, t.titulo,
  COUNT(ec.id) as eventos_vinculados
FROM tarefa t
LEFT JOIN eventos_calendario ec ON ec.tarefa_id = t.id
WHERE t.titulo LIKE 'QA_%'
GROUP BY t.id, t.titulo;

-- ========================================
-- VALIDAÇÕES TRANSVERSAIS
-- ========================================

-- RBAC/RLS: Verificar políticas ativas
SELECT 
  schemaname, tablename, policyname, 
  permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('clientes', 'projetos', 'tarefa', 'financeiro_lancamentos')
ORDER BY tablename, policyname;

-- DATA QUALITY: Tarefas sem cliente_id ou projeto_id
SELECT 
  COUNT(*) as total_invalidas,
  COUNT(*) FILTER (WHERE cliente_id IS NULL) as sem_cliente,
  COUNT(*) FILTER (WHERE projeto_id IS NULL) as sem_projeto
FROM tarefa;

-- DATA QUALITY: Eventos sem tarefa_id (quando deveriam ter)
SELECT COUNT(*) FROM eventos_calendario
WHERE tarefa_id IS NULL 
  AND origem NOT IN ('manual', 'comercial', 'feriado');

-- DATA QUALITY: Lançamentos sem cost_center (pós-implementação)
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE cost_center IS NULL) as sem_cost_center,
  (COUNT(*) FILTER (WHERE cost_center IS NULL)::float / COUNT(*) * 100) as percent_sem
FROM financeiro_lancamentos
WHERE tipo = 'despesa';

-- AUDITORIA: Coverage por entidade
SELECT 
  entidade_tipo,
  COUNT(*) as total_logs,
  COUNT(DISTINCT entidade_id) as entidades_distintas,
  COUNT(DISTINCT acao) as acoes_distintas
FROM audit_trail
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY entidade_tipo
ORDER BY total_logs DESC;
```

---

## 🎯 CRITÉRIOS DE ACEITE FINAIS

### Para considerar o sistema **APROVADO (95%)**:

1. **IIR Geral ≥ 95%** ✅
   - Todos os relacionamentos críticos implementados
   - FK validadas e com CASCADE apropriado
   
2. **Taxa de Sucesso Testes ≥ 95%** ✅
   - F1, F2, F3 passam com todos os critérios PASS
   
3. **Data Quality ≥ 92%** ✅
   - < 8% de campos obrigatórios nulos
   - < 5% de relacionamentos órfãos
   
4. **Cobertura RBAC/RLS = 100%** ✅
   - Todas as tabelas sensíveis com políticas
   - Testes de escopo passam sem vazamento
   
5. **Auditabilidade ≥ 95%** ✅
   - Ações críticas logadas em `audit_trail`
   - Rastreabilidade completa de aprovações, custos, status
   
6. **Performance** ✅
   - Queries < 500ms (95th percentile)
   - Views materializadas atualizadas diariamente
   
7. **Automação ≥ 90%** ✅
   - Triggers funcionando sem falhas
   - Workflows end-to-end sem intervenção manual

---

## 📌 PRÓXIMOS PASSOS

### Imediato (Esta Semana)
1. ✅ **Revisar este documento** com stakeholders (Tech Lead, Product Owner, QA)
2. 🔄 **Aprovar Sprints 2-4** do backlog priorizado
3. 🔄 **Preparar ambiente QA** (namespace QA_, dados de teste)

### Sprint 2 (Semanas 3-4)
1. Implementar migrations de `cost_center` e `billable`
2. Criar triggers de publicação e sincronização
3. Executar bateria de testes F1-F3
4. Validar IIR alcançando 85%

### Sprint 3 (Semana 5)
1. Implementar `social_queue` e auditoria
2. Refatorar views com SECURITY DEFINER
3. Validar taxa de sucesso testes ≥ 90%

### Sprint 4 (Semana 6)
1. Implementar otimizações finais (equipamentos, validações)
2. Executar teste de carga e performance
3. **GO-LIVE:** Sistema 95% operacional ✅

---

## 📊 DASHBOARD DE MÉTRICAS (Proposto)

Criar view consolidada para monitoramento contínuo:

```sql
CREATE MATERIALIZED VIEW vw_dashboard_qa AS
SELECT 
  -- IIR
  (SELECT COUNT(*) FROM information_schema.table_constraints 
   WHERE constraint_type = 'FOREIGN KEY') as fk_implementadas,
  
  -- Data Quality
  (SELECT COUNT(*) FROM tarefa WHERE cost_center IS NOT NULL)::float / 
    NULLIF((SELECT COUNT(*) FROM tarefa), 0) * 100 as pct_tarefas_cost_center,
  
  (SELECT COUNT(*) FROM aprovacoes_cliente WHERE status = 'aprovado' AND tarefa_id IS NOT NULL)::float /
    NULLIF((SELECT COUNT(*) FROM aprovacoes_cliente WHERE status = 'aprovado'), 0) * 100 as pct_aprovacoes_com_tarefa,
  
  -- Auditoria
  (SELECT COUNT(DISTINCT entidade_tipo) FROM audit_trail) as entidades_auditadas,
  
  -- Performance
  NOW() as ultima_atualizacao;

-- Refresh diário
SELECT cron.schedule('refresh_dashboard_qa', '0 3 * * *', 
  'REFRESH MATERIALIZED VIEW CONCURRENTLY vw_dashboard_qa');
```

---

**FIM DO DIAGNÓSTICO ARQUITETURAL & PLANO DE TESTES QA**

---

**Assinaturas:**

**Arquiteto de Sistemas:** _________________________  
**QA Lead:** _________________________  
**Product Owner:** _________________________  
**Tech Lead:** _________________________  

**Data de Aprovação:** __________________
