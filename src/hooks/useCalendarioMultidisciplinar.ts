import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { queryWithRetry } from '@/lib/supabase-query-wrapper';
import { startOfMonth, endOfMonth } from 'date-fns';
import { MODULE_QUERY_CONFIG } from '@/lib/queryConfig';
import { logger } from '@/lib/logger';

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
  observacoes?: string | null;
  quantidadePecas?: number | null;
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
      const result = await queryWithRetry(async () => {
        let query = supabase
          .from('eventos_calendario')
          .select(`
            *,
            responsavel:pessoas!responsavel_id(id, nome),
            projeto:projetos(id, titulo),
            cliente:clientes(id, nome)
          `, { count: 'exact' })
          .gte('data_inicio', options.dataInicio.toISOString())
          .lte('data_fim', options.dataFim.toISOString())
          .order('data_inicio')
          .range(0, 49);
        
        if (options.responsavelId) {
          query = query.eq('responsavel_id', options.responsavelId);
        }
        
        return await query;
      });
      
      if (result.error) {
        logger.error('Erro ao carregar eventos', 'useCalendarioMultidisciplinar', result.error);
        throw result.error;
      }
      
      logger.debug('Eventos carregados', 'useCalendarioMultidisciplinar', { count: (result.data as any[])?.length });
      return (result.data as any[]) || [];
    },
    ...MODULE_QUERY_CONFIG.tarefas
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
        p_equipamentos_ids: params.equipamentosIds,
        p_observacoes: params.observacoes,
        p_quantidade_pecas: params.quantidadePecas
      });
      
      if (error) {
        logger.error('Erro RPC ao criar evento', 'useCalendarioMultidisciplinar', error);
        throw new Error(error.message || 'Erro ao criar evento');
      }
      
      const result = data as any;
      if (!result?.success) {
        logger.error('Erro do servidor ao criar evento', 'useCalendarioMultidisciplinar', result);
        throw new Error(result?.error || 'Erro ao criar evento');
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos_calendario'] });
      toast.success('Evento criado com sucesso!');
    },
    onError: (error: any) => {
      logger.error('Erro na mutation criar evento', 'useCalendarioMultidisciplinar', error);
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