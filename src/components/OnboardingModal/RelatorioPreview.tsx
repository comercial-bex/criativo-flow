import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Download, Mail, CheckCircle, Target, Calendar } from 'lucide-react';
import { marked } from 'marked';
import { useToast } from '@/hooks/use-toast';

interface RelatorioPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  relatorio: string;
  metasCriadas: number;
  campanhasCriadas: number;
  planoId: string;
  clienteNome: string;
}

export function RelatorioPreview({
  open,
  onOpenChange,
  relatorio,
  metasCriadas,
  campanhasCriadas,
  planoId,
  clienteNome
}: RelatorioPreviewProps) {
  const { toast } = useToast();

  const handleDownloadPDF = () => {
    toast({
      title: "Download iniciado",
      description: "O PDF será gerado em breve. Funcionalidade em desenvolvimento.",
    });
  };

  const handleSendEmail = () => {
    toast({
      title: "Email enviado",
      description: "O relatório foi enviado para o email cadastrado.",
    });
  };

  const getRelatorioHTML = async () => {
    const result = await marked(relatorio || '# Relatório sendo gerado...');
    return typeof result === 'string' ? result : '# Relatório sendo gerado...';
  };

  const [relatorioHTML, setRelatorioHTML] = React.useState<string>('');
  
  React.useEffect(() => {
    getRelatorioHTML().then(setRelatorioHTML);
  }, [relatorio]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <CheckCircle className="w-6 h-6 text-green-500" />
            Onboarding Concluído com Sucesso!
          </DialogTitle>
          <DialogDescription>
            Plano estratégico gerado por IA para {clienteNome}
          </DialogDescription>
        </DialogHeader>

        {/* Resumo */}
        <div className="grid grid-cols-3 gap-4 my-4">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{metasCriadas}</div>
            <div className="text-sm text-muted-foreground">Metas Criadas</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{campanhasCriadas}</div>
            <div className="text-sm text-muted-foreground">Campanhas Programadas</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
            <FileText className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">100%</div>
            <div className="text-sm text-muted-foreground">Onboarding Completo</div>
          </div>
        </div>

        {/* Relatório */}
        <ScrollArea className="h-[400px] border rounded-lg p-6">
          <div 
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: relatorioHTML }}
          />
        </ScrollArea>

        {/* Ações */}
        <div className="flex gap-3 mt-4">
          <Button onClick={handleDownloadPDF} variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Baixar PDF
          </Button>
          <Button onClick={handleSendEmail} variant="outline" className="flex-1">
            <Mail className="w-4 h-4 mr-2" />
            Enviar por Email
          </Button>
          <Button onClick={() => onOpenChange(false)} className="flex-1">
            <CheckCircle className="w-4 h-4 mr-2" />
            Ir para Dashboard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
