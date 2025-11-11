# Breadcrumbs - Guia de Uso

## 📍 O que são Breadcrumbs?

Breadcrumbs (migalhas de pão) são indicadores de navegação que mostram a localização atual do usuário na hierarquia do site. Implementados automaticamente no GlobalHeader.

## 🎨 Aparência

```
Home > Clientes > João Silva Ltda > Projetos
[Icon] [Icon]      [Nome Real]      [Icon]
```

- **Links clicáveis**: Todos os itens exceto o último
- **Item atual**: Destacado com background BEX verde e fonte medium
- **Ícones**: Cada nível tem seu ícone específico
- **Separador**: ChevronRight entre os itens
- **Hover**: Efeito de hover com background BEX sutil
- **Nomes Dinâmicos**: IDs são automaticamente resolvidos para nomes reais
- **Loading State**: Spinner animado enquanto busca dados

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

### Resolução Dinâmica de Nomes

Breadcrumbs agora **resolvem automaticamente** IDs para nomes reais!

**Como funciona:**
1. Sistema detecta IDs na URL (UUIDs ou números)
2. Identifica o tipo de recurso pelo segmento anterior
3. Busca o nome real via React Query
4. Exibe loading spinner enquanto carrega
5. Mostra nome real quando dados estão disponíveis

**Exemplo em ação:**
```
Rota: /clients/550e8400-e29b-41d4-a716-446655440000/projects
Breadcrumbs: Home > Clientes > João Silva Ltda > Projetos
                             ↑ Nome buscado do banco!
```

**Tipos de recursos suportados:**
- `cliente` - Mostra nome do cliente
- `projeto` - Mostra título do projeto  
- `roteiro` - Mostra título do roteiro
- `contrato` - Mostra título do contrato
- `produto` - Mostra nome do produto
- `orcamento` - Mostra título/número do orçamento
- `proposta` - Mostra título/número da proposta
- `colaborador` - Mostra nome do colaborador
- `tarefa` - Mostra título da tarefa
- `planejamento` - Mostra título do planejamento

### Detecção de IDs

Breadcrumbs automaticamente **detectam** segmentos que são IDs:
- UUIDs: `550e8400-e29b-41d4-a716-446655440000`
- Numéricos: `123`, `456`

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

### Breadcrumbs com Nome Real do Recurso

Acesse uma página com ID e veja o nome real sendo carregado:

```typescript
// Navegue para: /clients/abc-123-def/projects
// Breadcrumbs automaticamente mostram:
// Home > Clientes > [Nome do Cliente Real] > Projetos

// O sistema busca automaticamente os dados necessários!
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

## 🔌 Resolvers de Dados

Os breadcrumbs usam hooks especializados para buscar nomes reais:

### Hooks Disponíveis

Todos localizados em `src/hooks/useBreadcrumbResolvers.ts`:

- `useClienteResolver(id)` - Busca nome do cliente
- `useProjetoResolver(id)` - Busca título do projeto
- `useRoteiroResolver(id)` - Busca título do roteiro
- `useContratoResolver(id)` - Busca título do contrato
- `useProdutoResolver(id)` - Busca nome do produto
- `useOrcamentoResolver(id)` - Busca título/número do orçamento
- `usePropostaResolver(id)` - Busca título/número da proposta
- `useColaboradorResolver(id)` - Busca nome do colaborador
- `useTarefaResolver(id)` - Busca título da tarefa
- `usePlanejamentoResolver(id)` - Busca título do planejamento

### Como Adicionar Novo Tipo de Recurso

1. **Criar resolver** em `src/hooks/useBreadcrumbResolvers.ts`:

```typescript
export function useMeuRecursoResolver(id?: string): ResolverResult {
  const { data, isLoading } = useQuery({
    queryKey: ["meu-recurso-breadcrumb", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("minha_tabela")
        .select("nome_campo")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  return {
    label: data?.nome_campo || id || "",
    isLoading,
  };
}
```

2. **Adicionar ao mapeamento** em `src/components/Breadcrumbs.tsx`:

```typescript
const resourceTypeMap: Record<string, string> = {
  "meu-recurso": "meurecurso",
  // ... outros mapeamentos
};
```

3. **Adicionar ao DynamicBreadcrumbItem** em `src/components/DynamicBreadcrumbItem.tsx`:

```typescript
const meuRecursoData = useMeuRecursoResolver(
  resourceType === "meurecurso" ? resourceId : undefined
);

// No switch:
case "meurecurso":
  resolverData = meuRecursoData;
  break;
```
