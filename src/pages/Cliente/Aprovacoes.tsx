import { useState } from 'react';
import { useClientDashboard } from '@/hooks/useClientDashboard';
import { useClientApprovals } from '@/hooks/useClientApprovals';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, FileText, Image, Video, MessageSquare, Camera, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const tipoIcons = {
  arte: <Image className="h-5 w-5" />,
  roteiro: <FileText className="h-5 w-5" />,
  video: <Video className="h-5 w-5" />,
  post: <MessageSquare className="h-5 w-5" />,
  captacao: <Camera className="h-5 w-5" />,
  outro: <FileText className="h-5 w-5" />
};

const statusColors = {
  pendente: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  aprovado: 'bg-green-500/10 text-green-600 border-green-500/20',
  reprovado: 'bg-red-500/10 text-red-600 border-red-500/20',
  revisao: 'bg-blue-500/10 text-blue-600 border-blue-500/20'
};

export default function ClienteAprovacoes() {
  const { clientProfile, loading: clienteLoading } = useClientDashboard();
  const { approvals, loading, updateApprovalStatus } = useClientApprovals(clientProfile?.cliente_id);
  const { toast } = useToast();
  
  const [selectedApproval, setSelectedApproval] = useState<string | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleApprove = async () => {
    if (!selectedApproval) return;
    
    setProcessing(true);
    const result = await updateApprovalStatus(selectedApproval, 'aprovado');
    
    if (result.success) {
      toast({
        title: 'Material Aprovado',
        description: 'O material foi aprovado com sucesso!'
      });
    } else {
      toast({
        title: 'Erro ao Aprovar',
        description: 'Não foi possível aprovar o material. Tente novamente.',
        variant: 'destructive'
      });
    }
    
    setShowApproveDialog(false);
    setSelectedApproval(null);
    setProcessing(false);
  };

  const handleReject = async () => {
    if (!selectedApproval || !rejectReason.trim()) {
      toast({
        title: 'Motivo Obrigatório',
        description: 'Por favor, informe o motivo da reprovação.',
        variant: 'destructive'
      });
      return;
    }
    
    setProcessing(true);
    const result = await updateApprovalStatus(selectedApproval, 'reprovado', rejectReason);
    
    if (result.success) {
      toast({
        title: 'Material Reprovado',
        description: 'O material foi reprovado. O solicitante será notificado.'
      });
    } else {
      toast({
        title: 'Erro ao Reprovar',
        description: 'Não foi possível reprovar o material. Tente novamente.',
        variant: 'destructive'
      });
    }
    
    setShowRejectDialog(false);
    setSelectedApproval(null);
    setRejectReason('');
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
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Central de Aprovações</h1>
        <p className="text-muted-foreground">
          Aprove ou reprove materiais enviados pela agência
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
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

      {/* Pendentes */}
      {pendingApprovals.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Aguardando Aprovação
          </h2>
          <div className="grid gap-4">
            {pendingApprovals.map((approval) => (
              <Card key={approval.id} className="border-l-4 border-l-yellow-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {tipoIcons[approval.tipo]}
                      <div>
                        <CardTitle>{approval.titulo}</CardTitle>
                        <CardDescription>
                          Enviado em {format(new Date(approval.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={statusColors[approval.status]}>
                      {approval.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {approval.descricao && (
                    <p className="text-sm text-muted-foreground">{approval.descricao}</p>
                  )}
                  {approval.anexo_url && (
                    <div>
                      <a
                        href={approval.anexo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Ver Material
                      </a>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        setSelectedApproval(approval.id);
                        setShowApproveDialog(true);
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setSelectedApproval(approval.id);
                        setShowRejectDialog(true);
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reprovar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Concluídos */}
      {completedApprovals.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Histórico</h2>
          <div className="grid gap-4">
            {completedApprovals.map((approval) => (
              <Card key={approval.id} className={`border-l-4 ${approval.status === 'aprovado' ? 'border-l-green-500' : 'border-l-red-500'}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {tipoIcons[approval.tipo]}
                      <div>
                        <CardTitle>{approval.titulo}</CardTitle>
                        <CardDescription>
                          {approval.decided_at
                            ? `Decidido em ${format(new Date(approval.decided_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`
                            : `Enviado em ${format(new Date(approval.created_at), "dd/MM/yyyy", { locale: ptBR })}`}
                        </CardDescription>
                      </div>
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

      {/* Dialogs */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Aprovação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja aprovar este material? O solicitante será notificado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} disabled={processing}>
              {processing ? 'Processando...' : 'Confirmar Aprovação'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reprovar Material</AlertDialogTitle>
            <AlertDialogDescription>
              Por favor, informe o motivo da reprovação para que a equipe possa fazer os ajustes necessários.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Descreva o motivo da reprovação..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} disabled={processing} className="bg-red-600 hover:bg-red-700">
              {processing ? 'Processando...' : 'Confirmar Reprovação'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
