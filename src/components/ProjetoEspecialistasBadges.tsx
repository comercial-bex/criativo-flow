import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Especialista {
  id: string;
  nome: string;
  especialidade: string;
  is_gerente: boolean;
}

interface ProjetoEspecialistasBadgesProps {
  projetoId: string | null;
  size?: "sm" | "md";
}

export function ProjetoEspecialistasBadges({ projetoId, size = "sm" }: ProjetoEspecialistasBadgesProps) {
  const [especialistas, setEspecialistas] = useState<Especialista[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projetoId) {
      fetchEspecialistas();
    } else {
      setLoading(false);
    }
  }, [projetoId]);

  const fetchEspecialistas = async () => {
    if (!projetoId) return;

    try {
      const { data, error } = await supabase
        .from('projeto_especialistas')
        .select(`
          especialista_id,
          especialidade,
          is_gerente,
          profiles:especialista_id (
            id,
            nome
          )
        `)
        .eq('projeto_id', projetoId);

      if (error) throw error;

      const mapped = (data || []).map((item: any) => ({
        id: item.profiles?.id || '',
        nome: item.profiles?.nome || 'Desconhecido',
        especialidade: item.especialidade,
        is_gerente: item.is_gerente
      }));

      setEspecialistas(mapped);
    } catch (error) {
      console.error('Erro ao carregar especialistas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEspecialidadeLabel = (esp: string) => {
    const labels: Record<string, string> = {
      grs: 'GRS',
      design: 'Designer',
      designer: 'Designer',
      filmmaker: 'Filmmaker',
      videomaker: 'Filmmaker',
      audiovisual: 'Filmmaker'
    };
    return labels[esp] || esp;
  };

  const getEspecialidadeColor = (esp: string) => {
    const colors: Record<string, string> = {
      grs: 'bg-blue-500',
      design: 'bg-purple-500',
      designer: 'bg-purple-500',
      filmmaker: 'bg-red-500',
      videomaker: 'bg-red-500',
      audiovisual: 'bg-red-500'
    };
    return colors[esp] || 'bg-gray-500';
  };

  if (loading) {
    return <Badge variant="outline" className="text-xs">Carregando...</Badge>;
  }

  if (!projetoId || especialistas.length === 0) {
    return (
      <Badge variant="outline" className="text-xs">
        <Users className="h-3 w-3 mr-1" />
        Sem equipe
      </Badge>
    );
  }

  const avatarSize = size === "sm" ? "h-6 w-6" : "h-8 w-8";
  const iconSize = size === "sm" ? "h-2 w-2" : "h-3 w-3";

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {especialistas.map((esp) => (
          <Tooltip key={esp.id}>
            <TooltipTrigger asChild>
              <div className="relative">
                <Avatar className={avatarSize}>
                  <AvatarFallback 
                    className={`text-xs text-white ${getEspecialidadeColor(esp.especialidade)}`}
                  >
                    {esp.nome.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {esp.is_gerente && (
                  <Star 
                    className={`absolute -top-1 -right-1 ${iconSize} fill-yellow-500 text-yellow-500`}
                  />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">
                <p className="font-semibold">{esp.nome}</p>
                <p className="text-xs text-muted-foreground">
                  {getEspecialidadeLabel(esp.especialidade)}
                  {esp.is_gerente && " (Gerente)"}
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
