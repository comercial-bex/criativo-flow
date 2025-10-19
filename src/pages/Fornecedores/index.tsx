import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FornecedoresTable } from "@/components/Fornecedores/FornecedoresTable";
import { FornecedorDialog } from "@/components/Fornecedores/FornecedorDialog";

export default function Fornecedores() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Fornecedores</h1>
          <p className="text-muted-foreground">
            Gerencie o cadastro de fornecedores
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Fornecedor
        </Button>
      </div>

      <FornecedoresTable />
      <FornecedorDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
