import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Edit, 
  FileDown, 
  Mail, 
  Link, 
  Printer, 
  FileSignature,
  Copy
} from "lucide-react";

interface PropostaActionBarProps {
  onEdit: () => void;
  onExportPDF: () => void;
  onSendEmail: () => void;
  onCopyLink: () => void;
  onPrint: () => void;
  onGerarContrato?: () => void;
  onNovaVersao?: () => void;
  status?: string;
  hasLink?: boolean;
}

export function PropostaActionBar({
  onEdit,
  onExportPDF,
  onSendEmail,
  onCopyLink,
  onPrint,
  onGerarContrato,
  onNovaVersao,
  status,
  hasLink = false,
}: PropostaActionBarProps) {
  return (
    <div className="no-print fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-card/95 backdrop-blur-lg border-2 border-primary/20 rounded-full shadow-2xl px-4 py-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="rounded-full hover:bg-primary/10"
            title="Editar Proposta"
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

          {hasLink && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCopyLink}
              className="rounded-full hover:bg-primary/10"
              title="Copiar Link Público"
            >
              <Link className="w-4 h-4 mr-2" />
              Copiar Link
            </Button>
          )}

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

          {onNovaVersao && (
            <>
              <Separator orientation="vertical" className="h-6" />
              <Button
                variant="ghost"
                size="sm"
                onClick={onNovaVersao}
                className="rounded-full hover:bg-primary/10"
                title="Criar Nova Versão"
              >
                <Copy className="w-4 h-4 mr-2" />
                Nova Versão
              </Button>
            </>
          )}

          {status === "assinado" && onGerarContrato && (
            <>
              <Separator orientation="vertical" className="h-6" />
              <Button
                variant="default"
                size="sm"
                onClick={onGerarContrato}
                className="rounded-full"
                title="Gerar Contrato"
              >
                <FileSignature className="w-4 h-4 mr-2" />
                Gerar Contrato
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
