import { useState } from 'react';
import { useClientDashboard } from '@/hooks/useClientDashboard';
import { useClientApprovals } from '@/hooks/useClientApprovals';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, FileText, Clock, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';
import { SectionHeader } from '@/components/SectionHeader';
import { AprovacaoTarefaCard } from '@/components/Aprovacoes/AprovacaoTarefaCard';

const statusColors = {
  pendente: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  aprovado: 'bg-green-500/10 text-green-600 border-green-500/20',
  reprovado: 'bg-red-500/10 text-red-600 border-red-500/20',
  revisao: 'bg-blue-500/10 text-blue-600 border-blue-500/20'
};

export default function ClienteAprovacoes() {
  const { clientProfile, loading: clienteLoading } = useClientDashboard();
  const { approvals, loading, updateApprovalStatus, refetch } = useClientApprovals(clientProfile?.cliente_id);
  const { toast } = useToast();
  const { startTutorial, hasSeenTutorial } = useTutorial('cliente-aprovacoes');
  
  const [selectedApproval, setSelectedApproval] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
    toast({
      title: 'Dados Atualizados',
      description: 'As aprovações foram recarregadas com sucesso.'
    });
  };

  const handleApprove = async (approvalId: string) => {
    
    setProcessing(true);
    const result = await updateApprovalStatus(approvalId, 'aprovado');
    
    if (result.success) {
      toast({
        title: 'Material Aprovado',
        description: 'O material foi aprovado com sucesso!'
      });
      setSelectedApproval(null);
    } else {
      toast({
        title: 'Erro ao Aprovar',
        description: 'Não foi possível aprovar o material. Tente novamente.',
        variant: 'destructive'
      });
    }
    
    setProcessing(false);
  };

  const handleReject = async (approvalId: string, motivo: string) => {
    
    setProcessing(true);
    const result = await updateApprovalStatus(approvalId, 'reprovado', motivo);
    
    if (result.success) {
      toast({
        title: 'Material Reprovado',
        description: 'O material foi reprovado. O solicitante será notificado.'
      });
      setSelectedApproval(null);
    } else {
      toast({
        title: 'Erro ao Reprovar',
        description: 'Não foi possível reprovar o material. Tente novamente.',
        variant: 'destructive'
      });
    }
    
    setProcessing(false);
  };

  if (clienteLoading || loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const pendingApprovals = approvals.filter(a => a.status === 'pendente');
  const completedApprovals = approvals.filter(a => a.status !== 'pendente');

  return (
    <div className="p-6 space-y-8">
      <SectionHeader
        title="Central de Aprovações"
        description="Revise e aprove os materiais antes da publicação"
        icon={CheckCircle}
      />

      <div className="flex items-center justify-between">
        <TutorialButton onStart={startTutorial} hasSeenTutorial={hasSeenTutorial} />
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Recarregar
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4" data-tour="estatisticas">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApprovals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aprovadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {approvals.filter(a => a.status === 'aprovado').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reprovadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {approvals.filter(a => a.status === 'reprovado').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvals.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pendentes - Layout Moderno */}
      {pendingApprovals.length > 0 && (
        <div data-tour="pendentes">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Aguardando Aprovação
          </h2>
          {pendingApprovals.map((approval) => (
            <div key={approval.id} className="mb-8">
              <AprovacaoTarefaCard
                approval={approval}
                onApprove={handleApprove}
                onReject={handleReject}
                processing={processing}
              />
            </div>
          ))}
        </div>
      )}

      {/* Concluídos - Resumido */}
      {completedApprovals.length > 0 && (
        <div data-tour="historico">
          <h2 className="text-xl font-semibold mb-4">Histórico</h2>
          <div className="grid gap-4">
            {completedApprovals.map((approval) => (
              <Card key={approval.id} className={`border-l-4 ${approval.status === 'aprovado' ? 'border-l-green-500' : 'border-l-red-500'}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{approval.titulo}</CardTitle>
                      <CardDescription>
                        {approval.decided_at
                          ? `Decidido em ${format(new Date(approval.decided_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`
                          : `Enviado em ${format(new Date(approval.created_at), "dd/MM/yyyy", { locale: ptBR })}`}
                      </CardDescription>
                    </div>
                    <Badge className={statusColors[approval.status]}>
                      {approval.status}
                    </Badge>
                  </div>
                </CardHeader>
                {(approval.descricao || approval.motivo_reprovacao) && (
                  <CardContent>
                    {approval.descricao && (
                      <p className="text-sm text-muted-foreground mb-2">{approval.descricao}</p>
                    )}
                    {approval.motivo_reprovacao && (
                      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-md p-3">
                        <p className="text-sm font-medium text-red-900 dark:text-red-100">
                          Motivo da reprovação:
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                          {approval.motivo_reprovacao}
                        </p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {approvals.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma Aprovação</h3>
            <p className="text-sm text-muted-foreground text-center">
              Você ainda não possui materiais para aprovação.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
