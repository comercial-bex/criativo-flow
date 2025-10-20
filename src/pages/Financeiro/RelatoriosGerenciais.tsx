import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DRETab } from "@/components/Financeiro/DRETab";
import { CustosProjetoTab } from "@/components/Financeiro/CustosProjetoTab";
import { FluxoCaixaTab } from "@/components/Financeiro/FluxoCaixaTab";
import { SectionHeader } from "@/components/SectionHeader";
import { TrendingUp, DollarSign, Activity } from "lucide-react";

export default function RelatoriosGerenciais() {
  const [searchParams] = useSearchParams();
  const tabInicial = searchParams.get('tab') || 'dre';
  const [activeTab, setActiveTab] = useState(tabInicial);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <SectionHeader
        title="Relatórios Gerenciais"
        description="Análises financeiras consolidadas para tomada de decisão"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dre" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            DRE
          </TabsTrigger>
          <TabsTrigger value="custos" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Custos por Projeto
          </TabsTrigger>
          <TabsTrigger value="fluxo" className="gap-2">
            <Activity className="h-4 w-4" />
            Fluxo de Caixa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dre" className="mt-6">
          <DRETab />
        </TabsContent>

        <TabsContent value="custos" className="mt-6">
          <CustosProjetoTab />
        </TabsContent>

        <TabsContent value="fluxo" className="mt-6">
          <FluxoCaixaTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
