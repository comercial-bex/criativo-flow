import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useProdutividadePomodoro } from '@/hooks/useProdutividadePomodoro';

interface PomodoroTimerProps {
  setor: 'grs' | 'design' | 'audiovisual';
}

export function PomodoroTimer({ setor }: PomodoroTimerProps) {
  const { pomodoroAtivo, iniciarPomodoro, finalizarPomodoro, cancelarPomodoro } = useProdutividadePomodoro(setor);
  const [tempoRestante, setTempoRestante] = useState(25 * 60);
  const [rodando, setRodando] = useState(false);

  useEffect(() => {
    if (pomodoroAtivo) {
      setRodando(true);
      // Calcular tempo restante baseado no início
      const iniciado = new Date(pomodoroAtivo.inicio).getTime();
      const agora = new Date().getTime();
      const decorrido = Math.floor((agora - iniciado) / 1000);
      const restante = Math.max(0, (25 * 60) - decorrido);
      setTempoRestante(restante);
    } else {
      setRodando(false);
      setTempoRestante(25 * 60);
    }
  }, [pomodoroAtivo]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (rodando && tempoRestante > 0) {
      interval = setInterval(() => {
        setTempoRestante(prev => {
          if (prev <= 1) {
            if (pomodoroAtivo) {
              finalizarPomodoro(pomodoroAtivo.id);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [rodando, tempoRestante, pomodoroAtivo]);

  const handleIniciar = async () => {
    const pomodoro = await iniciarPomodoro('foco');
    if (pomodoro) {
      setTempoRestante(25 * 60);
      setRodando(true);
    }
  };

  const handlePausar = () => {
    setRodando(false);
  };

  const handleReiniciar = () => {
    if (pomodoroAtivo) {
      cancelarPomodoro(pomodoroAtivo.id);
    }
    setTempoRestante(25 * 60);
    setRodando(false);
  };

  const formatarTempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progresso = ((25 * 60 - tempoRestante) / (25 * 60)) * 100;

  return (
    <Card className="bg-gradient-to-br from-[#262640] to-[#1a1a2e]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🍅 Pomodoro Timer
          {pomodoroAtivo && <Badge variant="default">Ativo</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-5xl font-bold text-white mb-4">
            {formatarTempo(tempoRestante)}
          </div>
          
          <div className="w-full bg-muted rounded-full h-2 mb-4">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-1000"
              style={{ width: `${progresso}%` }}
            />
          </div>

          <div className="flex gap-2 justify-center">
            {!rodando && !pomodoroAtivo && (
              <Button onClick={handleIniciar} size="lg" className="gap-2">
                <Play className="h-5 w-5" />
                Iniciar
              </Button>
            )}
            
            {rodando && (
              <Button onClick={handlePausar} variant="secondary" size="lg" className="gap-2">
                <Pause className="h-5 w-5" />
                Pausar
              </Button>
            )}
            
            {pomodoroAtivo && (
              <Button onClick={handleReiniciar} variant="outline" size="lg" className="gap-2">
                <RotateCcw className="h-5 w-5" />
                Reiniciar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
