import { Button } from '@/components/ui/button';
import { HelpCircle, RotateCcw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface TutorialButtonProps {
  onStart: () => void;
  hasSeenTutorial: boolean;
  variant?: 'default' | 'floating';
}

export function TutorialButton({ onStart, hasSeenTutorial, variant = 'default' }: TutorialButtonProps) {
  if (variant === 'floating') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onStart}
            size="icon"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90"
          >
            <HelpCircle className="h-6 w-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Iniciar Tutorial</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={hasSeenTutorial ? 'outline' : 'default'}
          size="sm"
          onClick={onStart}
        >
          {hasSeenTutorial ? (
            <>
              <RotateCcw className="h-4 w-4 mr-2" />
              Ver Tutorial
            </>
          ) : (
            <>
              <HelpCircle className="h-4 w-4 mr-2" />
              Iniciar Tutorial
            </>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{hasSeenTutorial ? 'Rever o tutorial interativo' : 'Fazer tour guiado pela página'}</p>
      </TooltipContent>
    </Tooltip>
  );
}
