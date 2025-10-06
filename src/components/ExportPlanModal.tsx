import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FileText, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ExportPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  planTitle: string;
  clienteId: string;
}

export const ExportPlanModal = ({ open, onOpenChange, planId, planTitle, clienteId }: ExportPlanModalProps) => {
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);
  const [format, setFormat] = useState<'pdf' | 'pptx'>('pdf');

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-plan', {
        body: {
          planId,
          format,
          clienteId
        }
      });

      if (error) throw error;

      if (data?.fileUrl) {
        // Download automático
        window.open(data.fileUrl, '_blank');
        
        toast({
          title: "Exportação concluída!",
          description: `Arquivo ${format.toUpperCase()} gerado com sucesso`
        });

        onOpenChange(false);
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível gerar o arquivo",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exportar Plano Estratégico</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Plano: <span className="font-medium text-foreground">{planTitle}</span>
          </p>

          <div>
            <Label>Formato de Exportação</Label>
            <RadioGroup value={format} onValueChange={(value) => setFormat(value as 'pdf' | 'pptx')}>
              <div className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="flex items-center gap-2 cursor-pointer">
                  <FileText className="h-4 w-4" />
                  PDF - Documento completo
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pptx" id="pptx" />
                <Label htmlFor="pptx" className="flex items-center gap-2 cursor-pointer">
                  <Download className="h-4 w-4" />
                  PowerPoint - Apresentação editável
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="bg-primary/10 p-3 rounded-lg text-sm">
            <p className="text-muted-foreground">
              O arquivo será gerado com todos os objetivos, KPIs, iniciativas e análise SWOT incluídos.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? 'Gerando...' : 'Exportar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
