# 🎯 GUIA DE PADRONIZAÇÃO GLOBAL - BEX COMMUNICATION v2.0

**Última atualização**: 2025-01-16  
**Versão**: 2.0.0  
**Escopo**: Aplicação global em todo o projeto

---

## 1️⃣ **PADRÕES CRÍTICOS DE QUERIES SUPABASE**

### 🔴 **REGRA OBRIGATÓRIA: Nome Correto da Tabela de Tarefas**

```typescript
// ❌ ERRADO - Tabela não existe
.from('tarefas')

// ✅ CORRETO - Nome real da tabela
.from('tarefa')
```

**📂 Arquivos Corrigidos**:
- `src/components/PlanoEditorial.tsx` (linha 573) ✅
- `src/components/VisaoGeral.tsx` (linha 55) ✅
- `src/pages/Dashboard.tsx` (linha 62) ✅
- `src/pages/Design/Metas.tsx` (linhas 95, 105) ✅

---

### 🔴 **REGRA OBRIGATÓRIA: Filtro por Usuário Autenticado**

Toda página/componente que exibe tarefas de um usuário específico **DEVE**:

```typescript
import { useAuth } from '@/hooks/useAuth';

export default function MinhasPagina() {
  const { user } = useAuth();

  const fetchTarefas = async () => {
    // ✅ Sempre verificar se user existe
    if (!user) {
      console.log('[MinhasPagina] ⚠️ Usuário não autenticado');
      return;
    }

    const { data, error } = await supabase
      .from('tarefa')
      .select('*')
      .eq('executor_id', user.id) // 🔥 FILTRO OBRIGATÓRIO
      .in('executor_area', ['Criativo', 'Audiovisual']); // Se aplicável
  };
}
```

**✅ Já Implementado Corretamente**:
- `src/pages/Design/Dashboard.tsx`
- `src/pages/Design/MinhasTarefas.tsx`
- `src/pages/Design/Calendario/hooks/useCalendarData.ts`

**📂 Arquivos a Verificar/Corrigir**:
- `src/pages/Audiovisual/MinhasTarefas.tsx`
- `src/pages/GRS/MinhasTarefas.tsx`
- `src/pages/MinhasTarefas.tsx`

---

### 🔴 **REGRA OBRIGATÓRIA: Status Enum Corretos**

```typescript
// ❌ ERRADO - Valores incorretos do enum
const tarefasAbertas = tarefas?.filter(t => ['to_do'].includes(t.status));
const tarefasConcluidas = tarefas?.filter(t => t.status === 'concluida');

// ✅ CORRETO - Valores reais do enum status_tarefa_enum
const tarefasAbertas = tarefas?.filter(t => 
  ['backlog', 'a_fazer', 'briefing'].includes(t.status)
);

const tarefasEmAndamento = tarefas?.filter(t => 
  ['em_andamento', 'em_revisao', 'em_criacao', 'em_producao', 'revisao_interna'].includes(t.status)
);

const tarefasConcluidas = tarefas?.filter(t => 
  ['concluido', 'entregue', 'publicado'].includes(t.status)
);
```

**📋 Status Enum Completo** (`status_tarefa_enum`):
- `backlog` - Na fila
- `a_fazer` - A fazer
- `briefing` - Em briefing
- `em_andamento` - Em andamento
- `em_criacao` - Em criação (Design)
- `em_producao` - Em produção (Audiovisual)
- `em_revisao` - Em revisão
- `revisao_interna` - Revisão interna
- `aprovacao_cliente` - Aguardando aprovação do cliente
- `concluido` - Concluído
- `entregue` - Entregue
- `publicado` - Publicado
- `pausado` - Pausado
- `cancelado` - Cancelado

---

### 🔴 **REGRA OBRIGATÓRIA: Tipo Tarefa Enum Corretos**

```typescript
// ❌ ERRADO - Valores incorretos do enum
const tipo = 'conteudo'; // Não existe
const tipo = 'design';   // Não existe

// ✅ CORRETO - Valores reais do enum tipo_tarefa_enum
const tipo = 'criativo_vt';      // Vídeo/Audiovisual
const tipo = 'feed_post';        // Post de feed
const tipo = 'stories';          // Stories
const tipo = 'reels';            // Reels
const tipo = 'carrossel';        // Carrossel
const tipo = 'anuncio';          // Anúncio
const tipo = 'landing_page';     // Landing page
const tipo = 'email_marketing';  // Email marketing
const tipo = 'planejamento';     // Planejamento
const tipo = 'estrategia';       // Estratégia
const tipo = 'relatorio';        // Relatório
const tipo = 'outros';           // Outros
```

**✅ Corrigido em**:
- `src/components/PlanoEditorial.tsx` (linha 561)

---

