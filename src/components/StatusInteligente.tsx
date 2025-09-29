import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";

interface StatusInteligenteProps {
  status: string;
  dataInicio?: string | null;
  dataPrazo?: string | null;
  className?: string;
}

export function StatusInteligente({ status, dataInicio, dataPrazo, className }: StatusInteligenteProps) {
  const getStatusInfo = () => {
    if (status === 'concluido') {
      return {
        color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
        icon: <CheckCircle className="h-3 w-3" />,
        text: 'Concluído'
      };
    }

    if (!dataPrazo) {
      return {
        color: 'bg-muted text-muted-foreground',
        icon: <Clock className="h-3 w-3" />,
        text: status === 'em_andamento' ? 'Em Andamento' : 'Backlog'
      };
    }

    const hoje = new Date();
    const prazo = new Date(dataPrazo);
    const inicio = dataInicio ? new Date(dataInicio) : hoje;
    
    const tempoTotal = prazo.getTime() - inicio.getTime();
    const tempoRestante = prazo.getTime() - hoje.getTime();
    const percentualRestante = tempoTotal > 0 ? (tempoRestante / tempoTotal) * 100 : 0;

    // Vermelho: vencido ou ≤5% do tempo
    if (tempoRestante <= 0 || percentualRestante <= 5) {
      return {
        color: 'bg-destructive text-destructive-foreground',
        icon: <AlertCircle className="h-3 w-3" />,
        text: tempoRestante <= 0 ? 'Vencido' : 'Crítico'
      };
    }

    // Amarelo: ≤30% do tempo
    if (percentualRestante <= 30) {
      return {
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        icon: <AlertTriangle className="h-3 w-3" />,
        text: 'Atenção'
      };
    }

    // Azul: >30% do tempo
    return {
      color: 'bg-primary/10 text-primary',
      icon: <Clock className="h-3 w-3" />,
      text: 'No Prazo'
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <Badge variant="secondary" className={`flex items-center gap-1 ${statusInfo.color} ${className}`}>
      {statusInfo.icon}
      <span>{statusInfo.text}</span>
    </Badge>
  );
}