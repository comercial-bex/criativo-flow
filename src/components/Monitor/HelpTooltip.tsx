import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HelpTooltipProps {
  title: string;
  description: string;
  problems?: string[];
  solutions?: string[];
}

export function HelpTooltip({ title, description, problems, solutions }: HelpTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors">
            <HelpCircle className="h-3.5 w-3.5 text-primary" />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side="right" 
          className="max-w-sm p-4 space-y-3 bg-popover/95 backdrop-blur-sm border-primary/20"
        >
          <div>
            <h4 className="font-semibold text-sm mb-1">{title}</h4>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>

          {problems && problems.length > 0 && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs font-medium text-destructive mb-1.5">
                ⚠️ Problemas Comuns:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                {problems.map((problem, i) => (
                  <li key={i}>{problem}</li>
                ))}
              </ul>
            </div>
          )}

          {solutions && solutions.length > 0 && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs font-medium text-primary mb-1.5">
                ✓ Soluções Rápidas:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                {solutions.map((solution, i) => (
                  <li key={i}>{solution}</li>
                ))}
              </ul>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
