import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface TypingUser {
  user_id: string;
  user_name: string;
  typing: boolean;
  timestamp: number;
}

export const useTypingIndicator = (threadId?: string) => {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<Record<string, TypingUser>>({});

  useEffect(() => {
    if (!threadId || !user) return;

    const channel = supabase.channel(`typing:${threadId}`, {
      config: { presence: { key: user.id } }
    });

    // Escutar mudanças de presença
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const typing: Record<string, TypingUser> = {};
        
        Object.entries(state).forEach(([id, data]: [string, any]) => {
          if (id !== user.id && data[0]?.typing) {
            typing[id] = data[0];
          }
        });
        
        setTypingUsers(typing);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, user]);

  const setTyping = async (isTyping: boolean) => {
    if (!threadId || !user) return;

    // Buscar nome da pessoa do usuário
    const { data: pessoa } = await supabase
      .from('pessoas')
      .select('nome')
      .eq('profile_id', user.id)
      .single();

    const channel = supabase.channel(`typing:${threadId}`);
    
    await channel.track({
      user_id: user.id,
      user_name: pessoa?.nome || 'Usuário',
      typing: isTyping,
      timestamp: Date.now()
    });
  };

  return { typingUsers, setTyping };
};
