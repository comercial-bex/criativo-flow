import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  Shield, 
  Zap, 
  Layers,
  Lock,
  Activity,
  Palette,
  FileText,
  Download
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function PreLaunchReport() {
  const [selectedCategory, setSelectedCategory] = useState<string>('overview');

  // Scores por categoria
  const scores = {
    backend: 95,
    performance: 88,
    uxui: 82,
    integration: 90,
    security: 92,
    stability: 75,
  };

  const overallScore = 87;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 75) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-500">Excelente</Badge>;
    if (score >= 75) return <Badge className="bg-yellow-500">Bom</Badge>;
    return <Badge variant="destructive">Atenção</Badge>;
  };

  const categories = [
    { 
      id: 'backend', 
      name: 'Backend & Conectividade', 
      score: scores.backend, 
      icon: Layers,
      weight: '25%',
      highlights: [
        '✅ RLS 100% sem warnings',
        '✅ 50+ functions ativas',
        '✅ 93.75% integridade user-perfil',
        '⚠️ 2 usuários órfãos'
      ]
    },
    { 
      id: 'performance', 
      name: 'Performance', 
      score: scores.performance, 
      icon: Zap,
      weight: '20%',
      highlights: [
        '✅ Cache hit rate: 73% (+62%)',
        '✅ Load time: 1.9s (-32%)',
        '✅ Virtual scrolling ativo',
        '⚠️ Dados de teste insuficientes'
      ]
    },
    { 
      id: 'uxui', 
      name: 'UX/UI', 
      score: scores.uxui, 
      icon: Palette,
      weight: '15%',
      highlights: [
        '✅ Design system implementado',
        '✅ Dark mode padrão',
        '✅ Responsive design',
        '⚠️ Falta onboarding tour'
      ]
    },
    { 
      id: 'integration', 
      name: 'Integração', 
      score: scores.integration, 
      icon: Activity,
      weight: '20%',
      highlights: [
        '✅ Circuito completo funcional',
        '✅ Real-time sync ativo',
        '✅ Audit trail completo',
        '⚠️ Financeiro não testado'
      ]
    },
    { 
      id: 'security', 
      name: 'Segurança', 
      score: scores.security, 
      icon: Lock,
      weight: '15%',
      highlights: [
        '✅ 120+ RLS policies',
        '✅ AES-256 encryption',
        '✅ RBAC implementado',
        '⚠️ Falta rate limiting'
      ]
    },
    { 
      id: 'stability', 
      name: 'Estabilidade', 
      score: scores.stability, 
      icon: Shield,
      weight: '5%',
      highlights: [
        '✅ Zero erros fatais 24h',
        '✅ Offline support ativo',
        '⚠️ Sem load test',
        '⚠️ Sem stress test'
      ]
    },
  ];

  const approvedModules = [
    { name: 'Autenticação & Autorização', score: 98 },
    { name: 'Dashboard GRS', score: 95 },
    { name: 'Gestão de Tarefas', score: 92 },
    { name: 'Clientes', score: 90 },
    { name: 'Projetos', score: 88 },
    { name: 'Calendário', score: 87 },
    { name: 'Notificações', score: 85 },
    { name: 'Team Chat', score: 83 },
  ];

  const pendingModules = [
    { name: 'Financeiro', score: 65, reason: 'Sem dados de teste' },
    { name: 'Inventário/Arsenal', score: 70, reason: 'Validação incompleta' },
    { name: 'RH/DP', score: 68, reason: 'Folha não testada' },
    { name: 'Relatórios', score: 60, reason: 'Exportação limitada' },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatório de Pré-Lançamento</h1>
          <p className="text-muted-foreground mt-1">BEX Flow MVP v1.0 - Análise Completa de Prontidão</p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      {/* Overall Score Card */}
      <Card className="border-2 border-primary">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="mb-4">
              <div className={`text-6xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}/100
              </div>
              <p className="text-xl text-muted-foreground mt-2">Pontuação Geral de Prontidão</p>
            </div>
            
            <Progress value={overallScore} className="h-4 mb-4" />
            
            <div className="flex items-center justify-center gap-4">
              <Badge className="bg-yellow-500 text-lg py-2 px-4">
                ✅ AJUSTAR E RETESTAR
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              Sistema com 87% de prontidão. Ajustes necessários em módulo financeiro e dados de teste.
              <br />
              <strong>Timeline:</strong> 2-3 dias de ajustes → Re-teste → Aprovação para Deploy
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Card 
              key={category.id}
              className="hover:border-primary transition-colors cursor-pointer"
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Icon className="w-5 h-5 mr-2" />
                    <span className="text-sm">{category.name}</span>
                  </div>
                  {getScoreBadge(category.score)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getScoreColor(category.score)} mb-2`}>
                  {category.score}/100
                </div>
                <Progress value={category.score} className="h-2 mb-3" />
                <div className="text-xs text-muted-foreground">
                  <div className="flex items-center justify-between mb-1">
                    <span>Peso no Score</span>
                    <span className="font-medium">{category.weight}</span>
                  </div>
                </div>
                <div className="space-y-1 mt-3">
                  {category.highlights.map((highlight, idx) => (
                    <div key={idx} className="text-xs flex items-start">
                      <span className="mr-1">{highlight.startsWith('✅') ? '✅' : '⚠️'}</span>
                      <span className="line-clamp-1">{highlight.substring(2)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="modules">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="modules">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Módulos
          </TabsTrigger>
          <TabsTrigger value="metrics">
            <TrendingUp className="w-4 h-4 mr-2" />
            Métricas
          </TabsTrigger>
          <TabsTrigger value="issues">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Issues
          </TabsTrigger>
          <TabsTrigger value="report">
            <FileText className="w-4 h-4 mr-2" />
            Relatório
          </TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
                Módulos Aprovados ({approvedModules.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {approvedModules.map((module) => (
                  <div key={module.name} className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <CheckCircle2 className="w-4 h-4 mr-3 text-green-500" />
                      <span>{module.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={module.score} className="w-32 h-2" />
                      <span className="text-sm font-medium w-12 text-right">{module.score}/100</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
                Módulos Pendentes ({pendingModules.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingModules.map((module) => (
                  <div key={module.name} className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <AlertTriangle className="w-4 h-4 mr-3 text-yellow-500" />
                      <div>
                        <div>{module.name}</div>
                        <div className="text-xs text-muted-foreground">{module.reason}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={module.score} className="w-32 h-2" />
                      <span className="text-sm font-medium w-12 text-right">{module.score}/100</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Comparativo de Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Overall Score</span>
                    <span className="font-medium">79% → 87% (+8%)</span>
                  </div>
                  <Progress value={87} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span>Cache Hit Rate</span>
                    <span className="font-medium">45% → 73% (+62%)</span>
                  </div>
                  <Progress value={73} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span>Load Time (p95)</span>
                    <span className="font-medium">2.8s → 1.9s (-32%)</span>
                  </div>
                  <Progress value={68} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span>UX Responsiveness</span>
                    <span className="font-medium">82% → 94% (+15%)</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues">
          <div className="space-y-4">
            <Card className="border-yellow-500">
              <CardHeader>
                <CardTitle className="flex items-center text-yellow-600">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Média Prioridade (3)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-medium">Dados de Teste Insuficientes</h4>
                  <p className="text-sm text-muted-foreground">
                    Apenas 15 tarefas (otimizado para 1000+). Virtual scrolling não validado.
                  </p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-medium">Módulo Financeiro Não Validado</h4>
                  <p className="text-sm text-muted-foreground">
                    0 lançamentos em produção. Integrações de pagamento pendentes.
                  </p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-medium">Usuários Órfãos</h4>
                  <p className="text-sm text-muted-foreground">
                    2 em auth.users sem perfil, 3 perfis sem usuário. Executar auto_sync_orphan_users().
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-blue-600">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Nenhum Issue Crítico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  ✅ Nenhum problema crítico que bloqueie o deploy foi identificado.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="report">
          <Card>
            <CardHeader>
              <CardTitle>Relatório Completo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="text-muted-foreground mb-4">
                  O relatório completo em Markdown está disponível em <code>PRE_LAUNCH_REPORT.md</code>
                </p>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <h3 className="text-lg font-semibold">Recomendação Final</h3>
                  <p>
                    <strong>STATUS:</strong> <Badge className="bg-yellow-500">AJUSTAR E RETESTAR</Badge>
                  </p>
                  <p className="text-sm">
                    O BEX Flow apresenta uma pontuação geral de 87/100, classificando-se como 
                    "Ajustar e Retestar". O sistema demonstra arquitetura sólida, performance 
                    otimizada e segurança robusta. Os principais gaps são relacionados a dados 
                    de teste e validação do módulo financeiro.
                  </p>
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Plano de Ação (15h):</h4>
                    <ul className="text-sm space-y-1">
                      <li>✓ Seed de dados (2h)</li>
                      <li>✓ Testes de carga (4h)</li>
                      <li>✓ Correção de órfãos (1h)</li>
                      <li>✓ Validação financeiro (6h)</li>
                      <li>✓ Testes cross-browser (2h)</li>
                    </ul>
                  </div>
                  <p className="text-sm mt-4">
                    <strong>Timeline:</strong> 2-3 dias de ajustes → Re-teste → Deploy staging 
                    (1 semana) → Deploy produção gradual
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Próximos Passos</h3>
              <p className="text-sm text-muted-foreground">
                Execute as correções sugeridas e gere novo relatório
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                Ver Checklist Completo
              </Button>
              <Button>
                Aplicar Correções Automáticas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
