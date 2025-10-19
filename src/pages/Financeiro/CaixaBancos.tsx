import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ContasBancariasTable } from "@/components/Financeiro/ContasBancariasTable";
import { ContaBancariaDialog } from "@/components/Financeiro/ContaBancariaDialog";

export default function CaixaBancos() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Caixa & Bancos</h1>
          <p className="text-muted-foreground">
            Gerencie contas bancárias e caixas da empresa
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      <ContasBancariasTable />
      <ContaBancariaDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
