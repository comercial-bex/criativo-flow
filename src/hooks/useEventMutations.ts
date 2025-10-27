import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { smartToast } from '@/lib/smart-toast';
import { logger } from '@/lib/logger';

export const useEventMutations = () => {
  const queryClient = useQueryClient();

  const updateEvento = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('eventos_calendario')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Erro ao atualizar evento', 'useEventMutations', error);
        throw error;
      }

      return data;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['eventos_calendario'] });
      
      const previousData = queryClient.getQueryData(['eventos_calendario']);
      
      queryClient.setQueryData(['eventos_calendario'], (old: any) => {
        if (!old) return old;
        return old.map((evento: any) => 
          evento.id === id ? { ...evento, ...updates } : evento
        );
      });

      return { previousData };
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['eventos_calendario'], context.previousData);
      }
      smartToast.error('Erro ao atualizar evento');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos_calendario'] });
      smartToast.success('Evento atualizado!');
    }
  });

  const deleteEvento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('eventos_calendario')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Erro ao deletar evento', 'useEventMutations', error);
        throw error;
      }

      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['eventos_calendario'] });
      
      const previousData = queryClient.getQueryData(['eventos_calendario']);
      
      queryClient.setQueryData(['eventos_calendario'], (old: any) => {
        if (!old) return old;
        return old.filter((evento: any) => evento.id !== id);
      });

      return { previousData };
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['eventos_calendario'], context.previousData);
      }
      smartToast.error('Erro ao deletar evento');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos_calendario'] });
      smartToast.success('Evento deletado!');
    }
  });

  return {
    updateEvento: updateEvento.mutate,
    deleteEvento: deleteEvento.mutate,
    isUpdating: updateEvento.isPending,
    isDeleting: deleteEvento.isPending
  };
};
