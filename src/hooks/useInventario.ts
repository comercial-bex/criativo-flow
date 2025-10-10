import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useInventarioItens() {
  return useQuery({
    queryKey: ['inventario-itens'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventario_itens')
        .select(`
          *,
          modelo:inventario_modelos(
            id,
            marca,
            modelo,
            categoria:inventario_categorias(id, nome, icone)
          )
        `)
        .eq('ativo', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });
}

export function useInventarioCategorias() {
  return useQuery({
    queryKey: ['inventario-categorias'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventario_categorias')
        .select('*')
        .eq('ativo', true)
        .order('nome');
      
      if (error) throw error;
      return data || [];
    }
  });
}

export function useInventarioModelos(categoriaId?: string) {
  return useQuery({
    queryKey: ['inventario-modelos', categoriaId],
    queryFn: async () => {
      let query = supabase
        .from('inventario_modelos')
        .select('*, categoria:inventario_categorias(nome)')
        .order('marca');
      
      if (categoriaId) {
        query = query.eq('categoria_id', categoriaId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    }
  });
}

export function useCreateInventarioItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (itemData: any) => {
      const { data, error } = await supabase
        .from('inventario_itens')
        .insert(itemData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventario-itens'] });
      toast.success('Item criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao criar item: ' + error.message);
    }
  });
}

export function useUpdateInventarioItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { data: updated, error } = await supabase
        .from('inventario_itens')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventario-itens'] });
      toast.success('Item atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar item: ' + error.message);
    }
  });
}

export function useVerificarDisponibilidade() {
  return useMutation({
    mutationFn: async ({
      itemId,
      inicio,
      fim,
      quantidade = 1,
      unidadeId
    }: {
      itemId: string;
      inicio: string;
      fim: string;
      quantidade?: number;
      unidadeId?: string;
    }) => {
      const { data, error } = await supabase.rpc('fn_verificar_disponibilidade', {
        p_item_id: itemId,
        p_inicio: inicio,
        p_fim: fim,
        p_quantidade: quantidade,
        p_unidade_id: unidadeId || null
      });
      
      if (error) throw error;
      return data;
    }
  });
}

export function useCriarReserva() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      itemId,
      tipoReserva,
      inicio,
      fim,
      quantidade = 1,
      unidadeId,
      tarefaId,
      projetoId
    }: {
      itemId: string;
      tipoReserva: string;
      inicio: string;
      fim: string;
      quantidade?: number;
      unidadeId?: string;
      tarefaId?: string;
      projetoId?: string;
    }) => {
      const { data, error } = await supabase.rpc('fn_criar_reserva_equipamento', {
        p_item_id: itemId,
        p_tipo_reserva: tipoReserva,
        p_inicio: inicio,
        p_fim: fim,
        p_quantidade: quantidade,
        p_unidade_id: unidadeId || null,
        p_tarefa_id: tarefaId || null,
        p_projeto_id: projetoId || null
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventario-reservas'] });
      toast.success('Equipamento reservado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao reservar equipamento: ' + error.message);
    }
  });
}
