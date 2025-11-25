import { AdaptiveBadge } from "@/components/ui/adaptive-badge";

interface StatusBadgeEspecialistaProps {
  status: 'pendente_aprovacao' | 'aprovado' | 'rejeitado' | 'suspenso';
}

const statusConfig = {
  pendente_aprovacao: {
    label: 'Pendente',
    variant: 'pending' as const,
  },
  aprovado: {
    label: 'Aprovado',
    variant: 'success' as const,
  },
  rejeitado: {
    label: 'Rejeitado',
    variant: 'error' as const,
  },
  suspenso: {
    label: 'Suspenso',
    variant: 'warning' as const,
  }
};

export function StatusBadgeEspecialista({ status }: StatusBadgeEspecialistaProps) {
  const config = statusConfig[status];
  
  return (
    <AdaptiveBadge variant={config.variant}>
      {config.label}
    </AdaptiveBadge>
  );
}