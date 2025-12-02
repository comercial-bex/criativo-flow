# Estrutura Completa do Sistema de Onboarding

## 📁 Arquitetura de Pastas

```
src/
├── components/
│   └── OnboardingModal/
│       ├── index.tsx                    # Modal principal
│       ├── OnboardingProgress.tsx       # Barra de progresso
│       ├── RelatorioPreview.tsx         # Preview do relatório IA
│       ├── types.ts                     # Tipos TypeScript
│       └── steps/
│           ├── StepEmpresa.tsx          # Passo 1: Dados da empresa
│           ├── StepPublico.tsx          # Passo 2: Público-alvo
│           ├── StepDigital.tsx          # Passo 3: Presença digital
│           ├── StepSwot.tsx             # Passo 4: Análise SWOT
│           ├── StepConcorrencia.tsx     # Passo 5: Concorrência
│           ├── StepObjetivos.tsx        # Passo 6: Objetivos
│           ├── StepMarca.tsx            # Passo 7: Identidade da marca
│           └── StepPlano.tsx            # Passo 8: Plano/Assinatura
│
├── hooks/
│   └── useClienteOnboarding.ts          # Hook para dados do onboarding
│
├── pages/
│   ├── Clientes/
│   │   └── ClienteDetalhes.tsx          # Acesso via detalhes do cliente
│   └── Admin/
│       └── OnboardingAdmin.tsx          # Gestão administrativa
│
supabase/
└── functions/
    ├── analyze-onboarding-complete/     # 🤖 IA: Análise completa
    ├── analyze-swot/                    # 🤖 IA: Análise SWOT
    ├── analyze-competitor/              # 🤖 IA: Análise competitiva
    └── suggest-campaigns/               # 🤖 IA: Sugestão de campanhas
```

---

## 🗄️ Schema do Banco de Dados

### Tabela: `cliente_onboarding`

```sql
CREATE TABLE cliente_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) NOT NULL,
  
  -- PASSO 1: Empresa
  nome_empresa TEXT NOT NULL,
  segmento_atuacao TEXT,
  produtos_servicos TEXT,
  tempo_mercado TEXT,
  localizacao TEXT,
  area_atendimento TEXT,
  
  -- PASSO 2: Público
  publico_alvo TEXT[],
  publico_alvo_outros TEXT,
  dores_problemas TEXT,
  valorizado TEXT,
  ticket_medio TEXT,
  frequencia_compra TEXT,
  como_encontram TEXT[],
  forma_aquisicao TEXT[],
  
  -- PASSO 3: Presença Digital
  link_instagram TEXT,
  link_facebook TEXT,
  link_linkedin TEXT,
  link_tiktok TEXT,
  link_youtube TEXT,
  link_site TEXT,
  link_google_maps TEXT,
  presenca_digital TEXT[],
  presenca_digital_outros TEXT,
  frequencia_postagens TEXT,
  tipos_conteudo TEXT[],
  midia_paga TEXT,
  
  -- PASSO 4: SWOT
  forcas TEXT,
  fraquezas TEXT,
  oportunidades TEXT,
  ameacas TEXT,
  diferenciais TEXT,
  concorrentes_diretos TEXT,
  
  -- PASSO 5: Concorrência (dados adicionais)
  estrutura_atual TEXT,
  equipe_vendas_externa TEXT,
  canais_atendimento_ativos TEXT,
  relacionamento_clientes TEXT[],
  materiais_impressos TEXT[],
  midia_tradicional TEXT[],
  feiras_eventos TEXT,
  fatores_crise TEXT,
  
  -- PASSO 6: Objetivos
  objetivos_digitais TEXT,
  objetivos_offline TEXT,
  onde_6_meses TEXT,
  resultados_esperados TEXT[],
  areas_foco TEXT[],
  objetivos_comunicacao TEXT[],
  
  -- PASSO 7: Marca
  historia_marca TEXT,
  valores_principais TEXT,
  tom_voz TEXT[],
  como_lembrada TEXT,
  missao TEXT,
  posicionamento TEXT,
  
  -- PASSO 8: Plano
  assinatura_id UUID REFERENCES assinaturas(id),
  plano_estrategico_id UUID REFERENCES planos_estrategicos(id),
  duracao_contrato_meses INTEGER,
  campanhas_mensais JSONB,
  
  -- IA e Relatório
  relatorio_ia_gerado TEXT,
  relatorio_gerado_em TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE cliente_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem ver todos onboardings"
ON cliente_onboarding FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'gestor')
  )
);

CREATE POLICY "Responsáveis podem ver seus clientes"
ON cliente_onboarding FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM clientes 
    WHERE id = cliente_onboarding.cliente_id 
    AND responsavel_id = auth.uid()
  )
);
```

