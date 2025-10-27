import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { startOfWeek, endOfWeek } from 'date-fns';

export interface EventoUnificado {
  id: string;
  titulo: string;
  data_inicio: string;
  data_fim: string;
  tipo: string;
  responsavel_id?: string;
  responsavel?: {
    id: string;
    nome: string;
    avatar_url?: string;
    papeis?: string[];
  };
  projeto_id?: string;
  projeto?: {
    id: string;
    titulo: string;
  };
  cliente_id?: string;
  cliente?: {
    id: string;
    nome: string;
  };
  origem?: string;
  cor?: string;
  descricao?: string;
  local?: string;
  status?: string;
  is_automatico?: boolean;
  is_bloqueante?: boolean;
  is_extra?: boolean;
}

export interface FiltrosCalendario {
  responsavelId?: string;
  tipo?: string;
  origem?: string;
  dataInicio?: Date;
  dataFim?: Date;
}

export const useCalendarioUnificado = (filtros: FiltrosCalendario = {}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    responsavelId,
    tipo,
    origem,
    dataInicio = startOfWeek(new Date(), { weekStartsOn: 1 }),
    dataFim = endOfWeek(new Date(), { weekStartsOn: 1 })
  } = filtros;

  // Query principal - buscar eventos
  const { data: eventos, isLoading, error, refetch } = useQuery({
    queryKey: ['calendario-unificado', { responsavelId, tipo, origem, dataInicio: dataInicio.toISOString(), dataFim: dataFim.toISOString() }],
    queryFn: async (): Promise<EventoUnificado[]> => {
      const { data, error } = await supabase
        .from('eventos_calendario')
        .select(`
          *,
          responsavel:pessoas!responsavel_id(id, nome, avatar_url, papeis),
          projeto:projetos!projeto_id(id, titulo),
          cliente:clientes!cliente_id(id, nome)
        `)
        .gte('data_inicio', dataInicio.toISOString())
        .lte('data_fim', dataFim.toISOString())
        .eq(responsavelId ? 'responsavel_id' : 'id', responsavelId || '00000000-0000-0000-0000-000000000000')
        .order('data_inicio');

      if (error) {
        console.error('Erro ao buscar eventos:', error);
        throw error;
      }

      let filteredData = data || [];

      // Remover filtro de responsavel se for '00000000...'
      if (responsavelId) {
        filteredData = filteredData;
      } else {
        const { data: allData } = await supabase
          .from('eventos_calendario')
          .select(`
            *,
            responsavel:pessoas!responsavel_id(id, nome, avatar_url, papeis),
            projeto:projetos!projeto_id(id, titulo),
            cliente:clientes!cliente_id(id, nome)
          `)
          .gte('data_inicio', dataInicio.toISOString())
          .lte('data_fim', dataFim.toISOString())
          .order('data_inicio');
        
        filteredData = allData || [];
      }

      // Filtrar manualmente por tipo e origem
      if (tipo && tipo !== 'todos') {
        filteredData = filteredData.filter((e: any) => e.tipo === tipo);
      }

      if (origem && origem !== 'todos') {
        filteredData = filteredData.filter((e: any) => e.origem === origem);
      }

      return filteredData as any;
    },
    staleTime: 30000, // 30 segundos
    gcTime: 300000, // 5 minutos
  });

  // Mutation para criar evento
  const criarEvento = useMutation({
    mutationFn: async (novoEvento: any) => {
      const { data, error } = await supabase
        .from('eventos_calendario')
        .insert([novoEvento as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendario-unificado'] });
      toast({
        title: 'Sucesso!',
        description: 'Evento criado com sucesso!',
      });
    },
    onError: (error: any) => {
      console.error('Erro ao criar evento:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar evento: ' + error.message,
        variant: 'destructive',
      });
    }
  });

  // Mutation para atualizar evento
  const atualizarEvento = useMutation({
    mutationFn: async ({ id, ...dados }: any) => {
      const { data, error } = await supabase
        .from('eventos_calendario')
        .update(dados as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendario-unificado'] });
      toast({
        title: 'Sucesso!',
        description: 'Evento atualizado!',
      });
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar evento:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar evento: ' + error.message,
        variant: 'destructive',
      });
    }
  });

  // Mutation para deletar evento
  const deletarEvento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('eventos_calendario')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendario-unificado'] });
      toast({
        title: 'Sucesso!',
        description: 'Evento deletado!',
      });
    },
    onError: (error: any) => {
      console.error('Erro ao deletar evento:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao deletar evento: ' + error.message,
        variant: 'destructive',
      });
    }
  });

  return {
    eventos: eventos || [],
    isLoading,
    error,
    refetch,
    criarEvento: criarEvento.mutateAsync,
    atualizarEvento: atualizarEvento.mutateAsync,
    deletarEvento: deletarEvento.mutateAsync,
    isCriando: criarEvento.isPending,
    isAtualizando: atualizarEvento.isPending,
    isDeletando: deletarEvento.isPending
  };
};
