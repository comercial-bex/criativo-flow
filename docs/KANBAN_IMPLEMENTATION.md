# 📋 Documentação de Implementação - Kanban Board

## 🎯 Funcionalidades Implementadas

### ✅ Click para Abrir Modal
- **Comportamento**: Click simples no card abre o modal de detalhes
- **Localização**: Todos os `ModernKanbanCard`
- **Componentes**: `TaskKanbanBoard`, `UniversalKanbanBoard`, `TarefasKanban`

### ✅ Drag & Drop Inteligente
- **Delay**: 200ms de hold antes de iniciar drag
- **Distance**: 8px de movimento mínimo
- **Tolerance**: 5px de tolerância durante o delay
- **Drop Zones**: Cards podem ser soltos sobre colunas OU sobre outros cards

### ✅ Detecção de Destino
```typescript
// Função helper em todos os boards
const findColumnByTaskId = (taskId: string): string | undefined => {
  const column = columns.find(col => 
    col.tasks.some(task => task.id === taskId)
  );
  return column?.id;
};
```

## 🔧 Configurações do Sensor

```typescript
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,    // Movimento mínimo para iniciar drag
      delay: 200,     // Tempo de hold antes do drag
      tolerance: 5,   // Movimento permitido durante o delay
    },
  })
);
```

### Explicação dos Parâmetros:

- **`distance: 8`**: O usuário precisa mover o ponteiro pelo menos 8 pixels antes que o drag seja iniciado
- **`delay: 200`**: O usuário precisa manter pressionado por 200ms antes de iniciar o drag
- **`tolerance: 5`**: Durante os 200ms de delay, o usuário pode mover até 5px sem cancelar o drag

Esta combinação garante que:
- Um click rápido não inicia drag (devido ao delay)
- Pequenos movimentos durante o click não são interpretados como drag (devido à tolerance)
- O usuário tem controle preciso sobre quando quer arrastar (distance + delay)

## 📦 Componentes Atualizados

| Componente | Status | Drag & Drop | Click Modal | Drop sobre Cards |
|-----------|--------|-------------|-------------|------------------|
| `TaskKanbanBoard.tsx` | ✅ | ✅ | ✅ | ✅ |
| `UniversalKanbanBoard.tsx` | ✅ | ✅ | ✅ | ✅ |
| `TarefasKanban.tsx` | ✅ | ✅ | ✅ | ✅ |
| `ModernKanbanCard.tsx` | ✅ | ✅ | ✅ | N/A |

## 🎨 UX/UI Guidelines

### Interações do Card:
1. **Click simples**: Abre modal de detalhes
2. **Hold 200ms + Drag**: Move o card entre colunas
3. **Menu Quick Move (⋮)**: Move diretamente sem drag
4. **Menu tem `stopPropagation`**: Não interfere com drag/click

### Feedback Visual:
- `cursor-grab`: Card em repouso
- `cursor-grabbing`: Durante drag
- `opacity-50`: Card sendo arrastado
- `ring-2 ring-bex`: Coluna receptora (isOver)

### Drop Zones:
- **Drop sobre coluna vazia**: Detecta pelo ID da coluna
- **Drop sobre card**: Usa `findColumnByTaskId` para identificar a coluna do card de destino
- **Drop sobre header/footer da coluna**: Detecta pelo ID da coluna

## 🧪 Testes Recomendados

### Cenário 1: Drag & Drop
- [ ] Arrastar card entre colunas vazias
- [ ] Arrastar card e soltar sobre outro card
- [ ] Arrastar card e soltar no topo da coluna
- [ ] Arrastar card e soltar no rodapé da coluna
- [ ] Arrastar múltiplos cards seguidos

### Cenário 2: Click vs Drag
- [ ] Click rápido abre modal (não inicia drag)
- [ ] Hold 200ms inicia drag (não abre modal)
- [ ] Click no menu ⋮ abre dropdown (não drag/modal)
- [ ] Click em badges/avatars dentro do card

### Cenário 3: Mobile
- [ ] Touch & hold 200ms inicia drag
- [ ] Tap rápido abre modal
- [ ] Drag funciona suavemente
- [ ] Scroll da coluna não interfere com drag

### Cenário 4: Módulos Específicos
- [ ] **UniversalKanbanBoard**: Admin > Tarefas
- [ ] **UniversalKanbanBoard**: Design > Tarefas
- [ ] **UniversalKanbanBoard**: Audiovisual > Tarefas
- [ ] **TarefasKanban**: Cliente > Planejamento > Tarefas
- [ ] **TaskKanbanBoard**: GRS > Projeto > Tarefas

## 🐛 Troubleshooting

### Problema: Click abre modal e inicia drag
**Solução**: Verificar `activationConstraint.delay` >= 200ms

### Problema: Não consegue soltar sobre cards
**Solução**: Verificar se `findColumnByTaskId` está implementada corretamente

### Problema: Drag muito sensível
**Solução**: Aumentar `distance` para 10-15px ou `delay` para 250-300ms

