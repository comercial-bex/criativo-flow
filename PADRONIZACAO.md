# Padrões do Projeto BEX Communication

Este documento define os padrões de código e estrutura adotados no projeto.

## 📁 Estrutura de Páginas

### Nomenclatura de Arquivos
- **Páginas**: PascalCase (ex: `Dashboard.tsx`, `Clientes.tsx`)
- **Componentes**: PascalCase (ex: `AgendaUnificada.tsx`, `ClientCard.tsx`)
- **Hooks**: camelCase com prefixo `use` (ex: `useAuth.tsx`, `useClientData.ts`)
- **Utils**: camelCase (ex: `statusUtils.ts`, `tarefaUtils.ts`)

### Declaração de Componentes

#### ✅ Padrão para Páginas
```typescript
// src/pages/Dashboard.tsx
export default function Dashboard() {
  // ... lógica do componente
  return (
    <div className="p-6 space-y-8">
      {/* ... conteúdo */}
    </div>
  );
}
```

#### ✅ Padrão para Componentes Exportados
```typescript
// src/components/AgendaUnificada.tsx
export function AgendaUnificada() {
  // ... lógica do componente
  return (
    <div>
      {/* ... conteúdo */}
    </div>
  );
}
```

#### ✅ Padrão para Componentes Internos
```typescript
// Componentes usados apenas dentro de um arquivo
function InternalComponent() {
  return <div>...</div>;
}
```

#### ❌ Evitar
```typescript
// Não usar arrow functions para componentes principais
const Dashboard = () => { ... };
export default Dashboard;

// Não usar export const para componentes exportados
export const AgendaUnificada = () => { ... };
```

## 🎨 Layout e Estrutura

### Uso de Layouts

#### Páginas com Sidebar (Desktop) e Bottom Nav (Mobile)
```typescript
import { ResponsiveLayout } from '@/components/ResponsiveLayout';

export default function MinhaPage() {
  return (
    <ResponsiveLayout>
      {/* Conteúdo da página */}
    </ResponsiveLayout>
  );
}
```

#### Páginas Standalone (sem layout)
```typescript
// Para páginas que gerenciam seu próprio layout
export default function Calendario() {
  return (
    <div className="min-h-screen bg-background p-6">
      {/* Layout customizado */}
    </div>
  );
}
```

### Quando usar ResponsiveLayout
- ✅ Dashboards e páginas principais
- ✅ Listagens e CRUDs
- ✅ Páginas que precisam de navegação global
- ❌ Páginas públicas (login, visualização pública)
- ❌ Modais e dialogs
- ❌ Páginas com layout totalmente customizado

## 🎯 Importações

### Ordem Recomendada
```typescript
// 1. React e libs externas
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. UI Components (shadcn)
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// 3. Componentes customizados
import { SectionHeader } from '@/components/SectionHeader';
import { ClientCard } from '@/components/ClientCard';

// 4. Hooks customizados
import { useAuth } from '@/hooks/useAuth';
import { useClientData } from '@/hooks/useClientData';

// 5. Utils e types
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

// 6. Icons
import { Users, Calendar, Plus } from 'lucide-react';
```

## 🔗 Rotas

### Padrões de Nomenclatura de Rotas

#### Módulos Principais
- `/dashboard` - Dashboard principal
- `/clientes` - Gestão de clientes
- `/financeiro` - Módulo financeiro
- `/calendario` - Calendário multidisciplinar
- `/agenda` - Agenda unificada
- `/inteligencia` - Módulo de inteligência

#### Módulos por Role
- `/grs/*` - Rotas do módulo GRS
- `/audiovisual/*` - Rotas de audiovisual
- `/design/*` - Rotas de design
- `/cliente/*` - Rotas da área do cliente
- `/admin/*` - Rotas administrativas

#### Padrão de Estruturação no App.tsx
```typescript
<Route path="/modulo" element={
  <ProtectedRoute module="modulo">
    <Layout><Pagina /></Layout>
  </ProtectedRoute>
} />
```

## 📊 Estado e Dados

### Nomenclatura de Estados
```typescript
// ✅ Bom
const [loading, setLoading] = useState(false);
const [clientes, setClientes] = useState<Cliente[]>([]);
const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);

// ❌ Evitar
const [isLoading, setIsLoading] = useState(false); // redundante para boolean
const [data, setData] = useState([]); // nome genérico demais
```

