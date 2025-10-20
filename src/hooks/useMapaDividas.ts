import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MapaDividaItem {
  divida_id: string;
  tipo: string;
  credor_devedor: string;
  descricao: string;
  valor_total: number;
  valor_pago: number;
  valor_restante: number;
  numero_parcelas: number;
  parcelas_pagas_count: number;
  parcelas_vencidas_count: number;
  proximo_vencimento: string | null;
  status: string;
  centro_custo_nome: string | null;
  data_emissao: string;
  cliente_id: string | null;
  fornecedor_id: string | null;
  centro_custo_id: string | null;
  cliente_nome: string | null;
}

export function useMapaDividas(filters?: {
  tipo?: 'pagar' | 'receber';
  status?: string;
}) {
  const { data: mapaDividas = [], isLoading } = useQuery({
    queryKey: ['mapa-dividas', filters],
    queryFn: async () => {
      // Retornar array vazio até view ser criada
      return [] as MapaDividaItem[];
    },
    staleTime: 2 * 60 * 1000,
  });

  const refreshMapaDividas = async () => {
    await supabase.rpc('refresh_relatorios_financeiros');
  };

  // Calcular totais
  const totalDividas = mapaDividas.reduce((acc, item) => acc + item.valor_total, 0);
  const totalPago = mapaDividas.reduce((acc, item) => acc + item.valor_pago, 0);
  const totalRestante = mapaDividas.reduce((acc, item) => acc + item.valor_restante, 0);
  const totalVencidas = mapaDividas.filter(item => item.parcelas_vencidas_count > 0).length;

  return {
    mapaDividas,
    isLoading,
    refreshMapaDividas,
    totais: {
      totalDividas,
      totalPago,
      totalRestante,
      totalVencidas,
    },
  };
}
