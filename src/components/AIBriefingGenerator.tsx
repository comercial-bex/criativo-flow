import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Wand2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIBriefingGeneratorProps {
  onGenerate: (briefing: {
    titulo: string;
    descricao: string;
    objetivo_postagem: string;
    publico_alvo: string;
    contexto_estrategico: string;
    formato_postagem: string;
    call_to_action: string;
  }) => void;
  clienteId?: string;
  planejamentoId?: string;
}

export function AIBriefingGenerator({ onGenerate, clienteId, planejamentoId }: AIBriefingGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt necessário",
        description: "Digite o que você precisa para gerar o briefing.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Buscar contexto do cliente/planejamento
      let contexto: any = {
        cliente: null,
        onboarding: null,
        planejamento: null
      };

      if (clienteId) {
        const { data: cliente } = await supabase
          .from('clientes')
          .select('*')
          .eq('id', clienteId)
          .single();
        
        const { data: onboarding } = await supabase
          .from('cliente_onboarding')
          .select('*')
          .eq('cliente_id', clienteId)
          .single();

        contexto.cliente = cliente;
        contexto.onboarding = onboarding;
      }

      if (planejamentoId) {
        const { data: planejamento } = await supabase
          .from('planejamentos')
          .select('*')
          .eq('id', planejamentoId)
          .single();
        
        contexto.planejamento = planejamento;
      }
      
      // Chamar edge function com IA
      const { data, error } = await supabase.functions.invoke('generate-task-briefing', {
        body: { 
          prompt, 
          contexto
        }
      });

      if (error) throw error;
      
      onGenerate(data.briefing);
      
      toast({
        title: "✨ Briefing gerado com IA!",
        description: "Revise e ajuste conforme necessário.",
      });

      setPrompt(''); // Limpar prompt após sucesso
      
    } catch (error: any) {
      console.error('Erro ao gerar briefing:', error);
      toast({
        title: "Erro na geração",
        description: error?.message || "Tente novamente ou preencha manualmente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      <div className="flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div>
            <h4 className="font-semibold text-sm text-purple-900">
              Gerar Briefing com IA ✨
            </h4>
            <p className="text-xs text-purple-700 mt-1">
              Descreva o que você precisa e a IA criará um briefing completo baseado no contexto do cliente
            </p>
          </div>
          
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Post de promoção para Black Friday com foco em vendas diretas"
            rows={2}
            className="bg-white"
            disabled={loading}
          />
          
          <Button 
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            size="sm"
            className="w-full"
            variant="secondary"
            type="button"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando briefing...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Gerar Briefing Automaticamente
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
