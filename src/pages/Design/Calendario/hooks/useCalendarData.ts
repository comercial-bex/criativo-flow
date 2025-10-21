import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { TarefaCalendario, EventoCalendario, Profile } from '../types';

export const useCalendarData = () => {
  const [tarefas, setTarefas] = useState<TarefaCalendario[]>([]);
  const [eventos, setEventos] = useState<EventoCalendario[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);

      if (!user) {
        console.log('[Design/Calendário] ⚠️ Usuário não autenticado');
        setLoading(false);
        return;
      }

      console.log('[Design/Calendário] 🔍 Iniciando busca de dados...');
      console.log('[Design/Calendário] 👤 User ID:', user.id);

      const [tarefasResult, eventosResult, profilesResult] = await Promise.all([
        supabase
          .from('tarefa')
          .select(`
            id, titulo, descricao, status, prioridade,
            executor_id, executor_area, cliente_id,
            prazo_executor, data_inicio_prevista, data_entrega_prevista,
            kpis
          `)
          .in('executor_area', ['Criativo', 'Audiovisual'])
          .eq('executor_id', user.id)
          .order('prazo_executor', { ascending: true }),
        
        supabase
          .from('eventos_calendario')
          .select('*')
          .order('data_inicio', { ascending: true }),
        
        supabase
          .from('pessoas')
          .select('id, nome, avatar_url')
      ]);

      console.log('[Design/Calendário] ✅ Tarefas:', tarefasResult.data?.length, 'itens');
      console.log('[Design/Calendário] 📋 Tarefas completas:', tarefasResult.data);
      console.log('[Design/Calendário] ❌ Erro tarefas:', tarefasResult.error);
      console.log('[Design/Calendário] 📅 Eventos:', eventosResult.data?.length, 'itens');
      console.log('[Design/Calendário] 📋 Eventos completos:', eventosResult.data);
      console.log('[Design/Calendário] ❌ Erro eventos:', eventosResult.error);

      if (tarefasResult.error) throw tarefasResult.error;
      if (eventosResult.error) throw eventosResult.error;
      if (profilesResult.error) throw profilesResult.error;

      setTarefas(tarefasResult.data || []);
      setEventos(eventosResult.data || []);
      setProfiles(profilesResult.data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    tarefas,
    eventos,
    profiles,
    loading,
    refetch: fetchData
  };
};
