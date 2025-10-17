import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { smartToast } from '@/lib/smart-toast';
import { useEffect } from 'react';

export interface ChatThread {
  id: string;
  title: string;
  participants: string[];
  is_group: boolean;
  last_message_at: string;
  created_at: string;
  created_by: string;
  last_message_preview?: string;
  participant_avatar?: string;
  participant_count?: number;
  unread_count?: number;
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  attachments: any[];
  mentioned_users: string[];
  reactions: any;
  created_at: string;
  sender?: {
    id: string;
    nome: string;
    avatar_url?: string;
  };
}

export const useTeamChat = (threadId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Listar threads do usuário
  const { data: threads, isLoading: loadingThreads } = useQuery({
    queryKey: ['team-chat-threads', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('team_chat_threads')
        .select('*')
        .contains('participants', [user.id])
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      return data as ChatThread[];
    },
    enabled: !!user,
  });

  // Buscar mensagens de uma thread específica
  const { data: messages } = useQuery({
    queryKey: ['team-chat-messages', threadId],
    queryFn: async () => {
      if (!threadId) return [];

      const { data: messagesData, error } = await supabase
        .from('team_chat_messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Buscar informações dos senders
      const senderIds = [...new Set(messagesData.map(m => m.sender_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nome, avatar_url')
        .in('id', senderIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return messagesData.map(msg => ({
        ...msg,
        sender: profilesMap.get(msg.sender_id)
      })) as ChatMessage[];
    },
    enabled: !!threadId,
  });

  // Contagem de mensagens não lidas
  const { data: unreadCount } = useQuery({
    queryKey: ['team-chat-unread', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { data: threadsData } = await supabase
        .from('team_chat_threads')
        .select('id')
        .contains('participants', [user.id]);

      if (!threadsData?.length) return 0;

      let totalUnread = 0;

      for (const thread of threadsData) {
        const { data: readStatus } = await supabase
          .from('team_chat_read_status')
          .select('last_read_at')
          .eq('user_id', user.id)
          .eq('thread_id', thread.id)
          .maybeSingle();

        const { count } = await supabase
          .from('team_chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('thread_id', thread.id)
          .neq('sender_id', user.id)
          .gt('created_at', readStatus?.last_read_at || '1970-01-01');

        totalUnread += count || 0;
      }

      return totalUnread;
    },
    enabled: !!user,
    refetchInterval: 10000
  });

  // Real-time subscription com optimistic updates
  useEffect(() => {
    if (!threadId) return;

    const channel = supabase
      .channel(`team-chat:${threadId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'team_chat_messages',
        filter: `thread_id=eq.${threadId}`
      }, async (payload) => {
        console.log('📨 Nova mensagem recebida:', payload);
        
        // Buscar dados do sender imediatamente
        const { data: sender } = await supabase
          .from('profiles')
          .select('id, nome, avatar_url')
          .eq('id', payload.new.sender_id)
          .single();
        
        // Inserir diretamente no cache (mais rápido)
        queryClient.setQueryData(
          ['team-chat-messages', threadId],
          (old: any) => [
            ...(old || []),
            { ...payload.new, sender }
          ]
        );

        // Tocar som se não for mensagem própria
        if (payload.new.sender_id !== user?.id) {
          const { playNotificationSound } = await import('@/lib/notification-sound');
          playNotificationSound();
        }

        // Invalidar contagem de não lidas
        queryClient.invalidateQueries({ queryKey: ['team-chat-unread'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, queryClient, user]);

  // Enviar mensagem com optimistic updates
  const sendMessage = useMutation({
    mutationFn: async ({ 
      content, 
      attachments = [], 
      mentionedUsers = [] 
    }: { 
      content: string; 
      attachments?: any[]; 
      mentionedUsers?: string[] 
    }) => {
      if (!threadId) throw new Error('Thread não selecionada');

      const { data, error } = await supabase.functions.invoke('send-team-message', {
        body: {
          thread_id: threadId,
          content,
          attachments,
          mentioned_users: mentionedUsers
        }
      });

      if (error) throw error;
      return data;
    },
    onMutate: async (newMessage) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: ['team-chat-messages', threadId] });
      
      // Snapshot do estado atual
      const previousMessages = queryClient.getQueryData(['team-chat-messages', threadId]);
      
      // Inserir mensagem otimista
      const optimisticMessage = {
        id: `temp-${crypto.randomUUID()}`,
        thread_id: threadId,
        sender_id: user?.id,
        content: newMessage.content,
        attachments: newMessage.attachments || [],
        mentioned_users: newMessage.mentionedUsers || [],
        reactions: {},
        created_at: new Date().toISOString(),
        sender: {
          id: user?.id,
          nome: 'Você',
        }
      };
      
      queryClient.setQueryData(
        ['team-chat-messages', threadId],
        (old: any) => [...(old || []), optimisticMessage]
      );
      
      return { previousMessages };
    },
    onError: (err, newMessage, context) => {
      // Rollback em caso de erro
      queryClient.setQueryData(
        ['team-chat-messages', threadId],
        context?.previousMessages
      );
      smartToast.error('Erro ao enviar mensagem', err.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-chat-messages', threadId] });
      queryClient.invalidateQueries({ queryKey: ['team-chat-threads'] });
    },
  });

  // Criar nova thread
  const createThread = useMutation({
    mutationFn: async ({ 
      title, 
      participants, 
      isGroup = false 
    }: { 
      title: string; 
      participants: string[]; 
      isGroup?: boolean 
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('team_chat_threads')
        .insert({
          title,
          participants: [...participants, user.id],
          is_group: isGroup,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-chat-threads'] });
      smartToast.success('Conversa criada', 'Nova conversa iniciada com sucesso');
    },
  });

  // Adicionar reação
  const addReaction = useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const message = messages?.find(m => m.id === messageId);
      if (!message) throw new Error('Mensagem não encontrada');

      const reactions = message.reactions || {};
      const userReactions = reactions[user.id] || [];

      const { error } = await supabase
        .from('team_chat_messages')
        .update({
          reactions: {
            ...reactions,
            [user.id]: userReactions.includes(emoji) 
              ? userReactions.filter((e: string) => e !== emoji)
              : [...userReactions, emoji]
          }
        })
        .eq('id', messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-chat-messages', threadId] });
    },
  });

  // Marcar mensagens como lidas
  const markAsRead = useMutation({
    mutationFn: async (threadIdParam: string) => {
      if (!user) return;

      const { data: lastMessage } = await supabase
        .from('team_chat_messages')
        .select('id')
        .eq('thread_id', threadIdParam)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!lastMessage) return;

      await supabase
        .from('team_chat_read_status')
        .upsert({
          user_id: user.id,
          thread_id: threadIdParam,
          last_read_message_id: lastMessage.id,
          last_read_at: new Date().toISOString()
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-chat-unread'] });
    }
  });

  return {
    threads,
    messages: messages || [],
    loadingThreads,
    unreadCount,
    sendMessage: sendMessage.mutate,
    isSending: sendMessage.isPending,
    createThread: createThread.mutate,
    addReaction: addReaction.mutate,
    markAsRead: markAsRead.mutate,
  };
};
