# Guia de Migração - Tema BEX Gaming

## Visão Geral

O sistema foi migrado para o tema **BEX Gaming**, aplicando automaticamente estilos consistentes em todos os componentes de UI através de uma propagação global.

## O que mudou?

### ✅ Componentes Atualizados Automaticamente

1. **Todos os Dialogs (Modais)**
   - Overlay escuro com `backdrop-blur-md`
   - Fundo `bg-black/40`
   - Borda verde BEX (`border-bex/20`)
   - Sombra gaming (`shadow-2xl shadow-bex/20`)

2. **Todos os Cards**
   - Variante `gaming` aplicada por padrão
   - Glow verde ao hover (`withGlow`)
   - Fundo `bg-card` com borda `border-bex/30`

3. **Todos os Buttons**
   - Variante padrão usa cor BEX verde (`#54C43D`)
   - Sombra com glow (`shadow-bex-glow`)
   - Hover com `bg-bex-dark`

### 🎨 Tipografia BEX

Classes globais disponíveis:
- `bex-title-primary` → Títulos principais (h1)
- `bex-title-secondary` → Subtítulos (h2)
- `bex-title-tertiary` → Cabeçalhos de seção (h3)
- `bex-body` → Texto de corpo padrão
- `bex-text-muted` → Textos secundários/legendas

**Fontes:**
- **Montserrat** (SemiBold 600-700) para títulos
- **Inter** (Regular 400-500) para corpo de texto

### 🎯 Como funciona a propagação automática?

O sistema utiliza **component wrappers** nos arquivos base de UI:

1. `src/components/ui/dialog.tsx` → Re-exporta `BexDialogContent` com `variant="gaming"`
2. `src/components/ui/card.tsx` → Re-exporta `BexCard` com `variant="gaming"` e `withGlow`
3. `src/components/ui/button.tsx` → Variante `default` usa estilo BEX

**Resultado:** Todos os 103+ arquivos que importam esses componentes herdam automaticamente o tema BEX Gaming.

## Para Desenvolvedores

### ✅ Uso Normal (Tema Gaming Automático)

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Todos esses componentes já vêm com o tema BEX Gaming aplicado
<Dialog>
  <DialogContent> {/* Já é variant="gaming" */}
    <DialogHeader>
      <DialogTitle>Meu Modal</DialogTitle>
    </DialogHeader>
  </DialogContent>
</Dialog>

<Card> {/* Já é variant="gaming" withGlow */}
  <CardHeader>...</CardHeader>
</Card>

<Button> {/* Já é verde BEX */}
  Clique Aqui
</Button>
```

### ⚠️ Desabilitar tema gaming em casos específicos

Se precisar usar o estilo padrão (sem gaming):

```tsx
import { Card } from '@/components/ui/card';

<Card variant="default" withGlow={false}>
  {/* Card sem tema gaming */}
</Card>
```

### 🔧 Usar componentes BEX diretamente

Para controle total:

```tsx
import { BexCard } from '@/components/ui/bex-card';
import { BexDialogContent } from '@/components/ui/bex-dialog';

<BexCard variant="glass"> {/* Glass effect */}
<BexDialogContent variant="gaming"> {/* Explicitamente gaming */}
```

## Arquivos Principais Modificados

### Criados
- `src/contexts/BexThemeContext.tsx` - Provider de tema global
- `docs/MIGRATION_BEX_GAMING.md` - Este documento

### Modificados
- `src/App.tsx` - Adicionado `<BexThemeProvider>`
- `src/components/ui/dialog.tsx` - Re-exporta BexDialog
- `src/components/ui/card.tsx` - Re-exporta BexCard
- `src/components/ui/button.tsx` - Variante default é BEX
- `src/components/SectionHeader.tsx` - Usa tipografia BEX
- `src/components/ui/bex-dialog.tsx` - Componente base BEX
- `src/components/ui/bex-card.tsx` - Componente base BEX
- `src/components/ui/bex-button.tsx` - Componente base BEX

## Impacto nos Módulos

### ✅ Propagação Automática Funciona Em:

- **GRS** - Todos os modais, cards e botões
- **Audiovisual** - Tarefas, captações, equipamentos
- **Design** - Biblioteca, aprovações, calendário
- **Administrativo** - Orçamentos, propostas, contratos
- **Financeiro** - Dashboard, produtos, relatórios
- **RH/DP** - Colaboradores, folha de ponto
- **Inventário** - Listagens e gerenciamento
- **Calendário** - Visualizações e eventos

### 🎯 Total de Arquivos Impactados

- **103 arquivos** com `Dialog` → Tema gaming automático
- **50+ arquivos** com `Card` → Tema gaming automático
- **200+ arquivos** com `Button` → Tema gaming automático

## Troubleshooting

### Problema: Card ou Dialog não está com tema gaming

**Solução 1:** Verifique se está importando do caminho correto:
```tsx
// ✅ CORRETO
import { Dialog, DialogContent } from '@/components/ui/dialog';

// ❌ ERRADO
import { Dialog } from '@radix-ui/react-dialog';
```

**Solução 2:** Limpe o cache e reconstrua:
```bash
rm -rf node_modules/.vite
npm run dev
```

### Problema: Tipografia não aparece

Certifique-se que as classes BEX existem em `src/index.css`:
```css
.bex-title-primary { ... }
.bex-body { ... }
```

## Próximos Passos

1. ✅ **Validar visualmente** todas as páginas principais
2. ✅ **Testar modais** de criação e edição de tarefas
3. ✅ **Verificar FABs** em páginas de listagem
4. 📝 **Documentar componentes customizados** que precisam adaptação

## Suporte

Para dúvidas ou problemas, consulte:
- `docs/BEX_DESIGN_SYSTEM.md` - Documentação completa do design system
- `src/styles/bex-theme.ts` - Definições de cores e estilos
- `src/contexts/BexThemeContext.tsx` - Provider de tema

---

**Data de implementação:** 2025-10-13  
**Versão:** 1.0.0
