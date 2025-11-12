import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Copy, Check, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/lib/toast-compat';
import ReactMarkdown from 'react-markdown';

interface AIAssistantMessageProps {
  content: string;
  timestamp: string;
}

export function AIAssistantMessage({ content, timestamp }: AIAssistantMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('Conteúdo copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-3 p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
      <Avatar className="w-8 h-8 border-2 border-primary">
        <AvatarFallback className="bg-primary text-primary-foreground">
          <Sparkles className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Assistente IA</span>
            <span className="text-xs text-muted-foreground">{timestamp}</span>
          </div>
          
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="w-3 h-3 mr-1" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
                Copiar
              </>
            )}
          </Button>
        </div>
        
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
