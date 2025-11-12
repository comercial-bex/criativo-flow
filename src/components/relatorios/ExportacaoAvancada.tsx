import { Button } from '@/components/ui/button';
import { 
  Download, FileText, Presentation, Share2, 
  Mail, MessageCircle, Printer 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/lib/toast-compat';

interface ExportacaoAvancadaProps {
  relatorioTitulo: string;
  linkHash: string;
  onExportPDF: () => void;
}

export function ExportacaoAvancada({ 
  relatorioTitulo, 
  linkHash,
  onExportPDF 
}: ExportacaoAvancadaProps) {
  
  const handleExportPowerPoint = async () => {
    toast.info('Exportação PowerPoint', {
      description: 'Funcionalidade em desenvolvimento. Em breve você poderá exportar para .pptx'
    });
  };

  const handleShare = (type: 'whatsapp' | 'email' | 'link') => {
    const url = window.location.href;
    const text = `Confira o ${relatorioTitulo}`;
    
    switch (type) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(relatorioTitulo)}&body=${encodeURIComponent(text + '\n\n' + url)}`;
        break;
      case 'link':
        navigator.clipboard.writeText(url);
        toast.success('Link copiado!', {
          description: 'O link do relatório foi copiado para a área de transferência.'
        });
        break;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-white/10">
          <Download className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Exportar Relatório</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onExportPDF}>
          <FileText className="mr-2 h-4 w-4" />
          Baixar PDF
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleExportPowerPoint}>
          <Presentation className="mr-2 h-4 w-4" />
          Exportar PowerPoint
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimir
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Compartilhar</DropdownMenuLabel>
        
        <DropdownMenuItem onClick={() => handleShare('link')}>
          <Share2 className="mr-2 h-4 w-4" />
          Copiar Link
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
          <MessageCircle className="mr-2 h-4 w-4" />
          Enviar via WhatsApp
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleShare('email')}>
          <Mail className="mr-2 h-4 w-4" />
          Enviar por Email
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
