import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Folha {
  id: string;
  competencia: string;
  mes: number;
  ano: number;
  centro_custo?: string;
  unidade_filial?: string;
  status: 'aberta' | 'processada' | 'fechada';
  total_proventos: number;
  total_descontos: number;
  total_encargos: number;
  total_liquido: number;
  total_colaboradores: number;
  processada_em?: string;
  processada_por?: string;
  fechada_em?: string;
  fechada_por?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FolhaItem {
  id: string;
  folha_id: string;
  colaborador_id: string;
  base_calculo: number;
  total_proventos: number;
  total_descontos: number;
  total_encargos: number;
  liquido: number;
  proventos: any[];
  descontos: any[];
  encargos: any[];
  status: 'pendente' | 'pago' | 'cancelado';
  forma_pagamento?: string;
  data_pagamento?: string;
  comprovante_url?: string;
  colaborador?: {
    nome_completo: string;
    cpf_cnpj: string;
    cargo_atual?: string;
    regime: string;
    salario_base?: number;
    fee_mensal?: number;
  };
}

export function useFolhaPagamento(competencia?: string) {
  const queryClient = useQueryClient();

  const { data: folhas = [], isLoading: isLoadingFolhas } = useQuery({
    queryKey: ['folhas', competencia],
    queryFn: async () => {
      let query = supabase
        .from('financeiro_folha')
        .select('*')
        .order('competencia', { ascending: false });
      
      if (competencia) {
        query = query.eq('competencia', competencia);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Folha[];
    },
  });

  const { data: itens = [], isLoading: isLoadingItens } = useQuery({
    queryKey: ['folha-itens', folhas[0]?.id],
    queryFn: async () => {
      if (!folhas[0]?.id) return [];
      
      const { data, error } = await supabase
        .from('financeiro_folha_itens')
        .select(`
          *,
          colaborador:rh_colaboradores(
            nome_completo,
            cpf_cnpj,
            cargo_atual,
            regime,
            salario_base,
            fee_mensal
          )
        `)
        .eq('folha_id', folhas[0].id)
        .order('colaborador.nome_completo');
      
      if (error) throw error;
      return data as FolhaItem[];
    },
    enabled: !!folhas[0]?.id,
  });

  const processarFolhaMutation = useMutation({
    mutationFn: async (params: { competencia: string; centro_custo?: string; unidade_filial?: string }) => {
      // 1. Buscar ou criar folha
      const [ano, mes] = params.competencia.split('-');
      
      const { data: folhaExistente } = await supabase
        .from('financeiro_folha')
        .select('*')
        .eq('competencia', params.competencia)
        .maybeSingle();
      
      let folhaId: string;
      
      if (folhaExistente) {
        folhaId = folhaExistente.id;
      } else {
        const { data: novaFolha, error } = await supabase
          .from('financeiro_folha')
          .insert({
            competencia: params.competencia,
            mes: parseInt(mes),
            ano: parseInt(ano),
            centro_custo: params.centro_custo,
            unidade_filial: params.unidade_filial,
            status: 'aberta',
          })
          .select()
          .single();
        
        if (error) throw error;
        folhaId = novaFolha.id;
      }
      
      // 2. Buscar colaboradores ativos
      const { data: colaboradores, error: colabError } = await supabase
        .from('rh_colaboradores')
        .select('*')
        .eq('status', 'ativo');
      
      if (colabError) throw colabError;
      
      // 3. Processar cada colaborador com cálculos fiscais
      const itensParaInserir = await Promise.all(
        colaboradores.map(async (colab) => {
          const salarioBruto = colab.salario_base || colab.fee_mensal || 0;
          
          // Calcular INSS (progressivo)
          const { data: calculoINSS } = await supabase.rpc('fn_calcular_inss', {
            p_salario_bruto: salarioBruto,
            p_competencia: params.competencia,
          });
          
          const inss = calculoINSS?.[0]?.valor_inss || 0;
          const faixasINSS = calculoINSS?.[0]?.faixas_aplicadas || [];
          
          // Base para IRRF = Salário - INSS
          const baseIRRF = salarioBruto - inss;
          
          // Calcular IRRF
          const { data: calculoIRRF } = await supabase.rpc('fn_calcular_irrf', {
            p_base_calculo: baseIRRF,
            p_num_dependentes: 0, // TODO: pegar do cadastro do colaborador
            p_competencia: params.competencia,
          });
          
          const irrf = calculoIRRF?.[0]?.valor_irrf || 0;
          
          // Calcular FGTS (encargo patronal)
          const { data: calculoFGTS } = await supabase.rpc('fn_calcular_fgts', {
            p_salario_bruto: salarioBruto,
            p_competencia: params.competencia,
          });
          
          const fgts = calculoFGTS || 0;
          
          // Montar rubricas
          const proventos = [
            {
              rubrica_id: '001',
              nome: 'Salário Base',
              valor: salarioBruto,
            },
          ];
          
          const descontos = [];
          if (inss > 0) {
            descontos.push({
              rubrica_id: '101',
              nome: 'INSS',
              valor: inss,
              faixas: faixasINSS,
            });
          }
          if (irrf > 0) {
            descontos.push({
              rubrica_id: '102',
              nome: 'IRRF',
              valor: irrf,
            });
          }
          
          const encargos = [
            {
              rubrica_id: '201',
              nome: 'FGTS (8%)',
              valor: fgts,
            },
          ];
          
          const totalProventos = salarioBruto;
          const totalDescontos = inss + irrf;
          const totalEncargos = fgts;
          const liquido = totalProventos - totalDescontos;
          
          return {
            folha_id: folhaId,
            colaborador_id: colab.id,
            base_calculo: salarioBruto,
            total_proventos: totalProventos,
            total_descontos: totalDescontos,
            total_encargos: totalEncargos,
            liquido: liquido,
            proventos: proventos as any,
            descontos: descontos as any,
            encargos: encargos as any,
            status: 'pendente' as const,
          };
        })
      );
      
      const { error: insertError } = await supabase
        .from('financeiro_folha_itens')
        .upsert(itensParaInserir, { onConflict: 'folha_id,colaborador_id' });
      
      if (insertError) throw insertError;
      
      // 4. Atualizar totais da folha
      const totalProventos = itensParaInserir.reduce((sum, item) => sum + item.total_proventos, 0);
      const totalDescontos = itensParaInserir.reduce((sum, item) => sum + item.total_descontos, 0);
      const totalEncargos = itensParaInserir.reduce((sum, item) => sum + item.total_encargos, 0);
      const totalLiquido = itensParaInserir.reduce((sum, item) => sum + item.liquido, 0);
      
      const { error: updateError } = await supabase
        .from('financeiro_folha')
        .update({
          total_proventos: totalProventos,
          total_descontos: totalDescontos,
          total_encargos: totalEncargos,
          total_liquido: totalLiquido,
          total_colaboradores: colaboradores.length,
          status: 'processada',
          processada_em: new Date().toISOString(),
        })
        .eq('id', folhaId);
      
      if (updateError) throw updateError;
      
      return folhaId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folhas'] });
      queryClient.invalidateQueries({ queryKey: ['folha-itens'] });
      toast.success('✅ Folha processada com sucesso!');
    },
    onError: (error: any) => {
      toast.error('❌ Erro ao processar folha', {
        description: error.message,
      });
    },
  });

  const registrarPagamentoMutation = useMutation({
    mutationFn: async (params: {
      item_id: string;
      forma_pagamento: string;
      data_pagamento: string;
      comprovante_url?: string;
      observacoes?: string;
    }) => {
      const { error } = await supabase
        .from('financeiro_folha_itens')
        .update({
          status: 'pago',
          forma_pagamento: params.forma_pagamento,
          data_pagamento: params.data_pagamento,
          comprovante_url: params.comprovante_url,
        })
        .eq('id', params.item_id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folha-itens'] });
      toast.success('✅ Pagamento registrado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('❌ Erro ao registrar pagamento', {
        description: error.message,
      });
    },
  });

  return {
    folhas,
    itens,
    isLoading: isLoadingFolhas || isLoadingItens,
    processarFolha: processarFolhaMutation.mutate,
    isProcessando: processarFolhaMutation.isPending,
    registrarPagamento: registrarPagamentoMutation.mutate,
    isRegistrandoPagamento: registrarPagamentoMutation.isPending,
  };
}
