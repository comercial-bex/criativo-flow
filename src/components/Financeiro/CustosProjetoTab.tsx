import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useRelatoriosCustosProjeto } from '@/hooks/useRelatoriosCustosProjeto';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function CustosProjetoTab() {
  const [clienteId, setClienteId] = useState<string | undefined>(undefined);
  const { custosData, isLoading } = useRelatoriosCustosProjeto(clienteId);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const totalCustos = custosData.reduce((acc, p) => acc + p.custo_total, 0);
  const totalReceitas = custosData.reduce((acc, p) => acc + p.receita_total, 0);
  const lucroTotal = totalReceitas - totalCustos;
  const margemTotal = totalReceitas > 0 ? ((lucroTotal / totalReceitas) * 100).toFixed(2) : '0.00';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Custos</p>
            <p className="text-2xl font-bold text-red-500">{formatCurrency(totalCustos)}</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Receitas</p>
            <p className="text-2xl font-bold text-green-500">{formatCurrency(totalReceitas)}</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Lucro Total</p>
            <p className={`text-2xl font-bold ${lucroTotal >= 0 ? 'text-blue-500' : 'text-orange-500'}`}>
              {formatCurrency(lucroTotal)}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Margem Média</p>
            <p className="text-2xl font-bold text-purple-500">{margemTotal}%</p>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        {isLoading ? (
          <Skeleton className="h-96 w-full" />
        ) : custosData.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Nenhum projeto com custos registrados</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Projeto</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Custos</TableHead>
                <TableHead className="text-right">Receitas</TableHead>
                <TableHead className="text-right">Lucro</TableHead>
                <TableHead className="text-right">Margem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {custosData.map((projeto) => (
                <TableRow key={projeto.projeto_id}>
                  <TableCell className="font-medium">{projeto.projeto_nome}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {projeto.cliente_nome || '-'}
                  </TableCell>
                  <TableCell className="text-right text-red-500">
                    {formatCurrency(projeto.custo_total)}
                  </TableCell>
                  <TableCell className="text-right text-green-500">
                    {formatCurrency(projeto.receita_total)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {projeto.lucro_liquido >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className={projeto.lucro_liquido >= 0 ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                        {formatCurrency(projeto.lucro_liquido)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={projeto.margem_lucro_percent >= 20 ? 'default' : 'secondary'}
                      className={
                        projeto.margem_lucro_percent >= 20
                          ? 'bg-green-500/10 text-green-500'
                          : projeto.margem_lucro_percent >= 10
                          ? 'bg-yellow-500/10 text-yellow-500'
                          : 'bg-red-500/10 text-red-500'
                      }
                    >
                      {projeto.margem_lucro_percent.toFixed(2)}%
                    </Badge>
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
