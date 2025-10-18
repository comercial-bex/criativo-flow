# 🎯 SPRINT 1 - PLANO DE AÇÃO DETALHADO

## 📊 STATUS ATUAL

**Arquivos Identificados:** 39 arquivos com `.from('profiles')`
**Total de Ocorrências:** 50 chamadas

---

## 🔥 PRIORIZAÇÃO POR CRITICIDADE

### **🔴 CRÍTICO - BLOQUEIA AUTENTICAÇÃO/ACESSO (Dia 1-3)**

#### **Grupo 1: Sistema de Autenticação (5 arquivos)**
| Arquivo | Ocorrências | Impacto | Ordem |
|---------|-------------|---------|-------|
| `Auth/LoginDiagnostic.tsx` | 1 | 🔴 Alto - Debug de login | 1 |
| `SmartRedirect.tsx` | 1 | 🔴 Alto - Roteamento pós-login | 2 |
| `SecurityTestPanel.tsx` | 1 | 🔴 Alto - Testes de segurança | 3 |
| `AccessRejectedPage.tsx` | 1 | 🔴 Alto - Feedback de rejeição | 4 |
| `AccessSuspendedPage.tsx` | 1 | 🔴 Alto - Feedback de suspensão | 5 |

**Ação:** Atualizar `.from('profiles')` → `.from('pessoas')`

---

#### **Grupo 2: Gestão de Usuários (3 arquivos)**
| Arquivo | Ocorrências | Impacto | Ordem |
|---------|-------------|---------|-------|
| `SimplifiedAdminControls.tsx` | 2 | 🔴 Alto - Aprovação de usuários | 6 |
| `Especialistas.tsx` | 3 | 🔴 Alto - CRUD especialistas | 7 |
| `Usuarios.tsx` | 2 | 🔴 Alto - Gestão global usuários | 8 |

**Ação:** Migrar para `pessoas` + atualizar campos:
- `especialidade` → verificar `papeis` array
- `status` → manter igual
- `cliente_id` → verificar se `'cliente' IN papeis`

---

#### **Grupo 3: Perfil do Usuário (1 arquivo)**
| Arquivo | Ocorrências | Impacto | Ordem |
|---------|-------------|---------|-------|
| `Perfil.tsx` | 3 | 🔴 Alto - Edição de perfil próprio | 9 |

**Ação:** Refatorar para usar `usePessoas` hook

---

### **🟠 ALTO - IMPACTA OPERAÇÕES DIÁRIAS (Dia 4-7)**

#### **Grupo 4: Tarefas (8 arquivos)**
| Arquivo | Ocorrências | Impacto | Ordem |
|---------|-------------|---------|-------|
| `TarefasKanban.tsx` | 1 | 🟠 Alto - Quadro Kanban | 10 |
| `TaskActivities.tsx` | 1 | 🟠 Alto - Atividades | 11 |
| `TaskParticipants.tsx` | 2 | 🟠 Alto - Participantes | 12 |
| `Admin/Tarefas.tsx` | 1 | 🟠 Alto - Gestão admin | 13 |
| `Cliente/Tarefas.tsx` | 2 | 🟠 Alto - Visão cliente | 14 |
| `MinhasTarefas.tsx` | 1 | 🟠 Alto - Tarefas próprias | 15 |
| `GRS/TarefasUnificadas.tsx` | 2 | 🟠 Alto - Tarefas GRS | 16 |
| `Design/TarefasUnificadas.tsx` | 1 | 🟠 Alto - Tarefas Design | 17 |

**Ação:** Atualizar queries de pessoas nas tarefas

---

#### **Grupo 5: Projetos e Eventos (4 arquivos)**
| Arquivo | Ocorrências | Impacto | Ordem |
|---------|-------------|---------|-------|
| `CriarProjetoAvulsoModal.tsx` | 1 | 🟠 Alto - Criação projeto | 18 |
| `ProjetoEspecialistas.tsx` | 1 | 🟠 Alto - Atribuição especialistas | 19 |
| `NewEventModal.tsx` | 1 | 🟠 Alto - Criação eventos | 20 |
| `AudiovisualScheduleModal.tsx` | 1 | 🟠 Alto - Agenda audiovisual | 21 |

