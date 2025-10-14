import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAgentesIA } from "@/hooks/useAgentesIA";
import { InfoIcon } from "lucide-react";

interface AgenteSelectorProps {
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  showError?: boolean;
}

export default function AgenteSelector({ selectedIds, onSelect, showError = false }: AgenteSelectorProps) {
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

  // Agrupar agentes por categoria (usando convenção de nomes)
  const agentesPorCategoria = agentes.reduce((acc, agente) => {
    // Detectar categoria baseado no nome
    const nomesLocais = ['Norte Humanizado', 'Cozinha Amapaense', 'Visual First', 'Voz Comunitária', 
                         'Jornalismo Local', 'Varejo Popular Amazônico', 'Saúde Humanizada Amazônia', 
                         'Institucional Público AP', 'Turismo & Amazônia', 'Negócio Local'];
    const cat = nomesLocais.includes(agente.nome) ? 'Agentes Locais BEX' : 'Especialistas Globais';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(agente);
    return acc;
  }, {} as Record<string, typeof agentes>);

  // Ordenar categorias: Agentes Locais BEX primeiro
  const categoriasOrdenadas = Object.keys(agentesPorCategoria).sort((a, b) => {
    if (a === 'Agentes Locais BEX') return -1;
    if (b === 'Agentes Locais BEX') return 1;
    return a.localeCompare(b);
  });

  return (
    <div className={`space-y-8 p-4 rounded-md ${showError && selectedIds.length === 0 ? "ring-2 ring-destructive" : "border"}`}>
      {categoriasOrdenadas.map(categoria => (
        <div key={categoria} className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">
              {categoria === 'Agentes Locais BEX' ? '🌴 Agentes Locais BEX' : '🎬 ' + categoria}
            </h3>
            {selectedIds.length > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                {selectedIds.filter(id => agentesPorCategoria[categoria].some(a => a.id === id)).length}/
                {agentesPorCategoria[categoria].length}
              </span>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Selecione múltiplos agentes para combinar estilos</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {categoria === 'Agentes Locais BEX' && (
            <p className="text-sm text-muted-foreground">
              Perfis criativos focados no contexto regional Amapá e Norte do Brasil
            </p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {agentesPorCategoria[categoria].map((agente) => (
              <TooltipProvider key={agente.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        const newSelection = selectedIds.includes(agente.id)
                          ? selectedIds.filter(id => id !== agente.id)
                          : [...selectedIds, agente.id];
                        onSelect(newSelection);
                      }}
                      className={cn(
                        "h-auto flex-col items-start p-4 rounded-2xl transition-all",
                        selectedIds.includes(agente.id)
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
      ))}
    </div>
  );
}
