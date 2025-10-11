import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

interface ComercialFilters {
  startDate: string;
  endDate: string;
}

interface ComercialStats {
  totalOrcamentos: number;
  orcamentosAprovados: number;
  propostasAssinadas: number;
  valorTotalPipeline: number;
  previsaoReceita: number;
  taxaConversao: number;
}

interface OrcamentoRecente {
  id: string;
  numero: string;
  titulo: string;
  cliente_nome: string;
  data: string;
  valor: number;
  status: string;
}

interface PropostaRecente {
  id: string;
  titulo: string;
  cliente_nome: string;
  data: string;
  valor: number;
  status: string;
}

export function useComercialAnalytics(filters: ComercialFilters) {
  // Buscar orçamentos
  const { data: orcamentos, isLoading: loadingOrcamentos } = useQuery({
    queryKey: ['comercial-orcamentos', filters],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orcamentos')
        .select(`
          id,
          numero,
          titulo,
          valor_final,
          status,
          created_at,
          clientes (nome)
        `)
        .gte('created_at', filters.startDate)
        .lte('created_at', filters.endDate)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Buscar propostas
  const { data: propostas, isLoading: loadingPropostas } = useQuery({
    queryKey: ['comercial-propostas', filters],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('propostas')
        .select(`
          id,
          titulo,
          assinatura_status,
          created_at,
          orcamentos (
            valor_final,
            clientes (nome)
          )
        `)
        .gte('created_at', filters.startDate)
        .lte('created_at', filters.endDate)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Calcular estatísticas
  const stats: ComercialStats = useMemo(() => {
    const totalOrcamentos = orcamentos?.length || 0;
    const orcamentosAprovados = orcamentos?.filter(o => o.status === 'aprovado').length || 0;
    const propostasAssinadas = propostas?.filter(p => p.assinatura_status === 'assinado').length || 0;
    
    const valorTotalPipeline = orcamentos?.reduce((acc, o) => acc + (Number(o.valor_final) || 0), 0) || 0;
    const previsaoReceita = propostas
      ?.filter(p => p.assinatura_status === 'assinado')
      .reduce((acc, p) => acc + (Number(p.orcamentos?.valor_final) || 0), 0) || 0;
    
    const taxaConversao = totalOrcamentos > 0 
      ? (propostasAssinadas / totalOrcamentos) * 100 
      : 0;

    return {
      totalOrcamentos,
      orcamentosAprovados,
      propostasAssinadas,
      valorTotalPipeline,
      previsaoReceita,
      taxaConversao
    };
  }, [orcamentos, propostas]);

  // Formatar orçamentos recentes
  const orcamentosRecentes: OrcamentoRecente[] = useMemo(() => {
    return (orcamentos?.slice(0, 5) || []).map(o => ({
      id: o.id,
      numero: o.numero || '-',
      titulo: o.titulo,
      cliente_nome: o.clientes?.nome || 'Cliente não informado',
      data: new Date(o.created_at).toLocaleDateString('pt-BR'),
      valor: Number(o.valor_final) || 0,
      status: o.status
    }));
  }, [orcamentos]);

  // Formatar propostas recentes
  const propostasRecentes: PropostaRecente[] = useMemo(() => {
    return (propostas?.slice(0, 5) || []).map(p => ({
      id: p.id,
      titulo: p.titulo,
      cliente_nome: p.orcamentos?.clientes?.nome || 'Cliente não informado',
      data: new Date(p.created_at).toLocaleDateString('pt-BR'),
      valor: Number(p.orcamentos?.valor_final) || 0,
      status: p.assinatura_status || 'pendente'
    }));
  }, [propostas]);

  return {
    stats,
    orcamentosRecentes,
    propostasRecentes,
    loading: loadingOrcamentos || loadingPropostas
  };
}
