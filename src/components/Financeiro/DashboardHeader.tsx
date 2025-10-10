import { RefreshCw, Download, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  onRefresh: () => void;
  onExport: () => void;
  onConfig: () => void;
  isRefreshing?: boolean;
}

export function DashboardHeader({
  onRefresh,
  onExport,
  onConfig,
  isRefreshing = false,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-['Montserrat']">
          📊 Dashboard Financeiro Inteligente
        </h1>
        <p className="text-muted-foreground mt-1 font-['Inter']">
          Análises e comparativos financeiros em tempo real
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Atualizar
        </Button>

        <Button variant="outline" size="sm" onClick={onExport} className="gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>

        <Button variant="outline" size="sm" onClick={onConfig} className="gap-2">
          <Settings className="h-4 w-4" />
          Configurações
        </Button>
      </div>
    </div>
  );
}
