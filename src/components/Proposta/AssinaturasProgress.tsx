import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, XCircle, Mail } from "lucide-react";

interface AssinaturasProgressProps {
  assinaturas: any[];
}

export function AssinaturasProgress({ assinaturas }: AssinaturasProgressProps) {
  const total = assinaturas.length;
  const assinadas = assinaturas.filter(a => a.status === 'assinado').length;
  const pendentes = assinaturas.filter(a => a.status === 'pendente').length;
  const enviadas = assinaturas.filter(a => a.status === 'enviado').length;
  const recusadas = assinaturas.filter(a => a.status === 'recusado').length;
  
  const progresso = total > 0 ? (assinadas / total) * 100 : 0;
  
  if (total === 0) return null;
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Assinaturas</span>
        <span className="text-muted-foreground">{assinadas}/{total}</span>
      </div>
      
      <Progress value={progresso} className="h-2" />
      
      <div className="flex gap-2 flex-wrap">
        {assinadas > 0 && (
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {assinadas} Assinada{assinadas !== 1 ? 's' : ''}
          </Badge>
        )}
        {enviadas > 0 && (
          <Badge variant="outline" className="bg-info/10 text-info border-info/20">
            <Mail className="w-3 h-3 mr-1" />
            {enviadas} Enviada{enviadas !== 1 ? 's' : ''}
          </Badge>
        )}
        {pendentes > 0 && (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
            <Clock className="w-3 h-3 mr-1" />
            {pendentes} Pendente{pendentes !== 1 ? 's' : ''}
          </Badge>
        )}
        {recusadas > 0 && (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
            <XCircle className="w-3 h-3 mr-1" />
            {recusadas} Recusada{recusadas !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>
    </div>
  );
}
