import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";
import { useFinanceiroDashboard } from "@/hooks/useFinanceiroDashboard";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export function DashboardFinanceiro() {
  const { 
    dashboardData, 
    lancamentosOrigem, 
    loadingDashboard, 
    loadingLancamentos,
    refreshDashboard,
    metrics 
  } = useFinanceiroDashboard();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const chartData = dashboardData.slice(0, 6).reverse().map(d => ({
    mes: format(new Date(d.mes), 'MMM/yy', { locale: ptBR }),
    receitas: Number(d.total_receitas),
    despesas: Number(d.total_despesas),
    saldo: Number(d.saldo),
  }));

  const receitasPieData = Object.entries(metrics.receitasPorOrigem).map(([name, value]) => ({
    name: name === 'tarefa' ? 'Tarefas' : name === 'evento' ? 'Eventos' : name,
    value: Number(value),
  }));

  const despesasPieData = Object.entries(metrics.despesasPorOrigem).map(([name, value]) => ({
    name: name === 'tarefa' ? 'Tarefas' : name === 'evento' ? 'Eventos' : name === 'folha' ? 'Folha' : name,
    value: Number(value),
  }));

  if (loadingDashboard) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Botão de Refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Dashboard Financeiro</h2>
          <p className="text-muted-foreground">Integração completa de receitas e despesas</p>
        </div>
        <Button onClick={refreshDashboard} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar Dados
        </Button>
      </div>

      {/* Cards de Métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Receitas (Mês Atual)</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(metrics.atual.total_receitas)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Despesas (Mês Atual)</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(metrics.atual.total_despesas)}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Saldo</p>
              <p className={`text-2xl font-bold ${metrics.atual.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(metrics.atual.saldo)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Margem de Lucro</p>
              <p className={`text-2xl font-bold ${metrics.atual.margem_lucro_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.atual.margem_lucro_percent.toFixed(2)}%
              </p>
            </div>
            <Activity className="h-8 w-8 text-primary" />
          </div>
        </Card>
      </div>

      {/* Gráfico de Receitas vs Despesas */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Receitas vs Despesas (Últimos 6 Meses)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Line type="monotone" dataKey="receitas" stroke="hsl(var(--chart-1))" name="Receitas" strokeWidth={2} />
            <Line type="monotone" dataKey="despesas" stroke="hsl(var(--chart-2))" name="Despesas" strokeWidth={2} />
            <Line type="monotone" dataKey="saldo" stroke="hsl(var(--chart-3))" name="Saldo" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Composição de Receitas e Despesas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Composição de Receitas</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={receitasPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {receitasPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Composição de Despesas</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={despesasPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {despesasPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Tabela de Lançamentos com Origem */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Lançamentos Recentes (com Origem)</h3>
        {loadingLancamentos ? (
          <Skeleton className="h-96 w-full" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Cliente/Projeto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">% Projeto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lancamentosOrigem.slice(0, 20).map((lancamento) => (
                <TableRow key={lancamento.id}>
                  <TableCell className="text-sm">
                    {format(new Date(lancamento.data_lancamento), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell className="text-sm">{lancamento.descricao}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {lancamento.tipo_origem === 'tarefa' ? 'Tarefa' : 
                       lancamento.tipo_origem === 'evento' ? 'Evento' :
                       lancamento.tipo_origem === 'folha' ? 'Folha' : 
                       lancamento.tipo_origem}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {lancamento.cliente_nome && (
                      <div className="text-xs text-muted-foreground">{lancamento.cliente_nome}</div>
                    )}
                    {lancamento.projeto_titulo}
                  </TableCell>
                  <TableCell>
                    <Badge variant={lancamento.tipo_transacao === 'receita' ? 'default' : 'destructive'}>
                      {lancamento.tipo_transacao === 'receita' ? 'Receita' : 'Despesa'}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${lancamento.tipo_transacao === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(lancamento.valor)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {lancamento.percentual_projeto ? `${lancamento.percentual_projeto.toFixed(1)}%` : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}