import { useState } from "react";
import { useContracts } from "@/hooks/useContracts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText, Download, CheckCircle, Plus, DollarSign, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ContratosTabProps {
  clienteId: string;
}

export function ContratosTab({ clienteId }: ContratosTabProps) {
  const { contracts, loading, updateStatus } = useContracts(clienteId);
  const [filter, setFilter] = useState<string>("todos");

  const filteredContracts =
    filter === "todos"
      ? contracts
      : contracts.filter((c) => c.status === filter);

  const stats = {
    total: contracts.length,
    rascunho: contracts.filter((c) => c.status === "rascunho").length,
    enviado: contracts.filter((c) => c.status === "enviado").length,
    assinado: contracts.filter((c) => c.status === "assinado").length,
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      rascunho: { variant: "secondary" as const, label: "Rascunho", className: "" },
      enviado: { variant: "default" as const, label: "Enviado", className: "" },
      assinado: { variant: "outline" as const, label: "Assinado", className: "bg-green-500/10 text-green-700" },
      cancelado: { variant: "outline" as const, label: "Cancelado", className: "bg-red-500/10 text-red-700" },
    };
    const config = variants[status as keyof typeof variants] || variants.rascunho;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded animate-pulse" />
          ))}
        </div>
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
        <Card className="cursor-pointer hover:bg-accent" onClick={() => setFilter("rascunho")}>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Rascunhos</div>
            <div className="text-2xl font-bold text-gray-600">{stats.rascunho}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-accent" onClick={() => setFilter("enviado")}>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Enviados</div>
            <div className="text-2xl font-bold text-blue-600">{stats.enviado}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-accent" onClick={() => setFilter("assinado")}>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Assinados</div>
            <div className="text-2xl font-bold text-green-600">{stats.assinado}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {filter === "todos" ? "Todos os Contratos" : `Contratos - ${filter}`}
        </h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Contrato
        </Button>
      </div>

      {filteredContracts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhum contrato encontrado"
          description="Crie um novo contrato para começar"
          action={{
            label: "Criar Contrato",
            onClick: () => {},
          }}
        />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filteredContracts.map((contract) => (
            <Card key={contract.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{contract.titulo}</CardTitle>
                  {getStatusBadge(contract.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Badge variant="outline" className="mb-2">
                    {contract.tipo}
                  </Badge>
                  {contract.descricao && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {contract.descricao}
                    </p>
                  )}
                </div>

                {contract.valor_mensal && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      R$ {contract.valor_mensal.toLocaleString("pt-BR")} /mês
                    </span>
                  </div>
                )}

                {contract.data_inicio && contract.data_fim && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(contract.data_inicio), "dd/MM/yy")} -{" "}
                      {format(new Date(contract.data_fim), "dd/MM/yy")}
                    </span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {contract.arquivo_url && (
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="h-3 w-3 mr-1" />
                      Baixar
                    </Button>
                  )}
                  {contract.status === "enviado" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => updateStatus({ id: contract.id, status: "assinado" })}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Assinar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
