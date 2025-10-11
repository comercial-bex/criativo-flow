import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';

interface ColaboradorTempData {
  id?: string;
  cliente_id: string;
  produto_nome: string;
  valor_unitario: number;
  regime?: string;
  cargo_atual?: string;
  salario_ou_fee?: number;
  metadata?: Record<string, any>;
}

export function useColaboradorTempData(clienteId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar dados temporários pendentes
  const { data: dadosPendentes = [], isLoading } = useQuery({
    queryKey: ['admin-temp-data-rh', clienteId],
    queryFn: async () => {
      let query = supabase
        .from('admin_temp_data')
        .select('*')
        .eq('origem', 'rh')
        .is('used_at', null);

      if (clienteId) {
        query = query.eq('cliente_id', clienteId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!clienteId,
  });

  // Criar dados temporários
  const createTempDataMutation = useMutation({
    mutationFn: async (dados: ColaboradorTempData) => {
      const { data, error } = await supabase
        .from('admin_temp_data')
        .insert({
          cliente_id: dados.cliente_id,
          produto_id: null, // Null para colaboradores
          produto_nome: dados.produto_nome,
          valor_unitario: dados.valor_unitario,
          regime: dados.regime,
          cargo_atual: dados.cargo_atual,
          salario_ou_fee: dados.salario_ou_fee,
          origem: 'rh',
          metadata: dados.metadata || {},
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-temp-data-rh'] });
      toast({
        title: 'Dados temporários criados',
        description: 'Dados salvos para sincronização posterior',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar dados temporários',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Consumir dados temporários (marcar como usado)
  const consumeTempDataMutation = useMutation({
    mutationFn: async ({ tempDataId, pessoaId }: { tempDataId: string; pessoaId: string }) => {
      const { error } = await supabase
        .from('admin_temp_data')
        .update({
          used_at: new Date().toISOString(),
          used_in_document_type: 'pessoa',
          used_in_document_id: pessoaId,
        })
        .eq('id', tempDataId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-temp-data-rh'] });
      toast({
        title: 'Sincronização concluída',
        description: 'Dados temporários foram vinculados ao colaborador',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao sincronizar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    dadosPendentes,
    isLoading,
    createTempData: createTempDataMutation.mutate,
    consumeTempData: consumeTempDataMutation.mutate,
    isPending: createTempDataMutation.isPending || consumeTempDataMutation.isPending,
  };
}
