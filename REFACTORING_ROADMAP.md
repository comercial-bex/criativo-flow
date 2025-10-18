# 🚀 ROADMAP DE REFATORAÇÃO - ALTERNATIVA 1

## 📋 VISÃO GERAL

**Objetivo:** Refatoração gradual do sistema em 3-4 semanas
**Melhoria Esperada:** +63% no score geral do sistema
**Risco:** Baixo (sistema continua operacional durante todo processo)

---

## 📊 BASELINE ATUAL

```
✅ Estrutura de Dados: 100% (tabela `pessoas` criada)
✅ Hooks Principais: 90% (usePessoas, useProfileData atualizados)
🔄 Componentes: 15% (apenas alguns componentes migrados)
⏳ Migração Total: 35%

PROBLEMAS CRÍTICOS:
🔴 Credenciais sem criptografia (LGPD violado)
🟠 66 arquivos ainda usando .from('profiles')
🟠 FKs apontando para tabelas legadas
🟡 Financeiro desintegrado
```

---

## 🎯 SPRINT 1 (SEMANA 1-2): PESSOAS + CRIPTOGRAFIA

### **Dia 1-2: Auditoria e Preparação**
- [x] Criar dashboard de migração (`/admin/migracao`)
- [ ] Listar todos os 66 arquivos com `.from('profiles')`
- [ ] Categorizar por criticidade (Alta/Média/Baixa)
- [ ] Criar checklist de verificação

### **Dia 3-5: Migração de Hooks Críticos**
**Prioridade ALTA - Bloqueadores:**
- [ ] `useAuth.tsx` - Sistema de autenticação
- [ ] `useAccessControl.ts` - Controle de acesso
- [ ] `useUserRole.ts` - Verificação de papéis
- [ ] `useSignUpWithValidation.ts` - Cadastro de usuários

**Arquivos a Atualizar:**
```typescript
// ❌ ANTES:
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId);

// ✅ DEPOIS:
const { data } = await supabase
  .from('pessoas')
  .select('*')
  .eq('id', userId);
```

### **Dia 6-8: Migração de Componentes Críticos**
**Prioridade ALTA:**
- [ ] `Admin/NewUserModal.tsx`
- [ ] `Auth/LoginDiagnostic.tsx`
- [ ] `SimplifiedAdminControls.tsx`
- [ ] `SmartRedirect.tsx`
- [ ] `SecurityTestPanel.tsx`

**Prioridade MÉDIA:**
- [ ] `UserProfileSection.tsx`
- [ ] `ProfileCard.tsx`
- [ ] `EspecialistasSelector.tsx`
- [ ] `ProjetoEspecialistas.tsx`

### **Dia 9-10: Implementar Criptografia de Credenciais**

**Passo 1: Criar Funções de Criptografia**
```sql
-- Função de criptografia usando pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION encrypt_credential(
  p_plaintext TEXT,
  p_key TEXT DEFAULT 'your-secret-key'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN encode(
    encrypt(p_plaintext::bytea, p_key::bytea, 'aes'),
    'base64'
  );
END;
$$;

CREATE OR REPLACE FUNCTION decrypt_credential(
  p_encrypted TEXT,
  p_key TEXT DEFAULT 'your-secret-key'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN convert_from(
    decrypt(decode(p_encrypted, 'base64'), p_key::bytea, 'aes'),
    'UTF8'
  );
END;
$$;
```

**Passo 2: Alterar Tabela**
```sql
-- Adicionar colunas criptografadas
ALTER TABLE credenciais_cliente
  ADD COLUMN senha_encrypted TEXT,
  ADD COLUMN tokens_api_encrypted TEXT;

-- Migrar dados existentes
UPDATE credenciais_cliente
SET senha_encrypted = encrypt_credential(senha),
    tokens_api_encrypted = encrypt_credential(tokens_api::text)
WHERE senha IS NOT NULL;

-- Remover colunas antigas (após confirmação)
-- ALTER TABLE credenciais_cliente
--   DROP COLUMN senha,
--   DROP COLUMN tokens_api;
```

**Passo 3: Atualizar Código**
- [ ] Atualizar `fn_cred_save()` para usar criptografia
- [ ] Atualizar `fn_cred_get_metadata()` para descriptografar
- [ ] Criar hook `useCredenciais` com decrypt automático

### **Dia 11-12: Migração de FKs**

