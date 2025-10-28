import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useImportarExtrato } from "@/hooks/useImportarExtrato";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle2, AlertCircle, Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function ExtratosHistoryCard() {
  const { extratos, loadingExtratos, deletarExtrato } = useImportarExtrato();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'concluido':
        return (
          <Badge className="bg-success">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Concluído
          </Badge>
        );
      case 'processando':
        return (
          <Badge className="bg-warning">
            <Clock className="w-3 h-3 mr-1" />
            Processando
          </Badge>
        );
      case 'erro':
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Erro
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loadingExtratos) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico de Importações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  const extratosRecentes = extratos.slice(0, 5);

  if (extratosRecentes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico de Importações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhuma importação realizada ainda.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Últimas Importações</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {extratosRecentes.map((extrato) => (
            <div
              key={extrato.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{extrato.arquivo_nome}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {format(new Date(extrato.data_importacao), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                    <span>•</span>
                    <span>{extrato.total_transacoes} transações</span>
                    {extrato.periodo_inicio && extrato.periodo_fim && (
                      <>
                        <span>•</span>
                        <span>
                          {format(new Date(extrato.periodo_inicio), "dd/MM", { locale: ptBR })} -{" "}
                          {format(new Date(extrato.periodo_fim), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getStatusBadge(extrato.status)}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm("Deseja excluir este extrato?")) {
                      deletarExtrato(extrato.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
