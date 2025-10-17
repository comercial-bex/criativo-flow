import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewSection } from "@/components/Cliente/Dashboard/OverviewSection";
import { ApproversSection } from "@/components/Cliente/Dashboard/ApproversSection";
import { FinanceSection } from "@/components/Cliente/Dashboard/FinanceSection";
import { GoalsSection } from "@/components/Cliente/Dashboard/GoalsSection";
import { SupportSection } from "@/components/Cliente/Dashboard/SupportSection";
import { useClientDashboard } from "@/hooks/useClientDashboard";
import { useClientMetas } from "@/hooks/useClientMetas";
import { useClientTickets } from "@/hooks/useClientTickets";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { LayoutDashboard, Target, DollarSign, MessageSquare, CheckSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PainelClienteV2() {
  const { clientProfile, counts, timeline, loading } = useClientDashboard();
  const { metas } = useClientMetas(clientProfile?.cliente_id);
  const { tickets } = useClientTickets(clientProfile?.cliente_id);
  
  useRealtimeNotifications();

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
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Painel do Cliente</h1>
        <p className="text-muted-foreground">
          {clientProfile.cliente_nome} - Gestão completa de projetos e aprovações
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
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
