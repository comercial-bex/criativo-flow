import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";

export function FluxoPorCategoria() {
  const { data: fluxoData, isLoading } = useQuery({
    queryKey: ['fluxo-por-categoria'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_fluxo_por_categoria_data', {});
      
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const receitas = fluxoData?.filter(f => f.titulo_tipo === 'receber') || [];
  const despesas = fluxoData?.filter(f => f.titulo_tipo === 'pagar') || [];

  // Agrupar por categoria
  const receitasPorCategoria = receitas.reduce((acc: any[], item) => {
    const existe = acc.find(a => a.categoria_id === item.categoria_id);
    if (existe) {
      existe.valor += item.valor_pago;
    } else {
      acc.push({
        categoria_id: item.categoria_id,
        nome: item.categoria_nome || 'Sem Categoria',
        valor: item.valor_pago,
        cor: item.categoria_cor || '#3b82f6',
      });
    }
    return acc;
  }, []);

  const despesasPorCategoria = despesas.reduce((acc: any[], item) => {
    const existe = acc.find(a => a.categoria_id === item.categoria_id);
    if (existe) {
      existe.valor += item.valor_pago;
    } else {
      acc.push({
        categoria_id: item.categoria_id,
        nome: item.categoria_nome || 'Sem Categoria',
        valor: item.valor_pago,
        cor: item.categoria_cor || '#ef4444',
      });
    }
    return acc;
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border p-3 rounded-lg shadow-lg">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Receitas por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            Receitas por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          {receitasPorCategoria.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Sem dados de receitas categorizadas
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={receitasPorCategoria}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ nome, percent }) => `${nome}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="valor"
                  >
                    {receitasPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="mt-4 space-y-2">
                {receitasPorCategoria.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: cat.cor }}
                      />
                      <span>{cat.nome}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(cat.valor)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Despesas por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-destructive" />
            Despesas por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          {despesasPorCategoria.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Sem dados de despesas categorizadas
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={despesasPorCategoria}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ nome, percent }) => `${nome}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="valor"
                  >
                    {despesasPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="mt-4 space-y-2">
                {despesasPorCategoria.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: cat.cor }}
                      />
                      <span>{cat.nome}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(cat.valor)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
