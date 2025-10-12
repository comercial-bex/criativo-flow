# BEX Design System - Gaming Style

## 🎨 Introdução

Sistema de design moderno com identidade visual gaming mantendo a cor verde característica da BEX (`#54C43D`).

## 📦 Componentes BEX

### 1. BexCard

Card moderno com 4 variantes:

```tsx
import { BexCard, BexCardHeader, BexCardTitle, BexCardContent } from "@/components/ui/bex-card";

// Default - Card padrão
<BexCard variant="default">
  <BexCardContent>Conteúdo</BexCardContent>
</BexCard>

// Glass - Efeito vidro com blur
<BexCard variant="glass">
  <BexCardContent>Modal transparente</BexCardContent>
</BexCard>

// Glow - Brilho verde ao hover
<BexCard variant="glow">
  <BexCardContent>Card interativo</BexCardContent>
</BexCard>

// Gaming - Efeito completo com gradiente
<BexCard variant="gaming" withGlow>
  <BexCardContent>Dashboard card</BexCardContent>
</BexCard>
```

### 2. BexButton

Botões com estilo gaming:

```tsx
import { BexButton } from "@/components/ui/bex-button";

// Botão BEX padrão
<BexButton variant="bex">Salvar</BexButton>

// Botão gaming com gradiente e animação
<BexButton variant="bexGaming">Continuar</BexButton>

// Outline verde
<BexButton variant="bexOutline">Cancelar</BexButton>

// Ghost verde
<BexButton variant="bexGhost">Detalhes</BexButton>
```

**Variantes disponíveis:**
- `bex`: Verde sólido com shadow
- `bexGaming`: Gradiente verde com animação de brilho
- `bexOutline`: Borda verde, preenche no hover
- `bexGhost`: Transparente com hover verde

### 3. BexBadge

Badges modernos:

```tsx
import { BexBadge } from "@/components/ui/bex-badge";

// Badge verde padrão
<BexBadge variant="bex">Ativo</BexBadge>

// Outline verde
<BexBadge variant="bexOutline">Pendente</BexBadge>

// Com brilho pulsante
<BexBadge variant="bexGlow">Novo</BexBadge>

// Gaming com gradiente
<BexBadge variant="bexGaming">Premium</BexBadge>
```

### 4. BexAvatar

Avatar com efeitos gaming:

```tsx
import { BexAvatar, BexAvatarImage, BexAvatarFallback } from "@/components/ui/bex-avatar";

// Avatar com glow
<BexAvatar withGlow>
  <BexAvatarImage src={url} />
  <BexAvatarFallback>AB</BexAvatarFallback>
</BexAvatar>

// Avatar gaming (escala no hover)
<BexAvatar gaming>
  <BexAvatarImage src={url} />
  <BexAvatarFallback>AB</BexAvatarFallback>
</BexAvatar>
```

### 5. BexDialog

Modal gaming:

```tsx
import { 
  Dialog, 
  DialogTrigger, 
  BexDialogContent, 
  BexDialogHeader, 
  BexDialogTitle,
  BexDialogDescription,
  BexDialogFooter 
} from "@/components/ui/bex-dialog";

<Dialog>
  <DialogTrigger>Abrir</DialogTrigger>
  <BexDialogContent variant="gaming">
    <BexDialogHeader>
      <BexDialogTitle gaming>Título</BexDialogTitle>
      <BexDialogDescription>Descrição</BexDialogDescription>
    </BexDialogHeader>
    <BexDialogFooter>
      <BexButton variant="bex">Confirmar</BexButton>
    </BexDialogFooter>
  </BexDialogContent>
</Dialog>
```

**Variantes:**
- `default`: Modal padrão
- `glass`: Efeito vidro
- `gaming`: Blur + borda verde + shadow

### 6. ConfirmationDialog (Atualizado)

Dialog de confirmação modernizado:

```tsx
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

<ConfirmationDialog
  open={open}
  onOpenChange={setOpen}
  title="Confirmar exclusão"
  description="Esta ação não pode ser desfeita"
  onConfirm={handleDelete}
  gaming={true} // Ativa estilo gaming
/>
```

## 🎨 Paleta de Cores

### Cores Principais

```css
/* Verde BEX */
--bex: #54C43D (padrão)
--bex-light: #6dd34f
--bex-dark: #47a834

/* Escala completa */
bex-50: #f0fdf4
bex-100: #dcfce7
bex-200: #bbf7d0
bex-300: #86efac
bex-400: #6dd34f
bex-500: #54C43D (DEFAULT)
bex-600: #47a834
bex-700: #3a8629
bex-800: #2d6820
bex-900: #1f4a16
```

### Uso em Tailwind

```tsx
// Background
<div className="bg-bex">Verde sólido</div>
<div className="bg-bex-light">Verde claro</div>
<div className="bg-bex-dark">Verde escuro</div>

// Texto
<p className="text-bex">Texto verde</p>

// Borda
<div className="border-bex">Borda verde</div>
<div className="border-bex/30">Borda verde 30% opacidade</div>
```

## ✨ Efeitos Visuais

### Gradientes

```tsx
// Gradiente verde
<div className="gradient-bex">Fundo gradiente</div>

// Gradiente manual
<div className="bg-gradient-to-r from-bex via-bex-light to-bex-dark">
  Gradiente customizado
</div>
```

### Sombras (Box Shadow)

```tsx
// Sombra verde
<div className="shadow-bex">Sombra padrão</div>

// Sombra grande
<div className="shadow-bex-lg">Sombra grande</div>

// Sombra glow (brilho)
<div className="shadow-bex-glow">Efeito luminoso</div>
```

### Blur (Glass Effect)

```tsx
// Classe utilitária
<div className="glass-bex">Efeito vidro</div>

// Manual
<div className="backdrop-blur-md bg-black/30 border border-bex/20">
  Blur customizado
</div>
```

