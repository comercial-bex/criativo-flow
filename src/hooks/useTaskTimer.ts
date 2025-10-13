// BEX 3.0 - Hook para cronômetro de tarefas (Deadline Timer + Work Stopwatch)

import { useState, useEffect, useCallback } from 'react';
import { calcularStatusPrazo, TimeRemaining } from '@/utils/tarefaUtils';
import { StatusPrazo } from '@/types/tarefa';

// ========== DEADLINE TIMER (prazo da tarefa) ==========
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
    }, 1000);

    return () => clearInterval(interval);
  }, [prazoExecutor]);

  const { status, timeRemaining } = calcularStatusPrazo(prazoExecutor);

  const formattedTime = timeRemaining
    ? `${String(timeRemaining.days).padStart(2, '0')}:${String(timeRemaining.hours).padStart(2, '0')}:${String(timeRemaining.minutes).padStart(2, '0')}:${String(timeRemaining.seconds).padStart(2, '0')}`
    : '--:--:--:--';

  const isUrgent = timeRemaining
    ? timeRemaining.total_seconds <= 14400 && timeRemaining.total_seconds > 0
    : false;

  return {
    timeRemaining,
    status,
    formattedTime,
    isUrgent,
  };
}

// ========== WORK STOPWATCH (cronômetro de trabalho) ==========
interface UseWorkStopwatchResult {
  isRunning: boolean;
  elapsedSeconds: number;
  formattedTime: string;
  start: () => void;
  pause: () => void;
  reset: () => void;
  getHours: () => number;
}

export function useWorkStopwatch(taskId: string): UseWorkStopwatchResult {
  const storageKey = `task-timer-${taskId}`;
  
  // Carregar estado do localStorage
  const loadState = useCallback(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const { elapsedSeconds, isRunning, lastStartTime } = JSON.parse(saved);
        
        // Se estava rodando, calcular tempo decorrido desde última atualização
        if (isRunning && lastStartTime) {
          const now = Date.now();
          const additionalSeconds = Math.floor((now - lastStartTime) / 1000);
          return {
            elapsedSeconds: elapsedSeconds + additionalSeconds,
            isRunning: true,
            lastStartTime: now,
          };
        }
        
        return { elapsedSeconds, isRunning: false, lastStartTime: null };
      } catch {
        return { elapsedSeconds: 0, isRunning: false, lastStartTime: null };
      }
    }
    return { elapsedSeconds: 0, isRunning: false, lastStartTime: null };
  }, [storageKey]);

  const [state, setState] = useState(loadState);

  // Salvar estado no localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  // Interval para atualizar cronômetro
  useEffect(() => {
    if (!state.isRunning) return;

    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        elapsedSeconds: prev.elapsedSeconds + 1,
        lastStartTime: Date.now(),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isRunning]);

  const start = useCallback(() => {
    setState(prev => ({
      ...prev,
      isRunning: true,
      lastStartTime: Date.now(),
    }));
  }, []);

  const pause = useCallback(() => {
    setState(prev => ({
      ...prev,
      isRunning: false,
      lastStartTime: null,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      elapsedSeconds: 0,
      isRunning: false,
      lastStartTime: null,
    });
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  const getHours = useCallback(() => {
    return state.elapsedSeconds / 3600;
  }, [state.elapsedSeconds]);

  // Formatar tempo como HH:MM:SS
  const hours = Math.floor(state.elapsedSeconds / 3600);
  const minutes = Math.floor((state.elapsedSeconds % 3600) / 60);
  const seconds = state.elapsedSeconds % 60;
  const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    isRunning: state.isRunning,
    elapsedSeconds: state.elapsedSeconds,
    formattedTime,
    start,
    pause,
    reset,
    getHours,
  };
}
