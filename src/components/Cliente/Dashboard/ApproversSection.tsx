import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClientApprovals } from "@/hooks/useClientApprovals";
import { CheckCircle, XCircle, FileText } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ApproversSectionProps {
  clienteId: string;
}

export function ApproversSection({ clienteId }: ApproversSectionProps) {
  const { approvals, updateApprovalStatus } = useClientApprovals(clienteId);
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [actionModal, setActionModal] = useState(false);
  const [actionType, setActionType] = useState<'aprovado' | 'reprovado'>('aprovado');
  const [motivo, setMotivo] = useState('');

  const handleAction = async () => {
    if (actionType === 'reprovado' && !motivo.trim()) {
      toast.error("Informe o motivo da reprovação");
      return;
    }

    const result = await updateApprovalStatus(selectedApproval.id, actionType, motivo);
    
    if (result.success) {
      toast.success(`Item ${actionType === 'aprovado' ? 'aprovado' : 'reprovado'} com sucesso!`);
      setActionModal(false);
      setMotivo('');
    } else {
      toast.error("Erro ao processar aprovação");
    }
  };

  const pendentes = approvals.filter(a => a.status === 'pendente');
  const aprovados = approvals.filter(a => a.status === 'aprovado');
  const reprovados = approvals.filter(a => a.status === 'reprovado');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Central de Aprovações</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pendente">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pendente">
                Pendentes ({pendentes.length})
              </TabsTrigger>
              <TabsTrigger value="aprovado">
                Aprovados ({aprovados.length})
              </TabsTrigger>
              <TabsTrigger value="reprovado">
                Reprovados ({reprovados.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pendente" className="space-y-4 mt-4">
              {pendentes.map((approval) => (
                <Card key={approval.id} className="border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{approval.tipo}</Badge>
                          <h3 className="font-semibold">{approval.titulo}</h3>
                        </div>
                        {approval.descricao && (
                          <p className="text-sm text-muted-foreground">{approval.descricao}</p>
                        )}
                        {approval.anexo_url && (
                          <Button variant="link" className="p-0 h-auto" asChild>
                            <a href={approval.anexo_url} target="_blank" rel="noopener">
                              <FileText className="h-4 w-4 mr-2" />
                              Visualizar Anexo
                            </a>
                          </Button>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => {
                            setSelectedApproval(approval);
                            setActionType('aprovado');
                            setActionModal(true);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => {
                            setSelectedApproval(approval);
                            setActionType('reprovado');
                            setActionModal(true);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reprovar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {pendentes.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                  <p className="text-lg font-semibold">Tudo em dia!</p>
                  <p className="text-sm">Não há itens pendentes de aprovação</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="aprovado" className="space-y-4 mt-4">
              {aprovados.map((approval) => (
                <Card key={approval.id} className="border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {approval.tipo}
                      </Badge>
                      <span className="font-medium">{approval.titulo}</span>
                      <Badge className="ml-auto bg-green-600">Aprovado</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="reprovado" className="space-y-4 mt-4">
              {reprovados.map((approval) => (
                <Card key={approval.id} className="border-red-200">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-red-50 text-red-700">
                          {approval.tipo}
                        </Badge>
                        <span className="font-medium">{approval.titulo}</span>
                        <Badge className="ml-auto bg-red-600">Reprovado</Badge>
                      </div>
                      {approval.motivo_reprovacao && (
                        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          <strong>Motivo:</strong> {approval.motivo_reprovacao}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal de Ação */}
      <Dialog open={actionModal} onOpenChange={setActionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'aprovado' ? 'Aprovar Item' : 'Reprovar Item'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="font-medium mb-2">{selectedApproval?.titulo}</p>
              {actionType === 'reprovado' && (
                <Textarea
                  placeholder="Informe o motivo da reprovação..."
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="min-h-[100px]"
                />
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setActionModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAction} variant={actionType === 'aprovado' ? 'default' : 'destructive'}>
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