### Hover Effects

```tsx
// Lift (eleva no hover)
<div className="hover-lift-bex">Eleva ao passar mouse</div>

// Glow (brilha no hover)
<div className="glow-bex hover:glow-bex">Brilha ao hover</div>

// Border glow
<div className="border-glow-bex">Borda com brilho</div>
```

## 🎯 Classes Utilitárias

```css
/* Glass effect BEX */
.glass-bex {
  backdrop-blur-md bg-white/5 dark:bg-black/30 border border-bex/20
}

/* Glow effect */
.glow-bex {
  shadow-bex-glow
}

/* Hover lift */
.hover-lift-bex {
  transition-all duration-200 hover:-translate-y-1 hover:shadow-bex-lg
}

/* Gradient background */
.gradient-bex {
  bg-gradient-to-r from-bex via-bex-light to-bex-dark
}

/* Border with glow */
.border-glow-bex {
  border border-bex/30 shadow-lg shadow-bex/20
}
```

## 🚀 Exemplos Práticos

### Dashboard Card

```tsx
<BexCard variant="gaming" withGlow className="hover-lift-bex">
  <BexCardHeader>
    <BexCardTitle className="text-bex">Total de Projetos</BexCardTitle>
  </BexCardHeader>
  <BexCardContent>
    <div className="text-4xl font-bold text-white">1,234</div>
    <div className="flex items-center gap-2 text-sm text-bex-light mt-2">
      <TrendingUp className="w-4 h-4" />
      +12% vs mês anterior
    </div>
  </BexCardContent>
</BexCard>
```

### Lista de Projetos

```tsx
<BexCard variant="glass">
  <BexCardHeader>
    <BexCardTitle>Projetos Ativos</BexCardTitle>
  </BexCardHeader>
  <BexCardContent>
    {projetos.map(projeto => (
      <div key={projeto.id} className="flex items-center gap-3 p-3 hover:bg-bex/5 rounded-lg transition-colors">
        <BexAvatar gaming>
          <BexAvatarImage src={projeto.logo} />
          <BexAvatarFallback>{projeto.sigla}</BexAvatarFallback>
        </BexAvatar>
        <div className="flex-1">
          <h4 className="font-medium">{projeto.nome}</h4>
          <p className="text-sm text-muted-foreground">{projeto.cliente}</p>
        </div>
        <BexBadge variant="bex">{projeto.status}</BexBadge>
      </div>
    ))}
  </BexCardContent>
</BexCard>
```

### Formulário

```tsx
<BexCard variant="glass">
  <BexCardHeader>
    <BexCardTitle className="text-bex">Novo Cliente</BexCardTitle>
  </BexCardHeader>
  <BexCardContent>
    <form className="space-y-4">
      <div>
        <Label>Nome</Label>
        <Input className="focus:border-bex/50 focus:ring-bex/20" />
      </div>
      
      <div className="flex gap-2">
        <BexButton variant="bex" type="submit">
          Salvar
        </BexButton>
        <BexButton variant="bexOutline" type="button">
          Cancelar
        </BexButton>
      </div>
    </form>
  </BexCardContent>
</BexCard>
```

## 📱 Responsividade

Todos os componentes BEX são totalmente responsivos:

```tsx
// Card que muda layout em mobile
<BexCard variant="gaming" className="p-4 md:p-6">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {/* Conteúdo */}
  </div>
</BexCard>

// Botões responsivos
<BexButton 
  variant="bex" 
  size={{ base: "sm", md: "default", lg: "lg" }}
>
  Ação
</BexButton>
```

## 🎨 Tema BEX (bex-theme.ts)

Importar tema centralizado:

```tsx
import { bexTheme } from "@/styles/bex-theme";

// Usar gradientes
<div className={bexTheme.gradients.gaming}>Gaming gradient</div>

// Usar bordas
<div className={bexTheme.borders.primary}>Borda padrão</div>

// Usar shadows
<div className={bexTheme.shadows.greenGlow}>Shadow glow</div>

// Usar glass effect
<div className={bexTheme.glassEffect.medium}>Glass médio</div>
```

## 🔄 Migração de Componentes Antigos

### Substituir cores roxas por verde

```tsx
// ANTES
className="bg-purple-600 text-white hover:bg-purple-700"

// DEPOIS
className="bg-bex text-white hover:bg-bex-dark"
```

### Atualizar Cards

```tsx
// ANTES
<Card className="border-purple-500/30">

// DEPOIS
<BexCard variant="glow">
```

### Atualizar Badges

```tsx
// ANTES
<Badge className="bg-purple-600">Status</Badge>

// DEPOIS
<BexBadge variant="bex">Status</BexBadge>
```

## 💡 Boas Práticas

1. **Use componentes BEX quando possível** ao invés de criar estilos customizados
2. **Prefira classes utilitárias** (`glass-bex`, `hover-lift-bex`) para consistência
3. **Gaming variant** para elementos principais (dashboards, headers)
4. **Glass variant** para modais e overlays
5. **Glow variant** para cards interativos
6. **Sempre use a cor `bex`** ao invés de valores hexadecimais diretos

## 🐛 Troubleshooting

### Sombras não aparecem
- Verificar se `tailwindcss-animate` está instalado
- Confirmar que `boxShadow` está no `tailwind.config.ts`

### Blur não funciona
- Garantir que o elemento pai permite `overflow`
- Usar `backdrop-blur-*` ao invés de `blur-*`

### Cores não atualizam
- Limpar cache do Tailwind: `npm run build`
- Verificar se está usando `bex` ao invés de valores hardcoded

---

**Versão:** 1.0  
**Última atualização:** 2025  
**Mantido por:** Equipe BEX