### 🔴 **REGRA OBRIGATÓRIA: Campos Corretos para Filtros**

```typescript
// ❌ ERRADO - Campos incorretos
.eq('responsavel_id', user.id)  // ❌ Usar para GRS/gerentes
.eq('tipo', 'design')            // ❌ Campo não existe com esse nome

// ✅ CORRETO - Para executores (designers, filmmakers)
.eq('executor_id', user.id)
.eq('executor_area', 'Criativo')     // ou 'Audiovisual', 'GRS', etc.

// ✅ CORRETO - Para responsáveis (GRS, gerentes)
.eq('responsavel_id', user.id)
```

**📋 Valores de `executor_area`**:
- `Criativo` - Design/Creative
- `Audiovisual` - Filmmaker
- `GRS` - GRS/Estratégia
- `Atendimento` - Atendimento
- `Trafego` - Tráfego pago

**✅ Corrigido em**:
- `src/pages/Design/Metas.tsx` (linhas 97, 110)

---

### 🔴 **REGRA OBRIGATÓRIA: Campos de Data Corretos**

```typescript
// ❌ ERRADO - Campo não existe
const prazo = new Date(tarefa.data_prazo);

// ✅ CORRETO - Usar campos reais com fallback
const dataTarefa = tarefa.data_entrega_prevista || tarefa.prazo_executor;
if (dataTarefa) {
  const prazo = new Date(dataTarefa);
}
```

**📋 Campos de Data na Tabela `tarefa`**:
- `data_inicio_prevista` - Data de início prevista
- `data_entrega_prevista` - Data de entrega prevista (preferencial)
- `prazo_executor` - Prazo para o executor (fallback)
- `created_at` - Data de criação
- `updated_at` - Data de última atualização

---

### 🔴 **REGRA OBRIGATÓRIA: Selecionar Campo `kpis` nas Queries**

```typescript
// ❌ ERRADO - kpis não é carregado
const { data } = await supabase
  .from('tarefa')
  .select('*');  // Apenas * não garante kpis em alguns casos

// ✅ CORRETO - Sempre incluir kpis explicitamente quando necessário
const { data } = await supabase
  .from('tarefa')
  .select(`
    *,
    kpis
  `);

// ✅ CORRETO - Select granular
const { data } = await supabase
  .from('tarefa')
  .select(`
    id, titulo, descricao, status, prioridade,
    executor_id, executor_area, cliente_id,
    prazo_executor, data_inicio_prevista, data_entrega_prevista,
    kpis
  `);
```

**Por que é importante?**  
O campo `kpis` (JSONB) armazena dados críticos como:
- `kpis.briefing` - Briefing preenchido pelo GRS
- `kpis.metadados` - Metadados adicionais
- `kpis.referencias` - Referências e links

**✅ Corrigido em**:
- `src/components/VisaoGeral.tsx` (linha 56)
- `src/pages/Design/Metas.tsx` (linhas 96, 108)

---

### 🔴 **REGRA OBRIGATÓRIA: Sintaxe Correta do Supabase Insert**

```typescript
// ❌ ERRADO - Insert sem array
.insert({
  titulo: 'Teste',
  status: 'backlog'
})

// ✅ CORRETO - Insert com array
.insert([{
  titulo: 'Teste',
  status: 'backlog'
}])
```

**✅ Corrigido em**:
- `src/components/PlanoEditorial.tsx` (linha 573)

---

## 2️⃣ **PADRÕES DE INTERFACE E TIPOS**

### 🔴 **REGRA OBRIGATÓRIA: Adicionar `kpis` em Interfaces de Tarefas**

```typescript
interface KanbanTask extends TaskWithDeadline {
  descricao?: string;
  responsavel_id?: string;
  executor_id?: string;
  executor_area?: string;
  status: string;
  prioridade: 'baixa' | 'media' | 'alta';
  // ... outros campos
  
  // ✅ OBRIGATÓRIO: Adicionar kpis
  kpis?: {
    briefing?: {
      id_cartao?: string;
      publico_alvo?: string;
      objetivo_postagem?: string;
      call_to_action?: string;
      formato_postagem?: string;
      contexto_estrategico?: string;
      hashtags?: string[];
      observacoes_gerais?: string;
      roteiro_audiovisual?: string;
    };
    metadados?: any;
    referencias?: any;
  };
}
```

**📂 Arquivos a Verificar/Atualizar**:
- Todas as interfaces de tarefas em componentes Kanban
- `src/types/tarefa.ts` (tipo global)

---

## 3️⃣ **PADRÕES DE CARREGAMENTO DE BRIEFING**

### 🔴 **REGRA OBRIGATÓRIA: Prioridade de Carregamento de Briefing**

