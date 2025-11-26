import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface TaskActivity {
  id: string;
  tarefa_id: string;
  tarefa_titulo?: string;
  user_id: string;
  user_nome?: string;
  user_avatar?: string;
  tipo_atividade: 'mudanca_status' | 'comentario' | 'atribuicao' | 'anexo' | 'criacao';
  conteudo: string;
  metadata?: {
    status_anterior?: string;
    status_novo?: string;
    atribuido_a?: string;
    arquivo_nome?: string;
  };
  lida: boolean;
  created_at: string;
}

interface UseActivityFeedOptions {
  filter?: 'all' | 'mine';
  executorArea?: string;
  limit?: number;
}

export function useActivityFeed(options: UseActivityFeedOptions = {}) {
  const { filter = 'all', executorArea, limit = 50 } = options;
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  const fetchActivities = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      let query = supabase
        .from('tarefa_atividades')
        .select(`
          *,
          tarefa:tarefa_id (
            id,
            titulo,
            executor_area,
            executor_id
          ),
          profiles:user_id (
            profile_id,
            nome,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      const { data, error } = await query;

      if (error) throw error;

      // Filtrar e formatar atividades
      let filteredActivities = (data || []).map((activity: any) => ({
        id: activity.id,
        tarefa_id: activity.tarefa_id,
        tarefa_titulo: activity.tarefa?.titulo,
        user_id: activity.user_id,
        user_nome: activity.profiles?.nome || 'Usuário',
        user_avatar: activity.profiles?.avatar_url,
        tipo_atividade: activity.tipo_atividade,
        conteudo: activity.conteudo,
        metadata: activity.metadata,
        lida: false, // Default false, will be managed locally
        created_at: activity.created_at,
        executor_area: activity.tarefa?.executor_area,
        executor_id: activity.tarefa?.executor_id,
      }));

      // Aplicar filtro "mine" - tarefas onde sou executor
      if (filter === 'mine') {
        filteredActivities = filteredActivities.filter(
          (a: any) => a.executor_id === user.id
        );
      }

      // Aplicar filtro de área de executor
      if (executorArea) {
        filteredActivities = filteredActivities.filter(
          (a: any) => a.executor_area === executorArea
        );
      }

      setActivities(filteredActivities as TaskActivity[]);

      // Contar não lidas
      const unread = filteredActivities.filter((a: any) => !a.lida).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (activityId: string) => {
    // Marcar localmente apenas
    setActivities((prev) =>
      prev.map((a) => (a.id === activityId ? { ...a, lida: true } : a))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    // Marcar todas localmente
    setActivities((prev) => prev.map((a) => ({ ...a, lida: true })));
    setUnreadCount(0);
  };

  useEffect(() => {
    if (user?.id) {
      fetchActivities();

      // Configurar realtime subscription
      const channel = supabase
        .channel('activity-feed')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'tarefa_atividades',
          },
          () => {
            fetchActivities();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id, filter, executorArea, limit]);

  return {
    activities,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refresh: fetchActivities,
  };
}
