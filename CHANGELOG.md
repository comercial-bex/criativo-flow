# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [Unreleased]

## [2.0.0] - Kanban Board Improvements - 2025-01-15

### ✅ Added
- Delay de 200ms no drag para prevenir conflito com click simples
- Detecção de drop sobre cards (além de colunas) em todos os boards Kanban
- Função helper `findColumnByTaskId` para localização automática de colunas ao soltar cards
- Configuração padronizada de sensores (`PointerSensor`) em todos os componentes Kanban
- Parâmetro `tolerance: 5` para permitir pequenos movimentos durante o delay
- Documentação completa da implementação Kanban (`docs/KANBAN_IMPLEMENTATION.md`)

### 🔧 Changed
- **UniversalKanbanBoard.tsx**: 
  - Sensor com `activationConstraint` (delay: 200ms, distance: 8px, tolerance: 5px)
  - `handleDragEnd` agora detecta drops sobre cards automaticamente
- **TarefasKanban.tsx**: 
  - Adicionados imports `PointerSensor`, `useSensor`, `useSensors`
  - Sensor configurado com mesmos parâmetros de delay/distance/tolerance
  - `handleDragEnd` refatorado para usar `findColumnByTaskId`
  - `DndContext` agora recebe prop `sensors`
- **TaskKanbanBoard.tsx**: 
  - Sensor atualizado de `distance: 5` para `distance: 8` com delay de 200ms
- **ModernKanbanCard.tsx**: 
  - Click simples abre modal (removido botão dedicado `Maximize2`)
  - `onClick` movido para elemento raiz do card
  - Badge de prioridade reposicionado para `top-2 left-2`

### 🐛 Fixed
- Click acidental ao tentar arrastar cards
- Drop sobre cards não detectava coluna correta
- Drag iniciava sem querer ao clicar no card
- Conflito entre evento de click e início de drag

### 📚 Documentation
- Criado guia completo de implementação Kanban
- Documentados parâmetros de configuração do sensor
- Adicionados cenários de teste (desktop e mobile)
- Incluído troubleshooting para problemas comuns
- Mapeados todos os módulos e boards do sistema

### 🎨 UX Improvements
- Interação mais intuitiva: click abre, hold arrasta
- Feedback visual consistente em todos os boards
- Suporte melhorado para mobile (touch & hold)
- Menu Quick Move preservado sem interferências

---

## Formato do Changelog

Este changelog segue os princípios de [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

### Categorias
- **Added**: Novas funcionalidades
- **Changed**: Mudanças em funcionalidades existentes
- **Deprecated**: Funcionalidades que serão removidas
- **Removed**: Funcionalidades removidas
- **Fixed**: Correções de bugs
- **Security**: Correções de vulnerabilidades
