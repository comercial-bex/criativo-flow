import { useReflexaoDiaria } from "@/hooks/useReflexaoDiaria";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function ReflexaoDiaria() {
  const { reflexao, loading, refresh } = useReflexaoDiaria();

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground italic">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span>Gerando reflexão do dia...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <p className="text-lg italic text-muted-foreground">
        "{reflexao}"
      </p>
      <Button
        variant="ghost"
        size="icon"
        onClick={refresh}
        disabled={loading}
        className="h-8 w-8"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
}
