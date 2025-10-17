import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { useAIContentGenerator } from '@/hooks/useAIContentGenerator';
import { toast } from 'sonner';

type ContentType = 'post' | 'legenda' | 'hashtags' | 'swot' | 'calendario';

interface AIContentGeneratorProps {
  onContentGenerated?: (content: string | any, type: ContentType) => void;
  trigger?: React.ReactNode;
}

export function AIContentGenerator({ onContentGenerated, trigger }: AIContentGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState<ContentType>('post');
  const [copied, setCopied] = useState(false);
  
  const { generateContent, content, loading } = useAIContentGenerator();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    const result = await generateContent(prompt, contentType);
    if (result && onContentGenerated) {
      onContentGenerated(result, contentType);
    }
  };

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(typeof content === 'string' ? content : JSON.stringify(content, null, 2));
      setCopied(true);
      toast.success('Conteúdo copiado!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const contentTypeLabels = {
    post: 'Post Completo',
    legenda: 'Legenda',
    hashtags: 'Hashtags',
    swot: 'Análise SWOT',
    calendario: 'Calendário Editorial'
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Sparkles className="w-4 h-4 mr-2" />
            Gerar Conteúdo com IA
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Gerar Conteúdo com IA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="contentType">Tipo de Conteúdo</Label>
            <Select value={contentType} onValueChange={(v) => setContentType(v as ContentType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(contentTypeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Descreva o que você precisa</Label>
            <Textarea
              id="prompt"
              placeholder={`Ex: Criar ${contentTypeLabels[contentType].toLowerCase()} sobre...`}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>

          {content && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Conteúdo Gerado</Label>
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
              <div className="p-4 rounded-lg bg-muted max-h-[300px] overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Fechar
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
                Gerar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
