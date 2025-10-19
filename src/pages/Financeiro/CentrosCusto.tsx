import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SectionHeader } from '@/components/SectionHeader';
import { useCentrosCusto } from '@/hooks/useCentrosCusto';
import { CentrosCustoTable } from '@/components/Financeiro/CentrosCustoTable';
import { CentroCustoDialog } from '@/components/Financeiro/CentroCustoDialog';

export default function CentrosCusto() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCentro, setSelectedCentro] = useState<any>(null);
  const { centros, isLoading } = useCentrosCusto();

  const handleEdit = (centro: any) => {
    setSelectedCentro(centro);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedCentro(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="Centros de Custo"
        description="Gerencie os centros de custo para alocação de despesas"
        action={
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Centro de Custo
          </Button>
        }
      />

      <Card className="p-6">
        <CentrosCustoTable
          centros={centros}
          isLoading={isLoading}
          onEdit={handleEdit}
        />
      </Card>

      <CentroCustoDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        centro={selectedCentro}
      />
    </div>
  );
}
