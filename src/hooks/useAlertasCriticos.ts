import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AlertaCritico {
  tipo_alerta: string;
  quantidade: number;
  severidade: 'erro' | 'alerta' | 'info';
  detalhes: any;
}

export function useAlertasCriticos() {
  return useQuery({
    queryKey: ['alertas-criticos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_alertas_pendentes')
        .select('*');
      
      if (error) {
        console.error('Erro ao buscar alertas:', error);
        throw error;
      }
      
      return (data || []) as AlertaCritico[];
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
    refetchInterval: 2 * 60 * 1000, // Refresh a cada 2 minutos
    refetchOnWindowFocus: true,
  });
}
