# 📚 Guia de Implementação de Tutoriais

Este documento fornece um guia completo para implementar tutoriais interativos usando o sistema `intro.js` nas páginas da aplicação.

## 📋 Checklist para Nova Página

### 1. Adicionar configuração em `useTutorial.ts`

Adicione uma nova entrada no objeto `TUTORIALS_CONFIG`:

```typescript
'nome-da-pagina': {
  page: 'nome-da-pagina',
  steps: [
    { 
      intro: '<h3>Bem-vindo!</h3><p>Descrição inicial do tutorial</p>' 
    },
    { 
      element: '[data-tour="elemento-1"]', 
      intro: '<h3>Título do Step</h3><p>Descrição do elemento</p>', 
      position: 'bottom' 
    },
    { 
      element: '[data-tour="elemento-2"]', 
      intro: '<h3>Outro Step</h3><p>Outra descrição</p>', 
      position: 'right' 
    },
    { 
      intro: '<h3>✅ Tutorial Concluído!</h3><p>Você pode rever este tutorial a qualquer momento.</p>' 
    },
  ],
},
```

### 2. Importar hook e componente

No componente da página, adicione as importações:

```typescript
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';

// Dentro do componente:
const { startTutorial, hasSeenTutorial } = useTutorial('nome-da-pagina');
```

### 3. Adicionar botão no header

Adicione o `TutorialButton` próximo ao cabeçalho da página:

```typescript
<div className="flex items-center gap-2">
  <TutorialButton onStart={startTutorial} hasSeenTutorial={hasSeenTutorial} />
  {/* Outros botões do header */}
</div>
```

### 4. Marcar elementos com data-tour

Adicione o atributo `data-tour` nos elementos que serão destacados no tutorial:

```typescript
<Button data-tour="novo-item">Novo Item</Button>
<Card data-tour="kpis">...</Card>
<Table data-tour="tabela">...</Table>
<div data-tour="filtros">...</div>
```

### 5. Testar

Limpe o localStorage e recarregue a página para testar:

```javascript
// No console do navegador:
localStorage.clear();
location.reload();
```

Verifique:
- ✅ Tutorial inicia automaticamente na primeira vez
- ✅ Botão aparece no header
- ✅ Elementos são destacados corretamente
- ✅ Posições estão adequadas
- ✅ Botão "Ver Tutorial" funciona após primeira visualização

---

## 🎨 Boas Práticas

### Estrutura dos Steps

1. **Step Inicial (Boas-vindas)**
   - Sem `element`
   - Apenas `intro` com título e descrição geral
   - Apresenta a página e o que o usuário vai aprender

2. **Steps Intermediários (Tour)**
   - Com `element` (seletor data-tour)
   - `intro` com título (h3) e descrição (p)
   - `position` adequada ao contexto do elemento

3. **Step Final (Conclusão)**
   - Sem `element`
   - `intro` com mensagem de conclusão
   - Emoji ✅ para feedback visual positivo

### Quantidade de Steps

- **Ideal**: 5-7 steps por página
- **Máximo**: 8-10 steps
- **Evite**: Mais de 10 steps (causa fadiga no usuário)

### Posicionamento (`position`)

Escolha a posição baseada no contexto:

| Posição | Quando usar |
|---------|-------------|
| `'bottom'` | Headers, botões de ação no topo |
| `'top'` | Tabelas, listas, conteúdo inferior |
| `'left'` | Sidebars direitas, cards laterais direitos |
| `'right'` | Sidebars esquerdas, cards laterais esquerdos |
| `'auto'` | Quando não tem certeza (intro.js escolhe) |

### Nomeação de data-tour

Use nomes descritivos e consistentes:

```typescript
// ✅ BOM
data-tour="novo-cliente"
data-tour="kpis-financeiros"
data-tour="filtros-data"
data-tour="tabela-contratos"

// ❌ EVITE
data-tour="btn1"
data-tour="div2"
data-tour="card"
```

### Textos dos Steps

```typescript
// ✅ BOM - Claro e direto
intro: '<h3>Filtrar por Status</h3><p>Use estes filtros para refinar sua busca por status específicos.</p>'

// ❌ EVITE - Muito genérico
intro: '<h3>Filtros</h3><p>Aqui estão os filtros.</p>'
```

---

## 📊 Status de Implementação

### ✅ Páginas com Tutorial Completo

| Página | Tutorial Config | TutorialButton | data-tour | Status |
|--------|----------------|----------------|-----------|--------|
| `/admin/contratos` | ✅ | ✅ | ✅ | Completo |
| `/admin/produtos` | ✅ | ✅ | ✅ | Completo |
| `/financeiro/categorias` | ✅ | ✅ | ✅ | Completo |
| `/cliente/projetos` | ✅ | ✅ | ⚠️ | Parcial |
| `/grs/*` (diversos) | ✅ | ✅ | ✅ | Completo |
| `/audiovisual/*` | ✅ | ✅ | ✅ | Completo |
| `/rh/*` | ✅ | ✅ | ✅ | Completo |
| `/financeiro/dashboard` | ✅ | ✅ | ✅ | Completo |

### ⚠️ Páginas que Precisam de data-tour

| Página | O que falta |
|--------|-------------|
| `/cliente/projetos` | Adicionar `data-tour` nos elementos principais |

---

## 🔧 Configurações Globais

### Auto-start Delay

O tutorial inicia automaticamente após um delay configurado em `useTutorial.ts`:

