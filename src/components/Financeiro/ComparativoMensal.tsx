import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function ComparativoMensal() {
  const mesAtual = new Date().toISOString().slice(0, 7) + '-01';
  const mesAnterior = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7) + '-01';

  const { data: dadosAtual, isLoading: loadingAtual } = useQuery({
    queryKey: ['folha-comparativo', mesAtual],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financeiro_folha')
        .select('total_liquido, total_encargos, total_descontos')
        .eq('competencia', mesAtual)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: dadosAnterior, isLoading: loadingAnterior } = useQuery({
    queryKey: ['folha-comparativo', mesAnterior],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financeiro_folha')
        .select('total_liquido, total_encargos, total_descontos')
        .eq('competencia', mesAnterior)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  if (loadingAtual || loadingAnterior) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Carregando comparativo...</p>
        </CardContent>
      </Card>
    );
  }

  const custoAtual = (dadosAtual?.total_liquido || 0) + (dadosAtual?.total_encargos || 0);
  const custoAnterior = (dadosAnterior?.total_liquido || 0) + (dadosAnterior?.total_encargos || 0);
  const variacao = custoAnterior > 0 ? ((custoAtual - custoAnterior) / custoAnterior) * 100 : 0;

  const getTendenciaIcon = () => {
    if (variacao > 0) return <TrendingUp className="h-4 w-4 text-destructive" />;
    if (variacao < 0) return <TrendingDown className="h-4 w-4 text-success" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTendenciaColor = () => {
    if (variacao > 0) return 'text-destructive';
    if (variacao < 0) return 'text-success';
    return 'text-muted-foreground';
  };

  const formatMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {getTendenciaIcon()}
          Comparativo Mês a Mês
        </CardTitle>
        <CardDescription>
          {new Date(mesAtual).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} vs{' '}
          {new Date(mesAnterior).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Custo Atual</span>
            <span className="font-bold">{formatMoeda(custoAtual)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Custo Anterior</span>
            <span className="font-medium">{formatMoeda(custoAnterior)}</span>
          </div>
        </div>

        <div className="pt-3 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Variação</span>
            <span className={`font-bold ${getTendenciaColor()}`}>
              {variacao > 0 ? '+' : ''}{variacao.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground">Diferença</span>
            <span className={`text-xs font-medium ${getTendenciaColor()}`}>
              {variacao > 0 ? '+' : ''}{formatMoeda(custoAtual - custoAnterior)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

