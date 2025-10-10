import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface HistoricoSalarial {
  id: string;
  colaborador_id: string;
  tipo_alteracao: string;
  salario_anterior?: number;
  salario_novo: number;
  cargo_anterior?: string;
  cargo_novo?: string;
  data_vigencia: string;
  motivo?: string;
  justificativa?: string;
  aprovado_por?: string;
  created_at?: string;
  metadata?: any;
}

export function useHistoricoSalarial(colaboradorId?: string) {
  const queryClient = useQueryClient();

  const { data: historico = [], isLoading } = useQuery({
    queryKey: ['historico-salarial', colaboradorId],
    queryFn: async () => {
      let query = supabase
        .from('financeiro_historico_salarial')
        .select('*')
        .order('data_vigencia', { ascending: false });
      
      if (colaboradorId) {
        query = query.eq('colaborador_id', colaboradorId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as HistoricoSalarial[];
    },
    enabled: !!colaboradorId,
  });

  const createMutation = useMutation({
    mutationFn: async (novoHistorico: Omit<HistoricoSalarial, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('financeiro_historico_salarial')
        .insert([novoHistorico])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['historico-salarial'] });
      toast.success('✅ Histórico registrado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('❌ Erro ao registrar histórico', {
        description: error.message,
      });
    },
  });

  return {
    historico,
    isLoading,
    criar: createMutation.mutate,
    isCriando: createMutation.isPending,
  };
}
