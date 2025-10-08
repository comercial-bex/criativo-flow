// BEX 3.0 - Hook para cronômetro de tarefas em tempo real

import { useState, useEffect } from 'react';
import { calcularStatusPrazo, TimeRemaining } from '@/utils/tarefaUtils';
import { StatusPrazo } from '@/types/tarefa';

interface UseTaskTimerResult {
  timeRemaining?: TimeRemaining;
  status: StatusPrazo;
  formattedTime: string;
  isUrgent: boolean;
}

export function useTaskTimer(prazoExecutor?: string | null): UseTaskTimerResult {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!prazoExecutor) return;

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Atualizar a cada segundo

    return () => clearInterval(interval);
  }, [prazoExecutor]);

  const { status, timeRemaining } = calcularStatusPrazo(prazoExecutor);

  const formattedTime = timeRemaining
    ? `${String(timeRemaining.days).padStart(2, '0')}:${String(timeRemaining.hours).padStart(2, '0')}:${String(timeRemaining.minutes).padStart(2, '0')}:${String(timeRemaining.seconds).padStart(2, '0')}`
    : '--:--:--:--';

  const isUrgent = timeRemaining
    ? timeRemaining.total_seconds <= 14400 && timeRemaining.total_seconds > 0
    : false; // ≤ 4h

  return {
    timeRemaining,
    status,
    formattedTime,
    isUrgent,
  };
}
