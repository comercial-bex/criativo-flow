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

  // Real-time subscription
  useEffect(() => {
    if (!threadId) return;

    const channel = supabase
      .channel(`team-chat:${threadId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'team_chat_messages',
        filter: `thread_id=eq.${threadId}`
      }, (payload) => {
        console.log('📨 Nova mensagem recebida:', payload);
        queryClient.invalidateQueries({ queryKey: ['team-chat-messages', threadId] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, queryClient]);

  // Enviar mensagem
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-chat-messages', threadId] });
      queryClient.invalidateQueries({ queryKey: ['team-chat-threads'] });
    },
    onError: (error: any) => {
      smartToast.error('Erro ao enviar mensagem', error.message);
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

  return {
    threads,
    messages: messages || [],
    loadingThreads,
    sendMessage: sendMessage.mutate,
    isSending: sendMessage.isPending,
    createThread: createThread.mutate,
    addReaction: addReaction.mutate,
  };
};
