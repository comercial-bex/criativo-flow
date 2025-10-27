import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProjetos } from '@/hooks/useProjetos';
import { useFinanceiroIntegrado } from '@/hooks/useFinanceiroIntegrado';
import { DollarSign, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * ✅ SPRINT 3: Dashboard de Lucratividade de Projetos
 * Rastreamento completo de receitas vs. custos por projeto
 */
export default function LucratividadeProjetos() {
  const [projetoSelecionado, setProjetoSelecionado] = useState<string>('');
  const { projetos, isLoading: loadingProjetos, calcularLucro } = useProjetos();
  const { 
    lancamentos, 
    resumo, 
    analises, 
    isLoading: loadingFinanceiro 
  } = useFinanceiroIntegrado({ 
    projetoId: projetoSelecionado || undefined 
  });

  const [lucroData, setLucroData] = useState<{
    total_receitas: number;
    total_custos: number;
    lucro_liquido: number;
    margem_lucro: number;
  } | null>(null);

  const handleCalcularLucro = async () => {
    if (!projetoSelecionado) return;
    const resultado = await calcularLucro(projetoSelecionado);
    setLucroData(resultado);
  };

  if (loadingProjetos) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">📊 Lucratividade por Projeto</h1>
        <Select value={projetoSelecionado} onValueChange={setProjetoSelecionado}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Selecione um projeto" />
          </SelectTrigger>
          <SelectContent>
            {projetos.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.titulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {projetoSelecionado && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Receitas</p>
                  <p className="text-2xl font-bold">
                    R$ {resumo.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <TrendingDown className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Custos</p>
                  <p className="text-2xl font-bold">
                    R$ {resumo.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                  <p className="text-2xl font-bold">
                    R$ {resumo.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Margem</p>
                  <p className="text-2xl font-bold">
                    {resumo.margemLucro.toFixed(1)}%
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Análise de Custos</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Custos por Tarefa</h3>
                {Object.entries(analises.custosPorTarefa).map(([tarefa, valor]) => (
                  <div key={tarefa} className="flex justify-between py-2 border-b">
                    <span>{tarefa}</span>
                    <span className="font-semibold">
                      R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>

              {analises.tarefaMaisCara && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Tarefa Mais Cara</p>
                  <p className="font-semibold">{analises.tarefaMaisCara[0]}</p>
                  <p className="text-xl font-bold text-red-600">
                    R$ {analises.tarefaMaisCara[1].toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Lançamentos Recentes</h2>
            <div className="space-y-2">
              {lancamentos.slice(0, 10).map((lanc) => (
                <div key={lanc.id} className="flex justify-between items-center py-3 border-b">
                  <div>
                    <p className="font-medium">{lanc.descricao}</p>
                    <p className="text-sm text-muted-foreground">
                      {lanc.tarefa_titulo || lanc.evento_titulo || '-'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${lanc.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                      {lanc.tipo === 'receita' ? '+' : '-'} R$ {lanc.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(lanc.data_lancamento).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {!projetoSelecionado && (
        <Card className="p-12 text-center">
          <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Selecione um Projeto</h2>
          <p className="text-muted-foreground">
            Escolha um projeto acima para visualizar sua lucratividade
          </p>
        </Card>
      )}
    </div>
  );
}
