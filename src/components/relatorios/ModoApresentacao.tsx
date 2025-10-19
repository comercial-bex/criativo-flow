import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Clock, X } from 'lucide-react';

interface ModoApresentacaoProps {
  isActive: boolean;
  onClose: () => void;
  currentSection: number;
  totalSections: number;
  onNext: () => void;
  autoAdvanceSeconds?: number;
}

export function ModoApresentacao({ 
  isActive, 
  onClose, 
  currentSection, 
  totalSections,
  onNext,
  autoAdvanceSeconds = 30 
}: ModoApresentacaoProps) {
  const [timeRemaining, setTimeRemaining] = useState(autoAdvanceSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    if (!isActive || isPaused) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (currentSection < totalSections - 1) {
            onNext();
            return autoAdvanceSeconds;
          }
          return 0;
        }
        return prev - 1;
      });

      setTotalTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused, currentSection, totalSections, onNext, autoAdvanceSeconds]);

  useEffect(() => {
    setTimeRemaining(autoAdvanceSeconds);
  }, [currentSection, autoAdvanceSeconds]);

  if (!isActive) return null;

  const progress = ((autoAdvanceSeconds - timeRemaining) / autoAdvanceSeconds) * 100;
  const totalMinutes = Math.floor(totalTime / 60);
  const totalSeconds = totalTime % 60;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-background/95 backdrop-blur-md 
          border border-border rounded-2xl shadow-2xl p-4 min-w-[400px]"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div className="font-mono text-lg font-bold">
                {String(totalMinutes).padStart(2, '0')}:{String(totalSeconds).padStart(2, '0')}
              </div>
            </div>
            
            <div className="h-6 w-px bg-border" />
            
            <div className="text-sm text-muted-foreground">
              Slide {currentSection + 1} / {totalSections}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsPaused(!isPaused)}
              className="hover:bg-muted"
            >
              {isPaused ? (
                <Play className="w-4 h-4" />
              ) : (
                <Pause className="w-4 h-4" />
              )}
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setTimeRemaining(autoAdvanceSeconds);
                setTotalTime(0);
              }}
              className="hover:bg-muted"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            <div className="h-6 w-px bg-border" />
            
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Barra de progresso do slide */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Próximo slide em</span>
            <span className="font-mono font-bold text-foreground">
              {timeRemaining}s
            </span>
          </div>
          
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Status */}
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2 text-xs">
            {isPaused ? (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span className="text-muted-foreground">Apresentação pausada</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-muted-foreground">Apresentação em andamento</span>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