---

#### **Grupo 6: Calendário e Agenda (3 arquivos)**
| Arquivo | Ocorrências | Impacto | Ordem |
|---------|-------------|---------|-------|
| `Design/Calendario.tsx` | 1 | 🟠 Alto - Calendário design | 22 |
| `Design/Calendario/hooks/useCalendarData.ts` | 1 | 🟠 Alto - Hook calendário | 23 |
| `Design/Metas.tsx` | 1 | 🟠 Alto - Metas design | 24 |

---

### **🟡 MÉDIO - FEATURES ESPECÍFICAS (Dia 8-10)**

#### **Grupo 7: Conteúdo e Posts (3 arquivos)**
| Arquivo | Ocorrências | Impacto | Ordem |
|---------|-------------|---------|-------|
| `PlanoEditorial.tsx` | 1 | 🟡 Médio - Calendário posts | 25 |
| `PostsContentView.tsx` | 1 | 🟡 Médio - Visualização posts | 26 |
| `VisaoGeral.tsx` | 2 | 🟡 Médio - Dashboard geral | 27 |

---

#### **Grupo 8: Equipamentos e Estoque (2 arquivos)**
| Arquivo | Ocorrências | Impacto | Ordem |
|---------|-------------|---------|-------|
| `Audiovisual/Equipamentos.tsx` | 1 | 🟡 Médio - Gestão equipamentos | 28 |
| `Audiovisual/MinhasTarefas.tsx` | 1 | 🟡 Médio - Tarefas AV | 29 |
| `Audiovisual/TarefasUnificadas.tsx` | 1 | 🟡 Médio - Tarefas AV unif | 30 |

---

#### **Grupo 9: Comunicação (3 arquivos)**
| Arquivo | Ocorrências | Impacto | Ordem |
|---------|-------------|---------|-------|
| `TeamChat/MentionAutocomplete.tsx` | 1 | 🟡 Médio - Menções chat | 31 |
| `TeamChat/NewThreadDialog.tsx` | 1 | 🟡 Médio - Nova conversa | 32 |
| `Admin/CentralNotificacoes.tsx` | 2 | 🟡 Médio - Notificações | 33 |

---

#### **Grupo 10: Seleção de Pessoas (1 arquivo)**
| Arquivo | Ocorrências | Impacto | Ordem |
|---------|-------------|---------|-------|
| `EspecialistasSelector.tsx` | 1 | 🟡 Médio - Seletor genérico | 34 |

---

### **🟢 BAIXO - UTILITÁRIOS E MONITORING (Dia 11-12)**

#### **Grupo 11: Hooks e Utilitários (5 arquivos)**
| Arquivo | Ocorrências | Impacto | Ordem |
|---------|-------------|---------|-------|
| `hooks/useAIContext.ts` | 1 | 🟢 Baixo - Contexto IA | 35 |
| `hooks/useModalPreload.ts` | 1 | 🟢 Baixo - Preload modais | 36 |
| `hooks/useRealtimeNotifications.ts` | 1 | 🟢 Baixo - Notifs realtime | 37 |
| `hooks/useTypingIndicator.ts` | 1 | 🟢 Baixo - Indicador digitação | 38 |
| `lib/monitor-fallback.ts` | 1 | 🟢 Baixo - Monitoring | 39 |

---

## 🛠️ TEMPLATE DE MIGRAÇÃO

### **Padrão Simples (Select)**
```typescript
// ❌ ANTES:
const { data: pessoas } = await supabase
  .from('profiles')
  .select('*')
  .eq('status', 'aprovado');

// ✅ DEPOIS:
const { data: pessoas } = await supabase
  .from('pessoas')
  .select('*')
  .eq('status', 'aprovado');
```

### **Padrão com Filtro de Papel**
```typescript
// ❌ ANTES:
const { data: especialistas } = await supabase
  .from('profiles')
  .select('*')
  .eq('especialidade', 'design');

// ✅ DEPOIS:
const { data: especialistas } = await supabase
  .from('pessoas')
  .select('*')
  .contains('papeis', ['especialista'])
  .eq('especialidade', 'design'); // especialidade ainda existe em pessoas
```

