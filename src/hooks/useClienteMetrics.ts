import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useClienteMetrics(clienteId: string | null, userId: string) {
  return useQuery({
    queryKey: ['cliente-metrics', clienteId, userId],
    queryFn: async () => {
      if (!clienteId) return null;

      // Buscar dados da empresa
      const { data: empresa } = await supabase
        .from('clientes')
        .select('nome, cnpj_cpf, status')
        .eq('id', clienteId)
        .single();

      // Buscar permissões do cliente
      const { data: permissoes } = await supabase
        .from('cliente_usuarios')
        .select('role_cliente, permissoes, ativo')
        .eq('user_id', userId)
        .single();

      // Contar projetos (qualquer status, vamos filtrar manualmente)
      const { data: projetos } = await supabase
        .from('projetos')
        .select('status')
        .eq('cliente_id', clienteId);
      
      const projetosAtivos = projetos?.filter(p => 
        p.status && ['ativo', 'em_andamento'].includes(p.status)
      ).length || 0;

      // Contar solicitações pendentes
      const { count: solicitacoesPendentes } = await supabase
        .from('aprovacoes_cliente')
        .select('*', { count: 'exact', head: true })
        .eq('cliente_id', clienteId)
        .eq('status', 'pendente');

      // Última interação - usar aprovações como proxy
      const { data: ultimaAprovacao } = await supabase
        .from('aprovacoes_cliente')
        .select('created_at')
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false })
        .limit(1);

      return {
        empresa,
        permissoes,
        projetosAtivos,
        solicitacoesPendentes: solicitacoesPendentes || 0,
        ultimaInteracao: ultimaAprovacao && ultimaAprovacao.length > 0 ? ultimaAprovacao[0].created_at : null
      };
    },
    enabled: !!clienteId && !!userId
  });
}