**Tabelas com FK para `profiles`:**
```sql
-- 1. user_roles (já usa auth.users, OK)
-- 2. tarefas
ALTER TABLE tarefa
  DROP CONSTRAINT IF EXISTS tarefa_responsavel_id_fkey,
  DROP CONSTRAINT IF EXISTS tarefa_executor_id_fkey,
  ADD CONSTRAINT tarefa_responsavel_id_fkey 
    FOREIGN KEY (responsavel_id) REFERENCES pessoas(id),
  ADD CONSTRAINT tarefa_executor_id_fkey 
    FOREIGN KEY (executor_id) REFERENCES pessoas(id);

-- 3. projetos
ALTER TABLE projetos
  DROP CONSTRAINT IF EXISTS projetos_responsavel_id_fkey,
  ADD CONSTRAINT projetos_responsavel_id_fkey 
    FOREIGN KEY (responsavel_id) REFERENCES pessoas(id);

-- 4. clientes
ALTER TABLE clientes
  DROP CONSTRAINT IF EXISTS clientes_responsavel_id_fkey,
  ADD CONSTRAINT clientes_responsavel_id_fkey 
    FOREIGN KEY (responsavel_id) REFERENCES pessoas(id);

-- 5. eventos_calendario
ALTER TABLE eventos_calendario
  DROP CONSTRAINT IF EXISTS eventos_calendario_responsavel_id_fkey,
  ADD CONSTRAINT eventos_calendario_responsavel_id_fkey 
    FOREIGN KEY (responsavel_id) REFERENCES pessoas(id);

-- [+15 tabelas...]
```

### **Dia 13-14: Testes e Validação Sprint 1**
- [ ] Testar autenticação
- [ ] Testar criação de usuários
- [ ] Testar acesso de credenciais
- [ ] Verificar integridade de FKs
- [ ] Rodar linter de segurança
- [ ] Backup completo do banco

**Entregáveis Sprint 1:**
- ✅ 100% arquivos migrados de `profiles` → `pessoas`
- ✅ Credenciais 100% criptografadas (LGPD compliant)
- ✅ FKs atualizadas
- ✅ Score de Segurança: 25 → 95 (+280%)

---

## 🎯 SPRINT 2 (SEMANA 3): FINANCEIRO INTEGRADO

### **Dia 15-17: Adicionar Relacionamentos Financeiros**

**Schema Atualizado:**
```sql
-- Adicionar FKs em financeiro_lancamentos
ALTER TABLE financeiro_lancamentos
  ADD COLUMN tarefa_id UUID REFERENCES tarefa(id),
  ADD COLUMN projeto_id UUID REFERENCES projetos(id),
  ADD COLUMN evento_id UUID REFERENCES eventos_calendario(id),
  ADD COLUMN reserva_id UUID REFERENCES inventario_reservas(id);

-- Criar índices para performance
CREATE INDEX idx_lancamentos_tarefa ON financeiro_lancamentos(tarefa_id);
CREATE INDEX idx_lancamentos_projeto ON financeiro_lancamentos(projeto_id);
CREATE INDEX idx_lancamentos_evento ON financeiro_lancamentos(evento_id);
CREATE INDEX idx_lancamentos_reserva ON financeiro_lancamentos(reserva_id);
```

### **Dia 18-19: Criar Triggers Automáticos**

**Trigger 1: Custo de Tarefa Concluída**
```sql
CREATE OR REPLACE FUNCTION fn_registrar_custo_tarefa()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_valor NUMERIC;
  v_conta_despesa UUID;
BEGIN
  IF NEW.status = 'concluida' AND OLD.status != 'concluida' THEN
    -- Calcular custo baseado em horas trabalhadas
    SELECT COALESCE(
      (NEW.horas_trabalhadas * p.valor_hora_especialista),
      0
    ) INTO v_valor
    FROM pessoas p
    WHERE p.id = NEW.executor_id;

    -- Buscar conta de despesa
    SELECT id INTO v_conta_despesa
    FROM financeiro_plano_contas
    WHERE codigo = '3.1.01.001'; -- Despesas com pessoal

    -- Criar lançamento
    INSERT INTO financeiro_lancamentos (
      data_lancamento, descricao, tipo, valor,
      conta_debito_id, tarefa_id, projeto_id
    ) VALUES (
      NEW.updated_at,
      'Custo de execução: ' || NEW.titulo,
      'despesa',
      v_valor,
      v_conta_despesa,
      NEW.id,
      NEW.projeto_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_registrar_custo_tarefa
AFTER UPDATE ON tarefa
FOR EACH ROW
EXECUTE FUNCTION fn_registrar_custo_tarefa();
```

