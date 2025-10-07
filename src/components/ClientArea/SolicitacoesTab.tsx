import { useState } from "react";
import { useClientApprovals } from "@/hooks/useClientApprovals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SolicitacoesTabProps {
  clienteId: string;
}

export function SolicitacoesTab({ clienteId }: SolicitacoesTabProps) {
  const { approvals, loading, updateApprovalStatus } = useClientApprovals(clienteId);
  const [filter, setFilter] = useState<string>("todos");

  const filteredApprovals =
    filter === "todos"
      ? approvals
      : approvals.filter((a) => a.status === filter);

  const stats = {
    total: approvals.length,
    pendente: approvals.filter((a) => a.status === "pendente").length,
    aprovado: approvals.filter((a) => a.status === "aprovado").length,
    reprovado: approvals.filter((a) => a.status === "reprovado").length,
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:bg-accent" onClick={() => setFilter("todos")}>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-accent" onClick={() => setFilter("pendente")}>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Pendentes</div>
            <div className="text-2xl font-bold text-orange-600">{stats.pendente}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-accent" onClick={() => setFilter("aprovado")}>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Aprovados</div>
            <div className="text-2xl font-bold text-green-600">{stats.aprovado}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-accent" onClick={() => setFilter("reprovado")}>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Reprovados</div>
            <div className="text-2xl font-bold text-red-600">{stats.reprovado}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {filter === "todos" ? "Todas as Solicitações" : `Solicitações - ${filter}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredApprovals.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Nenhuma solicitação encontrada"
              description="Não há solicitações de aprovação para este cliente"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApprovals.map((approval) => (
                  <TableRow key={approval.id}>
                    <TableCell>
                      <Badge variant="outline">{approval.tipo}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{approval.titulo}</TableCell>
                    <TableCell>
                      {approval.status === "pendente" && (
                        <Badge variant="secondary" className="bg-orange-500/10 text-orange-700">
                          <Clock className="h-3 w-3 mr-1" />
                          Pendente
                        </Badge>
                      )}
                      {approval.status === "aprovado" && (
                        <Badge className="bg-green-500/10 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Aprovado
                        </Badge>
                      )}
                      {approval.status === "reprovado" && (
                        <Badge className="bg-red-500/10 text-red-700">
                          <XCircle className="h-3 w-3 mr-1" />
                          Reprovado
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(approval.created_at), "dd MMM yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {approval.status === "pendente" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600"
                            onClick={() => updateApprovalStatus(approval.id, "aprovado")}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            onClick={() => updateApprovalStatus(approval.id, "reprovado", "Motivo da reprovação")}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reprovar
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
