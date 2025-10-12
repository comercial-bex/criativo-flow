import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAgentesIA } from "@/hooks/useAgentesIA";
import { InfoIcon } from "lucide-react";

interface AgenteSelectorProps {
  selectedId?: string;
  onSelect: (id: string) => void;
}

export default function AgenteSelector({ selectedId, onSelect }: AgenteSelectorProps) {
  const { data: agentes = [], isLoading } = useAgentesIA();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-muted/50 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">🎬 Especialistas de Referência</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Escolha um perfil criativo para influenciar o estilo do roteiro</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {agentes.map((agente) => (
          <TooltipProvider key={agente.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onSelect(agente.id)}
                  className={cn(
                    "h-auto flex-col items-start p-4 rounded-2xl transition-all",
                    selectedId === agente.id
                      ? "bg-[hsl(var(--primary)/.2)] border-primary text-primary font-semibold"
                      : "hover:bg-muted/50"
                  )}
                >
                  <span className="text-2xl mb-1">{agente.icone}</span>
                  <span className="text-sm font-medium">{agente.nome}</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {agente.especialidade}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="font-semibold">{agente.especialidade}</p>
                <p className="text-sm text-muted-foreground mt-1">{agente.descricao}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
}
