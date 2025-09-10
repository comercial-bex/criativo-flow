import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusPadrao = 
  | 'rascunho'
  | 'em_revisao' 
  | 'aprovado_cliente'
  | 'em_producao'
  | 'em_aprovacao_final'
  | 'finalizado'
  | 'reprovado';

interface StatusBadgeProps {
  status: StatusPadrao;
  className?: string;
}

const statusConfig = {
  rascunho: {
    label: 'Rascunho',
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-700 hover:bg-gray-100'
  },
  em_revisao: {
    label: 'Em revisão',
    variant: 'secondary' as const,
    className: 'bg-orange-100 text-orange-700 hover:bg-orange-100'
  },
  aprovado_cliente: {
    label: 'Aprovado cliente',
    variant: 'secondary' as const,
    className: 'bg-green-100 text-green-700 hover:bg-green-100'
  },
  em_producao: {
    label: 'Em produção',
    variant: 'secondary' as const,
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-100'
  },
  em_aprovacao_final: {
    label: 'Em aprovação final',
    variant: 'secondary' as const,
    className: 'bg-purple-100 text-purple-700 hover:bg-purple-100'
  },
  finalizado: {
    label: 'Finalizado',
    variant: 'secondary' as const,
    className: 'bg-green-100 text-green-700 hover:bg-green-100'
  },
  reprovado: {
    label: 'Reprovado',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-700 hover:bg-red-100'
  }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}