---

## 📋 Fluxo de 8 Passos

### Passo 1: Dados da Empresa (`StepEmpresa`)

**Campos:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| nome_empresa | text | ✅ | Nome fantasia ou razão social |
| segmento_atuacao | text | ✅ | Nicho de mercado |
| produtos_servicos | textarea | ✅ | Principais produtos/serviços |
| tempo_mercado | select | ❌ | Tempo de atuação |
| localizacao | text | ❌ | Cidade/Estado |
| area_atendimento | text | ❌ | Área geográfica de atendimento |

**Opções tempo_mercado:**
- Menos de 1 ano
- 1 a 3 anos
- 3 a 5 anos
- 5 a 10 anos
- Mais de 10 anos

---

### Passo 2: Público-Alvo (`StepPublico`)

**Campos:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| publico_alvo | checkbox[] | ✅ | Perfis do público |
| publico_alvo_outros | text | ❌ | Outros perfis |
| dores_problemas | textarea | ✅ | Problemas que o cliente resolve |
| valorizado | textarea | ❌ | O que o público mais valoriza |
| ticket_medio | text | ❌ | Valor médio de compra |
| frequencia_compra | select | ❌ | Frequência de compra |
| como_encontram | checkbox[] | ❌ | Como encontram a empresa |
| forma_aquisicao | checkbox[] | ❌ | Como adquirem |

**Opções publico_alvo:**
- B2B (Empresas)
- B2C (Consumidor Final)
- Classe A
- Classe B
- Classe C
- Jovens (18-30)
- Adultos (30-50)
- Maduros (50+)
- Local
- Regional
- Nacional

**Opções como_encontram:**
- Google/Busca
- Redes Sociais
- Indicação
- Anúncios
- Feiras/Eventos
- Parceiros

---

### Passo 3: Presença Digital (`StepDigital`)

**Campos:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| link_instagram | url | ❌ | Link do Instagram |
| link_facebook | url | ❌ | Link do Facebook |
| link_linkedin | url | ❌ | Link do LinkedIn |
| link_tiktok | url | ❌ | Link do TikTok |
| link_youtube | url | ❌ | Link do YouTube |
| link_site | url | ❌ | Link do site |
| link_google_maps | url | ❌ | Link do Google Maps |
| presenca_digital | checkbox[] | ❌ | Canais ativos |
| frequencia_postagens | select | ❌ | Frequência atual |
| tipos_conteudo | checkbox[] | ❌ | Tipos de conteúdo |
| midia_paga | select | ❌ | Investimento em mídia paga |

**Opções frequencia_postagens:**
- Diária
- 3-5x por semana
- 1-2x por semana
- Quinzenal
- Mensal
- Irregular/Raramente

**Opções tipos_conteudo:**
- Fotos de produtos
- Bastidores
- Depoimentos
- Educacional
- Entretenimento
- Promoções
- Stories
- Reels/Vídeos curtos

---

### Passo 4: Análise SWOT (`StepSwot`)

**Campos:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| forcas | textarea | ✅ | Pontos fortes internos |
| fraquezas | textarea | ✅ | Pontos fracos internos |
| oportunidades | textarea | ✅ | Oportunidades externas |
| ameacas | textarea | ✅ | Ameaças externas |
| diferenciais | textarea | ✅ | Diferenciais competitivos |
| concorrentes_diretos | textarea | ❌ | Principais concorrentes |

**🤖 Geração com IA:**
```typescript
// Trigger: Ao sair do passo ou clicar em "Analisar com IA"
// Input: forcas, fraquezas, oportunidades, ameacas, segmento_atuacao
// Output: Análise estratégica e recomendações
```

