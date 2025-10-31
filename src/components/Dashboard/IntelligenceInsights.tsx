import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjetoROIDashboard } from './ProjetoROIDashboard';
import { ProdutividadeWidget } from './ProdutividadeWidget';
import { Brain, TrendingUp, Activity } from 'lucide-react';

export function IntelligenceInsights() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Intelligence Insights</h2>
          <p className="text-sm text-muted-foreground">
            Análises consolidadas de ROI, produtividade e desempenho operacional
          </p>
        </div>
      </div>

      <Tabs defaultValue="roi" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="roi" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            ROI & Financeiro
          </TabsTrigger>
          <TabsTrigger value="produtividade" className="gap-2">
            <Activity className="h-4 w-4" />
            Produtividade
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roi" className="space-y-4">
          <ProjetoROIDashboard limit={15} />
        </TabsContent>

        <TabsContent value="produtividade" className="space-y-4">
          <ProdutividadeWidget titulo="Produtividade da Equipe (Últimos 7 dias)" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
