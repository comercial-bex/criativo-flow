import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { startOfMonth, endOfMonth } from 'date-fns';

interface CriarEventoParams {
  projetoId: string;
  responsavelId: string;
  titulo: string;
  tipo: string;
  dataInicio: Date;
  dataFim: Date;
  modoCriativo?: string | null;
  local?: string | null;
  isExtra?: boolean;
  equipamentosIds?: string[] | null;
}

export const useCalendarioMultidisciplinar = (options: {
  responsavelId?: string;
  dataInicio: Date;
  dataFim: Date;
}) => {
  const queryClient = useQueryClient();

  const { data: eventos, isLoading } = useQuery({
    queryKey: ['eventos_calendario', options],
    queryFn: async () => {
      let query = supabase
        .from('eventos_calendario')
        .select(`
          *,
          responsavel:profiles!responsavel_id(id, nome, especialidade),
          projeto:projetos(id, titulo),
          cliente:clientes(id, nome)
        `)
        .gte('data_inicio', options.dataInicio.toISOString())
        .lte('data_fim', options.dataFim.toISOString())
        .order('data_inicio');
      
      if (options.responsavelId) {
        query = query.eq('responsavel_id', options.responsavelId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
  
  const criarEventoMutation = useMutation({
    mutationFn: async (params: CriarEventoParams) => {
      const { data, error } = await supabase.rpc('fn_criar_evento_com_regras', {
        p_projeto_id: params.projetoId,
        p_responsavel_id: params.responsavelId,
        p_titulo: params.titulo,
        p_tipo: params.tipo as any,
        p_data_inicio: params.dataInicio.toISOString(),
        p_data_fim: params.dataFim.toISOString(),
        p_modo_criativo: params.modoCriativo,
        p_local: params.local,
        p_is_extra: params.isExtra || false,
        p_equipamentos_ids: params.equipamentosIds
      });
      
      if (error) throw error;
      const result = data as any;
      if (!result?.success) throw new Error(result?.error || 'Erro ao criar evento');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos_calendario'] });
      toast.success('Evento criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar evento');
    }
  });
  
  const verificarConflito = async (params: {
    responsavelId: string;
    dataInicio: Date;
    dataFim: Date;
    excluirEventoId?: string | null;
  }) => {
    const { data } = await supabase.rpc('fn_verificar_conflito_agenda', {
      p_responsavel_id: params.responsavelId,
      p_data_inicio: params.dataInicio.toISOString(),
      p_data_fim: params.dataFim.toISOString(),
      p_excluir_evento_id: params.excluirEventoId
    });
    return data;
  };
  
  const sugerirSlot = async (params: {
    responsavelId: string;
    duracaoMinutos: number;
    dataPreferida: string;
    tipoEvento: string;
  }) => {
    const { data } = await supabase.rpc('fn_sugerir_slot_disponivel', {
      p_responsavel_id: params.responsavelId,
      p_duracao_minutos: params.duracaoMinutos,
      p_data_preferida: params.dataPreferida,
      p_tipo_evento: params.tipoEvento as any
    });
    return data;
  };
  
  return {
    eventos,
    isLoading,
    criarEvento: criarEventoMutation.mutate,
    isCriandoEvento: criarEventoMutation.isPending,
    verificarConflito,
    sugerirSlot
  };
};