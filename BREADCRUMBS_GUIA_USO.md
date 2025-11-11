# Breadcrumbs - Guia de Uso

## 📍 O que são Breadcrumbs?

Breadcrumbs (migalhas de pão) são indicadores de navegação que mostram a localização atual do usuário na hierarquia do site. Implementados automaticamente no GlobalHeader.

## 🎨 Aparência

```
Home > GRS > Roteiro IA > Novo Roteiro
[Icon] [Icon]  [Icon]      [Icon destacado]
```

- **Links clicáveis**: Todos os itens exceto o último
- **Item atual**: Destacado com background BEX verde e fonte medium
- **Ícones**: Cada nível tem seu ícone específico
- **Separador**: ChevronRight entre os itens
- **Hover**: Efeito de hover com background BEX sutil

## 📋 Configuração de Rotas

As rotas são configuradas no arquivo `src/components/Breadcrumbs.tsx`:

```typescript
const routeConfig: Record<string, { label: string; icon?: string }> = {
  "/grs/roteiro-ia": { label: "Roteiro IA", icon: "Film" },
  "/grs/roteiro-ia/novo": { label: "Novo Roteiro", icon: "FilePlus" },
  // ... mais rotas
};
```

## ➕ Adicionar Nova Rota aos Breadcrumbs

1. Abra `src/components/Breadcrumbs.tsx`
2. Adicione a configuração no objeto `routeConfig`:

```typescript
// Exemplo: Adicionar rota de análise de dados
"/inteligencia/analise-dados": { 
  label: "Análise de Dados", 
  icon: "BarChart3" 
},
```

3. Use qualquer ícone do lucide-react disponível

## 🔧 Props do Componente

```typescript
<Breadcrumbs 
  maxItems={5}        // Máximo de itens visíveis (opcional)
  className="px-4"    // Classes CSS adicionais (opcional)
/>
```

### maxItems

Quando há muitos níveis, breadcrumbs longos são truncados:
```
Home > ... > Roteiro IA > Novo Roteiro
```

## 🎯 Comportamento

### Detecção de IDs

Breadcrumbs automaticamente **ignoram** segmentos que são IDs:
- UUIDs: `550e8400-e29b-41d4-a716-446655440000`
- Numéricos: `123`, `456`

**Exemplo:**
```
Rota: /clientes/550e8400-e29b-41d4-a716-446655440000/projetos
Breadcrumbs: Home > Clientes > Projetos
```

### Fallback Automático

Se uma rota não está configurada, o sistema:
1. Capitaliza o segmento
2. Substitui hífens por espaços
3. Não adiciona ícone

**Exemplo:**
```
Rota não configurada: /minha-nova-pagina
Breadcrumb gerado: Minha Nova Pagina
```

## 🎨 Estilo e Temas

### Item Normal (clicável)
```tsx
<Link className="
  text-muted-foreground 
  hover:text-bex 
  hover:bg-bex/10
  transition-all duration-200
">
```

### Item Atual
```tsx
<div className="
  bg-bex/10 
  text-bex 
  font-medium
">
```

## 📱 Responsividade

- **Desktop/Tablet**: Breadcrumbs visíveis no GlobalHeader
- **Mobile**: Ocultos automaticamente para economizar espaço

## 🔍 Hook useBreadcrumbs

Você pode usar o hook diretamente em componentes personalizados:

```typescript
import { useBreadcrumbs } from "@/components/Breadcrumbs";

function MyComponent() {
  const breadcrumbs = useBreadcrumbs();
  
  // breadcrumbs é um array de BreadcrumbItem
  // [
  //   { label: "Home", path: "/inicio", icon: Home },
  //   { label: "GRS", path: "/grs", icon: Globe },
  //   ...
  // ]
  
  return (
    <div>
      Você está em: {breadcrumbs[breadcrumbs.length - 1].label}
    </div>
  );
}
```

## 🛠️ Exemplos de Configuração

### Adicionar Módulo Completo

```typescript
// Marketing Digital
"/marketing": { label: "Marketing", icon: "Megaphone" },
"/marketing/campanhas": { label: "Campanhas", icon: "Target" },
"/marketing/campanhas/nova": { label: "Nova Campanha", icon: "Plus" },
"/marketing/analytics": { label: "Analytics", icon: "BarChart3" },
```

### Rota com Subníveis

```typescript
"/projetos": { label: "Projetos", icon: "FolderOpen" },
"/projetos/cliente": { label: "Cliente", icon: "User" },
"/projetos/cliente/tarefas": { label: "Tarefas", icon: "CheckSquare" },
"/projetos/cliente/tarefas/nova": { label: "Nova Tarefa", icon: "Plus" },
```

## 🎯 Melhores Práticas

1. **Labels curtos**: Máximo 2-3 palavras
2. **Ícones consistentes**: Use o mesmo ícone para conceitos similares
3. **Hierarquia clara**: Organize rotas de forma lógica
4. **Evite profundidade excessiva**: Máximo 4-5 níveis

## 🚀 Performance

- Breadcrumbs são **memoizados** com `useMemo`
- Recalculados apenas quando `location.pathname` muda
- Não causam re-renders desnecessários
- Leves e otimizados para produção

## 🔗 Integração com Navegação

Breadcrumbs funcionam perfeitamente com:
- React Router (Links nativos)
- Sidebar navigation
- Mobile bottom navigation
- Busca universal
- Histórico do navegador

## 📚 Ícones Disponíveis

Todos os ícones do lucide-react podem ser usados:

```typescript
// Mais comuns
"Home", "Users", "Settings", "Bell", "Calendar",
"File", "Folder", "Search", "Mail", "Phone",
"BarChart3", "TrendingUp", "Activity", "Target",
"Film", "Camera", "Image", "Video", "Music",
"Package", "ShoppingCart", "CreditCard", "DollarSign"
// ... e centenas de outros
```

Veja todos em: https://lucide.dev/icons
