import { FileText, Mail, Printer, Copy, Edit, Share2, Files } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface PreviewActionBarProps {
  orcamento: any;
  onEdit: () => void;
  onExport: () => void;
  onSend: () => void;
  onDuplicate: () => void;
  onConvert: () => void;
}

const statusLabels: Record<string, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
  expirado: "Expirado"
};

export const PreviewActionBar = ({
  orcamento,
  onEdit,
  onExport,
  onSend,
  onDuplicate,
  onConvert
}: PreviewActionBarProps) => {
  const { toast } = useToast();

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copiado!",
      description: "O link do orçamento foi copiado para a área de transferência.",
    });
  };

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b shadow-sm p-4 mb-6 rounded-t-lg no-print">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-bex" />
          <div>
            <h2 className="font-semibold text-foreground">Orçamento #{orcamento.numero || 'N/A'}</h2>
            <p className="text-xs text-muted-foreground">{orcamento.clientes?.nome || 'Cliente'}</p>
          </div>
          <Badge variant="outline" className="ml-2">
            {statusLabels[orcamento.status]}
          </Badge>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Ações Primárias */}
          <Button 
            onClick={onEdit}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Editar</span>
          </Button>
          
          <Button 
            onClick={onExport}
            variant="default"
            size="sm"
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar PDF</span>
          </Button>

          {/* Ações Secundárias */}
          <div className="flex items-center gap-2 border-l pl-2 ml-2">
            <Button 
              onClick={onSend}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Enviar</span>
            </Button>

            <Button 
              onClick={handlePrint}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </Button>

            <Button 
              onClick={handleCopyLink}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              <span className="hidden sm:inline">Copiar Link</span>
            </Button>
          </div>

          {/* Ações Terciárias */}
          <div className="flex items-center gap-2 border-l pl-2 ml-2">
            <Button 
              onClick={onConvert}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Converter</span>
            </Button>

            <Button 
              onClick={onDuplicate}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <Files className="h-4 w-4" />
              <span className="hidden sm:inline">Duplicar</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
