import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Signature
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';

interface DashboardStats {
  totalOrcamentos: number;
  orcamentosAprovados: number;
  totalPropostas: number;
  propostasAssinadas: number;
  valorTotalOrcamentos: number;
  valorTotalPropostas: number;
  previsaoReceita: number;
}

interface OrcamentoRecente {
  id: string;
  titulo: string;
  valor_final: number;
  status: string;
  created_at: string;
  clientes?: { nome: string };
}

interface PropostaRecente {
  id: string;
  titulo: string;
  assinatura_status: string;
  created_at: string;
  orcamentos?: { 
    valor_final: number;
    clientes?: { nome: string };
  };
}

const statusColors = {
  rascunho: "bg-gray-100 text-gray-800",
  enviado: "bg-blue-100 text-blue-800",
  aprovado: "bg-green-100 text-green-800",
  rejeitado: "bg-red-100 text-red-800",
  expirado: "bg-orange-100 text-orange-800",
  pendente: "bg-gray-100 text-gray-800",
  assinado: "bg-green-100 text-green-800",
  recusado: "bg-red-100 text-red-800"
};

const statusLabels = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
  expirado: "Expirado",
  pendente: "Pendente",
  assinado: "Assinado",
  recusado: "Recusado"
};

export default function AdministrativoDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrcamentos: 0,
    orcamentosAprovados: 0,
    totalPropostas: 0,
    propostasAssinadas: 0,
    valorTotalOrcamentos: 0,
    valorTotalPropostas: 0,
    previsaoReceita: 0
  });
  
  const [orcamentosRecentes, setOrcamentosRecentes] = useState<OrcamentoRecente[]>([]);
  const [propostasRecentes, setPropostasRecentes] = useState<PropostaRecente[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { startTutorial, hasSeenTutorial } = useTutorial('administrativo-dashboard');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Buscar estatísticas de orçamentos
      const { data: orcamentos, error: orcamentosError } = await supabase
        .from('orcamentos')
        .select(`
          id,
          titulo,
          valor_final,
          status,
          created_at,
          clientes (nome)
        `)
        .order('created_at', { ascending: false });

      if (orcamentosError) throw orcamentosError;

      // Buscar estatísticas de propostas
      const { data: propostas, error: propostasError } = await supabase
        .from('propostas')
        .select(`
          id,
          titulo,
          assinatura_status,
          created_at,
          orcamentos (
            valor_final,
            clientes (nome)
          )
        `)
        .order('created_at', { ascending: false });

      if (propostasError) throw propostasError;

      // Buscar previsão financeira
      const { data: previsao, error: previsaoError } = await supabase
        .from('financeiro_previsao')
        .select('valor_mensal, parcelas')
        .eq('status', 'confirmado');

      if (previsaoError) throw previsaoError;

      // Calcular estatísticas
      const totalOrcamentos = orcamentos?.length || 0;
      const orcamentosAprovados = orcamentos?.filter(o => o.status === 'aprovado').length || 0;
      const totalPropostas = propostas?.length || 0;
      const propostasAssinadas = propostas?.filter(p => p.assinatura_status === 'assinado').length || 0;
      
      const valorTotalOrcamentos = orcamentos?.reduce((acc, o) => acc + Number(o.valor_final), 0) || 0;
      const valorTotalPropostas = propostas?.reduce((acc, p) => acc + Number(p.orcamentos?.valor_final || 0), 0) || 0;
      const previsaoReceita = previsao?.reduce((acc, p) => acc + (Number(p.valor_mensal) * Number(p.parcelas)), 0) || 0;

      setStats({
        totalOrcamentos,
        orcamentosAprovados,
        totalPropostas,
        propostasAssinadas,
        valorTotalOrcamentos,
        valorTotalPropostas,
        previsaoReceita
      });

      // Definir dados recentes
      setOrcamentosRecentes(orcamentos?.slice(0, 5) || []);
      setPropostasRecentes(propostas?.slice(0, 5) || []);

    } catch (error: any) {
      toast({
        title: "Erro ao carregar dashboard",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">Visão geral de orçamentos, propostas e assinaturas</p>
        </div>
        <div className="flex gap-2">
          <TutorialButton onStart={startTutorial} hasSeenTutorial={hasSeenTutorial} />
          <Button asChild data-tour="novo-orcamento">
            <Link to="/administrativo/orcamentos">
              <Plus className="mr-2 h-4 w-4" />
              Novo Orçamento
            </Link>
          </Button>
          <Button variant="outline" asChild data-tour="nova-proposta">
            <Link to="/administrativo/propostas">
              <FileText className="mr-2 h-4 w-4" />
              Nova Proposta
            </Link>
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-tour="kpis">
        <Card data-tour="kpi-orcamentos">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Orçamentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrcamentos}</div>
            <p className="text-xs text-muted-foreground">
              {stats.orcamentosAprovados} aprovados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Propostas Assinadas</CardTitle>
            <Signature className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.propostasAssinadas}</div>
            <p className="text-xs text-muted-foreground">
              de {stats.totalPropostas} total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor em Orçamentos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {stats.valorTotalOrcamentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Previsão de Receita</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              R$ {stats.previsaoReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orçamentos Recentes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Orçamentos Recentes
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/administrativo/orcamentos">Ver Todos</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orcamentosRecentes.map((orcamento) => (
                <div key={orcamento.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                  <div>
                    <p className="font-medium">{orcamento.titulo}</p>
                    <p className="text-sm text-muted-foreground">
                      {orcamento.clientes?.nome} • {format(new Date(orcamento.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      R$ {orcamento.valor_final.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <Badge className={`text-xs ${statusColors[orcamento.status as keyof typeof statusColors]}`}>
                      {statusLabels[orcamento.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                </div>
              ))}
              {orcamentosRecentes.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum orçamento encontrado
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Propostas Recentes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Signature className="h-5 w-5" />
                Propostas Recentes
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/administrativo/propostas">Ver Todas</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {propostasRecentes.map((proposta) => (
                <div key={proposta.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                  <div>
                    <p className="font-medium">{proposta.titulo}</p>
                    <p className="text-sm text-muted-foreground">
                      {proposta.orcamentos?.clientes?.nome} • {format(new Date(proposta.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      R$ {(proposta.orcamentos?.valor_final || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <Badge className={`text-xs ${statusColors[proposta.assinatura_status as keyof typeof statusColors]}`}>
                      {statusLabels[proposta.assinatura_status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                </div>
              ))}
              {propostasRecentes.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Nenhuma proposta encontrada
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Criar Orçamento</h3>
                    <p className="text-sm text-muted-foreground">Novo orçamento para cliente</p>
                  </div>
                </div>
                <Button className="w-full mt-3" variant="outline" asChild>
                  <Link to="/administrativo/orcamentos">Criar Agora</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Signature className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Nova Proposta</h3>
                    <p className="text-sm text-muted-foreground">Proposta com assinatura</p>
                  </div>
                </div>
                <Button className="w-full mt-3" variant="outline" asChild>
                  <Link to="/administrativo/propostas">Criar Agora</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Ver Relatórios</h3>
                    <p className="text-sm text-muted-foreground">Análise de performance</p>
                  </div>
                </div>
                <Button className="w-full mt-3" variant="outline" asChild>
                  <Link to="/relatorios">Ver Relatórios</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}