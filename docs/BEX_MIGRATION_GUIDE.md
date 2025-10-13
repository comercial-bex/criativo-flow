# 🔄 Guia de Migração - BEX Gaming Design System

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Preparação](#preparação)
3. [Migração de Cards](#migração-de-cards)
4. [Migração de Botões](#migração-de-botões)
5. [Migração de Badges](#migração-de-badges)
6. [Migração de Tipografia](#migração-de-tipografia)
7. [Migração de Formulários](#migração-de-formulários)
8. [Migração de Tabs](#migração-de-tabs)
9. [Migração de Cores](#migração-de-cores)
10. [Efeitos Visuais](#efeitos-visuais)
11. [Checklist de Migração](#checklist-de-migração)
12. [Problemas Comuns](#problemas-comuns)

---

## 📖 Visão Geral

Este guia ajudará você a migrar componentes existentes para o **BEX Gaming Design System**, garantindo:

- ✅ Consistência visual em toda aplicação
- ✅ Uso correto de cores e tipografia
- ✅ Aplicação de efeitos gaming (glassmorphism, glow, animações)
- ✅ Performance e acessibilidade

### Antes de Começar

**IMPORTANTE:** Faça backup ou commit antes de iniciar a migração de qualquer arquivo!

---

## 🎯 Preparação

### 1. Identifique Componentes para Migração

Execute uma busca no projeto para encontrar:

```bash
# Buscar Cards antigos
grep -r "Card>" src/ --include="*.tsx"

# Buscar Buttons antigos
grep -r "Button>" src/ --include="*.tsx"

# Buscar classes de cores diretas (anti-pattern)
grep -r "text-white\|bg-white\|text-black\|bg-black" src/ --include="*.tsx"
```

### 2. Instale Dependências (se necessário)

Verifique se os componentes BEX estão disponíveis:

```bash
# Verificar se arquivos existem
ls src/components/ui/bex-*
```

### 3. Importe os Componentes BEX

No topo do arquivo que será migrado:

```tsx
// Antes
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Depois
import { BexCard, BexCardHeader, BexCardTitle, BexCardContent } from "@/components/ui/bex-card";
import { BexButton } from "@/components/ui/bex-button";
import { BexBadge } from "@/components/ui/bex-badge";
```

---

## 🎴 Migração de Cards

### Passo 1: Identificar Cards Antigos

**Antes:**
```tsx
<Card className="bg-card border-border">
  <CardHeader>
    <CardTitle className="text-white text-xl font-bold">
      Título do Card
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-gray-300">Conteúdo do card</p>
  </CardContent>
</Card>
```

### Passo 2: Converter para BexCard

**Depois:**
```tsx
<BexCard variant="gaming" withGlow>
  <BexCardHeader>
    <BexCardTitle>Título do Card</BexCardTitle>
  </BexCardHeader>
  <BexCardContent>
    <p className="bex-body">Conteúdo do card</p>
  </BexCardContent>
</BexCard>
```

### Variantes Disponíveis

| Caso de Uso | Variant | Props Extras |
|-------------|---------|--------------|
| Card padrão | `variant="default"` | - |
| Card com glass effect | `variant="glass"` | - |
| Card com brilho | `variant="glow"` | - |
| Card gaming completo | `variant="gaming"` | `withGlow` (opcional) |

### Exemplo Completo de Migração

**Arquivo:** `src/components/GRS/MetricasRapidas.tsx`

**Antes:**
```tsx
<Card className="bg-gradient-to-br from-card to-card/50 border border-bex/30 shadow-lg hover:shadow-bex/20 transition-all">
  <CardHeader className="pb-2">
    <CardTitle className="text-sm font-medium text-blue-400">
      Projetos - Pendente
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-3xl font-bold text-white">{metricas.projetosPendentes}</p>
  </CardContent>
</Card>
```

**Depois:**
```tsx
<BexCard variant="gaming" className="group">
  <BexCardHeader className="pb-2">
    <BexCardTitle className="text-sm font-medium text-blue-400">
      Projetos - Pendente
    </BexCardTitle>
  </BexCardHeader>
  <BexCardContent>
    <p className="text-3xl font-bold text-white">{metricas.projetosPendentes}</p>
  </BexCardContent>
</BexCard>
```

**Benefícios:**
- ✅ Menos classes custom
- ✅ Efeitos gaming automáticos
- ✅ Hover states consistentes
- ✅ Animações incluídas

---

## 🎛️ Migração de Botões

### Passo 1: Identificar Botões Antigos

**Antes:**
```tsx
<Button 
  className="bg-primary hover:bg-primary/90 text-white font-semibold"
  onClick={handleClick}
>
  <Plus className="mr-2 h-4 w-4" />
  Adicionar
</Button>
```

### Passo 2: Converter para BexButton

**Depois:**
```tsx
<BexButton 
  variant="bexGaming"
  onClick={handleClick}
>
  <Plus className="mr-2 h-4 w-4" />
  Adicionar
</BexButton>
```

### Mapeamento de Variantes

| Estilo Antigo | Nova Variant |
|---------------|--------------|
| `variant="default"` + bg-primary | `variant="bexGaming"` |
| `variant="default"` + bg-green | `variant="bex"` |
| `variant="outline"` + border-primary | `variant="bexOutline"` |
| `variant="ghost"` | `variant="bexGhost"` |
| Botão de ícone | `size="icon"` |

### Exemplos por Caso de Uso

#### Botão Primário de Ação

**Antes:**
```tsx
<Button className="bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg">
  Criar Projeto
</Button>
```

**Depois:**
```tsx
<BexButton variant="bexGaming">
  Criar Projeto
</BexButton>
```

#### Botão Secundário

**Antes:**
```tsx
<Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
  Ver Detalhes
</Button>
```

**Depois:**
```tsx
<BexButton variant="bexOutline">
  Ver Detalhes
</BexButton>
```

#### Botão de Ícone

**Antes:**
```tsx
<Button size="icon" className="bg-card hover:bg-card/80">
  <Settings className="h-5 w-5" />
</Button>
```

**Depois:**
```tsx
<BexButton variant="bexGhost" size="icon">
  <Settings className="h-5 w-5" />
</BexButton>
```

---

## 🏷️ Migração de Badges

### Passo 1: Identificar Badges Antigos

**Antes:**
```tsx
<Badge className="bg-green-500 text-white">
  Ativo
</Badge>
```

### Passo 2: Converter para BexBadge

**Depois:**
```tsx
<BexBadge variant="bex">
  Ativo
</BexBadge>
```

### Mapeamento de Status

| Status | Variant Recomendada |
|--------|---------------------|
| Ativo/Online/Sucesso | `variant="bex"` |
| Pendente/Em Andamento | `variant="bexGaming"` |
| Alerta/Atenção | `variant="secondary"` |
| Erro/Rejeitado | `variant="destructive"` |
| Com Brilho/Destaque | `variant="bexGlow"` |

### Exemplo com Ícone

**Antes:**
```tsx
<Badge className="bg-primary text-white flex items-center gap-1">
  <CheckCircle className="h-3 w-3" />
  Aprovado
</Badge>
```

**Depois:**
```tsx
<BexBadge variant="bexGaming">
  <CheckCircle className="mr-1 h-3 w-3" />
  Aprovado
</BexBadge>
```

---

## 📝 Migração de Tipografia

### Classes Antigas → Classes BEX

| Uso | Antes | Depois |
|-----|-------|--------|
| Título Principal | `text-2xl font-bold text-white` | `bex-title-primary` |
| Subtítulo | `text-lg font-semibold text-gray-100` | `bex-title-secondary` |
| Texto Corpo | `text-base text-gray-300` | `bex-body` |
| Texto Muted | `text-sm text-gray-400` | `bex-text-muted` |

### Exemplo de Migração

**Antes:**
```tsx
<div className="space-y-4">
  <h1 className="text-3xl font-bold text-white">
    Dashboard GRS
  </h1>
  <h2 className="text-xl font-semibold text-gray-200">
    Visão Geral
  </h2>
  <p className="text-base text-gray-300">
    Aqui você encontra suas métricas principais
  </p>
  <span className="text-sm text-gray-400">
    Atualizado há 5 minutos
  </span>
</div>
```

**Depois:**
```tsx
<div className="space-y-4">
  <h1 className="bex-title-primary">
    Dashboard GRS
  </h1>
  <h2 className="bex-title-secondary">
    Visão Geral
  </h2>
  <p className="bex-body">
    Aqui você encontra suas métricas principais
  </p>
  <span className="bex-text-muted">
    Atualizado há 5 minutos
  </span>
</div>
```

### Benefícios

- ✅ Consistência automática de fontes (Montserrat para títulos, Inter para corpo)
- ✅ Pesos e tamanhos padronizados
- ✅ Suporte automático a dark mode
- ✅ Menos classes para lembrar

---

## 📋 Migração de Formulários

### Inputs

**Antes:**
```tsx
<input 
  className="w-full px-3 py-2 bg-card border border-input text-white rounded-md focus:ring-2 focus:ring-primary"
  placeholder="Digite aqui..."
/>
```

**Depois:**
```tsx
<Input 
  placeholder="Digite aqui..."
  className="focus:ring-bex focus:border-bex"
/>
```

### Form Labels

**Antes:**
```tsx
<label className="text-sm font-medium text-white mb-2">
  Nome do Projeto
</label>
```

**Depois:**
```tsx
<label className="text-sm font-medium text-foreground">
  Nome do Projeto
</label>
```

### Exemplo Completo de Form

**Antes:**
```tsx
<div className="space-y-4">
  <div>
    <label className="text-sm font-medium text-white">Email</label>
    <input 
      type="email"
      className="w-full px-3 py-2 bg-card border border-input text-white rounded-md"
    />
  </div>
  <button className="w-full bg-primary hover:bg-primary/90 text-white py-2 rounded-md">
    Enviar
  </button>
</div>
```

**Depois:**
```tsx
<div className="space-y-4">
  <div className="space-y-2">
    <label className="text-sm font-medium text-foreground">Email</label>
    <Input type="email" />
  </div>
  <BexButton variant="bexGaming" className="w-full">
    Enviar
  </BexButton>
</div>
```

---

## 🗂️ Migração de Tabs

**Antes:**
```tsx
<Tabs defaultValue="tab1" className="w-full">
  <TabsList className="bg-muted">
    <TabsTrigger value="tab1" className="data-[state=active]:bg-primary">
      Aba 1
    </TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    Conteúdo
  </TabsContent>
</Tabs>
```

**Depois:**
```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">
      Aba 1
    </TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    Conteúdo
  </TabsContent>
</Tabs>
```

**Nota:** O componente Tabs já possui estilos BEX automáticos. Remova classes customizadas desnecessárias.

---

## 🎨 Migração de Cores

### ❌ Anti-Patterns (NUNCA USE)

```tsx
// ERRADO - Cores diretas
className="text-white bg-black"
className="text-gray-300 bg-gray-900"
className="border-green-500"

// ERRADO - Valores HEX/RGB diretos
style={{ color: '#ffffff', background: '#000000' }}
```

### ✅ Padrão BEX Correto

```tsx
// CORRETO - Tokens semânticos
className="text-foreground bg-background"
className="text-muted-foreground bg-card"
className="border-bex"

// CORRETO - Classes BEX
className="text-bex bg-bex/10"
className="text-bex-light border-bex/30"
```

### Mapeamento de Cores

| Cor Antiga | Token BEX | Uso |
|------------|-----------|-----|
| `text-white` | `text-foreground` | Texto principal |
| `text-gray-300` | `text-muted-foreground` | Texto secundário |
| `bg-black` | `bg-background` | Fundo principal |
| `bg-gray-900` | `bg-card` | Fundo de cards |
| `bg-green-500` | `bg-bex` | Verde BEX |
| `border-gray-700` | `border-border` | Bordas padrão |
| `border-green-500` | `border-bex` | Bordas BEX |

### Exemplo Completo

**Antes:**
```tsx
<div className="bg-black border border-gray-800 rounded-lg p-4">
  <h2 className="text-white text-xl font-bold mb-2">
    Título
  </h2>
  <p className="text-gray-300 mb-4">
    Descrição do card
  </p>
  <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
    Ação
  </button>
</div>
```

**Depois:**
```tsx
<BexCard variant="gaming">
  <BexCardHeader>
    <BexCardTitle>Título</BexCardTitle>
  </BexCardHeader>
  <BexCardContent className="space-y-4">
    <p className="bex-body">
      Descrição do card
    </p>
    <BexButton variant="bexGaming">
      Ação
    </BexButton>
  </BexCardContent>
</BexCard>
```

---

## ✨ Efeitos Visuais

### Glassmorphism

**Antes:**
```tsx
<div className="backdrop-blur-md bg-black/30 border border-white/10 rounded-lg">
  Conteúdo
</div>
```

**Depois:**
```tsx
<div className="glass-bex-gaming rounded-lg">
  Conteúdo
</div>
```

### Classes Glass Disponíveis

- `glass-bex-light` - Blur suave, fundo claro
- `glass-bex` - Blur médio, fundo médio
- `glass-bex-dark` - Blur forte, fundo escuro
- `glass-bex-gaming` - Blur gaming otimizado (recomendado)

### Glow Effects

**Antes:**
```tsx
<div className="shadow-lg shadow-green-500/50 hover:shadow-green-500/80 transition-shadow">
  Conteúdo
</div>
```

**Depois:**
```tsx
<div className="glow-bex hover:shadow-bex-glow transition-all">
  Conteúdo
</div>
```

### Animações

**Antes:**
```tsx
<div 
  className="opacity-0 translate-y-4"
  style={{ 
    animation: 'fadeIn 0.3s ease-out forwards' 
  }}
>
  Conteúdo
</div>
```

**Depois:**
```tsx
<div className="animate-fade-in">
  Conteúdo
</div>
```

### Classes de Animação Disponíveis

- `animate-fade-in` - Fade in com slide
- `animate-scale-in` - Scale in com fade
- `animate-pulse-glow` - Brilho pulsante
- `hover-lift-bex` - Elevação no hover

---

## ✅ Checklist de Migração

Use este checklist ao migrar cada componente:

### Por Arquivo

- [ ] Importei componentes BEX necessários?
- [ ] Substitui todos os `Card` por `BexCard`?
- [ ] Substitui todos os `Button` por `BexButton`?
- [ ] Substitui todos os `Badge` por `BexBadge`?
- [ ] Removi classes de cores diretas (`text-white`, `bg-black`)?
- [ ] Substitui tipografia por classes BEX (`.bex-title-primary`)?
- [ ] Apliquei glassmorphism onde apropriado?
- [ ] Adicionei animações de entrada?
- [ ] Testei hover states?
- [ ] Verifiquei responsividade?

### Visual

- [ ] Cores seguem a paleta BEX Gaming?
- [ ] Tipografia usa Montserrat (títulos) e Inter (corpo)?
- [ ] Cards têm efeito gaming adequado?
- [ ] Botões têm gradientes BEX?
- [ ] Badges têm as cores corretas?
- [ ] Animações são suaves?
- [ ] Dark mode funciona corretamente?

### Funcionalidade

- [ ] Todos os eventos (onClick, onChange) funcionam?
- [ ] Estados (loading, disabled) estão corretos?
- [ ] Formulários validam corretamente?
- [ ] Acessibilidade (ARIA) mantida?

---

## ⚠️ Problemas Comuns

### 1. Botões Não Aparecem

**Problema:**
```tsx
<BexButton variant="bexGaming">Texto</BexButton>
// Botão não aparece ou está invisível
```

**Solução:**
Verifique se o componente está importado corretamente:
```tsx
import { BexButton } from "@/components/ui/bex-button";
```

### 2. Cores Incorretas em Dark Mode

**Problema:**
```tsx
<div className="text-white bg-black">
  // Texto branco em fundo branco (light mode)
</div>
```

**Solução:**
Use tokens semânticos:
```tsx
<div className="text-foreground bg-background">
  // Ajusta automaticamente ao tema
</div>
```

### 3. Tipografia Não Muda

**Problema:**
```tsx
<h1 className="bex-title-primary">
  // Fonte não é Montserrat
</h1>
```

**Solução:**
Verifique se o Google Fonts está importado no `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
```

### 4. Glassmorphism Não Funciona

**Problema:**
```tsx
<div className="glass-bex">
  // Não tem efeito de blur
</div>
```

**Solução:**
Verifique se há elemento pai com `backdrop-filter` conflitante. Remova:
```tsx
// Remova isto do pai
className="backdrop-blur-sm"
```

### 5. Animações Não Aparecem

**Problema:**
```tsx
<div className="animate-fade-in">
  // Não anima
</div>
```

**Solução:**
Verifique se as animações estão definidas em `tailwind.config.ts`:
```ts
// Deve conter
animation: {
  "fade-in": "fade-in 0.3s ease-out",
  // ...
}
```

### 6. Hover States Não Funcionam

**Problema:**
```tsx
<BexCard variant="gaming">
  // Não tem efeito hover
</BexCard>
```

**Solução:**
Adicione classe de hover:
```tsx
<BexCard variant="gaming" className="hover-lift-bex">
  // Agora tem elevação no hover
</BexCard>
```

---

## 🔍 Verificação Final

Após migrar um arquivo, teste:

1. **Visual:** Componente parece correto?
2. **Interatividade:** Botões/links funcionam?
3. **Responsivo:** Funciona em mobile/tablet/desktop?
4. **Performance:** Não há lentidão?
5. **Console:** Não há erros no console?

---

## 📚 Recursos Adicionais

- [BEX Design System Completo](./BEX_DESIGN_SYSTEM_COMPLETE.md)
- [Página Showcase](http://localhost:5173/design-system)
- Componentes em: `src/components/ui/bex-*`

---

## 🎯 Próximos Passos

1. **Priorize páginas principais** (Dashboard, Painel)
2. **Migre seção por seção** (Cards → Botões → Tipografia)
3. **Teste após cada migração**
4. **Documente problemas encontrados**
5. **Revise código migrado** em equipe

---

**Última atualização:** 2025-10-13