```typescript
// Atual: 1000ms (1 segundo)
setTimeout(() => {
  startTutorial();
}, 1000);

// Ajuste para 3 segundos se necessário:
setTimeout(() => {
  startTutorial();
}, 3000);
```

### Opções do intro.js

Configurações globais em `useTutorial.ts` (linha 346-357):

```typescript
intro.setOptions({
  steps: config.steps,
  showProgress: true,      // Mostra progresso (1/5, 2/5, etc)
  showBullets: true,       // Mostra bolinhas de navegação
  exitOnOverlayClick: false, // Não fecha ao clicar fora
  nextLabel: 'Próximo →',
  prevLabel: '← Anterior',
  doneLabel: 'Concluir ✓',
  skipLabel: 'Pular',
  scrollToElement: true,   // Scroll automático para elemento
  scrollPadding: 30,
  disableInteraction: true // Desabilita interação com elementos destacados
});
```

---

## 🐛 Troubleshooting

### Tutorial não inicia automaticamente

**Causa**: localStorage já tem registro de visualização

**Solução**:
```javascript
localStorage.removeItem('tutorial-seen-nome-da-pagina');
location.reload();
```

### Elemento não é destacado

**Causa**: Seletor `data-tour` incorreto ou elemento renderizado depois

**Solução**:
1. Verificar se o `data-tour` está correto
2. Adicionar delay maior se elemento é dinâmico
3. Usar selector absoluto se necessário: `element: '#id-do-elemento'`

### Posicionamento errado

**Causa**: Position não adequada ao layout

**Solução**:
- Trocar `position` para `'auto'` ou testar outras posições
- Verificar se elemento tem espaço suficiente na tela

### Tutorial quebra em mobile

**Causa**: Elementos muito pequenos ou posições inadequadas

**Solução**:
- Usar `position: 'auto'` em elementos móveis
- Garantir elementos touch-friendly (mínimo 44x44px)
- Testar sempre em dispositivos móveis

---

## 📝 Exemplos Completos

### Exemplo 1: Página Administrativa

```typescript
// useTutorial.ts
'admin-usuarios': {
  page: 'admin-usuarios',
  steps: [
    {
      intro: '<h3>👥 Gestão de Usuários</h3><p>Aqui você controla todos os usuários do sistema.</p>'
    },
    {
      element: '[data-tour="novo-usuario"]',
      intro: '<h3>Criar Novo Usuário</h3><p>Clique aqui para adicionar um novo usuário ao sistema.</p>',
      position: 'bottom'
    },
    {
      element: '[data-tour="filtros"]',
      intro: '<h3>Filtros de Busca</h3><p>Use os filtros para encontrar usuários específicos por nome, email ou status.</p>',
      position: 'bottom'
    },
    {
      element: '[data-tour="tabela-usuarios"]',
      intro: '<h3>Lista de Usuários</h3><p>Visualize, edite ou desative usuários diretamente na tabela.</p>',
      position: 'top'
    },
    {
      intro: '<h3>✅ Tutorial Concluído!</h3><p>Você está pronto para gerenciar usuários!</p>'
    }
  ]
}

// Componente
export default function Usuarios() {
  const { startTutorial, hasSeenTutorial } = useTutorial('admin-usuarios');
  
  return (
    <div>
      <div className="flex justify-between">
        <h1>Usuários</h1>
        <div className="flex gap-2">
          <TutorialButton onStart={startTutorial} hasSeenTutorial={hasSeenTutorial} />
          <Button data-tour="novo-usuario">Novo Usuário</Button>
        </div>
      </div>
      
      <div data-tour="filtros">
        {/* Filtros */}
      </div>
      
      <div data-tour="tabela-usuarios">
        {/* Tabela */}
      </div>
    </div>
  );
}
```

### Exemplo 2: Dashboard com KPIs

```typescript
// useTutorial.ts
'dashboard-vendas': {
  page: 'dashboard-vendas',
  steps: [
    {
      intro: '<h3>📊 Dashboard de Vendas</h3><p>Acompanhe suas métricas e performance em tempo real.</p>'
    },
    {
      element: '[data-tour="kpis"]',
      intro: '<h3>Indicadores Principais</h3><p>Veja os KPIs mais importantes do seu negócio.</p>',
      position: 'bottom'
    },
    {
      element: '[data-tour="grafico-vendas"]',
      intro: '<h3>Gráfico de Vendas</h3><p>Analise a evolução das vendas ao longo do tempo.</p>',
      position: 'top'
    },
    {
      element: '[data-tour="filtro-periodo"]',
      intro: '<h3>Filtrar Período</h3><p>Altere o período para ver dados históricos.</p>',
      position: 'left'
    },
    {
      intro: '<h3>✅ Pronto!</h3><p>Agora você pode analisar suas vendas com eficiência.</p>'
    }
  ]
}
```

---

## 🎯 Checklist Pré-Deploy

Antes de fazer deploy de novos tutoriais:

- [ ] Testei em desktop
- [ ] Testei em tablet
- [ ] Testei em mobile
- [ ] Auto-start funciona na primeira vez
- [ ] Botão "Ver Tutorial" aparece após primeira visualização
- [ ] Todos os elementos têm `data-tour` correto
- [ ] Posições estão adequadas
- [ ] Textos estão claros e sem erros
- [ ] Máximo de 10 steps
- [ ] Includes step de boas-vindas e conclusão

---

## 📚 Referências

- [Intro.js Documentation](https://introjs.com/docs)
- [Código-fonte: useTutorial.ts](../src/hooks/useTutorial.ts)
- [Código-fonte: TutorialButton.tsx](../src/components/TutorialButton.tsx)
