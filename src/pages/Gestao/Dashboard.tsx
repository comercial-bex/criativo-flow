import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, DollarSign, Calculator, FileSignature, AlertTriangle, Wallet, Users } from "lucide-react";
import { useUnifiedFinancialData } from "@/hooks/useUnifiedFinancialData";
import { useFinancialExports } from "@/hooks/useFinancialExports";
import { FilterBar, FilterValues } from "@/components/Financeiro/FilterBar";
import { KPICards } from "@/components/Financeiro/KPICards";
import { ReceitasDespesasChart } from "@/components/Financeiro/Charts/ReceitasDespesasChart";
import { ComposicaoReceitasChart } from "@/components/Financeiro/Charts/ComposicaoReceitasChart";
import { ComposicaoDespesasChart } from "@/components/Financeiro/Charts/ComposicaoDespesasChart";
import { ReceitaClienteChart } from "@/components/Financeiro/Charts/ReceitaClienteChart";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { startOfMonth, endOfMonth, subMonths, startOfYear } from "date-fns";

const GestaoDashboard = () => {
  const [periodo, setPeriodo] = useState<"mes" | "trimestre" | "ano">("mes");
  const [type, setType] = useState<'all' | 'receita' | 'despesa'>('all');

  const getDateRange = (periodo: "mes" | "trimestre" | "ano") => {
    const now = new Date();
    switch (periodo) {
      case "mes":
        return {
          startDate: startOfMonth(now).toISOString().split('T')[0],
          endDate: endOfMonth(now).toISOString().split('T')[0]
        };
      case "trimestre":
        return {
          startDate: startOfMonth(subMonths(now, 2)).toISOString().split('T')[0],
          endDate: endOfMonth(now).toISOString().split('T')[0]
        };
      case "ano":
        return {
          startDate: startOfYear(now).toISOString().split('T')[0],
          endDate: endOfMonth(now).toISOString().split('T')[0]
        };
    }
  };

  const { startDate, endDate } = getDateRange(periodo);

  const { financeiro, comercial, kpiDashboard, errorKPIDashboard, loading } = useUnifiedFinancialData({
    startDate,
    endDate,
    type
  });

  const { exportConsolidatedPDF, exportDataAsXLSX } = useFinancialExports();

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleApplyFilters = (filters: FilterValues) => {
    setPeriodo(filters.periodo);
    setType(filters.tipo);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'rascunho': 'bg-gray-500',
      'enviado': 'bg-blue-500',
      'aprovado': 'bg-green-500',
      'reprovado': 'bg-red-500',
      'pendente': 'bg-yellow-500',
      'assinado': 'bg-green-600'
    };
    return colors[status] || 'bg-gray-400';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Gestão & Finanças</h1>
          <p className="text-muted-foreground">Visão completa do financeiro e comercial</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <FilterBar onApply={handleApplyFilters} />

      {/* ALERTAS CRÍTICOS */}
      {errorKPIDashboard && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar KPIs</AlertTitle>
          <AlertDescription>
            Não foi possível carregar alguns indicadores. Verifique sua conexão e tente novamente.
          </AlertDescription>
        </Alert>
      )}

      {financeiro.dividas.porTipo.aPagar.vencidas > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Dívidas Vencidas</AlertTitle>
          <AlertDescription>
            Você tem {financeiro.dividas.porTipo.aPagar.vencidas} dívida(s) vencida(s) a pagar. 
            Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
              financeiro.dividas.mapa.filter(d => d.tipo === 'pagar' && d.parcelas_vencidas_count > 0)
                .reduce((acc, d) => acc + d.valor_restante, 0)
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* SEÇÃO FINANCEIRA */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Financeiro (Contábil)</h2>
        </div>

        <KPICards data={financeiro.kpis} loading={loading} />

        {/* SEÇÃO DE DÍVIDAS E FOLHA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total a Pagar</p>
                <p className="text-2xl font-bold text-red-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    financeiro.dividas.porTipo.aPagar.total
                  )}
                </p>
                {financeiro.dividas.porTipo.aPagar.vencidas > 0 && (
                  <p className="text-xs text-red-500 font-medium mt-1">
                    {financeiro.dividas.porTipo.aPagar.vencidas} vencida(s)
                  </p>
                )}
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total a Receber</p>
                <p className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    financeiro.dividas.porTipo.aReceber.total
                  )}
                </p>
                {financeiro.dividas.porTipo.aReceber.vencidas > 0 && (
                  <p className="text-xs text-orange-500 font-medium mt-1">
                    {financeiro.dividas.porTipo.aReceber.vencidas} inadimplente(s)
                  </p>
                )}
              </div>
              <Wallet className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Folha de Pagamento</p>
                <p className="text-2xl font-bold text-blue-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    financeiro.folha.total
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {financeiro.folha.detalhes.length} registro(s)
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inadimplência</p>
                <p className="text-2xl font-bold text-purple-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    financeiro.dividas.totais.totalRestante
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {financeiro.dividas.totais.totalVencidas} título(s)
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-purple-500" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReceitasDespesasChart 
            data={financeiro.receitasDespesas} 
            loading={loading} 
          />
          <ComposicaoReceitasChart 
            data={financeiro.composicaoReceitas} 
            loading={loading} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ComposicaoDespesasChart 
            data={financeiro.composicaoDespesas} 
            loading={loading} 
          />
          <ReceitaClienteChart 
            data={financeiro.receitaPorCliente} 
            loading={loading} 
          />
        </div>
      </div>

      <Separator className="my-8" />

      {/* SEÇÃO COMERCIAL */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Comercial (Vendas)</h2>
        </div>

        {/* KPIs Comerciais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orçamentos</p>
                <p className="text-2xl font-bold">{comercial.stats.totalOrcamentos}</p>
              </div>
              <Calculator className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Orçamentos Aprovados</p>
                <p className="text-2xl font-bold">{comercial.stats.orcamentosAprovados}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Propostas Assinadas</p>
                <p className="text-2xl font-bold">{comercial.stats.propostasAssinadas}</p>
              </div>
              <FileSignature className="h-8 w-8 text-purple-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                <p className="text-2xl font-bold">{comercial.stats.taxaConversao.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
        </div>

        {/* Valores Comerciais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Valor Total em Pipeline</p>
              <p className="text-3xl font-bold text-blue-600">
                {new Intl.NumberFormat('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                }).format(comercial.stats.valorTotalPipeline)}
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Previsão de Receita</p>
              <p className="text-3xl font-bold text-green-600">
                {new Intl.NumberFormat('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                }).format(comercial.stats.previsaoReceita)}
              </p>
            </div>
          </Card>
        </div>

        {/* Listas de Orçamentos e Propostas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orçamentos Recentes */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Orçamentos Recentes</h3>
            <div className="space-y-3">
              {comercial.orcamentosRecentes.length > 0 ? (
                comercial.orcamentosRecentes.map((orc) => (
                  <div key={orc.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{orc.titulo}</p>
                      <p className="text-sm text-muted-foreground">{orc.cliente_nome}</p>
                      <p className="text-xs text-muted-foreground">{orc.data}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-semibold">
                        {new Intl.NumberFormat('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        }).format(orc.valor)}
                      </p>
                      <Badge className={getStatusColor(orc.status)}>
                        {orc.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">Nenhum orçamento encontrado</p>
              )}
            </div>
          </Card>

          {/* Propostas Recentes */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Propostas Recentes</h3>
            <div className="space-y-3">
              {comercial.propostasRecentes.length > 0 ? (
                comercial.propostasRecentes.map((prop) => (
                  <div key={prop.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{prop.titulo}</p>
                      <p className="text-sm text-muted-foreground">{prop.cliente_nome}</p>
                      <p className="text-xs text-muted-foreground">{prop.data}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-semibold">
                        {new Intl.NumberFormat('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        }).format(prop.valor)}
                      </p>
                      <Badge className={getStatusColor(prop.status)}>
                        {prop.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">Nenhuma proposta encontrada</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GestaoDashboard;
