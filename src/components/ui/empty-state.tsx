import { LucideIcon } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center",
      className
    )}>
      <div className="rounded-full bg-gradient-to-br from-bex/10 to-bex/5 p-6 mb-4 ring-1 ring-bex/20">
        <Icon className="h-10 w-10 text-bex" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        {description}
      </p>
      {(actionLabel && onAction) || action ? (
        <Button onClick={action?.onClick || onAction} size="sm">
          {action?.label || actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
