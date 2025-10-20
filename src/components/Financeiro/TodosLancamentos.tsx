import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ListFilter, Search, ArrowDownCircle, ArrowUpCircle, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { useTitulosFinanceiros } from "@/hooks/useTitulosFinanceiros";
import { Skeleton } from "@/components/ui/skeleton";

export function TodosLancamentos() {
  const [search, setSearch] = useState("");
  const [periodoFilter, setPeriodoFilter] = useState("30");
  
  const { data: titulos = [], isLoading } = useTitulosFinanceiros();

  // Filtrar por período
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - parseInt(periodoFilter));
  
  const titulosFiltrados = titulos
    .filter(t => {
      const dataVencimento = new Date(t.data_vencimento);
      const matchPeriodo = dataVencimento >= dataLimite;
      const matchBusca = search === "" || 
        t.descricao.toLowerCase().includes(search.toLowerCase()) ||
        t.clientes?.nome?.toLowerCase().includes(search.toLowerCase()) ||
        t.fornecedores?.razao_social?.toLowerCase().includes(search.toLowerCase());
      
      return matchPeriodo && matchBusca;
    })
    .sort((a, b) => new Date(b.data_vencimento).getTime() - new Date(a.data_vencimento).getTime());

  // Calcular saldo acumulado
  let saldoAcumulado = 0;
  const titulosComSaldo = titulosFiltrados.reverse().map(t => {
    const valor = t.tipo === 'receber' ? t.valor_liquido : -t.valor_liquido;
    saldoAcumulado += t.status === 'pago' ? valor : 0;
    
    return {
      ...t,
      saldoAcumulado,
    };
  }).reverse();

  const getTipoIcon = (tipo: string) => {
    return tipo === 'receber' 
      ? <ArrowDownCircle className="h-4 w-4 text-success" />
      : <ArrowUpCircle className="h-4 w-4 text-destructive" />;
  };

  const getTipoBadge = (tipo: string) => {
    return tipo === 'receber'
      ? <Badge variant="outline" className="bg-success/10 text-success border-success/20">Entrada</Badge>
      : <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Saída</Badge>;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'pago') return <Badge variant="default">Pago</Badge>;
    if (status === 'vencido') return <Badge variant="destructive">Vencido</Badge>;
    if (status === 'cancelado') return <Badge variant="secondary">Cancelado</Badge>;
    return <Badge variant="outline">Pendente</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const totalEntradas = titulosComSaldo
    .filter(t => t.tipo === 'receber' && t.status === 'pago')
    .reduce((acc, t) => acc + t.valor_liquido, 0);

  const totalSaidas = titulosComSaldo
    .filter(t => t.tipo === 'pagar' && t.status === 'pago')
    .reduce((acc, t) => acc + t.valor_liquido, 0);

  const saldoLiquido = totalEntradas - totalSaidas;

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
      {/* Resumo do Período */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas Realizadas</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(totalEntradas)}</div>
            <p className="text-xs text-muted-foreground">
              Últimos {periodoFilter} dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saídas Realizadas</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(totalSaidas)}</div>
            <p className="text-xs text-muted-foreground">
              Últimos {periodoFilter} dias
            </p>
          </CardContent>
        </Card>

        <Card className={saldoLiquido >= 0 ? 'border-success' : 'border-destructive'}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Líquido</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldoLiquido >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(saldoLiquido)}
            </div>
            <p className="text-xs text-muted-foreground">
              Entradas - Saídas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline de Lançamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListFilter className="h-5 w-5" />
            Timeline de Lançamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por descrição, cliente ou fornecedor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={periodoFilter} onValueChange={setPeriodoFilter}>
              <SelectTrigger className="w-48">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="180">Últimos 6 meses</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Entidade</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Saldo Acumulado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {titulosComSaldo.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Nenhum lançamento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  titulosComSaldo.map((titulo) => (
                    <TableRow key={titulo.id}>
                      <TableCell className="font-medium">
                        {format(new Date(titulo.data_vencimento), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTipoIcon(titulo.tipo)}
                          {getTipoBadge(titulo.tipo)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{titulo.descricao}</div>
                        {titulo.numero_documento && (
                          <div className="text-xs text-muted-foreground">
                            Doc: {titulo.numero_documento}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {titulo.tipo === 'receber' 
                          ? titulo.clientes?.nome || 'N/A'
                          : titulo.fornecedores?.razao_social || 'N/A'
                        }
                      </TableCell>
                      <TableCell className={`text-right font-medium ${
                        titulo.tipo === 'receber' ? 'text-success' : 'text-destructive'
                      }`}>
                        {titulo.tipo === 'receber' ? '+' : '-'} {formatCurrency(titulo.valor_liquido)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(titulo.status)}
                      </TableCell>
                      <TableCell className={`text-right font-bold ${
                        titulo.saldoAcumulado >= 0 ? 'text-success' : 'text-destructive'
                      }`}>
                        {titulo.status === 'pago' ? formatCurrency(titulo.saldoAcumulado) : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
