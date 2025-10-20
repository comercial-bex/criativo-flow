import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface InadimplenciaItem {
  titulo_id: string;
  numero_documento: string;
  tipo: 'pagar' | 'receber';
  descricao: string;
  valor_liquido: number;
  valor_pago: number;
  valor_em_aberto: number;
  data_vencimento: string;
  dias_atraso: number;
  status: string;
  devedor_credor: string;
  cliente_id?: string;
  fornecedor_id?: string;
  centro_custo?: string;
  updated_at: string;
}

export function useRelatoriosInadimplencia() {
  const { data: inadimplenciaData = [], isLoading } = useQuery({
    queryKey: ['relatorio-inadimplencia'],
    queryFn: async () => {
      // Retornar array vazio até view ser criada
      return [] as InadimplenciaItem[];
    },
    staleTime: 1 * 60 * 1000,
  });

  const totalInadimplente = inadimplenciaData.reduce((acc, item) => acc + item.valor_em_aberto, 0);
  const mediaDiasAtraso = inadimplenciaData.length > 0
    ? Math.round(inadimplenciaData.reduce((acc, item) => acc + item.dias_atraso, 0) / inadimplenciaData.length)
    : 0;

  return {
    inadimplenciaData,
    isLoading,
    totalInadimplente,
    mediaDiasAtraso,
    totalTitulos: inadimplenciaData.length,
  };
}