---

### Passo 5: Estrutura e Concorrência (`StepConcorrencia`)

**Campos:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| estrutura_atual | select | ❌ | Estrutura de marketing atual |
| equipe_vendas_externa | select | ❌ | Tem equipe externa |
| canais_atendimento_ativos | textarea | ❌ | Canais de atendimento |
| relacionamento_clientes | checkbox[] | ❌ | Como mantém relacionamento |
| materiais_impressos | checkbox[] | ❌ | Materiais físicos |
| midia_tradicional | checkbox[] | ❌ | Mídia tradicional |
| feiras_eventos | textarea | ❌ | Participação em eventos |
| fatores_crise | textarea | ❌ | Fatores de risco |

**🤖 Geração com IA:**
```typescript
// Trigger: Se concorrentes_diretos preenchido
// Input: concorrentes_diretos, segmento_atuacao, diferenciais
// Output: Análise competitiva e posicionamento
```

---

### Passo 6: Objetivos (`StepObjetivos`)

**Campos:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| objetivos_digitais | textarea | ✅ | Objetivos no digital |
| objetivos_offline | textarea | ❌ | Objetivos offline |
| onde_6_meses | textarea | ✅ | Visão de 6 meses |
| resultados_esperados | checkbox[] | ✅ | Resultados esperados |
| areas_foco | checkbox[] | ❌ | Áreas de foco |
| objetivos_comunicacao | checkbox[] | ❌ | Objetivos de comunicação |

**Opções resultados_esperados:**
- Aumentar vendas
- Gerar leads
- Fortalecer marca
- Engajar comunidade
- Lançar produto
- Expandir mercado
- Fidelizar clientes
- Aumentar ticket médio

**Opções objetivos_comunicacao:**
- Awareness (conhecimento)
- Consideração
- Conversão
- Retenção
- Advocacy (indicação)

---

### Passo 7: Identidade da Marca (`StepMarca`)

**Campos:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| historia_marca | textarea | ❌ | História da marca |
| valores_principais | textarea | ✅ | Valores da empresa |
| tom_voz | checkbox[] | ✅ | Tom de voz da comunicação |
| como_lembrada | textarea | ✅ | Como quer ser lembrada |
| missao | textarea | ❌ | Missão da empresa |
| posicionamento | textarea | ❌ | Posicionamento de mercado |

**Opções tom_voz:**
- Formal/Corporativo
- Informal/Descontraído
- Técnico/Especialista
- Inspirador/Motivacional
- Educativo
- Bem-humorado
- Sofisticado/Premium
- Popular/Acessível

---

### Passo 8: Plano e Finalização (`StepPlano`)

**Campos:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| assinatura_id | select | ✅ | Plano selecionado |
| duracao_contrato_meses | number | ❌ | Duração do contrato |
| campanhas_mensais | json | ❌ | Campanhas sugeridas |

**🤖 Geração com IA (Final):**
```typescript
// Trigger: Ao finalizar onboarding
// Input: Todos os dados do onboarding
// Output: 
//   - Relatório estratégico completo
//   - Sugestões de campanhas
//   - Metas recomendadas
//   - Plano de ação inicial
```

---

## 🤖 Edge Functions de IA

### 1. `analyze-onboarding-complete`

**Trigger:** Finalização do onboarding (Passo 8)

**Input:**
```json
{
  "onboarding_id": "uuid",
  "cliente_id": "uuid",
  "dados_completos": { ... }
}
```

**Output:**
```json
{
  "relatorio_markdown": "# Análise Estratégica...",
  "metas_sugeridas": [
    {
      "titulo": "Aumentar seguidores Instagram",
      "tipo_meta": "seguidores",
      "valor_alvo": 1000,
      "periodo_meses": 3
    }
  ],
  "campanhas_sugeridas": [
    {
      "nome": "Campanha de Lançamento",
      "objetivo": "awareness",
      "duracao_dias": 30,
      "orcamento_sugerido": 500
    }
  ],
  "proximos_passos": [
    "Configurar Business Manager",
    "Criar identidade visual",
    "Desenvolver calendário editorial"
  ]
}
```

---

### 2. `analyze-swot`

