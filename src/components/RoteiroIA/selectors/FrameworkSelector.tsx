import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useFrameworks } from "@/hooks/useFrameworks";

interface FrameworkSelectorProps {
  selectedIds: string[];
  onSelect: (id: string) => void;
  multiSelect?: boolean;
}

export default function FrameworkSelector({ 
  selectedIds, 
  onSelect, 
  multiSelect = false 
}: FrameworkSelectorProps) {
  const { data: frameworks = [], isLoading } = useFrameworks();

  const frameworksPorCategoria = frameworks.reduce((acc, fw) => {
    const cat = fw.categoria || "Geral";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(fw);
    return acc;
  }, {} as Record<string, typeof frameworks>);

  const handleSelect = (id: string) => {
    onSelect(id);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted/50 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        📚 Frameworks de Conteúdo
      </h3>

      {Object.entries(frameworksPorCategoria).map(([categoria, fws]) => (
        <div key={categoria} className="space-y-3">
          {categoria !== "Geral" && (
            <div className="border-l-4 border-primary pl-3">
              <h4 className="text-md font-semibold text-primary">{categoria}</h4>
              <p className="text-xs text-muted-foreground">
                {categoria === "HESEC" && "Framework focado em conexão emocional e educação"}
                {categoria === "HERO" && "Framework focado em empoderamento e resultados"}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {fws.map((fw) => (
              <Card
                key={fw.id}
                onClick={() => handleSelect(fw.id)}
                className={cn(
                  "cursor-pointer hover:bg-muted/50 transition-all rounded-2xl p-4",
                  selectedIds.includes(fw.id) && "bg-[hsl(var(--primary)/.2)] border-primary"
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{fw.icone}</span>
                  <div className="flex-1">
                    <h5 className="font-semibold">{fw.nome}</h5>
                    <p className="text-sm text-muted-foreground">{fw.descricao}</p>
                    {fw.aplicacao && (
                      <p className="text-xs text-muted-foreground mt-2">
                        <strong>Aplicação:</strong> {fw.aplicacao}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