**Trigger 2: Custo de Evento (Deslocamento)**
```sql
CREATE OR REPLACE FUNCTION fn_registrar_custo_evento()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_valor_desl NUMERIC := 0;
  v_conta_despesa UUID;
BEGIN
  -- Calcular custo de deslocamento
  IF NEW.tipo = 'deslocamento' THEN
    CASE NEW.tipo_deslocamento
      WHEN 'curto' THEN v_valor_desl := 50;
      WHEN 'medio' THEN v_valor_desl := 150;
      WHEN 'longo' THEN v_valor_desl := 300;
    END CASE;

    SELECT id INTO v_conta_despesa
    FROM financeiro_plano_contas
    WHERE codigo = '3.2.01.001'; -- Despesas com deslocamento

    INSERT INTO financeiro_lancamentos (
      data_lancamento, descricao, tipo, valor,
      conta_debito_id, evento_id, projeto_id
    ) VALUES (
      NEW.data_fim,
      'Deslocamento: ' || NEW.titulo,
      'despesa',
      v_valor_desl,
      v_conta_despesa,
      NEW.id,
      NEW.projeto_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;
```

### **Dia 20-21: Dashboard Financeiro por Projeto**

- [ ] Criar view `vw_custos_projeto`
- [ ] Criar componente `ProjetoCustos.tsx`
- [ ] Adicionar gráficos de custo vs receita
- [ ] Calcular ROI por projeto
- [ ] Relatório de lucratividade

**Entregáveis Sprint 2:**
- ✅ Financeiro integrado com tarefas/projetos/eventos
- ✅ Triggers automáticos de lançamento
- ✅ Dashboard de custos por projeto
- ✅ Visibilidade Financeira: +70%

---

## 🎯 SPRINT 3 (SEMANA 4): AUDITORIA + CLEANUP

### **Dia 22-24: Unificar Logs de Auditoria**

**Schema Unificado:**
```sql
CREATE TABLE audit_trail_unified (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  
  -- O que aconteceu
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'read'
  entity_type TEXT NOT NULL, -- 'tarefa', 'cliente', 'credencial'
  entity_id UUID,
  
  -- Contexto
  ip_address INET,
  user_agent TEXT,
  
  -- Dados
  before_data JSONB,
  after_data JSONB,
  
  -- Metadados
  metadata JSONB DEFAULT '{}',
  
  -- Índices
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_timestamp ON audit_trail_unified(timestamp);
CREATE INDEX idx_audit_user ON audit_trail_unified(user_id);
CREATE INDEX idx_audit_entity ON audit_trail_unified(entity_type, entity_id);
```

**Migração de Logs Existentes:**
```sql
-- Migrar de audit_logs
INSERT INTO audit_trail_unified (
  timestamp, user_id, action, entity_type, entity_id,
  before_data, after_data
)
SELECT 
  created_at, user_id, action, 'post', post_id,
  before, after
FROM audit_logs;

-- Migrar de audit_sensitive_access
INSERT INTO audit_trail_unified (
  timestamp, user_id, action, entity_type, entity_id,
  ip_address, user_agent, metadata
)
SELECT 
  timestamp, user_id, action, table_name, record_id,
  ip_address, user_agent, metadata
FROM audit_sensitive_access;

-- [Continuar para outras tabelas...]
```

### **Dia 25-26: Remover Tabelas Legadas**

**⚠️ CHECKPOINT DE SEGURANÇA:**
```sql
-- 1. Criar backup completo
-- 2. Verificar que NENHUM código usa mais as tabelas antigas
-- 3. Confirmar com equipe
```

**Remoção Gradual:**
```sql
-- PASSO 1: Desabilitar acesso (mas manter dados)
REVOKE ALL ON TABLE profiles FROM PUBLIC;
REVOKE ALL ON TABLE rh_colaboradores FROM PUBLIC;

-- PASSO 2: Renomear para _deprecated
ALTER TABLE profiles RENAME TO profiles_deprecated_backup;
ALTER TABLE rh_colaboradores RENAME TO rh_colaboradores_deprecated_backup;

-- PASSO 3: Após 1 semana sem incidentes, remover
-- DROP TABLE profiles_deprecated_backup;
-- DROP TABLE rh_colaboradores_deprecated_backup;
```

