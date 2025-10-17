import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Shield, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useClientDashboard } from "@/hooks/useClientDashboard";
import { useClientMetas } from "@/hooks/useClientMetas";
import { useClientTickets } from "@/hooks/useClientTickets";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useUserRole } from "@/hooks/useUserRole";
import { OverviewSection } from "@/components/Cliente/Dashboard/OverviewSection";
import { ApproversSection } from "@/components/Cliente/Dashboard/ApproversSection";
import { GoalsSection } from "@/components/Cliente/Dashboard/GoalsSection";
import { FinanceSection } from "@/components/Cliente/Dashboard/FinanceSection";
import { SupportSection } from "@/components/Cliente/Dashboard/SupportSection";
import { LayoutDashboard, Target, DollarSign, MessageSquare, CheckSquare } from "lucide-react";

export default function PainelClienteV2() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { role } = useUserRole();
  
  // Admin pode visualizar como cliente através do localStorage
  const adminSelectedClienteId = role === 'admin' 
    ? localStorage.getItem('admin_selected_cliente_id') || undefined
    : undefined;

  const { counts, timeline, clientProfile, loading } = useClientDashboard(adminSelectedClienteId);
  const { metas } = useClientMetas(clientProfile?.cliente_id);
  const { tickets } = useClientTickets(clientProfile?.cliente_id);
  
  useRealtimeNotifications();

  const handleExitAdminView = () => {
    localStorage.removeItem('admin_selected_cliente_id');
    navigate('/admin/painel');
  };

  // Obter tab atual da URL ou usar 'overview' como padrão
  const currentTab = searchParams.get('tab') || 'overview';

  if (loading || !clientProfile?.cliente_id) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const totalAprovacoes = counts.planejamentosPendentes + counts.postsPendentes;
  const ticketsAbertos = tickets.filter(t => t.status === 'aberto').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Badge de Modo Admin */}
      {role === 'admin' && adminSelectedClienteId && clientProfile && (
        <div className="bg-orange-100 border-l-4 border-orange-500 p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-orange-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-orange-800">Modo Admin - Visualizando como Cliente</p>
                <p className="text-sm text-orange-700">
                  Cliente: {clientProfile.cliente_nome || 'Não identificado'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExitAdminView}
              className="border-orange-400 text-orange-700 hover:bg-orange-50"
            >
              <X className="h-4 w-4 mr-1" />
              Sair da Visualização
            </Button>
          </div>
        </div>
      )}

      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Painel do Cliente</h1>
        <p className="text-muted-foreground">
          {clientProfile.cliente_nome} - Gestão completa de projetos e aprovações
        </p>
      </div>

      <Tabs value={currentTab} onValueChange={(value) => navigate(`/cliente/painel?tab=${value}`)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="approvals">
            <CheckSquare className="h-4 w-4 mr-2" />
            Aprovações {totalAprovacoes > 0 && `(${totalAprovacoes})`}
          </TabsTrigger>
          <TabsTrigger value="goals">
            <Target className="h-4 w-4 mr-2" />
            Metas
          </TabsTrigger>
          <TabsTrigger value="finance">
            <DollarSign className="h-4 w-4 mr-2" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="support">
            <MessageSquare className="h-4 w-4 mr-2" />
            Suporte {ticketsAbertos > 0 && `(${ticketsAbertos})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewSection 
            clienteId={clientProfile.cliente_id}
            counts={counts}
            timeline={timeline}
          />
        </TabsContent>

        <TabsContent value="approvals">
          <ApproversSection clienteId={clientProfile.cliente_id} />
        </TabsContent>

        <TabsContent value="goals">
          <GoalsSection metas={metas} />
        </TabsContent>

        <TabsContent value="finance">
          <FinanceSection clienteId={clientProfile.cliente_id} />
        </TabsContent>

        <TabsContent value="support">
          <SupportSection 
            tickets={tickets} 
            clienteId={clientProfile.cliente_id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
