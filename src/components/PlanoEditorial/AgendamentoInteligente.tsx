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

const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export const AgendamentoInteligente = ({
  isOpen,
  onClose,
  post,
  clienteId,
  onAplicarHorario
}: AgendamentoInteligenteProps) => {
  const { data: horarios, isLoading } = useAgendamentoInteligente(post.tipo_conteudo);

  const handleAplicar = (horario: any) => {
    const dataAtual = new Date(post.data_postagem);
    const novaData = new Date(dataAtual);
    novaData.setHours(horario.hora, 0, 0, 0);
    
    onAplicarHorario(novaData.toISOString());
    toast.success(`✅ Horário definido para ${horario.hora}:00 - Score: ${horario.score_performance.toFixed(1)}%`);
    onClose();
  };

  const melhorHorario = horarios && horarios.length > 0 ? horarios[0] : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Agendamento Inteligente com ML
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Sugestões baseadas em análise preditiva de performance
          </p>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary/50 animate-spin" />
            <p className="text-muted-foreground">Analisando dados históricos...</p>
          </div>
        ) : !horarios || horarios.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground mb-2">
              Ainda não há dados suficientes para análise preditiva
            </p>
            <p className="text-sm text-muted-foreground">
              Continue publicando para gerar recomendações personalizadas
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Melhor Horário Geral */}
            {melhorHorario && (
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-6 w-6 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">🏆 Melhor horário</p>
                        <p className="text-2xl font-bold text-primary">
                          {DIAS_SEMANA[melhorHorario.dia_semana]} às {melhorHorario.hora}:00
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Score de Performance: {melhorHorario.score_performance.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <Button onClick={() => handleAplicar(melhorHorario)} size="sm">
                      Aplicar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Horários Recomendados */}
            <div className="space-y-3">
              <h4 className="font-semibold">Top 5 Horários Recomendados:</h4>
              {horarios.slice(0, 5).map((horario, idx) => (
                <Card 
                  key={`${horario.dia_semana}-${horario.hora}`} 
                  className="hover:border-primary transition-all cursor-pointer"
                  onClick={() => handleAplicar(horario)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Clock className="h-5 w-5 text-primary" />
                          <span className="text-lg font-semibold">
                            {DIAS_SEMANA[horario.dia_semana]} às {horario.hora}:00
                          </span>
                          <Badge variant={idx === 0 ? 'default' : 'secondary'}>
                            #{idx + 1}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>📊 Performance: {horario.score_performance.toFixed(1)}%</span>
                          <span>❤️ Engajamento: {horario.taxa_engajamento_media.toFixed(2)}%</span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant={idx === 0 ? 'default' : 'outline'}
                      >
                        Aplicar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Informações Adicionais */}
            <div className="bg-muted/30 p-4 rounded-lg text-sm text-muted-foreground">
              <p className="flex items-center gap-2 mb-2">
                <span className="text-primary">ℹ️</span>
                <strong>Como funciona:</strong>
              </p>
              <ul className="space-y-1 ml-6 list-disc">
                <li>Análise baseada em posts históricos similares</li>
                <li>Considera taxa de engajamento e performance geral</li>
                <li>Atualizado em tempo real com novos dados</li>
              </ul>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
