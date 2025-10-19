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
import { useMapaDividas } from "@/hooks/useMapaDividas";
import { RefreshCw, TrendingDown, TrendingUp, AlertCircle } from "lucide-react";

export default function MapaDividas() {
  const [tipoFiltro, setTipoFiltro] = useState<'pagar' | 'receber' | undefined>();
  const { mapaDividas, isLoading, refreshMapaDividas, totais } = useMapaDividas({ tipo: tipoFiltro });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      ativa: "default",
      quitada: "secondary",
      renegociada: "outline",
      cancelada: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="Mapa de Dívidas"
        action={
          <Button variant="outline" size="sm" onClick={refreshMapaDividas}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total em Dívidas</p>
              <p className="text-2xl font-bold">{formatCurrency(totais.totalDividas)}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Pago</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totais.totalPago)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Saldo Devedor</p>
              <p className="text-2xl font-bold text-destructive">{formatCurrency(totais.totalRestante)}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-destructive" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Dívidas Vencidas</p>
              <p className="text-2xl font-bold text-orange-600">{totais.totalVencidas}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button
          variant={tipoFiltro === undefined ? "default" : "outline"}
          size="sm"
          onClick={() => setTipoFiltro(undefined)}
        >
          Todas
        </Button>
        <Button
          variant={tipoFiltro === 'pagar' ? "default" : "outline"}
          size="sm"
          onClick={() => setTipoFiltro('pagar')}
        >
          A Pagar
        </Button>
        <Button
          variant={tipoFiltro === 'receber' ? "default" : "outline"}
          size="sm"
          onClick={() => setTipoFiltro('receber')}
        >
          A Receber
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : mapaDividas.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Nenhuma dívida encontrada.</p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Credor/Devedor</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Valor Pago</TableHead>
                <TableHead>Saldo Devedor</TableHead>
                <TableHead>Parcelas</TableHead>
                <TableHead>Vencidas</TableHead>
                <TableHead>Próximo Vencimento</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mapaDividas.map((divida) => (
                <TableRow key={divida.divida_id}>
                  <TableCell>
                    <Badge variant={divida.tipo === 'pagar' ? 'destructive' : 'default'}>
                      {divida.tipo === 'pagar' ? 'A Pagar' : 'A Receber'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{divida.credor_devedor}</TableCell>
                  <TableCell>{divida.descricao}</TableCell>
                  <TableCell>{formatCurrency(divida.valor_total)}</TableCell>
                  <TableCell className="text-green-600">
                    {formatCurrency(divida.valor_pago)}
                  </TableCell>
                  <TableCell className="text-destructive font-medium">
                    {formatCurrency(divida.valor_restante)}
                  </TableCell>
                  <TableCell>
                    {divida.parcelas_pagas_count} / {divida.numero_parcelas}
                  </TableCell>
                  <TableCell>
                    {divida.parcelas_vencidas_count > 0 ? (
                      <Badge variant="destructive">{divida.parcelas_vencidas_count}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {divida.proximo_vencimento
                      ? new Date(divida.proximo_vencimento).toLocaleDateString('pt-BR')
                      : '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(divida.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
