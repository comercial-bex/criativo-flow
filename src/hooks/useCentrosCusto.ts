import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { smartToast } from '@/lib/smart-toast';

export interface CentroCusto {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  tipo: 'operacional' | 'administrativo' | 'comercial' | 'projetos';
  responsavel_id?: string;
  orcamento_mensal?: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export function useCentrosCusto() {
  const queryClient = useQueryClient();

  const { data: centros = [], isLoading } = useQuery({
    queryKey: ['centros-custo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('centros_custo')
        .select('*')
        .order('codigo');
      
      if (error) throw error;
      return data as CentroCusto[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const createCentro = useMutation({
    mutationFn: async (newCentro: Omit<CentroCusto, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('centros_custo')
        .insert([newCentro])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['centros-custo'] });
      smartToast.success('Centro de custo criado com sucesso');
    },
    onError: (error: any) => {
      smartToast.error('Erro ao criar centro de custo', error.message);
    },
  });

  const updateCentro = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CentroCusto> & { id: string }) => {
      const { data, error } = await supabase
        .from('centros_custo')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['centros-custo'] });
      smartToast.success('Centro de custo atualizado');
    },
    onError: (error: any) => {
      smartToast.error('Erro ao atualizar', error.message);
    },
  });

  const deleteCentro = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('centros_custo')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['centros-custo'] });
      smartToast.success('Centro de custo removido');
    },
    onError: (error: any) => {
      smartToast.error('Erro ao remover', error.message);
    },
  });

  return {
    centros,
    isLoading,
    createCentro: createCentro.mutate,
    updateCentro: updateCentro.mutate,
    deleteCentro: deleteCentro.mutate,
  };
}