### **Padrão com Cliente**
```typescript
// ❌ ANTES:
const { data: clientes } = await supabase
  .from('profiles')
  .select('*')
  .not('cliente_id', 'is', null);

// ✅ DEPOIS:
const { data: clientes } = await supabase
  .from('pessoas')
  .select('*')
  .contains('papeis', ['cliente']);
```

### **Padrão com Join**
```typescript
// ❌ ANTES:
const { data } = await supabase
  .from('tarefa')
  .select(`
    *,
    executor:profiles!executor_id(nome, email)
  `);

// ✅ DEPOIS:
const { data } = await supabase
  .from('tarefa')
  .select(`
    *,
    executor:pessoas!executor_id(nome, email)
  `);
```

---

## 🎯 CRITÉRIOS DE ACEITAÇÃO

Para cada arquivo migrado:
- [ ] Compilação sem erros TypeScript
- [ ] Funcionalidade testada manualmente
- [ ] Queries retornam dados corretos
- [ ] Performance mantida ou melhorada
- [ ] Logs sem erros no console

---

## 📋 CHECKLIST DE EXECUÇÃO

### **Dia 1-3: CRÍTICO (9 arquivos)**
- [ ] Auth/LoginDiagnostic.tsx
- [ ] SmartRedirect.tsx
- [ ] SecurityTestPanel.tsx
- [ ] AccessRejectedPage.tsx
- [ ] AccessSuspendedPage.tsx
- [ ] SimplifiedAdminControls.tsx
- [ ] Especialistas.tsx
- [ ] Usuarios.tsx
- [ ] Perfil.tsx

**Validação:** Sistema de login e gestão de usuários funcional

---

### **Dia 4-7: ALTO (15 arquivos)**
- [ ] TarefasKanban.tsx
- [ ] TaskActivities.tsx
- [ ] TaskParticipants.tsx
- [ ] Admin/Tarefas.tsx
- [ ] Cliente/Tarefas.tsx
- [ ] MinhasTarefas.tsx
- [ ] GRS/TarefasUnificadas.tsx
- [ ] Design/TarefasUnificadas.tsx
- [ ] CriarProjetoAvulsoModal.tsx
- [ ] ProjetoEspecialistas.tsx
- [ ] NewEventModal.tsx
- [ ] AudiovisualScheduleModal.tsx
- [ ] Design/Calendario.tsx
- [ ] Design/Calendario/hooks/useCalendarData.ts
- [ ] Design/Metas.tsx

**Validação:** Sistema de tarefas, projetos e calendário funcional

---

### **Dia 8-10: MÉDIO (10 arquivos)**
- [ ] PlanoEditorial.tsx
- [ ] PostsContentView.tsx
- [ ] VisaoGeral.tsx
- [ ] Audiovisual/Equipamentos.tsx
- [ ] Audiovisual/MinhasTarefas.tsx
- [ ] Audiovisual/TarefasUnificadas.tsx
- [ ] TeamChat/MentionAutocomplete.tsx
- [ ] TeamChat/NewThreadDialog.tsx
- [ ] Admin/CentralNotificacoes.tsx
- [ ] EspecialistasSelector.tsx

**Validação:** Features de conteúdo e comunicação funcionais

---

### **Dia 11-12: BAIXO (5 arquivos)**
- [ ] hooks/useAIContext.ts
- [ ] hooks/useModalPreload.ts
- [ ] hooks/useRealtimeNotifications.ts
- [ ] hooks/useTypingIndicator.ts
- [ ] lib/monitor-fallback.ts

**Validação:** Sistema completo sem `.from('profiles')`

---

## 🚀 COMEÇAR AGORA?

**Próxima ação:** Migrar os 9 arquivos críticos (Grupo 1-3)
- Tempo estimado: 2-3 horas
- Risco: Baixo (com testes)
- Ganho: Sistema de auth 100% migrado

**Posso iniciar?**
