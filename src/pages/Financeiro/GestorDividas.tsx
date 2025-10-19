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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDividas, Divida as DividaType } from "@/hooks/useDividas";
import { DividaDialog } from "@/components/Monitor/DividaDialog";
import { Plus, TrendingDown, TrendingUp } from "lucide-react";

export default function GestorDividas() {
  const [tipoFiltro, setTipoFiltro] = useState<'pagar' | 'receber' | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDivida, setSelectedDivida] = useState<DividaType | undefined>();
  const { data: dividas = [], isLoading, refetch } = useDividas({ tipo: tipoFiltro });

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
    <div className="space-y-6 p-6">
      <SectionHeader
        title="Gestor de Dívidas"
        action={
          <Button 
            size="sm"
            onClick={() => {
              setSelectedDivida(undefined);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Dívida
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Dívidas</p>
              <p className="text-2xl font-bold">{formatCurrency(totalDividas)}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Pago</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPago)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Saldo Devedor</p>
              <p className="text-2xl font-bold text-destructive">{formatCurrency(totalRestante)}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-destructive" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="todas" onValueChange={(v) => {
        if (v === 'pagar') setTipoFiltro('pagar');
        else if (v === 'receber') setTipoFiltro('receber');
        else setTipoFiltro(undefined);
      }}>
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="pagar">A Pagar</TabsTrigger>
          <TabsTrigger value="receber">A Receber</TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="mt-4">
          {isLoading ? (
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
          )}
        </TabsContent>
        <TabsContent value="pagar" className="mt-4">
          {/* Mesmo conteúdo, filtrado */}
        </TabsContent>
        <TabsContent value="receber" className="mt-4">
          {/* Mesmo conteúdo, filtrado */}
        </TabsContent>
      </Tabs>

      <DividaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        divida={selectedDivida}
        onSave={() => refetch()}
      />
    </div>
  );
}
