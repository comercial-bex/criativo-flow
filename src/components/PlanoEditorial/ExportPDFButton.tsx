import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { generatePlanoEditorialPDF } from "@/lib/pdf-generator/plano-editorial-pdf";
import { toast } from "@/lib/toast-compat";

interface ExportPDFButtonProps {
  planejamentoId: string;
}

export function ExportPDFButton({ planejamentoId }: ExportPDFButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await generatePlanoEditorialPDF(planejamentoId);
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={exporting} variant="outline">
      {exporting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Gerando PDF...
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4 mr-2" />
          Gerar PDF
        </>
      )}
    </Button>
  );
}
