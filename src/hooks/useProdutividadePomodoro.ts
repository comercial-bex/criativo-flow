import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Pomodoro {
  id: string;
  user_id: string;
  setor: string;
  inicio: string;
  fim: string | null;
  duracao_minutos: number | null;
  tipo: 'foco' | 'pausa_curta' | 'pausa_longa';
  status: 'ativo' | 'concluido' | 'cancelado';
}

export function useProdutividadePomodoro(setor: string) {
  const { user } = useAuth();
  const [pomodoros, setPomodoros] = useState<Pomodoro[]>([]);
  const [pomodoroAtivo, setPomodoroAtivo] = useState<Pomodoro | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPomodoros();
      const subscription = subscribeToChanges();
      return () => {
        subscription?.unsubscribe();
      };
    }
  }, [user, setor]);

  const fetchPomodoros = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('produtividade_pomodoro')
      .select('*')
      .eq('user_id', user.id)
      .eq('setor', setor)
      .order('inicio', { ascending: false })
      .limit(10);

    if (!error && data) {
      setPomodoros(data as Pomodoro[]);
      const ativo = data.find(p => p.status === 'ativo');
      setPomodoroAtivo((ativo as Pomodoro) || null);
    }
    setLoading(false);
  };

  const subscribeToChanges = () => {
    if (!user) return null;

    return supabase
      .channel('produtividade_pomodoro_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'produtividade_pomodoro',
          filter: `user_id=eq.${user.id}`
        },
        () => fetchPomodoros()
      )
      .subscribe();
  };

  const iniciarPomodoro = async (tipo: 'foco' | 'pausa_curta' | 'pausa_longa' = 'foco') => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('produtividade_pomodoro')
      .insert({
        user_id: user.id,
        setor,
        tipo,
        status: 'ativo'
      })
      .select()
      .single();

    if (!error && data) {
      setPomodoroAtivo(data as Pomodoro);
      return data;
    }
    return null;
  };

  const finalizarPomodoro = async (pomodoroId: string) => {
    if (!user) return null;

    // Calcular duração
    const pomodoro = pomodoros.find(p => p.id === pomodoroId);
    const duracao = pomodoro ? Math.floor((new Date().getTime() - new Date(pomodoro.inicio).getTime()) / 60000) : 25;

    const { data, error } = await supabase
      .from('produtividade_pomodoro')
      .update({
        fim: new Date().toISOString(),
        status: 'concluido',
        duracao_minutos: duracao
      })
      .eq('id', pomodoroId)
      .select()
      .single();

    if (!error && data) {
      setPomodoroAtivo(null);
      return data;
    }
    return null;
  };

  const cancelarPomodoro = async (pomodoroId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('produtividade_pomodoro')
      .update({ status: 'cancelado' })
      .eq('id', pomodoroId);

    if (!error) {
      setPomodoroAtivo(null);
    }
  };

  return {
    pomodoros,
    pomodoroAtivo,
    loading,
    iniciarPomodoro,
    finalizarPomodoro,
    cancelarPomodoro,
    refresh: fetchPomodoros
  };
}
