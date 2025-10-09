import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DadosItemTab } from './DadosItemTab';

interface InventarioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId?: string;
  mode?: 'view' | 'edit' | 'create';
  onSave?: () => void;
}

export function InventarioModal({ 
  open, 
  onOpenChange, 
  itemId, 
  mode = 'create',
  onSave 
}: InventarioModalProps) {
  const [activeTab, setActiveTab] = useState('dados');

  const handleSave = () => {
    onSave?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'create' && '➕ Novo Item de Inventário'}
            {mode === 'edit' && '✏️ Editar Item'}
            {mode === 'view' && '👁️ Detalhes do Item'}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="dados">📋 Dados</TabsTrigger>
            <TabsTrigger value="fotos" disabled>📸 Fotos</TabsTrigger>
            <TabsTrigger value="estoque" disabled>📦 Estoque</TabsTrigger>
            <TabsTrigger value="precos" disabled>💰 Aluguel</TabsTrigger>
            <TabsTrigger value="checklist" disabled>✅ Checklists</TabsTrigger>
            <TabsTrigger value="agenda" disabled>📅 Agenda</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dados" className="mt-6">
            <DadosItemTab itemId={itemId} mode={mode} onSave={handleSave} />
          </TabsContent>
          
          <TabsContent value="fotos">
            <div className="p-6 text-center text-muted-foreground">
              Em breve: Upload de fotos e documentos
            </div>
          </TabsContent>
          
          <TabsContent value="estoque">
            <div className="p-6 text-center text-muted-foreground">
              Em breve: Gestão de estoque e unidades
            </div>
          </TabsContent>
          
          <TabsContent value="precos">
            <div className="p-6 text-center text-muted-foreground">
              Em breve: Configuração de preços de aluguel
            </div>
          </TabsContent>
          
          <TabsContent value="checklist">
            <div className="p-6 text-center text-muted-foreground">
              Em breve: Checklists e termos
            </div>
          </TabsContent>
          
          <TabsContent value="agenda">
            <div className="p-6 text-center text-muted-foreground">
              Em breve: Agenda de disponibilidade
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
