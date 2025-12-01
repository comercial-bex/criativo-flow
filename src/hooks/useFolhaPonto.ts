import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { smartToast } from '@/lib/smart-toast';

export interface FolhaPonto {
  id: string;
  colaborador_id: string;
  competencia: string;
  horas_he_50?: number;
  horas_he_100?: number;
  horas_noturno?: number;
  dias_falta?: number;
  horas_falta?: number;
  minutos_atraso?: number;
  horas_compensacao?: number;
  motivo?: 'operacional' | 'cliente' | 'saude' | 'acordo' | 'outros';
  observacao?: string;
  arquivo_ponto_url?: string;
  comprovantes_anexos?: any[];
  status: 'pendente' | 'aprovado_gestor' | 'aprovado_rh' | 'rejeitado';
  aprovado_gestor_por?: string;
  aprovado_gestor_em?: string;
  aprovado_rh_por?: string;
  aprovado_rh_em?: string;
  rejeitado_motivo?: string;
  hora_base?: number;
  valor_he_50?: number;
  valor_he_100?: number;
  valor_adicional_noturno?: number;
  valor_desconto_falta?: number;
  valor_desconto_atraso?: number;
  created_at?: string;
  updated_at?: string;
}

export function useFolhaPonto(colaboradorId?: string, competencia?: string) {
  const queryClient = useQueryClient();

  const { data: pontos = [], isLoading } = useQuery({
    queryKey: ['folha-ponto', colaboradorId, competencia],
    queryFn: async () => {
      let query = (supabase
        .from('rh_folha_ponto' as any)
        .select('*', { count: 'exact' })
        .order('competencia', { ascending: false })
        .range(0, 49) as any); // Paginação: primeiros 50 registros
      
      if (colaboradorId) query = query.eq('colaborador_id', colaboradorId);
      if (competencia) query = query.eq('competencia', competencia);
      
      const { data, error } = await query;
      if (error) throw error;
      return data as FolhaPonto[];
    },
    enabled: !!colaboradorId || !!competencia,
    staleTime: 30 * 1000, // 30 segundos (dados críticos)
    gcTime: 2 * 60 * 1000, // 2 minutos
  });

  const salvarMutation = useMutation({
    mutationFn: async (dados: Partial<FolhaPonto> & { colaborador_id: string; competencia: string }) => {
      if (dados.id) {
        const { data, error } = await (supabase
          .from('rh_folha_ponto' as any)
          .update(dados)
          .eq('id', dados.id)
          .select()
          .single() as any);
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await (supabase
          .from('rh_folha_ponto' as any)
          .insert([dados])
          .select()
          .single() as any);
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folha-ponto'] });
      smartToast.success('Ponto salvo com sucesso');
    },
    onError: (error: any) => {
      smartToast.error('Erro ao salvar ponto', error.message);
    },
  });

  const aprovarGestorMutation = useMutation({
    mutationFn: async (id: string) => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const { error } = await (supabase
        .from('rh_folha_ponto' as any)
        .update({
          status: 'aprovado_gestor',
          aprovado_gestor_por: userId,
          aprovado_gestor_em: new Date().toISOString(),
        })
        .eq('id', id) as any);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folha-ponto'] });
      smartToast.success('Ponto aprovado pelo gestor');
    },
    onError: (error: any) => {
      smartToast.error('Erro ao aprovar ponto', error.message);
    },
  });

  const aprovarRHMutation = useMutation({
    mutationFn: async (id: string) => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const { error } = await (supabase
        .from('rh_folha_ponto' as any)
        .update({
          status: 'aprovado_rh',
          aprovado_rh_por: userId,
          aprovado_rh_em: new Date().toISOString(),
        })
        .eq('id', id) as any);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folha-ponto'] });
      smartToast.success('Ponto aprovado pelo RH');
    },
    onError: (error: any) => {
      smartToast.error('Erro ao aprovar ponto', error.message);
    },
  });

  const rejeitarMutation = useMutation({
    mutationFn: async ({ id, motivo }: { id: string; motivo: string }) => {
      const { error } = await (supabase
        .from('rh_folha_ponto' as any)
        .update({
          status: 'rejeitado',
          rejeitado_motivo: motivo,
        })
        .eq('id', id) as any);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folha-ponto'] });
      smartToast.success('Ponto rejeitado');
    },
    onError: (error: any) => {
      smartToast.error('Erro ao rejeitar ponto', error.message);
    },
  });

  return {
    pontos,
    isLoading,
    salvar: salvarMutation.mutate,
    aprovarGestor: aprovarGestorMutation.mutate,
    aprovarRH: aprovarRHMutation.mutate,
    rejeitar: rejeitarMutation.mutate,
    isSalvando: salvarMutation.isPending,
  };
}
