import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useRelatoriosDRE } from '@/hooks/useRelatoriosDRE';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export function DRETab() {
  const [mesInicio, setMesInicio] = useState<string>('');
  const [mesFim, setMesFim] = useState<string>('');
  const { dreData, isLoading, refreshDRE } = useRelatoriosDRE(mesInicio, mesFim);

  // Agrupar por mês
  const mesesAgrupados = dreData.reduce((acc, item) => {
    const mes = item.mes;
    if (!acc[mes]) {
      acc[mes] = { receitas: [], despesas: [] };
    }
    if (item.tipo === 'receita') {
      acc[mes].receitas.push(item);
    } else {
      acc[mes].despesas.push(item);
    }
    return acc;
  }, {} as Record<string, { receitas: any[]; despesas: any[] }>);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={refreshDRE} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-6">
          <Skeleton className="h-96 w-full" />
        </Card>
      ) : Object.keys(mesesAgrupados).length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Nenhum dado disponível no período selecionado</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(mesesAgrupados).map(([mes, { receitas, despesas }]) => {
            const totalReceitas = receitas.reduce((acc, r) => acc + r.valor_total, 0);
            const totalDespesas = despesas.reduce((acc, d) => acc + d.valor_total, 0);
            const lucroLiquido = totalReceitas - totalDespesas;
            const margemLucro = totalReceitas > 0 ? ((lucroLiquido / totalReceitas) * 100).toFixed(2) : '0.00';

            return (
              <Card key={mes} className="p-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold">
                    {format(new Date(mes), 'MMMM yyyy', { locale: ptBR })}
                  </h3>
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    <div className="rounded-lg bg-green-500/10 p-4">
                      <p className="text-sm text-muted-foreground">Receitas</p>
                      <p className="text-2xl font-bold text-green-500">{formatCurrency(totalReceitas)}</p>
                    </div>
                    <div className="rounded-lg bg-red-500/10 p-4">
                      <p className="text-sm text-muted-foreground">Despesas</p>
                      <p className="text-2xl font-bold text-red-500">{formatCurrency(totalDespesas)}</p>
                    </div>
                    <div className={`rounded-lg p-4 ${lucroLiquido >= 0 ? 'bg-blue-500/10' : 'bg-orange-500/10'}`}>
                      <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                      <p className={`text-2xl font-bold ${lucroLiquido >= 0 ? 'text-blue-500' : 'text-orange-500'}`}>
                        {formatCurrency(lucroLiquido)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-purple-500/10 p-4">
                      <p className="text-sm text-muted-foreground">Margem</p>
                      <p className="text-2xl font-bold text-purple-500">{margemLucro}%</p>
                    </div>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Conta</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...receitas, ...despesas].map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono">{item.conta_codigo}</TableCell>
                        <TableCell>{item.conta_nome}</TableCell>
                        <TableCell>
                          <span className={item.tipo === 'receita' ? 'text-green-500' : 'text-red-500'}>
                            {item.tipo}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(item.valor_total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
