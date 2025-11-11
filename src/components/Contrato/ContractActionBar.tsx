import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Edit, 
  FileDown, 
  Mail, 
  Printer, 
  FileSignature,
  DollarSign
} from "lucide-react";

interface ContractActionBarProps {
  onEdit: () => void;
  onExportPDF: () => void;
  onSendEmail: () => void;
  onPrint: () => void;
  onEnviarAssinatura?: () => void;
  onGerarFaturas?: () => void;
  status?: string;
}

export function ContractActionBar({
  onEdit,
  onExportPDF,
  onSendEmail,
  onPrint,
  onEnviarAssinatura,
  onGerarFaturas,
  status,
}: ContractActionBarProps) {
  return (
    <div className="no-print fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-card/95 backdrop-blur-lg border-2 border-primary/20 rounded-full shadow-2xl px-4 py-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="rounded-full hover:bg-primary/10"
            title="Editar Contrato"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Button
            variant="ghost"
            size="sm"
            onClick={onExportPDF}
            className="rounded-full hover:bg-primary/10"
            title="Exportar PDF"
          >
            <FileDown className="w-4 h-4 mr-2" />
            PDF
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onSendEmail}
            className="rounded-full hover:bg-primary/10"
            title="Enviar por E-mail"
          >
            <Mail className="w-4 h-4 mr-2" />
            Enviar
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onPrint}
            className="rounded-full hover:bg-primary/10"
            title="Imprimir"
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>

          {status === "rascunho" && onEnviarAssinatura && (
            <>
              <Separator orientation="vertical" className="h-6" />
              <Button
                variant="default"
                size="sm"
                onClick={onEnviarAssinatura}
                className="rounded-full"
                title="Enviar para Assinatura"
              >
                <FileSignature className="w-4 h-4 mr-2" />
                Enviar para Assinatura
              </Button>
            </>
          )}

          {(status === "vigente" || status === "assinado") && onGerarFaturas && (
            <>
              <Separator orientation="vertical" className="h-6" />
              <Button
                variant="default"
                size="sm"
                onClick={onGerarFaturas}
                className="rounded-full"
                title="Gerar Faturas"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Gerar Faturas
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
