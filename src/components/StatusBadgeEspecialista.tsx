import { Badge } from "@/components/ui/badge";

interface StatusBadgeEspecialistaProps {
  status: 'pendente_aprovacao' | 'aprovado' | 'rejeitado' | 'suspenso';
}

const statusConfig = {
  pendente_aprovacao: {
    label: 'Pendente',
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
  },
  aprovado: {
    label: 'Aprovado',
    className: 'bg-green-100 text-green-800 hover:bg-green-100'
  },
  rejeitado: {
    label: 'Rejeitado',
    className: 'bg-red-100 text-red-800 hover:bg-red-100'
  },
  suspenso: {
    label: 'Suspenso',
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-100'
  }
};

export function StatusBadgeEspecialista({ status }: StatusBadgeEspecialistaProps) {
  const config = statusConfig[status];
  
  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
}