import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export const FullScreenLoader = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  
  useEffect(() => {
    const warningTimer = setTimeout(() => setShowWarning(true), 5000);
    const counterInterval = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
    
    return () => {
      clearTimeout(warningTimer);
      clearInterval(counterInterval);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">
          Carregando{elapsed > 0 && ` (${elapsed}s)`}...
        </p>
        {showWarning && (
          <div className="text-sm text-yellow-600 dark:text-yellow-500 mt-4">
            <p>⏱️ Demorando mais que o esperado...</p>
            <p className="text-xs mt-1">Verificando conexão com servidor...</p>
            <button 
              onClick={() => window.location.href = '/auth'}
              className="underline mt-2 hover:text-yellow-700 dark:hover:text-yellow-400"
            >
              Forçar ir para login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
