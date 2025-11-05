import { useState, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Lightbulb, Sparkles, Loader2 } from 'lucide-react';
import { StepProps } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { smartToast } from '@/lib/smart-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function StepSwot({ formData, setFormData }: StepProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Calcular qualidade do preenchimento
  const qualityScore = useMemo(() => {
    let score = 0;
    const fields = [formData.forcas, formData.fraquezas, formData.oportunidades, formData.ameacas];
    
    fields.forEach(field => {
      if (!field) return;
      const length = field.trim().length;
      if (length > 200) score += 25; // Bem preenchido
      else if (length > 100) score += 15; // Razoável
      else if (length > 30) score += 10; // Básico
    });
    
    return Math.min(score, 100);
  }, [formData.forcas, formData.fraquezas, formData.oportunidades, formData.ameacas]);

  const qualityLabel = useMemo(() => {
    if (qualityScore >= 80) return { text: 'Excelente', color: 'text-green-600' };
    if (qualityScore >= 60) return { text: 'Bom', color: 'text-blue-600' };
    if (qualityScore >= 40) return { text: 'Razoável', color: 'text-orange-600' };
    return { text: 'Insuficiente', color: 'text-red-600' };
  }, [qualityScore]);

  const handleGenerateSwot = async () => {
    if (!formData.nome_empresa) {
      smartToast.error('Erro', 'Complete os dados básicos da empresa antes de gerar a análise SWOT');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Buscar o cliente_id baseado no nome da empresa (assumindo que está no contexto)
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('Usuário não autenticado');
      }

      // Primeiro, precisamos criar/atualizar o registro de onboarding para ter o cliente_id
      // Por enquanto, vamos simular - em produção, você passaria o cliente_id como prop
      const { data: clientes, error: clientesError } = await supabase
        .from('clientes')
        .select('id')
        .limit(1)
        .single();

      if (clientesError) throw clientesError;

      const { data, error } = await supabase.functions.invoke('analyze-swot', {
        body: { clienteId: clientes.id }
      });

      if (error) throw error;

      if (data.success && data.swot) {
        // Auto-preencher campos com análise da IA
        setFormData({
          ...formData,
          forcas: data.swot.forcas.join('\n• '),
          fraquezas: data.swot.fraquezas.join('\n• '),
          oportunidades: data.swot.oportunidades.join('\n• '),
          ameacas: data.swot.ameacas.join('\n• '),
        });

        smartToast.success('Análise SWOT gerada!', 'Você pode editar os campos conforme necessário');
      } else {
        throw new Error('Resposta inválida da IA');
      }
    } catch (error) {
      console.error('Erro ao gerar SWOT:', error);
      smartToast.error('Erro ao gerar análise', 'Tente novamente ou preencha manualmente');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">📊 Análise SWOT</h3>
            <p className="text-sm text-muted-foreground">
              Avalie os pontos fortes, fracos, oportunidades e ameaças do seu negócio
            </p>
          </div>
          <Button 
            onClick={handleGenerateSwot} 
            disabled={isGenerating || !formData.nome_empresa}
            variant="outline"
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Gerar com IA
              </>
            )}
          </Button>
        </div>

        {/* Indicador de Qualidade */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Qualidade do preenchimento</span>
            <span className={`font-semibold ${qualityLabel.color}`}>{qualityLabel.text} ({qualityScore}%)</span>
          </div>
          <Progress value={qualityScore} className="h-2" />
        </div>
      </div>

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription className="text-xs">
          <strong>Dica:</strong> Forças e Fraquezas são fatores internos (dentro da empresa). 
          Oportunidades e Ameaças são fatores externos (mercado, economia, concorrência).
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="forcas" className="flex items-center gap-2">
              <span className="text-green-600">✅</span> Forças (Strengths)
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Lightbulb className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">
                  <strong>Fatores internos positivos:</strong> Vantagens competitivas, recursos únicos, 
                  expertise da equipe, infraestrutura, reputação, relacionamento com clientes.
                </p>
                <p className="text-xs italic text-primary/80 mt-1">
                  💡 Ex: "Equipe com 10+ anos de experiência", "Localização estratégica no centro", 
                  "Atendimento personalizado reconhecido por clientes"
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Textarea
            id="forcas"
            value={formData.forcas}
            onChange={(e) => setFormData({ ...formData, forcas: e.target.value })}
            placeholder="Ex: Equipe experiente, localização privilegiada, qualidade reconhecida..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="fraquezas" className="flex items-center gap-2">
              <span className="text-red-600">⚠️</span> Fraquezas (Weaknesses)
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Lightbulb className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">
                  <strong>Fatores internos negativos:</strong> Limitações operacionais, falta de recursos, 
                  processos ineficientes, gaps de conhecimento, dependências.
                </p>
                <p className="text-xs italic text-primary/80 mt-1">
                  💡 Ex: "Processo de vendas 100% manual", "Baixo orçamento para marketing", 
                  "Presença digital limitada"
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Textarea
            id="fraquezas"
            value={formData.fraquezas}
            onChange={(e) => setFormData({ ...formData, fraquezas: e.target.value })}
            placeholder="Ex: Poucos recursos para marketing, processo manual de vendas..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="oportunidades" className="flex items-center gap-2">
              <span className="text-blue-600">🌟</span> Oportunidades (Opportunities)
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Lightbulb className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">
                  <strong>Fatores externos positivos:</strong> Tendências de mercado, mudanças no comportamento 
                  do consumidor, novos segmentos, tecnologias emergentes, gaps de concorrentes.
                </p>
                <p className="text-xs italic text-primary/80 mt-1">
                  💡 Ex: "Crescimento de 40% no e-commerce local", "Público procurando soluções sustentáveis", 
                  "Concorrentes com atendimento fraco"
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Textarea
            id="oportunidades"
            value={formData.oportunidades}
            onChange={(e) => setFormData({ ...formData, oportunidades: e.target.value })}
            placeholder="Ex: Crescimento do e-commerce, tendência de consumo sustentável..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="ameacas" className="flex items-center gap-2">
              <span className="text-orange-600">⚡</span> Ameaças (Threats)
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Lightbulb className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">
                  <strong>Fatores externos negativos:</strong> Concorrência agressiva, mudanças regulatórias, 
                  crises econômicas, mudanças de hábitos, riscos tecnológicos.
                </p>
                <p className="text-xs italic text-primary/80 mt-1">
                  💡 Ex: "Entrada de grandes marcas no mercado local", "Crise econômica afetando consumo", 
                  "Mudança de preferência do público para digital"
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Textarea
            id="ameacas"
            value={formData.ameacas}
            onChange={(e) => setFormData({ ...formData, ameacas: e.target.value })}
            placeholder="Ex: Concorrentes com preços mais baixos, crise econômica..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
