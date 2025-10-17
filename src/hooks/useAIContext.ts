import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export function useAIContext() {
  const { user } = useAuth();

  const { data: cliente } = useQuery({
    queryKey: ['ai-context-cliente', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('cliente_id')
        .eq('id', user.id)
        .single();

      if (!profile?.cliente_id) return null;

      const { data } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', profile.cliente_id)
        .single();

      return data;
    },
    enabled: !!user
  });

  const { data: onboarding } = useQuery({
    queryKey: ['ai-context-onboarding', cliente?.id],
    queryFn: async () => {
      if (!cliente?.id) return null;

      const { data } = await supabase
        .from('cliente_onboarding')
        .select('*')
        .eq('cliente_id', cliente.id)
        .single();

      return data;
    },
    enabled: !!cliente?.id
  });

  const { data: projetos } = useQuery({
    queryKey: ['ai-context-projetos', cliente?.id],
    queryFn: async () => {
      if (!cliente?.id) return [];

      const { data } = await supabase
        .from('projetos')
        .select('*')
        .eq('cliente_id', cliente.id)
        .order('created_at', { ascending: false })
        .limit(5);

      return data || [];
    },
    enabled: !!cliente?.id
  });

  return {
    cliente,
    onboarding,
    projetos,
    context: {
      cliente: cliente ? {
        nome: cliente.nome,
        id: cliente.id
      } : undefined,
      onboarding: onboarding ? {
        segmento_atuacao: onboarding.segmento_atuacao,
        publico_alvo: onboarding.publico_alvo,
        tom_voz: onboarding.tom_voz,
        valores_principais: onboarding.valores_principais
      } : undefined
    }
  };
}
