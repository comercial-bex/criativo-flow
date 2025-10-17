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
  tipoTarefa?: string;
}

export function AIBriefingGenerator({ onGenerate, clienteId, planejamentoId, tipoTarefa }: AIBriefingGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const gerarPromptContextual = (tipo: string | undefined, promptOriginal: string) => {
    const contextos: Record<string, string> = {
      'criativo_card': `
Você está criando um briefing para um POST CARD de Instagram/Facebook.
Especificações técnicas:
- Formato: Quadrado 1080x1080px
- Texto máximo: 3-4 linhas
- CTA visível e destacado
- Marca/logo presente
${promptOriginal}`,
      'criativo_carrossel': `
Você está criando um briefing para um CARROSSEL de Instagram.
Especificações técnicas:
- Formato: 2 a 10 cards (recomendado 5-7)
- Cada card: 1080x1080px
- Narrativa sequencial
- Último card com CTA forte
${promptOriginal}`,
      'criativo_cartela': `
Você está criando um briefing para uma CARTELA de imagens.
Especificações técnicas:
- Múltiplas imagens organizadas
- Layout grid ou mosaico
- Identidade visual coesa
${promptOriginal}`,
      'roteiro_reels': `
Você está criando um briefing para um REELS do Instagram.
Especificações técnicas:
- Duração: 15-60 segundos
- Formato: 9:16 (vertical)
- Hook nos primeiros 3 segundos
- Legendas obrigatórias
- Trilha sonora tendência
${promptOriginal}`,
      'reels_instagram': `
Você está criando um briefing para um REELS do Instagram.
Especificações técnicas:
- Duração: 15-60 segundos
- Formato: 9:16 (vertical)
- Hook nos primeiros 3 segundos
- Legendas obrigatórias
- Trilha sonora tendência
${promptOriginal}`,
      'criativo_vt': `
Você está criando um briefing para um VT (Vídeo Comercial).
Especificações técnicas:
- Duração: 30-60 segundos
- Formato: 16:9 (horizontal) ou 9:16 (vertical para social)
- Roteiro com início/meio/fim
- Locução profissional
- Animações/motion graphics
${promptOriginal}`,
      'stories_interativo': `
Você está criando um briefing para um STORIES INTERATIVO do Instagram.
Especificações técnicas:
- Duração: 7-15 segundos
- Formato: 9:16 (vertical)
- Possibilidade de swipe up/link
- Elementos interativos (enquetes, caixas de perguntas)
${promptOriginal}`,
      'feed_post': `
Você está criando um briefing para um POST DE FEED.
Especificações técnicas:
- Formato: Quadrado ou retrato
- Imagem de alta qualidade
- Legenda engajadora
- Hashtags estratégicas
${promptOriginal}`
    };
    
    return tipo && contextos[tipo] ? contextos[tipo] : promptOriginal;
  };
  
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
      
      // Gerar prompt contextual baseado no tipo de tarefa
      const promptContextual = gerarPromptContextual(tipoTarefa, prompt);

      // Chamar edge function com IA
      const { data, error } = await supabase.functions.invoke('generate-task-briefing', {
        body: { 
          prompt: promptContextual,
          tipoTarefa,
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
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h4 className="font-semibold text-base text-foreground flex items-center gap-2">
                Gerar Briefing com IA ✨
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Descreva o que você precisa e a IA criará um briefing completo baseado no contexto do cliente
              </p>
            </div>
            
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Post de promoção para Black Friday com foco em vendas diretas"
              rows={2}
              className="bg-background border-primary/20 focus:border-primary"
              disabled={loading}
            />
            
            <Button 
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              size="sm"
              className="w-full"
              variant="default"
              type="button"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando briefing com IA...
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
      </div>
    </Card>
  );
}
