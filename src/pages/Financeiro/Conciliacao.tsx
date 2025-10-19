import { useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useConciliacoes, Conciliacao as ConciliacaoType } from "@/hooks/useConciliacoes";
import { ConciliacaoDialog } from "@/components/Monitor/ConciliacaoDialog";
import { RefreshCw, Plus } from "lucide-react";

export default function Conciliacao() {
  const [selectedMes, setSelectedMes] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedConciliacao, setSelectedConciliacao] = useState<ConciliacaoType | undefined>();
  const { data: conciliacoes = [], isLoading, refetch } = useConciliacoes(undefined, selectedMes);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pendente: "outline",
      em_andamento: "secondary",
      concluida: "default",
      cancelada: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="Conciliação Bancária"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
            <Button 
              size="sm"
              onClick={() => {
                setSelectedConciliacao(undefined);
                setDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Conciliação
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : conciliacoes.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Nenhuma conciliação encontrada. Crie uma nova conciliação para começar.
          </p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês Referência</TableHead>
                <TableHead>Saldo Inicial</TableHead>
                <TableHead>Saldo Final</TableHead>
                <TableHead>Saldo Sistema</TableHead>
                <TableHead>Diferença</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conciliacoes.map((conciliacao) => (
                <TableRow key={conciliacao.id}>
                  <TableCell>
                    {new Date(conciliacao.mes_referencia).toLocaleDateString('pt-BR', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>{formatCurrency(conciliacao.saldo_inicial)}</TableCell>
                  <TableCell>{formatCurrency(conciliacao.saldo_final_extrato)}</TableCell>
                  <TableCell>{formatCurrency(conciliacao.saldo_final_sistema)}</TableCell>
                  <TableCell
                    className={
                      conciliacao.diferenca === 0
                        ? "text-green-600"
                        : "text-destructive font-medium"
                    }
                  >
                    {formatCurrency(conciliacao.diferenca)}
                  </TableCell>
                  <TableCell>{getStatusBadge(conciliacao.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedConciliacao(conciliacao);
                        setDialogOpen(true);
                      }}
                    >
                      Ver Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <ConciliacaoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        conciliacao={selectedConciliacao}
        onSave={() => refetch()}
      />
    </div>
  );
}
