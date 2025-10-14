import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { smartToast } from '@/lib/smart-toast';

export const useMonitorChat = (connectionId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar ou criar thread
  const { data: thread, isLoading: loadingThread } = useQuery({
    queryKey: ['monitor-chat-thread', connectionId],
    queryFn: async () => {
      if (!user || !connectionId) return null;

      // Verificar se já existe thread para esta conexão
      const { data: existing, error: existingError } = await supabase
        .from('system_chat_threads')
        .select('*')
        .eq('created_by', user.id)
        .contains('tags', [connectionId])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingError) throw existingError;
      if (existing) return existing;

      // Criar nova thread
      const { data: newThread, error: createError } = await supabase
        .from('system_chat_threads')
        .insert({
          title: `Diagnóstico - ${new Date().toLocaleDateString()}`,
          created_by: user.id,
          tags: [connectionId],
        })
        .select()
        .single();

      if (createError) throw createError;
      return newThread;
    },
    enabled: !!user && !!connectionId,
  });

  // Buscar mensagens do thread
  const { data: messages } = useQuery({
    queryKey: ['monitor-chat-messages', thread?.id],
    queryFn: async () => {
      if (!thread) return [];

      const { data, error } = await supabase
        .from('system_chat_messages')
        .select('*')
        .eq('thread_id', thread.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!thread,
  });

  // Enviar mensagem
  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      console.log('🔵 useMonitorChat.sendMessage - Iniciando', { 
        threadId: thread?.id, 
        connectionId, 
        message 
      });

      if (!thread || !connectionId) {
        const error = 'Thread não inicializado';
        console.error('❌ useMonitorChat.sendMessage - Erro:', error);
        throw new Error(error);
      }

      console.log('📡 Chamando edge function monitor-chat-assistant...');
      
      const { data, error } = await supabase.functions.invoke('monitor-chat-assistant', {
        body: {
          thread_id: thread.id,
          message,
          connection_id: connectionId,
        }
      });

      if (error) {
        console.error('❌ Edge function retornou erro:', error);
        throw error;
      }

      console.log('✅ Edge function respondeu com sucesso:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('✅ useMonitorChat.sendMessage - Sucesso, invalidando queries');
      queryClient.invalidateQueries({ queryKey: ['monitor-chat-messages', thread?.id] });
      smartToast.success('Mensagem enviada', 'Assistente respondeu com sucesso');
    },
    onError: (error: any) => {
      console.error('❌ useMonitorChat.sendMessage - Erro final:', error);
      smartToast.error(
        'Erro ao enviar mensagem', 
        error.message || 'Verifique se a edge function está configurada'
      );
    },
  });

  return {
    thread,
    messages: messages || [],
    loadingThread,
    sendMessage: sendMessage.mutate,
    isSending: sendMessage.isPending,
  };
};
