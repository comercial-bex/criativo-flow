import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDividas, Divida as DividaType } from "@/hooks/useDividas";
import { useMapaDividas } from "@/hooks/useMapaDividas";
import { DividaDialog } from "@/components/Monitor/DividaDialog";
import { Plus, LayoutGrid, List, TrendingDown, TrendingUp, AlertCircle } from "lucide-react";

export function DividasParceladasTab() {
  const [viewMode, setViewMode] = useState<'lista' | 'mapa'>('lista');
  const [tipoFiltro, setTipoFiltro] = useState<'pagar' | 'receber' | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDivida, setSelectedDivida] = useState<DividaType | undefined>();
  
  const { data: dividas = [], isLoading: loadingDividas, refetch } = useDividas({ tipo: tipoFiltro });
  const { mapaDividas, isLoading: loadingMapa, totais } = useMapaDividas({ tipo: tipoFiltro });

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

  const totalDividas = dividas.reduce((acc, d) => acc + d.valor_total, 0);
  const totalPago = dividas.reduce((acc, d) => acc + d.valor_pago, 0);
  const totalRestante = totalDividas - totalPago;

  return (
    <div className="space-y-6">
      {/* KPIs consolidados */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Dívidas</p>
              <p className="text-2xl font-bold">{formatCurrency(viewMode === 'mapa' ? totais.totalDividas : totalDividas)}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Pago</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(viewMode === 'mapa' ? totais.totalPago : totalPago)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Saldo Devedor</p>
              <p className="text-2xl font-bold text-destructive">{formatCurrency(viewMode === 'mapa' ? totais.totalRestante : totalRestante)}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-destructive" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Dívidas Vencidas</p>
              <p className="text-2xl font-bold text-orange-600">{viewMode === 'mapa' ? totais.totalVencidas : 0}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Toggle entre Lista (Gestor) e Mapa */}
      <div className="flex justify-between items-center">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'lista' | 'mapa')}>
          <TabsList>
            <TabsTrigger value="lista" className="gap-2">
              <List className="h-4 w-4" />
              Gestão
            </TabsTrigger>
            <TabsTrigger value="mapa" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button onClick={() => {
          setSelectedDivida(undefined);
          setDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Dívida
        </Button>
      </div>

      {/* Filtros de tipo */}
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

      {/* Conteúdo dinâmico */}
      {viewMode === 'lista' ? (
        // Vista de Gestão (do GestorDividas)
        loadingDividas ? (
          <Skeleton className="h-64 w-full" />
        ) : dividas.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Nenhuma dívida cadastrada.</p>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Valor Pago</TableHead>
                  <TableHead>Parcelas</TableHead>
                  <TableHead>Próximo Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dividas.map((divida) => (
                  <TableRow key={divida.id}>
                    <TableCell>
                      <Badge variant={divida.tipo === 'pagar' ? 'destructive' : 'default'}>
                        {divida.tipo === 'pagar' ? 'A Pagar' : 'A Receber'}
                      </Badge>
                    </TableCell>
                    <TableCell>{divida.descricao}</TableCell>
                    <TableCell>{formatCurrency(divida.valor_total)}</TableCell>
                    <TableCell className="text-green-600">
                      {formatCurrency(divida.valor_pago)}
                    </TableCell>
                    <TableCell>
                      {divida.parcelas?.filter((p: any) => p.status === 'pago').length || 0} /{' '}
                      {divida.numero_parcelas}
                    </TableCell>
                    <TableCell>
                      {divida.proximo_vencimento 
                        ? new Date(divida.proximo_vencimento).toLocaleDateString('pt-BR')
                        : '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(divida.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedDivida(divida);
                          setDialogOpen(true);
                        }}
                      >
                        Gerenciar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )
      ) : (
        // Vista de Mapa (do MapaDividas)
        loadingMapa ? (
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
        )
      )}

      <DividaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        divida={selectedDivida}
        onSave={() => refetch()}
      />
    </div>
  );
}