### Nomenclatura de Funções
```typescript
// ✅ Handlers de eventos
const handleSubmit = () => { ... };
const handleClientSelect = (id: string) => { ... };

// ✅ Funções de fetch
const fetchClientes = async () => { ... };
const loadDashboardData = async () => { ... };

// ✅ Funções de utilidade
const formatCurrency = (value: number) => { ... };
const validateForm = (data: FormData) => { ... };
```

## 🎨 Estilos e Classes Tailwind

### Uso de Design Tokens
```typescript
// ✅ Usar tokens semânticos
className="bg-background text-foreground"
className="bg-primary text-primary-foreground"
className="border-border"

// ❌ Evitar cores diretas
className="bg-white text-black"
className="bg-blue-500"
```

### Composição de Classes
```typescript
import { cn } from '@/lib/utils';

// ✅ Usar cn() para composição
<div className={cn(
  "base-classes",
  isActive && "active-state",
  "conditional-classes"
)} />

// ✅ Extrair classes complexas para variáveis
const cardClasses = cn(
  "rounded-lg border p-6",
  variant === 'primary' && "bg-primary text-primary-foreground",
  variant === 'secondary' && "bg-secondary text-secondary-foreground"
);
```

## 🔐 Controle de Acesso

### Uso de ProtectedRoute
```typescript
// Com módulo
<ProtectedRoute module="clientes">
  <Layout><Clientes /></Layout>
</ProtectedRoute>

// Com role específica
<ProtectedRoute requiredRole="admin">
  <Layout><AdminPanel /></Layout>
</ProtectedRoute>

// Com múltiplas roles
<ProtectedRoute allowedRoles={['admin', 'gestor', 'grs']}>
  <Layout><Aprovacoes /></Layout>
</ProtectedRoute>
```

## 📝 TypeScript

### Definição de Tipos
```typescript
// ✅ Interfaces para objetos complexos
interface Cliente {
  id: string;
  nome: string;
  email: string;
  status: 'ativo' | 'inativo';
}

// ✅ Types para unions e aliases
type UserRole = 'admin' | 'gestor' | 'grs' | 'cliente';
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// ✅ Generics quando necessário
interface ApiResponse<T> {
  data: T;
  error?: string;
}
```

## 🧪 Convenções de Nomenclatura

### Variáveis Booleanas
```typescript
// ✅ Prefixos descritivos
const isLoading = true;
const hasPermission = false;
const canEdit = true;
const shouldRefetch = false;

// ❌ Evitar
const loading = true; // ambíguo
const permission = false; // não é booleano
```

### Arrays e Listas
```typescript
// ✅ Plural para arrays
const clientes = [];
const eventos = [];
const tarefas = [];

// ✅ Singular para item individual
const cliente = { ... };
const selectedEvento = { ... };
```

## 📦 Exports

### Padrão de Exports
```typescript
// ✅ Default export para componente principal
export default function Dashboard() { ... }

// ✅ Named exports para utilitários e tipos
export function formatDate(date: Date) { ... }
export type { Cliente, Projeto };

// ✅ Named export para componentes secundários
export function ClientCard() { ... }
export function EventoCard() { ... }
```

## 🚀 Performance

### Otimizações Comuns
```typescript
// ✅ useCallback para funções passadas como props
const handleSubmit = useCallback(() => {
  // ...
}, [dependencies]);

// ✅ useMemo para cálculos pesados
const filteredClientes = useMemo(() => {
  return clientes.filter(c => c.status === 'ativo');
}, [clientes]);

// ✅ Lazy loading para componentes pesados
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

## 📱 Responsividade

### Breakpoints Tailwind
```typescript
// Mobile first
className="flex flex-col md:flex-row lg:grid lg:grid-cols-3"

// Tamanhos padrão
sm: 640px   // Tablets pequenos
md: 768px   // Tablets
lg: 1024px  // Desktop
xl: 1280px  // Desktop grande
2xl: 1536px // Telas muito grandes
```

### Hook useDeviceType
```typescript
import { useDeviceType } from '@/hooks/useDeviceType';

function MyComponent() {
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  
  return (
    <div>
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  );
}
```

---

## 📚 Recursos Adicionais

- [Shadcn UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [React Hook Form](https://react-hook-form.com/)
- [TanStack Query](https://tanstack.com/query/latest)

---

**Última atualização**: 2025-01-11
**Versão**: 1.0.0