### **Dia 27-28: Otimização e Limpeza**

**Índices Adicionais:**
```sql
-- Pessoas (mais consultado)
CREATE INDEX idx_pessoas_email ON pessoas(email);
CREATE INDEX idx_pessoas_cpf ON pessoas(cpf_normalizado);
CREATE INDEX idx_pessoas_papeis ON pessoas USING GIN(papeis);

-- Tarefas (queries complexas)
CREATE INDEX idx_tarefa_status_prazo ON tarefa(status, prazo_executor);
CREATE INDEX idx_tarefa_projeto_executor ON tarefa(projeto_id, executor_id);

-- Financeiro (relatórios)
CREATE INDEX idx_lancamentos_data ON financeiro_lancamentos(data_lancamento);
CREATE INDEX idx_lancamentos_tipo ON financeiro_lancamentos(tipo);
```

**Vacuum e Analyze:**
```sql
VACUUM ANALYZE pessoas;
VACUUM ANALYZE tarefa;
VACUUM ANALYZE financeiro_lancamentos;
VACUUM ANALYZE audit_trail_unified;
```

**Entregáveis Sprint 3:**
- ✅ Logs unificados em `audit_trail_unified`
- ✅ Tabelas legadas removidas
- ✅ Índices otimizados
- ✅ Performance: +40%

---

## 📈 MÉTRICAS DE SUCESSO

### **Antes da Refatoração:**
```
┌─────────────────────┬────────┬─────────┐
│ Métrica             │ Antes  │ Meta    │
├─────────────────────┼────────┼─────────┤
│ Segurança           │ 25/100 │ 95/100  │
│ Performance         │ 60/100 │ 84/100  │
│ Manutenibilidade    │ 35/100 │ 80/100  │
│ Compliance LGPD     │  0/100 │ 100/100 │
│ Cobertura de Testes │ 20/100 │ 60/100  │
├─────────────────────┼────────┼─────────┤
│ SCORE GERAL         │ 30/100 │ 90/100  │
└─────────────────────┴────────┴─────────┘
```

### **KPIs por Sprint:**

**Sprint 1:**
- ✅ 0% → 100% credenciais criptografadas
- ✅ 35% → 100% migração pessoas
- ✅ 0 → 100% compliance LGPD

**Sprint 2:**
- ✅ Integração financeira completa
- ✅ 70% melhoria visibilidade custos
- ✅ Dashboard financeiro funcional

**Sprint 3:**
- ✅ 5 tabelas de log → 1 tabela unificada
- ✅ 2 tabelas legadas removidas
- ✅ +40% performance em queries

---

## ⚠️ RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Dados corrompidos na migração | Baixa | Alto | Backup completo antes de cada sprint |
| Downtime não planejado | Média | Médio | Migração em horário de baixo uso |
| Código quebrado | Média | Alto | Testes automatizados + rollback plan |
| Resistência da equipe | Baixa | Baixo | Documentação clara + treinamento |

---

## 📋 CHECKLIST DE VALIDAÇÃO

### **Pré-Migração:**
- [ ] Backup completo do banco
- [ ] Equipe notificada
- [ ] Ambiente de staging testado
- [ ] Rollback plan documentado

### **Pós-Migração (Cada Sprint):**
- [ ] Todos os testes passando
- [ ] Performance mantida ou melhorada
- [ ] Logs sem erros críticos
- [ ] Funcionalidades críticas validadas
- [ ] Equipe confirmou sucesso

### **Validação Final:**
- [ ] Score de segurança ≥ 90/100
- [ ] 0 queries usando tabelas legadas
- [ ] Documentação atualizada
- [ ] Treinamento da equipe concluído
- [ ] Monitoramento ativo por 1 semana

---

## 🚀 PRÓXIMOS PASSOS

**AGORA (Urgente):**
1. ✅ Roadmap aprovado
2. ⏳ Criar issues no GitHub/Jira
3. ⏳ Agendar reunião de kickoff
4. ⏳ Iniciar Sprint 1

**Esta Semana:**
- Começar migração de hooks críticos
- Implementar criptografia de credenciais
- Atualizar primeiros 20 arquivos

**Semana 2:**
- Completar migração de componentes
- Atualizar FKs
- Validar Sprint 1

---

**Status:** 🟢 Pronto para Iniciar
**Próxima Ação:** Aprovar roadmap e iniciar Sprint 1
