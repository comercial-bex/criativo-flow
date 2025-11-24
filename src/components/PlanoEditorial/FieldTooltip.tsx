import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FieldTooltipProps {
  title: string;
  description: string;
  example?: string;
  importance?: 'high' | 'medium' | 'low';
}

export const FieldTooltip = ({ title, description, example, importance = 'medium' }: FieldTooltipProps) => {
  const importanceColors = {
    high: 'text-red-500',
    medium: 'text-yellow-500',
    low: 'text-muted-foreground'
  };

  const importanceLabels = {
    high: '⭐⭐⭐ Essencial',
    medium: '⭐⭐ Importante',
    low: '⭐ Opcional'
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className={`h-4 w-4 ml-1 cursor-help inline-block ${importanceColors[importance]}`} />
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-sm">{title}</p>
              <span className="text-xs text-muted-foreground">{importanceLabels[importance]}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
            {example && (
              <p className="text-xs italic text-primary/80 border-l-2 border-primary pl-2">
                💡 Exemplo: {example}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
