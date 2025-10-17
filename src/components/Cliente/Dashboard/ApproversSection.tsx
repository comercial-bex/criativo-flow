import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClientApprovals } from "@/hooks/useClientApprovals";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { ApprovalPreview } from "./ApprovalPreview";

interface ApproversSectionProps {
  clienteId: string;
}

export function ApproversSection({ clienteId }: ApproversSectionProps) {
  const { approvals, updateApprovalStatus } = useClientApprovals(clienteId);

  const handleApprove = async (approvalId: string) => {
    const result = await updateApprovalStatus(approvalId, 'aprovado');
    if (result.success) {
      toast.success('Item aprovado com sucesso!');
    } else {
      toast.error("Erro ao processar aprovação");
    }
  };

  const handleReject = async (approvalId: string, motivo: string) => {
    const result = await updateApprovalStatus(approvalId, 'reprovado', motivo);
    if (result.success) {
      toast.success('Item reprovado com sucesso!');
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
                <ApprovalPreview
                  key={approval.id}
                  approval={approval as any}
                  onApprove={() => handleApprove(approval.id)}
                  onReject={(motivo) => handleReject(approval.id, motivo)}
                />
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
    </div>
  );
}
