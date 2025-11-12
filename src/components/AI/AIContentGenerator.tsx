import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { useAIContentGenerator } from '@/hooks/useAIContentGenerator';
import { toast } from '@/lib/toast-compat';

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
  const [selectedModel, setSelectedModel] = useState<'gemini' | 'gpt4'>('gemini');
  
  const { generateContent, content, loading } = useAIContentGenerator();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    const result = await generateContent(prompt, contentType, selectedModel);
    if (result && onContentGenerated) {
      onContentGenerated(result, contentType);
      toast.success('✨ Conteúdo gerado e inserido na mensagem!', {
        description: 'Você pode editá-lo antes de enviar.'
      });
      setOpen(false);
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
          <DialogDescription>
            Escolha o tipo de conteúdo e descreva o que você precisa. 
            O conteúdo será gerado com IA e inserido na mensagem do chat.
          </DialogDescription>
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
            <Label>Modelo de IA</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={selectedModel === 'gemini' ? 'default' : 'outline'}
                onClick={() => setSelectedModel('gemini')}
                size="sm"
                className="flex-1"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Lovable AI
              </Button>
              <Button
                type="button"
                variant={selectedModel === 'gpt4' ? 'default' : 'outline'}
                onClick={() => setSelectedModel('gpt4')}
                size="sm"
                className="flex-1"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                GPT-4.1
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedModel === 'gemini' 
                ? '⚡ Mais rápido e econômico (padrão)'
                : '🎯 Mais criativo (requer API key)'}
            </p>
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
                Gerar Conteúdo
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
