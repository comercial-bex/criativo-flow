import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles } from 'lucide-react';
import { useAIBriefingGenerator } from '@/hooks/useAIBriefingGenerator';

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
          <Button onClick={handleGenerate} disabled={loading || !prompt.trim()}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Briefing
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
