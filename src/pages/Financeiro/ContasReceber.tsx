import { TitulosReceberList } from "@/components/Financeiro/TitulosReceberList";
import { DashboardVencimentos } from "@/components/Financeiro/DashboardVencimentos";

export default function ContasReceber() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Contas a Receber</h1>
        <p className="text-muted-foreground">
          Gerencie os títulos a receber e registre recebimentos
        </p>
      </div>

      <DashboardVencimentos />

      <TitulosReceberList />
    </div>
  );
}
