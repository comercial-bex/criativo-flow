# Guia de Implementação de Design do Figma

Este guia explica como implementar designs do Figma no projeto usando as ferramentas e práticas recomendadas.

## 1. Preparação do Design System

### 1.1 Extraindo Cores do Figma

1. **Acesse o Design System no Figma:**
   - Abra o arquivo de design
   - Procure pela seção "Design Tokens" ou "Colors"
   - Anote os valores HSL das cores principais

2. **Configure as cores no `src/index.css`:**
```css
@layer base {
  :root {
    /* Cores primárias do seu design */
    --primary: 220 84% 42%;        /* Azul principal */
    --primary-foreground: 0 0% 98%; /* Texto sobre primária */
    
    /* Cores secundárias */
    --secondary: 210 40% 96%;       /* Cinza claro */
    --secondary-foreground: 222 84% 4%; /* Texto sobre secundária */
    
    /* Cores de fundo */
    --background: 0 0% 100%;        /* Fundo branco */
    --foreground: 222 84% 4%;       /* Texto principal */
    
    /* Cores de card/superfície */
    --card: 0 0% 100%;
    --card-foreground: 222 84% 4%;
    
    /* Cores de borda */
    --border: 214 32% 91%;
    --input: 214 32% 91%;
    
    /* Cores de estado */
    --destructive: 0 84% 60%;       /* Vermelho para erros */
    --destructive-foreground: 0 0% 98%;
    
    --warning: 45 93% 47%;          /* Amarelo para avisos */
    --warning-foreground: 0 0% 98%;
    
    --success: 142 76% 36%;         /* Verde para sucesso */
    --success-foreground: 0 0% 98%;
  }

  .dark {
    /* Versão escura das cores */
    --primary: 220 84% 52%;
    --background: 222 84% 4%;
    --foreground: 0 0% 98%;
    /* ... outras cores dark mode */
  }
}
```

3. **Adicione cores customizadas no `tailwind.config.ts`:**
```typescript
export default {
  extend: {
    colors: {
      // Cores do seu design específico
      'brand-blue': 'hsl(220, 84%, 42%)',
      'brand-green': 'hsl(142, 76%, 36%)',
      'neutral-50': 'hsl(210, 40%, 98%)',
      'neutral-100': 'hsl(210, 40%, 96%)',
      // Gradientes
      'gradient-start': 'hsl(220, 84%, 42%)',
      'gradient-end': 'hsl(260, 84%, 52%)',
    }
  }
}
```

### 1.2 Configurando Tipografia

1. **Identifique as fontes no Figma:**
   - Vá em "Assets" → "Typography"
   - Anote os nomes das fontes e pesos utilizados

2. **Adicione as fontes no `index.html`:**
```html
<head>
  <!-- Google Fonts exemplo -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
</head>
```

3. **Configure no `tailwind.config.ts`:**
```typescript
export default {
  extend: {
    fontFamily: {
      'sans': ['Inter', 'system-ui', 'sans-serif'],
      'serif': ['Playfair Display', 'serif'],
      'display': ['Playfair Display', 'serif'],
    },
    fontSize: {
      // Tamanhos específicos do design
      'hero': ['3.5rem', { lineHeight: '1.2', fontWeight: '700' }],
      'h1': ['2.5rem', { lineHeight: '1.3', fontWeight: '600' }],
      'h2': ['2rem', { lineHeight: '1.4', fontWeight: '600' }],
      'h3': ['1.5rem', { lineHeight: '1.4', fontWeight: '500' }],
      'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
      'caption': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
    }
  }
}
```

### 1.3 Espaçamentos e Layouts

```typescript
// No tailwind.config.ts
export default {
  extend: {
    spacing: {
      // Espaçamentos específicos do design
      '18': '4.5rem',  // 72px
      '88': '22rem',   // 352px
      '128': '32rem',  // 512px
    },
    borderRadius: {
      'card': '12px',
      'button': '8px',
      'input': '6px',
    }
  }
}
```

## 2. Implementando Componentes

### 2.1 Extraindo Informações do Componente no Figma

Para cada componente:
1. **Selecione o componente no Figma**
2. **No painel direito, anote:**
   - Dimensões (Width/Height)
   - Padding interno
   - Margin externo
   - Border radius
   - Sombras (box-shadow)
   - Cores de fundo e texto
   - Estados (hover, active, disabled)

### 2.2 Implementando um Card Exemplo

```tsx
// Baseado no design do Figma
interface CardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
}

const Card = ({ title, description, children, variant = 'default' }: CardProps) => {
  const variants = {
    default: 'bg-card border border-border',
    elevated: 'bg-card shadow-lg border-0',
    outlined: 'bg-transparent border-2 border-border'
  };

  return (
    <div className={cn(
      // Estilos base do Figma
      "rounded-card p-6 transition-all duration-200",
      // Variantes
      variants[variant],
      // Estados interativos
      "hover:shadow-md hover:border-border/60"
    )}>
      <div className="space-y-2">
        <h3 className="text-h3 font-sans text-foreground">{title}</h3>
        {description && (
          <p className="text-caption text-muted-foreground">{description}</p>
        )}
      </div>
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
};
```

### 2.3 Sistema de Botões

```tsx
const buttonVariants = cva(
  // Base styles do Figma
  "inline-flex items-center justify-center rounded-button font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Implementar exatamente como no Figma
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        // Botão customizado do design
        gradient: "bg-gradient-to-r from-gradient-start to-gradient-end text-white hover:opacity-90",
      },
      size: {
        // Tamanhos exatos do Figma
        sm: "h-8 px-3 text-sm",
        default: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);
```

## 3. Implementando Layouts Complexos

### 3.1 Grid Systems

