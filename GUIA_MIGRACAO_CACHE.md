# 🚀 Guia de Migração: TanStack Query Cache

## 📊 Situação Atual vs. Otimizada

### ❌ ANTES (143 chamadas diretas ao Supabase)
```typescript
// Componente faz fetch direto toda vez que renderiza
const [clientes, setClientes] = useState([]);

useEffect(() => {
  const fetchClientes = async () => {
    const { data } = await supabase.from('clientes').select('*');
    setClientes(data);
  };
  fetchClientes();
}, []);
```

**Problemas:**
- ❌ Sem cache - refetch desnecessário
- ❌ Loading state manual
- ❌ Sem otimização de rede
- ❌ Dados stale sem invalidação
- ❌ Duplicação de código

### ✅ DEPOIS (com TanStack Query)
```typescript
import { useClientes } from '@/hooks/useClientes';

const { data: clientes, isLoading, error } = useClientes();
```

**Benefícios:**
- ✅ Cache automático (5 min)
- ✅ Loading/error states
- ✅ Deduplicação de requests
- ✅ Invalidação inteligente
- ✅ Refetch background
- ✅ Código limpo e reutilizável

---

## 🎯 Hooks Criados

### 1. `useClientes()`
```typescript
// Fetch com cache
const { data, isLoading, error } = useClientes();

// Criar cliente
const { mutate: createCliente } = useCreateCliente();
createCliente({ nome: 'Novo Cliente', ... });

// Atualizar
const { mutate: updateCliente } = useUpdateCliente();
updateCliente({ id: '123', data: { nome: 'Nome Atualizado' } });

// Deletar
const { mutate: deleteCliente } = useDeleteCliente();
deleteCliente('cliente-id');

// Stats
const { data: stats } = useClientesStats();
```

### 2. `useTransacoesFinanceiras()`
```typescript
// Com filtros
const { data } = useTransacoes({
  tipo: 'receita',
  status: 'pago',
  dataInicio: '2025-01-01',
  clienteId: 'abc123'
});

// Criar transação
const { mutate: createTransacao } = useCreateTransacao();

// Stats financeiras
const { data: stats } = useFinancialStats('mes');

// Fluxo de caixa (30 dias)
const { data: fluxo } = useFluxoCaixa(30);
```

### 3. `useProjetos()`
```typescript
// Fetch com relações
const { data } = useProjetos({ 
  includeRelations: true,
  clienteId: '123',
  status: 'em_andamento'
});

// Projeto individual
const { data: projeto } = useProjeto(projetoId);

// Por cliente
const { data: projetos } = useProjetosByCliente(clienteId);

// Stats
const { data: stats } = useProjetosStats(clienteId);
```

---

## 🔄 Estratégia de Migração

### Passo 1: Módulo CRM (Clientes)
**Arquivo:** `src/pages/Clientes.tsx`

```diff
- import { useClientData } from '@/hooks/useClientData';
+ import { 
+   useClientes, 
+   useCreateCliente, 
+   useUpdateCliente, 
+   useDeleteCliente 
+ } from '@/hooks/useClientes';

function Clientes() {
-  const { clientes, loading, createCliente, updateCliente, deleteCliente } = useClientData();
+  const { data: clientes = [], isLoading } = useClientes();
+  const { mutate: createCliente } = useCreateCliente();
+  const { mutate: updateCliente } = useUpdateCliente();
+  const { mutate: deleteCliente } = useDeleteCliente();

  // ...resto do código permanece igual
}
```

### Passo 2: Módulo Financeiro
**Componentes a migrar:**
- `src/components/Financeiro/TodosLancamentos.tsx`
- `src/components/Financeiro/TitulosListaUnificada.tsx`
- `src/components/Financeiro/FluxoPorCategoria.tsx`

```diff
- const [transacoes, setTransacoes] = useState([]);
- useEffect(() => {
-   const fetch = async () => {
-     const { data } = await supabase.from('transacoes_financeiras').select('*');
-     setTransacoes(data);
-   };
-   fetch();
- }, []);

+ import { useTransacoes } from '@/hooks/useTransacoesFinanceiras';
+ const { data: transacoes = [], isLoading } = useTransacoes({ tipo: 'receita' });
```

### Passo 3: Módulo Projetos
```diff
- const [projetos, setProjetos] = useState([]);
+ import { useProjetos } from '@/hooks/useProjetos';
+ const { data: projetos = [], isLoading } = useProjetos({ includeRelations: true });
```

