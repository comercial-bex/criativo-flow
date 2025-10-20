import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TitulosReceberList } from "@/components/Financeiro/TitulosReceberList";
import { TitulosPagarList } from "@/components/Financeiro/TitulosPagarList";
import { DividasParceladasTab } from "@/components/Financeiro/DividasParceladasTab";
import { InadimplenciaTab } from "@/components/Financeiro/InadimplenciaTab";
import { SectionHeader } from "@/components/SectionHeader";
import { PrevisaoFluxoCard } from "@/components/Financeiro/PrevisaoFluxoCard";
import { DashboardVencimentos } from "@/components/Financeiro/DashboardVencimentos";
import { FileText, CreditCard, AlertCircle, DollarSign } from "lucide-react";

export default function GestaoContas() {
  const [searchParams] = useSearchParams();
  const tabInicial = searchParams.get('tab') || 'receber';
  const [activeTab, setActiveTab] = useState(tabInicial);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <SectionHeader
        title="Gestão de Contas"
        description="Gestão completa de contas a receber, pagar, dívidas e inadimplência"
      />

      {/* Dashboard de Métricas e Previsão de Fluxo */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <DashboardVencimentos />
        </div>
        <PrevisaoFluxoCard />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="receber" className="gap-2">
            <DollarSign className="h-4 w-4" />
            A Receber
          </TabsTrigger>
          <TabsTrigger value="pagar" className="gap-2">
            <FileText className="h-4 w-4" />
            A Pagar
          </TabsTrigger>
          <TabsTrigger value="dividas" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Dívidas
          </TabsTrigger>
          <TabsTrigger value="inadimplencia" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Inadimplência
          </TabsTrigger>
        </TabsList>

        <TabsContent value="receber" className="mt-6">
          <TitulosReceberList />
        </TabsContent>

        <TabsContent value="pagar" className="mt-6">
          <TitulosPagarList />
        </TabsContent>

        <TabsContent value="dividas" className="mt-6">
          <DividasParceladasTab />
        </TabsContent>

        <TabsContent value="inadimplencia" className="mt-6">
          <InadimplenciaTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
