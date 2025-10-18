import { useEspecialistaData } from "@/hooks/useEspecialistaData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X, Eye } from "lucide-react";

interface EspecialistaViewHeaderProps {
  especialistaId: string;
  onClose: () => void;
}

export function EspecialistaViewHeader({ especialistaId, onClose }: EspecialistaViewHeaderProps) {
  const { data: especialista } = useEspecialistaData(especialistaId);

  if (!especialista) return null;

  const getInitials = (nome: string) => {
    if (!nome) return '?';
    const parts = nome.split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getEspecialidadeColor = (especialidade: string) => {
    const colors: Record<string, string> = {
      'design': 'border-purple-500 text-purple-500',
      'audiovisual': 'border-blue-500 text-blue-500',
      'grs': 'border-green-500 text-green-500',
      'admin': 'border-orange-500 text-orange-500'
    };
    return colors[especialidade] || 'border-gray-500 text-gray-500';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="text-lg">
            {getInitials(especialista.nome)}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <span className="font-semibold">Visualizando Dashboard de:</span>
            <span className="text-foreground">{especialista.nome}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className={getEspecialidadeColor(especialista.papeis?.[0] || 'cliente')}>
              {especialista.papeis?.[0] || 'cliente'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Modo somente leitura
            </span>
          </div>
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={onClose}>
        <X className="h-4 w-4 mr-2" />
        Voltar ao Painel GRS
      </Button>
    </div>
  );
}
