import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, FileText, Film, MessageSquare } from 'lucide-react';
import { AIBriefingDialog } from '@/components/AI/AIBriefingDialog';
import { AIScriptGenerator } from '@/components/AI/AIScriptGenerator';
import { AIContentGenerator } from '@/components/AI/AIContentGenerator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface AIQuickActionsProps {
  onActionSelect: (content: string) => void;
}

export function AIQuickActions({ onActionSelect }: AIQuickActionsProps) {
  const [clienteId] = useState<string>(''); // You might need to get this from context
  const [projetoId] = useState<string>(''); // You might need to get this from context

  const handleBriefingGenerated = (briefing: any) => {
    const formatted = `📋 **Briefing Gerado**\n\n**Título:** ${briefing.titulo}\n**Descrição:** ${briefing.descricao}\n**Público-alvo:** ${briefing.publico_alvo}\n**CTA:** ${briefing.call_to_action}`;
    onActionSelect(formatted);
  };

  const handleScriptGenerated = (script: string) => {
    const formatted = `🎬 **Roteiro Gerado**\n\n${script.substring(0, 500)}...\n\n_[Roteiro completo disponível]_`;
    onActionSelect(formatted);
  };

  const handleContentGenerated = (content: string | any) => {
    const formatted = `✨ **Conteúdo Gerado**\n\n${typeof content === 'string' ? content : JSON.stringify(content, null, 2)}`;
    onActionSelect(formatted);
  };

  return (
    <div className="border-b p-2 bg-muted/30">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-muted-foreground">Ações IA:</span>
        
        <div className="flex gap-1">
          <AIBriefingDialog 
            onBriefingGenerated={handleBriefingGenerated}
            trigger={
              <Button variant="ghost" size="sm" className="h-7">
                <FileText className="w-3 h-3 mr-1" />
                Briefing
              </Button>
            }
          />

          {clienteId && projetoId && (
            <AIScriptGenerator
              clienteId={clienteId}
              projetoId={projetoId}
              onScriptGenerated={handleScriptGenerated}
              trigger={
                <Button variant="ghost" size="sm" className="h-7">
                  <Film className="w-3 h-3 mr-1" />
                  Roteiro
                </Button>
              }
            />
          )}

          <AIContentGenerator
            onContentGenerated={handleContentGenerated}
            trigger={
              <Button variant="ghost" size="sm" className="h-7">
                <MessageSquare className="w-3 h-3 mr-1" />
                Conteúdo
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
}
