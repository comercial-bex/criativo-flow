import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PendencyCardProps {
  title: string;
  count: number;
  icon: LucideIcon;
  variant?: "critical" | "warning" | "info";
  children: ReactNode;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function PendencyCard({
  title,
  count,
  icon: Icon,
  variant = "critical",
  children,
  isExpanded = true,
  onToggle,
}: PendencyCardProps) {
  const variantStyles = {
    critical: "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50",
    warning: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-900/50",
    info: "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50",
  };

  const badgeVariants = {
    critical: "bg-red-500 hover:bg-red-600",
    warning: "bg-yellow-500 hover:bg-yellow-600",
    info: "bg-blue-500 hover:bg-blue-600",
  };

  return (
    <Card className={cn("border-2", variantStyles[variant])}>
      <CardHeader
        className="cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={onToggle}
      >
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <span>{title}</span>
            {count > 0 && (
              <Badge className={cn("ml-2", badgeVariants[variant])}>
                {count}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      {isExpanded && count > 0 && (
        <CardContent className="space-y-3">
          {children}
        </CardContent>
      )}
      {count === 0 && isExpanded && (
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            ✅ Nenhum item pendente
          </p>
        </CardContent>
      )}
    </Card>
  );
}
