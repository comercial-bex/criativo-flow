import { useEspecialistasGRS } from "@/hooks/useEspecialistasGRS";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface EspecialistaSelectorProps {
  onSelect: (especialistaId: string | null) => void;
  selectedId: string | null;
}

export function EspecialistaSelector({ onSelect, selectedId }: EspecialistaSelectorProps) {
  const { data: especialistas, isLoading } = useEspecialistasGRS();

  const getInitials = (nome: string) => {
    if (!nome) return '?';
    const parts = nome.split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getEspecialidadeColor = (especialidade: string) => {
    const colors: Record<string, string> = {
      'design': 'bg-purple-500',
      'audiovisual': 'bg-blue-500',
      'grs': 'bg-green-500',
      'admin': 'bg-orange-500'
    };
    return colors[especialidade] || 'bg-gray-500';
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Carregando...</div>;
  }

  return (
    <Select value={selectedId || "none"} onValueChange={(value) => onSelect(value === "none" ? null : value)}>
      <SelectTrigger className="w-full sm:w-[300px]">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <SelectValue placeholder="Visualizar especialista..." />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">
          <div className="flex items-center gap-2">
            <span>👁️ Voltar ao Painel GRS</span>
          </div>
        </SelectItem>
        
        {(especialistas || []).map((especialista) => (
          <SelectItem key={especialista.id} value={especialista.id}>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className={`text-xs ${getEspecialidadeColor(especialista.especialidade)}`}>
                  {getInitials(especialista.nome)}
                </AvatarFallback>
              </Avatar>
              <span>{especialista.nome}</span>
              <Badge variant="outline" className="text-xs">
                {especialista.especialidade}
              </Badge>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