```typescript
const loadBriefing = async () => {
  try {
    // 1️⃣ PRIORIDADE 1: Tentar buscar da tabela briefings
    const { data: briefingTable } = await supabase
      .from('briefings')
      .select('*')
      .eq('tarefa_id', task.id)
      .maybeSingle();
    
    if (briefingTable) {
      console.log('[Component] 📋 Briefing da tabela "briefings"', briefingTable);
      setBriefingEditData({ ...briefingTable });
      return;
    }
    
    // 2️⃣ PRIORIDADE 2: Buscar em kpis.briefing (onde GRS salva)
    if (task.kpis?.briefing) {
      console.log('[Component] 📋 Briefing de "kpis.briefing"', task.kpis.briefing);
      const kpisBriefing = task.kpis.briefing;
      setBriefingEditData({
        objetivo_postagem: kpisBriefing.objetivo_postagem || '',
        publico_alvo: kpisBriefing.publico_alvo || '',
        formato_postagem: kpisBriefing.formato_postagem || '',
        call_to_action: kpisBriefing.call_to_action || '',
        hashtags: Array.isArray(kpisBriefing.hashtags) 
          ? kpisBriefing.hashtags.join(', ') 
          : '',
        contexto_estrategico: kpisBriefing.contexto_estrategico || '',
        observacoes: kpisBriefing.observacoes_gerais || '',
        locucao: kpisBriefing.roteiro_audiovisual || '',
      });
      return;
    }
    
    console.log('[Component] ⚠️ Nenhum briefing encontrado');
  } catch (error) {
    console.error('[Component] ❌ Erro ao carregar briefing:', error);
  }
};
```

**✅ Já Implementado Corretamente**:
- `src/components/TaskDetailsModal.tsx`

---

## 4️⃣ **PADRÕES DE LOGS E DEBUG**

### 🔴 **REGRA OBRIGATÓRIA: Logs Estruturados**

```typescript
// ✅ PADRÃO DE LOGS
console.log('[NomeDoComponente] 🔍 Iniciando operação...');
console.log('[NomeDoComponente] 👤 User ID:', user.id);
console.log('[NomeDoComponente] ✅ Dados carregados:', data?.length, 'itens');
console.log('[NomeDoComponente] 📋 Dados completos:', data);
console.log('[NomeDoComponente] ❌ Erro:', error);
console.log('[NomeDoComponente] ⚠️ Aviso: Nenhum dado encontrado');
```

**Emojis Padrão**:
- 🔍 - Iniciando operação
- 👤 - Informação do usuário
- ✅ - Sucesso / Dados carregados
- 📋 - Dados detalhados
- ❌ - Erro
- ⚠️ - Aviso
- 🔥 - Crítico
- 💾 - Salvando dados
- 🔄 - Atualizando
- 🗑️ - Deletando

**✅ Já Implementado em**:
- `src/pages/Design/Dashboard.tsx`
- `src/components/TaskDetailsModal.tsx`

---

## 5️⃣ **PADRÕES DE EXIBIÇÃO DE DADOS**

### 🔴 **REGRA OBRIGATÓRIA: Indicador Visual de Dados Carregados**

```typescript
// ✅ Adicionar indicador após carregamento
{!loading && (
  <div className="text-xs text-muted-foreground px-4 py-2 bg-muted/30 rounded-lg border border-border/50 flex items-center gap-2">
    <span className="font-medium">📊 Dados carregados:</span>
    <span className="text-primary font-semibold">
      {stats.tarefasAbertas + stats.tarefasEmAndamento + stats.tarefasConcluidas}
    </span>
    <span>tarefa(s) total</span>
  </div>
)}
```

**✅ Já Implementado Corretamente**:
- `src/pages/Design/Dashboard.tsx`

---

## 6️⃣ **CHECKLIST DE IMPLEMENTAÇÃO**

### Para **TODA** nova página/componente que trabalha com tarefas:

- [ ] Usa `useAuth()` para obter `user.id`
- [ ] Verifica se `user` existe antes de fazer queries
- [ ] Usa `.from('tarefa')` (não `tarefas`)
- [ ] Filtra por `.eq('executor_id', user.id)` quando aplicável
- [ ] Usa status corretos do enum (`a_fazer`, `concluido`, etc.)
- [ ] Usa tipos corretos do enum (`criativo_vt`, `feed_post`, etc.)
- [ ] Usa campos corretos (`executor_id`, `executor_area`)
- [ ] Usa campos de data corretos (`data_entrega_prevista`, `prazo_executor`)
- [ ] Seleciona `kpis` na query quando briefing é necessário
- [ ] Adiciona `kpis` na interface TypeScript
- [ ] Usa sintaxe correta do insert (`.insert([{...}])`)
- [ ] Implementa logs estruturados com emojis
- [ ] Adiciona indicador visual de dados carregados
- [ ] Trata erros adequadamente com `try/catch`
- [ ] Mostra feedback ao usuário com `toast`

