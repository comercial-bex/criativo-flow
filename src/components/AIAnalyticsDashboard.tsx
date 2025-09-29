import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  TrendingUp, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle,
  BarChart3,
  Lightbulb,
  Target,
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AIInsight {
  type: 'growth' | 'warning' | 'opportunity' | 'success';
  title: string;
  description: string;
  metric?: string;
  action?: string;
}

interface AnalyticsData {
  totalClientes: number;
  receita: number;
  projetos: number;
  satisfaction: number;
}

export function AIAnalyticsDashboard() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingInsights, setGeneratingInsights] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Buscar dados básicos
      const [clientesResult, planejamentosResult] = await Promise.all([
        supabase.from('clientes').select('*'),
        supabase.from('planejamentos').select('*')
      ]);

      const analytics: AnalyticsData = {
        totalClientes: clientesResult.data?.length || 0,
        receita: 150000, // Mock data - integrar com dados reais
        projetos: planejamentosResult.data?.length || 0,
        satisfaction: 4.8 // Mock data
      };

      setAnalytics(analytics);
      generateAIInsights(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Erro ao carregar analytics');
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = async (data: AnalyticsData) => {
    setGeneratingInsights(true);
    
    // Simular análise de IA com base nos dados
    const aiInsights: AIInsight[] = [
      {
        type: 'growth',
        title: 'Crescimento Acelerado',
        description: `Com ${data.totalClientes} clientes ativos, você está 23% acima da meta mensal.`,
        metric: '+23%',
        action: 'Considere expandir a equipe de atendimento'
      },
      {
        type: 'opportunity',
        title: 'Oportunidade de Upselling',
        description: `${Math.floor(data.totalClientes * 0.3)} clientes estão elegíveis para upgrade de plano.`,
        metric: `${Math.floor(data.totalClientes * 0.3)} clientes`,
        action: 'Criar campanha de upgrade'
      },
      {
        type: 'warning',
        title: 'Atenção: Capacidade',
        description: `Com ${data.projetos} projetos ativos, você está próximo do limite de capacidade.`,
        metric: '85%',
        action: 'Otimizar fluxo de trabalho'
      },
      {
        type: 'success',
        title: 'Satisfação Excelente',
        description: `Satisfação média de ${data.satisfaction}/5.0 indica alta qualidade do serviço.`,
        metric: `${data.satisfaction}/5`,
        action: 'Manter padrão de qualidade'
      }
    ];

    // Simular delay da IA
    setTimeout(() => {
      setInsights(aiInsights);
      setGeneratingInsights(false);
    }, 2000);
  };

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'growth': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'opportunity': return <Lightbulb className="h-4 w-4 text-blue-600" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  const getInsightBadgeColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'growth': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-orange-100 text-orange-800';
      case 'opportunity': return 'bg-blue-100 text-blue-800';
      case 'success': return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-gradient-purple">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="h-6 w-6 text-purple-600 mr-3" />
              <div>
                <CardTitle className="text-purple-800">Dashboard Inteligente</CardTitle>
                <p className="text-sm text-gray-600">Insights powered by AI</p>
              </div>
            </div>
            <Button 
              onClick={() => analytics && generateAIInsights(analytics)}
              disabled={generatingInsights}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Zap className="h-4 w-4 mr-2" />
              {generatingInsights ? 'Analisando...' : 'Atualizar Insights'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Métricas Principais */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Users className="h-4 w-4 mr-2 text-blue-600" />
                Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalClientes}</div>
              <p className="text-xs text-green-600">+12% este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                Receita
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {analytics.receita.toLocaleString()}</div>
              <p className="text-xs text-green-600">+8% este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Target className="h-4 w-4 mr-2 text-purple-600" />
                Projetos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.projetos}</div>
              <p className="text-xs text-blue-600">+5% este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <BarChart3 className="h-4 w-4 mr-2 text-orange-600" />
                Satisfação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.satisfaction}</div>
              <p className="text-xs text-green-600">Excelente</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2 text-purple-600" />
            Insights Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {generatingInsights ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3">IA analisando dados...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{insight.title}</h4>
                          {insight.metric && (
                            <Badge className={getInsightBadgeColor(insight.type)}>
                              {insight.metric}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                        {insight.action && (
                          <p className="text-xs text-blue-600">💡 {insight.action}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}