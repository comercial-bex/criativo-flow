import { Badge } from "@/components/ui/badge";
import { Database } from "lucide-react";

interface CacheIndicatorProps {
  isOnline: boolean;
  timestamp?: Date;
}

export function CacheIndicator({ isOnline, timestamp }: CacheIndicatorProps) {
  if (isOnline) return null;

  return (
    <Badge variant="outline" className="gap-1.5 bg-muted/50">
      <Database className="h-3 w-3" />
      Dados em cache
      {timestamp && (
        <span className="text-xs opacity-70">
          ({new Date(timestamp).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })})
        </span>
      )}
    </Badge>
  );
}