---

## 7️⃣ **TEMPLATE DE PÁGINA COM TAREFAS**

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Tarefa {
  id: string;
  titulo: string;
  status: string;
  prioridade: 'baixa' | 'media' | 'alta';
  executor_id?: string;
  executor_area?: string;
  data_entrega_prevista?: string;
  prazo_executor?: string;
  kpis?: {
    briefing?: any;
    metadados?: any;
  };
  // ... outros campos
}

export default function MinhasPagina() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      fetchTarefas();
    }
  }, [user?.id]);

  const fetchTarefas = async () => {
    if (!user) {
      console.log('[MinhasPagina] ⚠️ Usuário não autenticado');
      setLoading(false);
      return;
    }

    try {
      console.log('[MinhasPagina] 🔍 Iniciando busca...');
      console.log('[MinhasPagina] 👤 User ID:', user.id);

      const { data, error } = await supabase
        .from('tarefa')
        .select('*, kpis')
        .eq('executor_id', user.id)
        .in('executor_area', ['Criativo', 'Audiovisual'])
        .order('created_at', { ascending: false });

      console.log('[MinhasPagina] ✅ Tarefas:', data?.length, 'itens');
      console.log('[MinhasPagina] 📋 Tarefas completas:', data);

      if (error) throw error;

      setTarefas(data || []);
    } catch (error) {
      console.error('[MinhasPagina] ❌ Erro:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar tarefas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Seu conteúdo */}
      {!loading && (
        <div className="text-xs text-muted-foreground px-4 py-2 bg-muted/30 rounded-lg">
          📊 Dados carregados: <strong>{tarefas.length}</strong> tarefa(s)
        </div>
      )}
    </div>
  );
}
```

---

## 8️⃣ **RESUMO DAS CORREÇÕES APLICADAS**

### ✅ **Arquivos Corrigidos - Prioridade Crítica**

| Arquivo | Linhas | Correções Aplicadas |
|---------|--------|-------------------|
| `src/components/PlanoEditorial.tsx` | 561, 573, 582 | ✅ `tarefas` → `tarefa`<br>✅ `tipo: 'conteudo'` → `tipo: 'criativo_vt'`<br>✅ `.insert({})` → `.insert([{}])` |
| `src/components/VisaoGeral.tsx` | 55-56 | ✅ `tarefas` → `tarefa`<br>✅ Adicionado `kpis` no select |
| `src/pages/Dashboard.tsx` | 62 | ✅ `tarefas` → `tarefa` |
| `src/pages/Design/Metas.tsx` | 95-110 | ✅ `tarefas` → `tarefa`<br>✅ `responsavel_id` → `executor_id`<br>✅ `tipo: 'design'` → `executor_area: 'Criativo'`<br>✅ Adicionado `kpis` nos selects |

### ⚠️ **Arquivos a Verificar - Prioridade Média**

1. **`src/pages/Audiovisual/MinhasTarefas.tsx`**
   - Verificar filtro por `executor_id`
   - Verificar `executor_area: 'Audiovisual'`

2. **`src/pages/GRS/MinhasTarefas.tsx`**
   - Verificar filtro por `responsavel_id` (GRS é responsável)
   - Verificar status enum

3. **`src/pages/MinhasTarefas.tsx`**
   - Verificar filtro correto por usuário
   - Verificar campos e enums

---

## 9️⃣ **VALIDAÇÃO FINAL**

### SQL para validar database:

```sql
-- ✅ Verificar nome correto da tabela
SELECT * FROM tarefa LIMIT 1;

-- ✅ Verificar status enum
SELECT DISTINCT status FROM tarefa;

-- ✅ Verificar tipos enum
SELECT DISTINCT tipo FROM tarefa;

-- ✅ Verificar executor_area
SELECT DISTINCT executor_area FROM tarefa;

-- ✅ Verificar campos de data
SELECT id, data_entrega_prevista, prazo_executor FROM tarefa LIMIT 5;

-- ✅ Verificar kpis
SELECT id, kpis FROM tarefa WHERE kpis IS NOT NULL LIMIT 5;
```

---

## 🎯 **CONCLUSÃO**

Este documento define os **padrões obrigatórios** para trabalhar com tarefas no projeto BEX Communication. 

**Status**: ✅ **Todos os arquivos críticos foram corrigidos e validados**

**Próximos Passos**:
1. ✅ Revisar e atualizar todos os arquivos listados em "Prioridade Crítica" - **CONCLUÍDO**
2. ⚠️ Revisar arquivos de "Prioridade Média"
3. 📝 Criar testes automatizados para validar conformidade
4. 🔒 Adicionar linter rules para forçar estes padrões

---

**Mantenha este documento atualizado sempre que novos padrões forem estabelecidos!**
