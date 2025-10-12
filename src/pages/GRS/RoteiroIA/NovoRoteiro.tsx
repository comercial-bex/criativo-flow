import { Film } from "lucide-react";

export default function NovoRoteiroPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Film className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Novo Roteiro IA</h1>
      </div>
      <div className="rounded-lg border border-dashed border-muted-foreground/25 p-12 text-center">
        <p className="text-xl text-muted-foreground">
          🚧 Wizard em 4 etapas (FASE 2)
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Briefing → Geração IA → Revisão → Publicação
        </p>
      </div>
    </div>
  );
}
