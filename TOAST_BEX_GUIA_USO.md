# Sistema de Toasts BEX - Guia Completo

## 🎨 Visão Geral

Sistema de notificações toast personalizado com design BEX, gradientes animados, ícones do lucide-react e posições configuráveis.

## ✨ Características

- **Design BEX**: Gradientes personalizados e cores do tema
- **Animações Suaves**: Usando framer-motion para transições fluidas
- **Ícones Dinâmicos**: Ícones lucide-react por tipo ou customizados
- **Posições Configuráveis**: 6 posições disponíveis
- **Progress Bar**: Indicador visual de tempo restante
- **Ações**: Botões de ação opcionais
- **Auto-dismiss**: Fechamento automático configurável
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

### 1. Importar o Hook

```typescript
import { useBexToast } from "@/components/BexToast";
```

### 2. Usar no Componente

```typescript
function MeuComponente() {
  const { showToast } = useBexToast();

  const handleClick = () => {
    showToast({
      title: "Tarefa criada!",
      description: "Sua tarefa foi adicionada com sucesso",
      variant: "success",
      duration: 5000
    });
  };

  return <button onClick={handleClick}>Criar Tarefa</button>;
}
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

### Salvar Dados

```typescript
const handleSave = async () => {
  try {
    await saveData();
    
    showToast({
      title: "Dados salvos!",
      description: "Suas alterações foram salvas com sucesso",
      variant: "success"
    });
  } catch (error) {
    showToast({
      title: "Erro ao salvar",
      description: error.message,
      variant: "error",
      duration: 7000
    });
  }
};
```

### Upload de Arquivo

```typescript
const handleUpload = async (file: File) => {
  showToast({
    title: "Enviando arquivo...",
    description: `Uploading ${file.name}`,
    variant: "info",
    icon: Upload
  });

  try {
    await uploadFile(file);
    
    showToast({
      title: "Upload concluído!",
      description: "Arquivo enviado com sucesso",
      variant: "success",
      icon: CheckCircle2
    });
  } catch (error) {
    showToast({
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
    
    showToast({
      title: "Item excluído",
      variant: "success",
      action: {
        label: "Desfazer",
        onClick: () => restoreItem(id)
      }
    });
  } catch (error) {
    showToast({
      title: "Erro ao excluir",
      variant: "error"
    });
  }
};
```

### Notificação de Sistema

```typescript
const checkUpdates = async () => {
  const hasUpdate = await checkForUpdates();
  
  if (hasUpdate) {
    showToast({
      title: "Atualização disponível!",
      description: "Nova versão do sistema disponível",
      variant: "info",
      icon: Download,
      duration: 10000,
      action: {
        label: "Atualizar Agora",
        onClick: () => window.location.reload()
      }
    });
  }
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

## 🔧 Props Completas

```typescript
interface ToastOptions {
  title: string;                    // Obrigatório - Título do toast
  description?: string;             // Opcional - Descrição detalhada
  variant?: ToastVariant;           // Opcional - Tipo (success, error, etc)
  duration?: number;                // Opcional - Duração em ms (padrão: 5000)
  icon?: LucideIcon;               // Opcional - Ícone customizado
  action?: {                       // Opcional - Ação do toast
    label: string;                 // Texto do botão
    onClick: () => void;           // Função ao clicar
  };
}
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

1. **Mensagens Curtas**: Mantenha títulos concisos (máx. 40 caracteres)
2. **Descrições Claras**: Use descrições para detalhes importantes
3. **Duração Adequada**: Ajuste baseado na quantidade de texto
4. **Ações Relevantes**: Adicione ações apenas quando necessário
5. **Ícones Apropriados**: Use ícones que façam sentido contextual
6. **Variante Correta**: Use a variante apropriada para cada situação

## 🐛 Troubleshooting

### Toast não aparece

Verifique se o `BexToastProvider` está envolvendo sua aplicação no App.tsx.

### Animações lentas

Reduza o número de toasts simultâneos ou ajuste as configurações do framer-motion.

### Estilos incorretos

Certifique-se de que as cores BEX estão definidas no `index.css` e `tailwind.config.ts`.