### Problema: Drag não inicia
**Solução**: 
- Verificar se `{...listeners}` está no elemento raiz do card
- Verificar se `sensors` está sendo passado ao `DndContext`

### Problema: Drop não funciona em coluna específica
**Solução**: 
- Verificar se `useDroppable({ id: column.id })` está configurado
- Verificar se o ID da coluna está correto

## 📐 Arquitetura

### Fluxo de Drag & Drop:

```
1. Usuário pressiona o card
   ↓
2. Aguarda 200ms (delay)
   ↓
3. Durante delay: pode mover até 5px (tolerance)
   ↓
4. Após 200ms: drag inicia
   ↓
5. Arrasta até zona de drop (coluna ou card)
   ↓
6. Solta o card
   ↓
7. handleDragEnd:
   - Verifica se drop foi em coluna (pelo ID)
   - Se não, busca coluna via findColumnByTaskId
   - Chama onTaskMove com taskId e newStatus
   ↓
8. Atualiza estado local e banco de dados
```

### Hierarquia de Componentes:

```
DndContext (com sensors)
├── UniversalKanbanColumn / TaskKanbanColumn
│   ├── useDroppable({ id: columnId })
│   └── SortableContext
│       └── ModernKanbanCard
│           ├── useSortable()
│           ├── onClick → abre modal
│           └── {...listeners} → drag & drop
└── DragOverlay
    └── ModernKanbanCard (visual durante drag)
```

## 🔄 Fluxo de Atualização

### Quando card é movido:

1. **`handleDragEnd`** detecta novo status
2. **`onTaskMove(taskId, newStatus)`** é chamado
3. Componente pai atualiza Supabase:
   ```typescript
   await supabase
     .from('tarefa')
     .update({ status: newStatus })
     .eq('id', taskId);
   ```
4. Estado local é atualizado via `setTasks`
5. Board re-renderiza com nova posição do card

## 💡 Boas Práticas

### DO's ✅
- Use `findColumnByTaskId` para detectar drops sobre cards
- Configure `sensors` com delay adequado (200ms é ideal)
- Use `stopPropagation` em menus/botões dentro do card
- Implemente feedback visual durante drag (opacity, shadows)
- Teste em mobile e desktop

### DON'Ts ❌
- Não use `onDoubleClick` para abrir modais (conflita com drag)
- Não coloque `onClick` em elementos filhos do card (use no card raiz)
- Não esqueça de passar `sensors` ao `DndContext`
- Não use IDs duplicados em colunas ou tasks
- Não modifique estado durante `handleDragStart` (apenas tracking)

## 📊 Performance

### Otimizações Implementadas:

- **`useMemo`** para filtrar tasks
- **`useMemo`** para organizar colunas
- **SortableContext** por coluna (não global)
- **DragOverlay** para visual suave durante drag

### Métricas Esperadas:

- **Tempo de resposta ao drag**: < 50ms
- **FPS durante drag**: 60fps
- **Tempo de atualização no DB**: < 200ms
- **Re-render após drop**: < 100ms

## 🔐 Segurança

### Validações Implementadas:

- Verifica se `targetColumn` existe antes de mover
- Valida status permitidos por módulo
- Usa `RLS policies` no Supabase para controle de acesso
- Toast de erro caso atualização falhe

## 🌍 Módulos Suportados

| Módulo | Colunas | Board Component |
|--------|---------|-----------------|
| **GRS** | Em Cadastro → A Fazer → Em Andamento → Em Revisão → Em Análise | UniversalKanbanBoard |
| **Design** | Briefing → Em Criação → Revisão Interna → Aprovação Cliente → Entregue | UniversalKanbanBoard |
| **Audiovisual** | Roteiro → Pré-Produção → Gravação → Pós-Produção → Entregue | UniversalKanbanBoard |
| **CRM** | Novo → Qualificado → Proposta → Negociação → Fechado | UniversalKanbanBoard |
| **Lead** | Novo → Contato → Qualificado → Oportunidade → Convertido | UniversalKanbanBoard |
| **Geral** | Backlog → A Fazer → Em Andamento → Concluído | UniversalKanbanBoard |
| **Planejamento** | Backlog → Para Fazer → Em Andamento → Em Revisão → Concluída | TarefasKanban |
| **Projeto GRS** | (Customizável) | TaskKanbanBoard |

## 📝 Changelog

### Versão 2.0.0 (2025-01-15)
- ✅ Implementado delay de 200ms no drag
- ✅ Adicionado detecção de drop sobre cards
- ✅ Criado `findColumnByTaskId` helper
- ✅ Padronizado UX em todos os boards
- ✅ Removido double-click (agora é click simples)
- ✅ Documentação completa criada

## 🔗 Links Úteis

- **dnd-kit Docs**: https://docs.dndkit.com/
- **Activation Constraints**: https://docs.dndkit.com/api-documentation/sensors#activation-constraints
- **Collision Detection**: https://docs.dndkit.com/api-documentation/context-provider/collision-detection-algorithms
