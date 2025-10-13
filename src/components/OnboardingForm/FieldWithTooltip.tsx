import { HelpCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FieldWithTooltipProps {
  label: string;
  helpText: string;
  example?: string;
  children: React.ReactNode;
}

export function FieldWithTooltip({ 
  label, 
  helpText, 
  example, 
  children 
}: FieldWithTooltipProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Label>{label}</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/70 cursor-help hover:text-muted-foreground transition-colors" />
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">{helpText}</p>
              {example && (
                <p className="text-xs italic text-primary/80">
                  💡 Exemplo: {example}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
      {children}
    </div>
  );
}
