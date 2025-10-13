import { Play, Pause, RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BexCard, BexCardContent, BexCardHeader, BexCardTitle } from '@/components/ui/bex-card';
import { useWorkStopwatch } from '@/hooks/useTaskTimer';
import { cn } from '@/lib/utils';

interface TaskTimerProps {
  taskId: string;
  onSaveTime: (hours: number) => Promise<void>;
}

export function TaskTimer({ taskId, onSaveTime }: TaskTimerProps) {
  const { 
    isRunning, 
    elapsedSeconds, 
    formattedTime, 
    start, 
    pause, 
    reset, 
    getHours 
  } = useWorkStopwatch(taskId);

  const handleSave = async () => {
    const hours = getHours();
    if (hours > 0) {
      await onSaveTime(hours);
      reset();
    }
  };

  return (
    <BexCard variant="gaming" className="w-full">
      <BexCardHeader className="pb-3">
        <BexCardTitle className="text-sm flex items-center gap-2">
          <span className="text-bex">⏱️</span>
          Cronômetro
        </BexCardTitle>
      </BexCardHeader>
      <BexCardContent className="space-y-3">
        {/* Display do tempo */}
        <div className="relative">
          <div 
            className={cn(
              "font-mono text-3xl text-center py-4 rounded-lg bg-muted/30 border-2 transition-all",
              isRunning 
                ? "border-bex shadow-lg shadow-bex/20 text-bex" 
                : "border-border/50 text-foreground"
            )}
          >
            {formattedTime}
          </div>
          {isRunning && (
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-bex animate-pulse" />
          )}
        </div>

        {/* Controles */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={isRunning ? "outline" : "default"}
            size="sm"
            onClick={isRunning ? pause : start}
            className={cn(
              "flex-1",
              !isRunning && "bg-bex hover:bg-bex-light text-black"
            )}
          >
            {isRunning ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={reset}
            disabled={elapsedSeconds === 0}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            disabled={elapsedSeconds === 0}
            className="bg-bex hover:bg-bex-light text-black"
          >
            <Save className="h-4 w-4" />
          </Button>
        </div>

        {elapsedSeconds > 0 && (
          <div className="text-xs text-center text-muted-foreground">
            {getHours().toFixed(2)}h acumuladas
          </div>
        )}
      </BexCardContent>
    </BexCard>
  );
}
