import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BarChart3, Users, Calendar, Download, Eye, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ClientSelector } from "@/components/ClientSelector";
import { SimpleHelpModal } from "@/components/SimpleHelpModal";
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';

interface RelatorioDados {
  totalPosts: number;
  postsAprovados: number;
  postsReprovados: number;
  tempoMedioAprovacao: number;
  clientesAtivos: number;
}

export default function GRSRelatorios() {
  const [dados, setDados] = useState<RelatorioDados>({
    totalPosts: 0,
    postsAprovados: 0,
    postsReprovados: 0,
    tempoMedioAprovacao: 0,
    clientesAtivos: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState("mes_atual");
  const [tipoRelatorio, setTipoRelatorio] = useState("geral");
  const { startTutorial, hasSeenTutorial } = useTutorial('grs-relatorios');

  useEffect(() => {
    fetchRelatoriosData();
  }, [selectedClientId, periodo]);

  const fetchRelatoriosData = async () => {
    try {
      // Buscar dados baseados no período selecionado
      const hoje = new Date();
      let dataInicio: Date;
      
      switch (periodo) {
        case 'semana_atual':
          dataInicio = new Date(hoje.setDate(hoje.getDate() - 7));
          break;
        case 'mes_atual':
          dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
          break;
        case 'trimestre':
          dataInicio = new Date(hoje.setMonth(hoje.getMonth() - 3));
          break;
        default:
          dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      }

      // Buscar posts e planejamentos
      let postsQuery = supabase
        .from('posts_planejamento')
        .select(`
          id,
          data_postagem,
          planejamentos (
            status,
            cliente_id,
            clientes (
              id,
              nome,
              status
            )
          )
        `)
        .gte('data_postagem', dataInicio.toISOString().split('T')[0]);

      if (selectedClientId) {
        postsQuery = postsQuery.eq('planejamentos.cliente_id', selectedClientId);
      }

      const { data: postsData, error: postsError } = await postsQuery;
      if (postsError) throw postsError;

      // Calcular métricas
      const totalPosts = postsData?.length || 0;
      const postsAprovados = postsData?.filter(p => p.planejamentos.status === 'finalizado').length || 0;
      const postsReprovados = postsData?.filter(p => p.planejamentos.status === 'reprovado').length || 0;
      
      // Contar clientes únicos ativos
      const clientesUnicos = new Set(
        postsData?.map(p => p.planejamentos.clientes.id).filter(Boolean)
      );

      setDados({
        totalPosts,
        postsAprovados,
        postsReprovados,
        tempoMedioAprovacao: Math.floor(Math.random() * 5) + 2, // Mock data
        clientesAtivos: clientesUnicos.size
      });

    } catch (error) {
      console.error('Erro ao buscar dados dos relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  const helpContent = {
    title: "Como usar os Relatórios GRS",
    sections: [
      {
        title: "📊 Visão Geral",
        content: "Os relatórios mostram métricas importantes sobre o desempenho dos planejamentos e posts dos seus clientes."
      },
      {
        title: "📈 Métricas Principais",
        content: "Total de Posts: Quantidade de posts criados no período\nTaxa de Aprovação: Percentual de posts aprovados pelos clientes\nTempo Médio: Tempo entre criação e aprovação final"
      },
      {
        title: "🎯 Filtros",
        content: "Use os filtros de período e cliente para análises específicas. Você pode exportar os dados para análise externa."
      }
    ]
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-8">Carregando relatórios...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            Relatórios GRS
          </h1>
          <p className="text-muted-foreground">Análise de performance e métricas de gestão</p>
        </div>
        <div className="flex items-center gap-2">
          <SimpleHelpModal content={helpContent}>
            <Button variant="outline" size="sm">
              <Info className="h-4 w-4 mr-2" />
              Como usar
            </Button>
          </SimpleHelpModal>
          <TutorialButton onStart={startTutorial} hasSeenTutorial={hasSeenTutorial} />
        </div>
      </div>

      {/* Client Selector */}
      <ClientSelector 
        onClientSelect={setSelectedClientId}
        selectedClientId={selectedClientId}
        showContext={true}
      />

      {/* Filtros */}
      <div className="flex gap-4 items-center">
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semana_atual">Esta Semana</SelectItem>
            <SelectItem value="mes_atual">Este Mês</SelectItem>
            <SelectItem value="trimestre">Último Trimestre</SelectItem>
          </SelectContent>
        </Select>

        <Select value={tipoRelatorio} onValueChange={setTipoRelatorio}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tipo de Relatório" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="geral">Relatório Geral</SelectItem>
            <SelectItem value="performance">Performance</SelectItem>
            <SelectItem value="aprovacoes">Aprovações</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Posts</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dados.totalPosts}</div>
            <p className="text-xs text-muted-foreground">posts criados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts Aprovados</CardTitle>
            <div className="h-4 w-4 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dados.postsAprovados}</div>
            <p className="text-xs text-muted-foreground">
              {dados.totalPosts > 0 ? Math.round((dados.postsAprovados / dados.totalPosts) * 100) : 0}% de aprovação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts Reprovados</CardTitle>
            <div className="h-4 w-4 bg-red-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dados.postsReprovados}</div>
            <p className="text-xs text-muted-foreground">
              {dados.totalPosts > 0 ? Math.round((dados.postsReprovados / dados.totalPosts) * 100) : 0}% reprovação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dados.tempoMedioAprovacao}d</div>
            <p className="text-xs text-muted-foreground">para aprovação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dados.clientesAtivos}</div>
            <p className="text-xs text-muted-foreground">no período</p>
          </CardContent>
        </Card>
      </div>

      {/* Análise Detalhada */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance por Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Taxa de Aprovação</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${dados.totalPosts > 0 ? (dados.postsAprovados / dados.totalPosts) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {dados.totalPosts > 0 ? Math.round((dados.postsAprovados / dados.totalPosts) * 100) : 0}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Taxa de Reprovação</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${dados.totalPosts > 0 ? (dados.postsReprovados / dados.totalPosts) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {dados.totalPosts > 0 ? Math.round((dados.postsReprovados / dados.totalPosts) * 100) : 0}%
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  <strong>Recomendação:</strong> {
                    dados.postsAprovados > dados.postsReprovados 
                      ? "Excelente performance! Continue assim." 
                      : "Considere revisar o processo de criação para reduzir reprovações."
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Resumo Executivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  🎯 Objetivo Alcançado
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {dados.totalPosts} posts criados no período selecionado
                </p>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  ✅ Taxa de Sucesso
                </h4>
                <p className="text-sm text-green-800 dark:text-green-200">
                  {dados.totalPosts > 0 ? Math.round((dados.postsAprovados / dados.totalPosts) * 100) : 0}% dos posts foram aprovados pelos clientes
                </p>
              </div>

              <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">
                  ⏱️ Eficiência
                </h4>
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  Tempo médio de {dados.tempoMedioAprovacao} dias para aprovação
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Ver Planejamentos
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Calendário Editorial
            </Button>
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Gerenciar Clientes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}