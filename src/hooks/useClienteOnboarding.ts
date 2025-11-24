import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ClienteOnboarding {
  id: string;
  cliente_id: string;
  nome_empresa: string | null;
  segmento_atuacao: string | null;
  produtos_servicos: string | null;
  tempo_mercado: string | null;
  localizacao: string | null;
  publico_alvo: string[] | null;
  dores_problemas: string | null;
  diferenciais: string | null;
  forcas: string | null;
  fraquezas: string | null;
  oportunidades: string | null;
  ameacas: string | null;
  link_instagram: string | null;
  link_facebook: string | null;
  link_linkedin: string | null;
  link_site: string | null;
  missao: string | null;
  posicionamento: string | null;
  objetivos_comunicacao: string[] | null;
  created_at: string;
  updated_at: string;
}

export function useClienteOnboarding(clienteId: string | undefined) {
  return useQuery({
    queryKey: ['cliente-onboarding', clienteId],
    queryFn: async () => {
      if (!clienteId) return null;

      const { data, error } = await supabase
        .from('cliente_onboarding')
        .select('*')
        .eq('cliente_id', clienteId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching onboarding:', error);
        throw error;
      }

      return data as ClienteOnboarding | null;
    },
    enabled: !!clienteId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
