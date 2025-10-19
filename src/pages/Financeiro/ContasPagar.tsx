import { TitulosPagarList } from "@/components/Financeiro/TitulosPagarList";
import { DashboardVencimentos } from "@/components/Financeiro/DashboardVencimentos";

export default function ContasPagar() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Contas a Pagar</h1>
        <p className="text-muted-foreground">
          Gerencie os títulos a pagar e registre pagamentos
        </p>
      </div>

      <DashboardVencimentos />

      <TitulosPagarList />
    </div>
  );
}
