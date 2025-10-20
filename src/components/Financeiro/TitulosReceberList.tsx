import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Search, Filter, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTitulosFinanceiros, type TituloFilters } from "@/hooks/useTitulosFinanceiros";
import { RegistrarPagamentoDialog } from "./RegistrarPagamentoDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { GestaoContasKPIs } from "./GestaoContasKPIs";
import { GraficoEvolucao } from "./GraficoEvolucao";
import { LancarTituloDialog } from "./LancarTituloDialog";

export function TitulosReceberList() {
  const [filters, setFilters] = useState<TituloFilters>({ tipo: 'receber' });
  const [search, setSearch] = useState("");
  const [selectedTitulo, setSelectedTitulo] = useState<string | null>(null);

  const { data: titulos = [], isLoading } = useTitulosFinanceiros(filters);

  const filteredTitulos = titulos.filter(t =>
    t.descricao.toLowerCase().includes(search.toLowerCase()) ||
    t.clientes?.nome?.toLowerCase().includes(search.toLowerCase()) ||
    t.numero_documento?.includes(search)
  );

  const getStatusBadge = (status: string, dias_atraso: number) => {
    if (status === 'pago') return <Badge variant="default">Recebido</Badge>;
    if (status === 'vencido') return <Badge variant="destructive">Inadimplente ({dias_atraso}d)</Badge>;
    if (status === 'cancelado') return <Badge variant="secondary">Cancelado</Badge>;
    return <Badge variant="outline">Pendente</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <GestaoContasKPIs tipo="receber" />
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contas a Receber
          </CardTitle>
          <LancarTituloDialog tipo="receber" />
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por descrição, cliente ou número..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filters.status || "all"}
              onValueChange={(v) => setFilters({ ...filters, status: v === "all" ? undefined : v })}
            >
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="vencido">Inadimplente</SelectItem>
                <SelectItem value="pago">Recebido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTitulos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Nenhum título encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTitulos.map((titulo) => (
                    <TableRow key={titulo.id}>
                      <TableCell className="font-medium">
                        {titulo.clientes?.nome || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{titulo.descricao}</div>
                          {titulo.numero_documento && (
                            <div className="text-xs text-muted-foreground">
                              Doc: {titulo.numero_documento}
                            </div>
                          )}
                          {titulo.contratos?.titulo && (
                            <div className="text-xs text-muted-foreground">
                              Contrato: {titulo.contratos.titulo}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(titulo.data_vencimento), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(titulo.valor_liquido)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(titulo.status, titulo.dias_atraso)}
                      </TableCell>
                      <TableCell className="text-right">
                        {titulo.status !== 'pago' && titulo.status !== 'cancelado' && (
                          <Button
                            size="sm"
                            onClick={() => setSelectedTitulo(titulo.id)}
                            className="gap-2"
                          >
                            <DollarSign className="h-4 w-4" />
                            Receber
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <GraficoEvolucao tipo="receber" />

      {selectedTitulo && (
        <RegistrarPagamentoDialog
          tituloId={selectedTitulo}
          tipo="receber"
          open={!!selectedTitulo}
          onOpenChange={(open) => !open && setSelectedTitulo(null)}
        />
      )}
    </>
  );
}
