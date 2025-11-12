import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Sparkles, TrendingUp, Loader2 } from 'lucide-react';
import { useAgendamentoInteligente } from '@/hooks/useAgendamentoInteligente';
import { toast } from '@/lib/toast-compat';

interface AgendamentoInteligenteProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
  clienteId: string;
  onAplicarHorario: (novaData: string) => void;
}

export const AgendamentoInteligente = ({
  isOpen,
  onClose,
  post,
  clienteId,
  onAplicarHorario
}: AgendamentoInteligenteProps) => {
  const { loading, sugestoes, sugerirHorarios, aplicarHorario } = useAgendamentoInteligente();
  const [gerando, setGerando] = useState(false);

  const handleGerarSugestoes = async () => {
    setGerando(true);
    await sugerirHorarios({
      clienteId,
      tipo_conteudo: post.tipo_conteudo || 'informar',
      data_postagem: post.data_postagem,
      publico_alvo: post.persona_alvo
    });
    setGerando(false);
  };

  const handleAplicar = (horario: any) => {
    const novaData = aplicarHorario(post.data_postagem, horario);
    onAplicarHorario(novaData);
    toast.success(`Horário definido para ${horario.hora}:${String(horario.minuto).padStart(2, '0')}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Agendamento Inteligente
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Sugestões baseadas em analytics e melhores práticas de {post.tipo_conteudo}
          </p>
        </DialogHeader>

        {!sugestoes ? (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary/50" />
            <p className="text-muted-foreground mb-6">
              Gere sugestões de horários otimizados para este post
            </p>
            <Button 
              onClick={handleGerarSugestoes} 
              disabled={gerando}
              className="gap-2"
            >
              {gerando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Gerar Sugestões com IA
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Melhor Horário Geral */}
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Melhor horário geral</p>
                    <p className="text-2xl font-bold text-primary">
                      {sugestoes.melhor_horario_geral}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Horários Sugeridos */}
            <div className="space-y-3">
              <h4 className="font-semibold">Horários Recomendados:</h4>
              {sugestoes.horarios_sugeridos.map((horario, idx) => (
                <Card key={idx} className="hover:border-primary transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Clock className="h-5 w-5 text-primary" />
                          <span className="text-xl font-bold">
                            {String(horario.hora).padStart(2, '0')}:{String(horario.minuto).padStart(2, '0')}
                          </span>
                          <Badge variant={idx === 0 ? 'default' : 'secondary'}>
                            Score: {horario.score}%
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {horario.justificativa}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleAplicar(horario)}
                        variant={idx === 0 ? 'default' : 'outline'}
                      >
                        Aplicar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recomendações */}
            {sugestoes.recomendacoes && sugestoes.recomendacoes.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Recomendações Estratégicas:</h4>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  {sugestoes.recomendacoes.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <p className="text-sm">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            {sugestoes.metadata && (
              <div className="text-xs text-muted-foreground border-t pt-3">
                <p>
                  {sugestoes.metadata.baseado_em_analytics 
                    ? `✅ Baseado em ${sugestoes.metadata.total_posts_historicos} posts anteriores` 
                    : '📊 Baseado em melhores práticas gerais'}
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
