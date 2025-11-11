# Guia de Uso - Transições de Página com Framer Motion

## 📦 Componentes Disponíveis

### 1. PageTransition (Automático)
Aplicado automaticamente em todas as páginas através do componente `Layout`.

**Efeito**: Fade-in com slide vertical suave e scale
**Duração**: 400ms entrada / 300ms saída

### 2. SlideTransition
Transição com deslizamento direcional.

```tsx
import { SlideTransition } from "@/components/transitions";

<SlideTransition direction="left" delay={0.1}>
  <Card>Conteúdo do Card</Card>
</SlideTransition>
```

**Props**:
- `direction`: "left" | "right" | "up" | "down"
- `delay`: número em segundos (padrão: 0)

### 3. StaggerChildren & StaggerItem
Para animar listas com efeito cascata.

```tsx
import { StaggerChildren, StaggerItem } from "@/components/transitions";

<StaggerChildren staggerDelay={0.1}>
  {items.map((item, index) => (
    <StaggerItem key={item.id} delay={index * 0.05}>
      <Card>{item.title}</Card>
    </StaggerItem>
  ))}
</StaggerChildren>
```

**Props StaggerChildren**:
- `staggerDelay`: intervalo entre animações dos filhos (padrão: 0.1s)

**Props StaggerItem**:
- `delay`: atraso individual adicional (padrão: 0)

### 4. FadeTransition
Simples fade in/out.

```tsx
import { FadeTransition } from "@/components/transitions";

<FadeTransition delay={0.2} duration={0.5}>
  <div>Conteúdo</div>
</FadeTransition>
```

**Props**:
- `delay`: atraso inicial (padrão: 0)
- `duration`: duração da animação (padrão: 0.4s)

## 🎨 Exemplos de Uso

### Cards em Grid com Stagger
```tsx
import { StaggerChildren, StaggerItem } from "@/components/transitions";

function DashboardCards() {
  return (
    <StaggerChildren staggerDelay={0.08}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <StaggerItem key={stat.id}>
            <Card>
              <CardHeader>
                <CardTitle>{stat.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </div>
    </StaggerChildren>
  );
}
```

### Modal/Dialog com Slide
```tsx
import { SlideTransition } from "@/components/transitions";
import { Dialog, DialogContent } from "@/components/ui/dialog";

<Dialog open={open}>
  <DialogContent>
    <SlideTransition direction="up">
      <div>
        <h2>Título do Modal</h2>
        <p>Conteúdo...</p>
      </div>
    </SlideTransition>
  </DialogContent>
</Dialog>
```

### Lista de Tarefas Animada
```tsx
import { StaggerChildren, StaggerItem } from "@/components/transitions";

function TaskList({ tasks }) {
  return (
    <StaggerChildren staggerDelay={0.05}>
      {tasks.map((task, index) => (
        <StaggerItem key={task.id} delay={index * 0.02}>
          <div className="p-4 border rounded-lg hover:bg-muted/50">
            <h3>{task.title}</h3>
            <p>{task.description}</p>
          </div>
        </StaggerItem>
      ))}
    </StaggerChildren>
  );
}
```

### Seções de Página com Diferentes Direções
```tsx
import { SlideTransition } from "@/components/transitions";

function PageContent() {
  return (
    <>
      <SlideTransition direction="down">
        <header className="mb-6">
          <h1>Título da Página</h1>
        </header>
      </SlideTransition>

      <SlideTransition direction="left" delay={0.1}>
        <div className="grid grid-cols-2 gap-4">
          {/* Conteúdo principal */}
        </div>
      </SlideTransition>

      <SlideTransition direction="right" delay={0.2}>
        <aside>
          {/* Sidebar ou conteúdo lateral */}
        </aside>
      </SlideTransition>
    </>
  );
}
```

## ⚡ Boas Práticas

1. **Use delays progressivos**: Para elementos em sequência, incremente o delay
   ```tsx
   <SlideTransition delay={0}>Header</SlideTransition>
   <SlideTransition delay={0.1}>Content</SlideTransition>
   <SlideTransition delay={0.2}>Footer</SlideTransition>
   ```

2. **Stagger para listas**: Use StaggerChildren para listas dinâmicas
   ```tsx
   <StaggerChildren staggerDelay={0.05}>
     {items.map(item => <StaggerItem key={item.id}>...</StaggerItem>)}
   </StaggerChildren>
   ```

3. **Combine com AnimatePresence**: Para elementos condicionais
   ```tsx
   import { AnimatePresence } from "framer-motion";
   
   <AnimatePresence mode="wait">
     {show && (
       <FadeTransition>
         <Alert>Mensagem</Alert>
       </FadeTransition>
     )}
   </AnimatePresence>
   ```

4. **Performance**: Evite animar muitos elementos simultaneamente
   - Use `staggerDelay` adequado (0.05-0.1s)
   - Limite animações a elementos visíveis
   - Considere `will-change` para animações complexas

## 🎯 Timing Padrão BEX

- **Entrada rápida**: 0.3-0.4s
- **Saída rápida**: 0.2-0.3s
- **Stagger delay**: 0.05-0.1s
- **Delay inicial**: 0-0.2s

## 🔧 Personalização

Para criar transições customizadas, use diretamente o `motion` do framer-motion:

```tsx
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.8 }}
  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
>
  Conteúdo customizado
</motion.div>
```