**Trigger:** Passo 4 - Botão "Analisar SWOT"

**Input:**
```json
{
  "forcas": "...",
  "fraquezas": "...",
  "oportunidades": "...",
  "ameacas": "...",
  "segmento": "..."
}
```

**Output:**
```json
{
  "analise": "Análise detalhada...",
  "recomendacoes": ["...", "..."],
  "matriz_prioridades": {
    "alta_urgencia": ["..."],
    "media_urgencia": ["..."],
    "baixa_urgencia": ["..."]
  }
}
```

---

### 3. `analyze-competitor`

**Trigger:** Passo 5 - Análise de concorrência

**Input:**
```json
{
  "concorrentes": "...",
  "segmento": "...",
  "diferenciais_cliente": "..."
}
```

**Output:**
```json
{
  "analise_competitiva": "...",
  "gaps_mercado": ["..."],
  "oportunidades_diferenciacao": ["..."],
  "posicionamento_sugerido": "..."
}
```

---

### 4. `suggest-campaigns`

**Trigger:** Passo 8 - Sugestão de campanhas

**Input:**
```json
{
  "objetivos": ["..."],
  "publico_alvo": ["..."],
  "orcamento_disponivel": 1000,
  "canais_ativos": ["instagram", "facebook"]
}
```

**Output:**
```json
{
  "campanhas": [
    {
      "nome": "...",
      "objetivo": "...",
      "canal_principal": "...",
      "duracao_sugerida": 30,
      "orcamento_sugerido": 500,
      "kpis": ["..."]
    }
  ]
}
```

---

## 🔗 Pontos de Acesso

### 1. Página de Clientes (`/clientes`)

```tsx
// Botão no card do cliente ou lista
<Button onClick={() => openOnboarding(clienteId)}>
  {hasOnboarding ? 'Editar Onboarding' : 'Iniciar Onboarding'}
</Button>

// Indicador de progresso
<OnboardingProgress clienteId={clienteId} />
```

### 2. Detalhes do Cliente (`/clientes/:id`)

```tsx
// Tab dedicada ou seção
<Tabs>
  <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
  <TabsContent value="onboarding">
    <OnboardingSection clienteId={clienteId} />
  </TabsContent>
</Tabs>
```

### 3. Área do Cliente (`/area-cliente`)

```tsx
// Se onboarding incompleto, mostrar CTA
{!onboardingCompleto && (
  <Card className="border-warning">
    <CardHeader>
      <CardTitle>Complete seu perfil</CardTitle>
      <CardDescription>
        Preencha o onboarding para receber recomendações personalizadas
      </CardDescription>
    </CardHeader>
    <CardContent>
      <OnboardingProgress value={progressoOnboarding} />
      <Button onClick={continueOnboarding}>Continuar</Button>
    </CardContent>
  </Card>
)}
```

### 4. Admin (`/admin/onboarding`)

```tsx
// Lista de onboardings pendentes/completos
<DataTable
  columns={[
    { header: 'Cliente', accessor: 'nome_empresa' },
    { header: 'Progresso', accessor: 'progresso' },
    { header: 'Última Atualização', accessor: 'updated_at' },
    { header: 'Ações', accessor: 'actions' }
  ]}
  data={onboardings}
/>
```

---

## 📊 Cálculo de Progresso