```tsx
// Baseado no grid do Figma (ex: 12 colunas)
const GridContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-12 gap-6 max-w-7xl mx-auto px-6">
    {children}
  </div>
);

// Componente de coluna responsiva
const GridColumn = ({ 
  span = 12, 
  smSpan, 
  mdSpan, 
  lgSpan, 
  children 
}: {
  span?: number;
  smSpan?: number;
  mdSpan?: number;
  lgSpan?: number;
  children: React.ReactNode;
}) => {
  const spanClasses = [
    `col-span-${span}`,
    smSpan && `sm:col-span-${smSpan}`,
    mdSpan && `md:col-span-${mdSpan}`,
    lgSpan && `lg:col-span-${lgSpan}`,
  ].filter(Boolean).join(' ');

  return <div className={spanClasses}>{children}</div>;
};
```

### 3.2 Seções de Layout

```tsx
// Implementar seções como no Figma
const HeroSection = () => (
  <section className="py-24 bg-gradient-to-br from-primary to-primary/80">
    <div className="container mx-auto px-6">
      <div className="max-w-4xl mx-auto text-center text-white">
        <h1 className="text-hero font-display mb-6">
          Título Principal do Design
        </h1>
        <p className="text-xl opacity-90 mb-8">
          Subtítulo conforme especificado no Figma
        </p>
        <Button size="lg" variant="secondary">
          Call to Action
        </Button>
      </div>
    </div>
  </section>
);
```

## 4. Extraindo e Usando Assets

### 4.1 Exportando Imagens do Figma

1. **Selecione o elemento no Figma**
2. **No painel direito, clique em "Export"**
3. **Configure:**
   - Formato: PNG para fotos, SVG para ícones
   - Resolução: 2x para telas retina
   - Nome descritivo

4. **Salve em `src/assets/`:**
```
src/assets/
├── images/
│   ├── hero-bg.png
│   ├── hero-bg@2x.png
│   └── logo.svg
├── icons/
│   ├── arrow-right.svg
│   └── check.svg
└── illustrations/
    └── empty-state.svg
```

### 4.2 Usando Assets no Código

```tsx
// Importar imagens
import heroImage from '@/assets/images/hero-bg.png';
import logoSvg from '@/assets/images/logo.svg';

// Usar em componentes
const Hero = () => (
  <div 
    className="relative bg-cover bg-center"
    style={{ backgroundImage: `url(${heroImage})` }}
  >
    <img src={logoSvg} alt="Logo" className="h-8 w-auto" />
  </div>
);
```

## 5. Animations e Micro-interações

### 5.1 Extraindo Animações do Figma

No Figma, procure por:
- Protótipos com transições
- Overlays com animações
- Estados de hover/click

### 5.2 Implementando Animações

```css
/* Adicionar no index.css */
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

```typescript
// No tailwind.config.ts
animation: {
  'slide-up': 'slide-up 0.3s ease-out',
  'scale-in': 'scale-in 0.2s ease-out',
  'fade-in': 'fade-in 0.3s ease-out',
}
```

```tsx
// Usar em componentes
const AnimatedCard = () => (
  <div className="animate-slide-up hover:animate-scale-in transition-all duration-200">
    Conteúdo do card
  </div>
);
```

## 6. Responsividade

### 6.1 Breakpoints do Design

```typescript
// Configure breakpoints baseados no design
screens: {
  'xs': '475px',
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
}
```

### 6.2 Implementação Mobile-First

```tsx
const ResponsiveComponent = () => (
  <div className="
    px-4 py-8          // Mobile
    sm:px-6 sm:py-12   // Tablet
    lg:px-8 lg:py-16   // Desktop
    xl:px-12 xl:py-20  // Large Desktop
  ">
    <h1 className="
      text-2xl          // Mobile
      sm:text-3xl       // Tablet
      lg:text-4xl       // Desktop
      xl:text-5xl       // Large
    ">
      Título Responsivo
    </h1>
  </div>
);
```

## 7. Verificação e Ajustes

### 7.1 Checklist de Implementação

- [ ] ✅ Cores implementadas corretamente (HSL format)
- [ ] ✅ Tipografia configurada com fontes do design
- [ ] ✅ Espaçamentos seguem o sistema do Figma
- [ ] ✅ Componentes têm todos os estados (hover, active, disabled)
- [ ] ✅ Layout responsivo funciona em todos breakpoints
- [ ] ✅ Assets otimizados e carregando corretamente
- [ ] ✅ Animações suaves e performáticas
- [ ] ✅ Contraste adequado para acessibilidade

### 7.2 Ferramentas de Desenvolvimento

```bash
# Verificar contraste de cores
# Use ferramentas como WebAIM Contrast Checker

# Verificar responsividade
# DevTools → Toggle device toolbar

# Verificar performance
# DevTools → Lighthouse
```

## 8. Exemplo Prático Completo

```tsx
// Implementação de uma seção baseada no Figma
const ProductCard = ({ product }: { product: Product }) => (
  <Card className="group hover:shadow-lg transition-all duration-300">
    <div className="relative overflow-hidden rounded-t-card">
      <img 
        src={product.image} 
        alt={product.name}
        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <Badge 
        variant="secondary" 
        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm"
      >
        {product.category}
      </Badge>
    </div>
    
    <div className="p-6">
      <h3 className="text-h3 font-sans mb-2">{product.name}</h3>
      <p className="text-caption text-muted-foreground mb-4">
        {product.description}
      </p>
      
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-primary">
          R$ {product.price}
        </span>
        <Button variant="gradient" size="sm">
          Comprar
        </Button>
      </div>
    </div>
  </Card>
);
```

Este guia fornece uma base sólida para implementar qualquer design do Figma de forma fiel e profissional, mantendo a consistência e performance do projeto.