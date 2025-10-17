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

  const { data: intelligenceData } = useQuery({
    queryKey: ['ai-context-intelligence', cliente?.id],
    queryFn: async () => {
      if (!cliente?.id) return null;

      const { data: news } = await supabase
        .from('intelligence_data')
        .select('title, content, published_at, intelligence_sources(name)')
        .eq('data_type', 'news')
        .order('retrieved_at', { ascending: false })
        .limit(10);

      const { data: social } = await supabase
        .from('intelligence_data')
        .select('title, content, keywords, metric_value, intelligence_sources(name)')
        .eq('data_type', 'social')
        .order('retrieved_at', { ascending: false })
        .limit(10);

      const { data: demographics } = await supabase
        .from('intelligence_data')
        .select('title, content, region, intelligence_sources(name)')
        .eq('data_type', 'demographics')
        .order('retrieved_at', { ascending: false })
        .limit(5);

      return {
        news: news || [],
        socialTrends: social || [],
        demographics: demographics || []
      };
    },
    enabled: !!cliente?.id
  });

  const { data: competitors } = useQuery({
    queryKey: ['ai-context-competitors', cliente?.id],
    queryFn: async () => {
      if (!cliente?.id) return null;

      const { data } = await supabase
        .from('concorrentes_analise')
        .select('nome, instagram, site, observacoes, analise_ia')
        .eq('cliente_id', cliente.id)
        .limit(5);

      return data || [];
    },
    enabled: !!cliente?.id
  });

  return {
    cliente,
    onboarding,
    projetos,
    intelligenceData,
    competitors,
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
      } : undefined,
      intelligence: intelligenceData ? {
        recentNews: intelligenceData.news.map((n: any) => ({
          title: n.title,
          summary: n.content?.substring(0, 200)
        })),
        socialTrends: intelligenceData.socialTrends.map((t: any) => ({
          title: t.title,
          keywords: t.keywords
        })),
        marketInsights: intelligenceData.demographics
      } : undefined,
      competitors: competitors?.map((c: any) => ({
        name: c.nome,
        instagram: c.instagram,
        insights: c.analise_ia
      }))
    }
  };
}
