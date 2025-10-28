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

      // 🚀 USAR VIEW UNIFICADA - mais eficiente!
      const [eventosResult, profilesResult] = await Promise.all([
        supabase
          .from('vw_calendario_unificado')
          .select('*')
          .order('data_inicio', { ascending: true }),
        
        supabase
          .from('pessoas')
          .select('id, nome, avatar_url')
      ]);

      console.log('[Design/Calendário] 📅 Eventos:', eventosResult.data?.length, 'itens');
      console.log('[Design/Calendário] 📋 Eventos completos:', eventosResult.data);
      console.log('[Design/Calendário] ❌ Erro eventos:', eventosResult.error);

      if (eventosResult.error) throw eventosResult.error;
      if (profilesResult.error) throw profilesResult.error;

      // Separar tarefas do usuário dos eventos
      const todosEventos = eventosResult.data || [];
      const tarefasDoUsuario = todosEventos
        .filter(e => e.origem === 'grs' && e.responsavel_id === user.id)
        .map(e => ({
          id: e.tarefa_id || e.id,
          titulo: e.titulo,
          prazo_executor: e.data_fim,
          executor_id: e.responsavel_id,
          executor_area: 'Criativo',
          cliente_id: e.cliente_id,
          status: e.status
        })) as any;
      
      console.log('[Design/Calendário] ✅ Tarefas extraídas:', tarefasDoUsuario.length, 'itens');

      setTarefas(tarefasDoUsuario);
      setEventos(todosEventos as any);
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