```typescript
function calcularProgresso(onboarding: ClienteOnboarding): number {
  const passos = [
    // Passo 1: Empresa (peso 15%)
    {
      peso: 15,
      campos: ['nome_empresa', 'segmento_atuacao', 'produtos_servicos'],
      obrigatorios: ['nome_empresa', 'segmento_atuacao', 'produtos_servicos']
    },
    // Passo 2: Público (peso 15%)
    {
      peso: 15,
      campos: ['publico_alvo', 'dores_problemas', 'valorizado'],
      obrigatorios: ['publico_alvo', 'dores_problemas']
    },
    // Passo 3: Digital (peso 10%)
    {
      peso: 10,
      campos: ['presenca_digital', 'link_instagram', 'link_site'],
      obrigatorios: []
    },
    // Passo 4: SWOT (peso 15%)
    {
      peso: 15,
      campos: ['forcas', 'fraquezas', 'oportunidades', 'ameacas', 'diferenciais'],
      obrigatorios: ['forcas', 'fraquezas', 'oportunidades', 'ameacas', 'diferenciais']
    },
    // Passo 5: Concorrência (peso 10%)
    {
      peso: 10,
      campos: ['estrutura_atual', 'concorrentes_diretos'],
      obrigatorios: []
    },
    // Passo 6: Objetivos (peso 15%)
    {
      peso: 15,
      campos: ['objetivos_digitais', 'onde_6_meses', 'resultados_esperados'],
      obrigatorios: ['objetivos_digitais', 'onde_6_meses', 'resultados_esperados']
    },
    // Passo 7: Marca (peso 10%)
    {
      peso: 10,
      campos: ['valores_principais', 'tom_voz', 'como_lembrada'],
      obrigatorios: ['valores_principais', 'tom_voz', 'como_lembrada']
    },
    // Passo 8: Plano (peso 10%)
    {
      peso: 10,
      campos: ['assinatura_id'],
      obrigatorios: ['assinatura_id']
    }
  ];

  let progressoTotal = 0;

  passos.forEach(passo => {
    const camposPreenchidos = passo.campos.filter(campo => {
      const valor = onboarding[campo];
      if (Array.isArray(valor)) return valor.length > 0;
      return valor !== null && valor !== undefined && valor !== '';
    });

    const percentualPasso = camposPreenchidos.length / passo.campos.length;
    progressoTotal += passo.peso * percentualPasso;
  });

  return Math.round(progressoTotal);
}
```

---

## 🔐 Permissões e Acesso

| Perfil | Ver | Criar | Editar | Excluir | Gerar IA |
|--------|-----|-------|--------|---------|----------|
| Admin | ✅ Todos | ✅ | ✅ | ✅ | ✅ |
| Gestor | ✅ Seus clientes | ✅ | ✅ | ❌ | ✅ |
| Especialista | ✅ Atribuídos | ❌ | ✅ Parcial | ❌ | ❌ |
| Cliente | ✅ Próprio | ❌ | ✅ Próprio | ❌ | ❌ |

---

## 🎨 Componentes UI Utilizados

```tsx
// Componentes base (shadcn/ui)
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

// Ícones
import { Building2, Users, Globe, Target, TrendingUp, Palette, Package, Sparkles } from 'lucide-react';
```

---

## 🔄 Fluxo Visual

```
┌─────────────────────────────────────────────────────────────────┐
│                     MODAL DE ONBOARDING                         │
├─────────────────────────────────────────────────────────────────┤
│  [1] ─► [2] ─► [3] ─► [4] ─► [5] ─► [6] ─► [7] ─► [8]         │
│  Emp.   Púb.   Dig.   SWOT   Conc.  Obj.   Marc.  Plan.        │
│                        🤖     🤖            🤖                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │              CONTEÚDO DO PASSO ATUAL                    │   │
│  │                                                         │   │
│  │  [Formulário com campos específicos do passo]           │   │
│  │                                                         │   │
│  │  🤖 Botão "Analisar com IA" (onde aplicável)            │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  [Voltar]                    ████████░░ 65%        [Próximo]    │
└─────────────────────────────────────────────────────────────────┘

                              │
                              ▼ (Após passo 8)
                              
┌─────────────────────────────────────────────────────────────────┐
│                   RELATÓRIO PREVIEW                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ Onboarding Completo!                                        │
│                                                                 │
│  📊 Resumo:                                                     │
│  • X metas criadas                                              │
│  • Y campanhas sugeridas                                        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           RELATÓRIO GERADO PELA IA                      │   │
│  │  (Markdown renderizado)                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [📥 Baixar PDF]  [📧 Enviar por Email]  [✓ Concluir]          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📝 Notas de Implementação

1. **Salvar automaticamente** a cada mudança de passo
2. **Validar campos obrigatórios** antes de avançar
3. **Permitir navegação** entre passos já preenchidos
4. **Cache local** para não perder dados em caso de erro
5. **Loading states** durante chamadas de IA
6. **Error handling** com feedback visual claro
7. **Mobile responsive** - formulários adaptados
8. **Acessibilidade** - labels, aria, keyboard navigation
