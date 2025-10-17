import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles } from 'lucide-react';
import { useAIBriefingGenerator } from '@/hooks/useAIBriefingGenerator';
import { toast } from 'sonner';

interface AIBriefingDialogProps {
  onBriefingGenerated?: (briefing: any) => void;
  context?: any;
  trigger?: React.ReactNode;
}

export function AIBriefingDialog({ onBriefingGenerated, context, trigger }: AIBriefingDialogProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const { generateBriefing, briefing, loading } = useAIBriefingGenerator();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    const result = await generateBriefing(prompt, context || {});
    if (result && onBriefingGenerated) {
      onBriefingGenerated(result);
      toast.success('✨ Briefing gerado e inserido na mensagem!', {
        description: 'Você pode editá-lo antes de enviar.'
      });
      setOpen(false);
      setPrompt('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Sparkles className="w-4 h-4 mr-2" />
            Gerar com IA
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Gerar Briefing com IA
          </DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para gerar um briefing personalizado com inteligência artificial. 
            O resultado será inserido automaticamente na mensagem do chat.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Descreva o que você precisa</Label>
            <Textarea
              id="prompt"
              placeholder="Ex: Criar um post para Instagram sobre lançamento de produto, público-alvo jovem adulto, tom descontraído..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>

          {briefing && (
            <div className="p-4 rounded-lg bg-muted space-y-2">
              <h4 className="font-semibold">{briefing.titulo}</h4>
              <p className="text-sm text-muted-foreground">{briefing.descricao}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleGenerate} 
            disabled={loading || !prompt.trim()}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Gerando com IA...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Gerar Briefing
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