---

## ⚡ Configurações de Cache

### Atual (já configurado em `src/App.tsx`)
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minuto default
      gcTime: 5 * 60 * 1000, // 5 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Por Hook (personalizado)
```typescript
// Clientes - cache 5 min
staleTime: 5 * 60 * 1000

// Transações - cache 2 min (muda mais)
staleTime: 2 * 60 * 1000

// Stats - cache 10 min (muda menos)
staleTime: 10 * 60 * 1000
```

---

## 🎨 Invalidação de Cache

### Automática (já implementada)
```typescript
const { mutate: createCliente } = useCreateCliente();

createCliente(novoCliente); // ✅ Invalida cache automaticamente
```

### Manual (quando necessário)
```typescript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// Invalidar clientes
queryClient.invalidateQueries({ queryKey: ['clientes'] });

// Invalidar financeiro
queryClient.invalidateQueries({ queryKey: ['transacoes_financeiras'] });

// Refetch imediato
queryClient.refetchQueries({ queryKey: ['clientes'] });
```

---

## 📈 Performance Esperada

### Redução de Requests
- **Antes:** 143 chamadas diretas
- **Depois:** ~20-30 chamadas (cache + deduplicação)
- **Economia:** ~70-80% menos requests

### Tempo de Carregamento
- **Cache hit:** ~0ms (instantâneo)
- **Cache miss:** ~200-500ms (rede)
- **Navegação:** 5x mais rápida

### UX Melhorada
- ✅ Transições instantâneas (cache)
- ✅ Loading states consistentes
- ✅ Erro handling unificado
- ✅ Optimistic updates
- ✅ Background refetch

---

## 🔍 Debugging

### DevTools (já configurado)
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Já está em App.tsx - apenas abrir DevTools
```

**Ver:**
- Queries ativas
- Cache status
- Refetch automático
- Mutations pendentes

---

## ✅ Checklist de Migração

### Fase 1: CRM (Prioridade Alta)
- [ ] `src/pages/Clientes.tsx` → `useClientes()`
- [ ] `src/components/ClientCard.tsx` → usar props do cache
- [ ] `src/components/ClientTableView.tsx` → usar props do cache
- [ ] Remover `useClientData()` antigo

### Fase 2: Financeiro (Prioridade Alta)
- [ ] `src/components/Financeiro/TodosLancamentos.tsx`
- [ ] `src/components/Financeiro/TitulosListaUnificada.tsx`
- [ ] `src/components/Financeiro/FluxoPorCategoria.tsx`
- [ ] `src/components/Financeiro/DividasParceladasTab.tsx`
- [ ] Dashboard já usa TanStack Query ✅

### Fase 3: Projetos (Prioridade Média)
- [ ] `src/pages/Projetos.tsx` → `useProjetos()`
- [ ] Componentes de listagem
- [ ] Detalhes de projeto

### Fase 4: Outros Módulos
- [ ] Tarefas
- [ ] Eventos/Calendário
- [ ] Metas

---

## 🚨 Pontos de Atenção

### 1. Real-time ainda funciona
```typescript
// Supabase real-time continua funcionando
useEffect(() => {
  const channel = supabase
    .channel('clientes-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'clientes' },
      () => {
        // Invalidar cache quando há mudanças
        queryClient.invalidateQueries({ queryKey: ['clientes'] });
      }
    )
    .subscribe();

  return () => { channel.unsubscribe(); };
}, []);
```

### 2. Auth ainda usa Supabase direto
```typescript
// Auth não precisa de cache
const { user } = useAuth(); // ✅ Continua igual
```

### 3. Edge Functions continuam normais
```typescript
// Edge functions não mudam
await supabase.functions.invoke('minha-funcao'); // ✅ OK
```

---

## 🎯 Próximos Passos

1. **Validar hooks criados** ✅
2. **Migrar Clientes** (maior impacto)
3. **Migrar Financeiro** (143→ ~30 requests)
4. **Medir performance** (DevTools)
5. **Ajustar staleTime** se necessário
6. **Documentar para equipe**

---

## 📚 Recursos

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Supabase + React Query](https://supabase.com/docs/guides/database/react-query)
- DevTools: `Ctrl + Shift + I` → React Query panel

---

**Implementado por:** Lovable AI  
**Data:** 11/11/2025  
**Status:** ✅ Hooks criados - Pronto para migração
