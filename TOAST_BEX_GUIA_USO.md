# Sistema de Toasts BEX - Guia Completo

## 🎨 Visão Geral

Sistema de notificações toast personalizado com design BEX, gradientes animados, ícones do lucide-react e posições configuráveis.

## ✨ Características

- **Design BEX**: Gradientes personalizados e cores do tema
- **Animações Suaves**: Usando framer-motion para transições fluidas
- **Ícones Dinâmicos**: Ícones lucide-react por tipo ou customizados
- **Posições Configuráveis**: 6 posições disponíveis
- **Sistema de Prioridades**: critical, high, normal, low
- **Queue Inteligente**: Limite de toasts visíveis com fila automática
- **Progress Bar**: Indicador visual de tempo restante
- **Ações**: Botões de ação opcionais
- **Auto-dismiss**: Fechamento automático configurável
- **Helpers Simplificados**: API fácil com `toast.success()`, etc.
- **Promise Support**: Toasts automáticos para operações assíncronas
- **Responsivo**: Adapta-se a diferentes tamanhos de tela

## 📋 Tipos de Toast

### Success
```typescript
showToast({
  title: "Sucesso!",
  description: "Operação realizada com sucesso",
  variant: "success",
  duration: 5000
});
```
- Cor: Verde BEX (#54C43D)
- Ícone: CheckCircle2
- Gradiente: Verde com transparência

### Error
```typescript
showToast({
  title: "Erro!",
  description: "Algo deu errado",
  variant: "error",
  duration: 7000
});
```
- Cor: Vermelho
- Ícone: XCircle
- Gradiente: Vermelho com transparência

### Warning
```typescript
showToast({
  title: "Atenção!",
  description: "Verifique os dados antes de continuar",
  variant: "warning"
});
```
- Cor: Laranja
- Ícone: AlertTriangle
- Gradiente: Laranja com transparência

### Info
```typescript
showToast({
  title: "Informação",
  description: "Dados atualizados",
  variant: "info"
});
```
- Cor: Azul
- Ícone: Info
- Gradiente: Azul com transparência

### Default
```typescript
showToast({
  title: "Notificação",
  description: "Mensagem geral"
});
```
- Cor: Cinza
- Ícone: Sparkles
- Gradiente: Cinza com transparência

## 🎯 Como Usar

### Método 1: Helpers Standalone (Recomendado) ⭐

A forma mais simples de usar toasts em qualquer lugar do código:

```typescript
import { toast } from "@/components/BexToast";

// Uso super simples!
toast.success("Salvo com sucesso!");
toast.error("Erro ao salvar");
toast.warning("Atenção!");
toast.info("Nova atualização disponível");

// Com descrição
toast.success("Dados salvos!", "Suas alterações foram salvas no servidor");
toast.error("Falha no upload", "Verifique sua conexão e tente novamente");

// Com opções extras
toast.success("Arquivo enviado!", "Upload concluído", {
  duration: 3000,
  icon: Upload,
  action: {
    label: "Ver Arquivo",
    onClick: () => window.open("/arquivos")
  }
});
```

### Método 2: Hook useBexToast

Para uso em componentes React com mais controle:

```typescript
import { useBexToast } from "@/components/BexToast";

function MeuComponente() {
  const { success, error, loading, update, dismiss } = useBexToast();

  const handleSave = async () => {
    const loadingId = loading("Salvando dados...");
    
    try {
      await saveData();
      update(loadingId, {
        title: "Salvo com sucesso!",
        variant: "success",
        duration: 5000
      });
    } catch (err) {
      update(loadingId, {
        title: "Erro ao salvar",
        variant: "error",
        duration: 7000
      });
    }
  };

  return <button onClick={handleSave}>Salvar</button>;
}
```

## 🎯 Sistema de Prioridades

O sistema de queue gerencia automaticamente a exibição de toasts baseado em prioridades.

### Níveis de Prioridade

1. **Critical** 🔴
   - Aparecem **imediatamente**, mesmo que exceda o limite
   - Remove toasts de menor prioridade se necessário
   - Use para: Erros críticos, alertas de segurança, ações irreversíveis

2. **High** 🟡
   - Prioridade alta na fila
   - Aparece antes de toasts normais e baixos
   - Use para: Avisos importantes, confirmações necessárias

3. **Normal** 🟢 (padrão)
   - Prioridade padrão
   - Processado por ordem de chegada (FIFO)
   - Use para: Feedback de ações, informações gerais

4. **Low** 🔵
   - Menor prioridade
   - Aguarda outros toasts de maior prioridade
   - Use para: Dicas, sugestões, informações secundárias

### Configurando Prioridades

```typescript
// Critical - Aparece imediatamente
toast.error("Erro crítico no sistema!", "Ação necessária", {
  priority: "critical",
  duration: 10000
});

// High - Alta prioridade
toast.warning("Dados não salvos", "Salve antes de sair", {
  priority: "high"
});

// Normal - Prioridade padrão
toast.success("Operação concluída!"); // priority: "normal" é o padrão

// Low - Baixa prioridade
toast.info("Dica: Use atalhos para agilizar", undefined, {
  priority: "low"
});
```

## 📊 Gerenciamento de Queue

### Limite de Toasts Visíveis

Por padrão, **máximo 3 toasts** são exibidos simultaneamente. Toasts excedentes aguardam na fila.

```typescript
const { setMaxVisible, queuedCount } = useBexToast();

// Configurar limite
setMaxVisible(5); // Permite até 5 toasts visíveis

// Ver quantos estão na fila
console.log(queuedCount); // Ex: 7 toasts aguardando
```

### Funcionamento da Queue

1. **Toasts são criados** com prioridade
2. **Se há espaço**: Toast aparece imediatamente
3. **Se não há espaço**:
   - **Critical**: Remove toast de menor prioridade e aparece
   - **Outros**: Entra na fila ordenada por prioridade

4. **Quando um toast fecha**: Próximo da fila aparece (maior prioridade primeiro)

### Indicador Visual de Queue

Quando há toasts na fila, um indicador aparece no canto inferior esquerdo:

```
+7 notificações na fila
```

### Exemplos Práticos de Queue

```typescript
// Cenário: Sistema de notificações em tempo real

// 1. Configurar limite apropriado
setMaxVisible(3);

// 2. Toast crítico sempre aparece
toast.error("Conexão perdida!", "Reconectando...", {
  priority: "critical"
});

// 3. Toasts normais aguardam se houver muitos
for (let i = 0; i < 10; i++) {
  toast.info(`Nova mensagem ${i}`, undefined, {
    priority: "normal"
  });
}

// 4. Toast de alta prioridade pula na fila
toast.warning("Pagamento pendente", "Vence em 1 dia", {
  priority: "high"
});
```

### Estratégias de Uso

**Para Aplicações com Muitas Notificações:**
```typescript
// Aumentar limite de toasts visíveis
setMaxVisible(5);

// Usar prioridades apropriadas
toast.info("Tarefa concluída", undefined, { priority: "low" });
toast.warning("Prazo próximo", undefined, { priority: "high" });
```

**Para Aplicações Simples:**
```typescript
// Manter padrão (3 toasts)
// Usar priority apenas quando necessário
toast.success("Salvo!");
toast.error("Erro!", undefined, { priority: "critical" });
```

**Evitar Sobrecarga Visual:**
```typescript
// Agrupar notificações similares
let count = 0;
const notifyBatch = () => {
  count++;
  if (count === 10) {
    toast.success("10 arquivos processados!");
    count = 0;
  }
};
```

### Método 3: Promise Helper 🚀

Para operações assíncronas com loading automático:

```typescript
import { toast } from "@/components/BexToast";

// Modo simples
await toast.promise(
  saveData(),
  {
    loading: "Salvando dados...",
    success: "Dados salvos com sucesso!",
    error: "Erro ao salvar dados"
  }
);

// Com mensagens dinâmicas
await toast.promise(
  fetchUsers(),
  {
    loading: "Buscando usuários...",
    success: (users) => `${users.length} usuários carregados!`,
    error: (err) => `Erro: ${err.message}`
  }
);
```

## 📍 Posições Disponíveis

O sistema suporta 6 posições diferentes:

```typescript
const { setPosition } = useBexToast();

// Posições disponíveis
setPosition("top-right");      // Padrão - Superior direita
setPosition("top-left");       // Superior esquerda
setPosition("bottom-right");   // Inferior direita
setPosition("bottom-left");    // Inferior esquerda
setPosition("top-center");     // Superior centro
setPosition("bottom-center");  // Inferior centro
```

### Exemplo de Mudança de Posição

```typescript
function ConfiguracoesPage() {
  const { setPosition } = useBexToast();

  return (
    <select onChange={(e) => setPosition(e.target.value as any)}>
      <option value="top-right">Superior Direita</option>
      <option value="top-left">Superior Esquerda</option>
      <option value="bottom-right">Inferior Direita</option>
      <option value="bottom-left">Inferior Esquerda</option>
      <option value="top-center">Superior Centro</option>
      <option value="bottom-center">Inferior Centro</option>
    </select>
  );
}
```

## 🎨 Ícones Customizados

Você pode usar qualquer ícone do lucide-react:

```typescript
import { Rocket, Heart, Star, Zap } from "lucide-react";

showToast({
  title: "Lançamento!",
  description: "Nova funcionalidade disponível",
  variant: "info",
  icon: Rocket  // Ícone customizado
});

showToast({
  title: "Curtiu?",
  description: "Obrigado pelo feedback!",
  variant: "success",
  icon: Heart
});
```

## 🔘 Toasts com Ações

Adicione botões de ação aos toasts:

```typescript
showToast({
  title: "Arquivo pronto!",
  description: "Seu relatório foi gerado",
  variant: "success",
  action: {
    label: "Abrir",
    onClick: () => {
      window.open("/relatorios/ultimo");
    }
  }
});

showToast({
  title: "Tarefa atribuída",
  description: "Uma nova tarefa foi atribuída a você",
  variant: "info",
  action: {
    label: "Ver Detalhes",
    onClick: () => {
      navigate("/tarefas/123");
    }
  }
});
```

## ⏱️ Duração Customizada

```typescript
// Toast rápido (2 segundos)
showToast({
  title: "Copiado!",
  variant: "success",
  duration: 2000
});

// Toast longo (10 segundos)
showToast({
  title: "Erro crítico",
  description: "Verifique os logs para mais detalhes",
  variant: "error",
  duration: 10000
});

// Duração padrão é 5000ms (5 segundos)
```

## 🎭 Exemplos Práticos

### Salvar Dados (Promise Helper)

```typescript
const handleSave = async () => {
  try {
    await toast.promise(
      supabase.from("tarefas").insert({ titulo, descricao }),
      {
        loading: "Salvando tarefa...",
        success: "Tarefa criada com sucesso!",
        error: "Erro ao criar tarefa"
      }
    );
    navigate("/tarefas");
  } catch (error) {
    // Erro já foi mostrado pelo toast
  }
};
```

### Upload de Arquivo com Progress

```typescript
const handleUpload = async (file: File) => {
  const loadingId = toast.loading("Enviando arquivo...", file.name);

  try {
    // Simular progresso
    const interval = setInterval(() => {
      toast.update(loadingId, {
        title: "Enviando arquivo...",
        description: `${Math.random() * 100}% concluído`
      });
    }, 500);

    await uploadFile(file);
    clearInterval(interval);
    
    toast.update(loadingId, {
      title: "Upload concluído!",
      description: "Arquivo enviado com sucesso",
      variant: "success",
      duration: 5000
    });
  } catch (error) {
    toast.update(loadingId, {
      title: "Erro no upload",
      description: "Tente novamente",
      variant: "error",
      action: {
        label: "Tentar Novamente",
        onClick: () => handleUpload(file)
      }
    });
  }
};
```

### Confirmação de Ação

```typescript
const handleDelete = async (id: string) => {
  try {
    await deleteItem(id);
    
    toast.success("Item excluído", undefined, {
      action: {
        label: "Desfazer",
        onClick: async () => {
          await toast.promise(
            restoreItem(id),
            {
              loading: "Restaurando...",
              success: "Item restaurado!",
              error: "Erro ao restaurar"
            }
          );
        }
      }
    });
  } catch (error) {
    toast.error("Erro ao excluir");
  }
};
```

### Operações em Lote

```typescript
const handleBulkOperation = async (items: string[]) => {
  const loadingId = toast.loading("Processando itens...", `0/${items.length} completos`);
  let completed = 0;

  for (const item of items) {
    try {
      await processItem(item);
      completed++;
      
      toast.update(loadingId, {
        title: "Processando itens...",
        description: `${completed}/${items.length} completos`
      });
    } catch (error) {
      toast.error(`Erro no item ${item}`);
    }
  }

  toast.update(loadingId, {
    title: "Processamento concluído!",
    description: `${completed} de ${items.length} itens processados`,
    variant: completed === items.length ? "success" : "warning",
    duration: 5000
  });
};
```

## 🎨 Design System

### Cores por Variante

- **Success**: `from-bex-500/20 via-bex-600/10 to-transparent`
- **Error**: `from-red-500/20 via-red-600/10 to-transparent`
- **Warning**: `from-orange-500/20 via-orange-600/10 to-transparent`
- **Info**: `from-blue-500/20 via-blue-600/10 to-transparent`
- **Default**: `from-gray-500/20 via-gray-600/10 to-transparent`

### Efeitos Visuais

- **Shimmer**: Efeito de brilho animado
- **Backdrop Blur**: Blur no fundo (backdrop-blur-xl)
- **Shadow**: Sombra 2xl para profundidade
- **Progress Bar**: Indicador animado de tempo

## 🚀 API Completa

### Helper Functions (toast.*)

```typescript
// Toasts básicos - retornam o ID do toast
toast.success(title, description?, options?): string
toast.error(title, description?, options?): string
toast.warning(title, description?, options?): string
toast.info(title, description?, options?): string

// Options podem incluir:
{
  priority?: "critical" | "high" | "normal" | "low",
  duration?: number,
  icon?: LucideIcon,
  action?: { label: string, onClick: () => void }
}

// Loading toast - não fecha automaticamente
toast.loading(title, description?, options?): string

// Atualizar toast existente
toast.update(id, options): void

// Fechar toast manualmente
toast.dismiss(id): void

// Promise helper - loading automático
toast.promise(promise, messages): Promise<T>
```

### Hook Functions (useBexToast)

```typescript
const {
  // Helpers de toast
  success(title, description?, options?): string,
  error(title, description?, options?): string,
  warning(title, description?, options?): string,
  info(title, description?, options?): string,
  loading(title, description?, options?): string,
  update(id, options): void,
  dismiss(id): void,
  promise(promise, messages): Promise<T>,
  
  // Configurações de posição
  position: "top-right" | "top-left" | ...,
  setPosition(position): void,
  
  // Configurações de queue
  maxVisible: number,              // Máximo de toasts visíveis
  setMaxVisible(max: number): void,
  queuedCount: number,             // Toasts na fila
  
  // Método base
  showToast(options): string
} = useBexToast();
```

### ToastOptions Interface

```typescript
interface ToastOptions {
  title: string;                           // Obrigatório
  description?: string;                    // Opcional
  variant?: "success" | "error" | "warning" | "info" | "default";
  priority?: "critical" | "high" | "normal" | "low";  // Padrão: "normal"
  duration?: number;                       // Em ms (padrão: 5000)
  icon?: LucideIcon;                      // Ícone customizado
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

### Prioridades

```typescript
type ToastPriority = "critical" | "high" | "normal" | "low";

// Peso das prioridades (maior = mais importante)
critical: 4  // Sempre aparece, remove outros se necessário
high: 3      // Alta prioridade na fila
normal: 2    // Prioridade padrão
low: 1       // Baixa prioridade, aguarda na fila
```

## 🚀 Migração do Sistema Antigo

### Antes (Shadcn Toast)

```typescript
import { useToast } from "@/hooks/use-toast";

const { toast } = useToast();

toast({
  title: "Sucesso",
  description: "Operação concluída"
});
```

### Depois (BEX Toast)

```typescript
import { useBexToast } from "@/components/BexToast";

const { showToast } = useBexToast();

showToast({
  title: "Sucesso",
  description: "Operação concluída",
  variant: "success"
});
```

## 📱 Responsividade

Os toasts são totalmente responsivos:

- **Desktop**: 380px de largura
- **Mobile**: `max-w-[calc(100vw-2rem)]` para evitar overflow
- **Animações**: Otimizadas para todos os dispositivos

## ⚡ Performance

- **Lazy Loading**: Componentes carregam sob demanda
- **Framer Motion**: Animações GPU-aceleradas
- **Auto-cleanup**: Toasts são removidos automaticamente
- **Memoization**: Otimizações internas para re-renders

## 🎯 Boas Práticas

1. **Use Prioridades Apropriadas**
   - Critical: Apenas para erros críticos e ações irreversíveis
   - High: Avisos importantes que requerem atenção
   - Normal (padrão): Feedback geral de ações
   - Low: Informações secundárias, dicas

2. **Mensagens Curtas**: Mantenha títulos concisos (máx. 40 caracteres)

3. **Descrições Claras**: Use descrições para detalhes importantes

4. **Duração Adequada**: Ajuste baseado na quantidade de texto e prioridade
   - Critical/Error: 7-10 segundos
   - Normal: 5 segundos
   - Success rápido: 2-3 segundos

5. **Limite de Toasts**: Configure `maxVisible` baseado no uso
   - Apps simples: 2-3 toasts
   - Apps com muitas notificações: 4-6 toasts
   - Nunca mais que 10 toasts

6. **Ações Relevantes**: Adicione ações apenas quando necessário e útil

7. **Ícones Apropriados**: Use ícones que façam sentido contextual

8. **Variante Correta**: Use a variante apropriada para cada situação

9. **Evite Spam**: Agrupe notificações similares quando possível

10. **Queue Awareness**: Para apps com muitas notificações, monitore `queuedCount`

## 🐛 Troubleshooting

### Toast não aparece

Verifique se o `BexToastProvider` está envolvendo sua aplicação no App.tsx.

### Animações lentas

Reduza o número de toasts simultâneos ou ajuste as configurações do framer-motion.

### Estilos incorretos

Certifique-se de que as cores BEX estão definidas no `index.css` e `tailwind.config.ts`.
