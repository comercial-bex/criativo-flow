import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ClientApproval {
  id: string;
  cliente_id: string;
  projeto_id: string | null;
  tarefa_id: string | null;
  tipo: 'arte' | 'roteiro' | 'video' | 'post' | 'captacao' | 'outro';
  titulo: string;
  descricao: string | null;
  anexo_url: string | null;
  status: 'pendente' | 'aprovado' | 'reprovado' | 'revisao';
  motivo_reprovacao: string | null;
  decidido_por: string | null;
  decided_at: string | null;
  solicitado_por: string;
  created_at: string;
  updated_at: string;
}

export function useClientApprovals(clienteId?: string) {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState<ClientApproval[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovals = async () => {
    if (!clienteId) return;
    
    try {
      const { data, error } = await supabase
        .from('aprovacoes_cliente')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApprovals((data || []) as ClientApproval[]);
    } catch (error) {
      console.error('Erro ao carregar aprovações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();

    // Realtime subscription
    const channel = supabase
      .channel('aprovacoes_cliente_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'aprovacoes_cliente',
          filter: `cliente_id=eq.${clienteId}`
        },
        () => {
          fetchApprovals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clienteId, user]);

  const updateApprovalStatus = async (
    approvalId: string,
    status: 'aprovado' | 'reprovado' | 'revisao',
    motivo?: string
  ) => {
    try {
      const { error } = await supabase
        .from('aprovacoes_cliente')
        .update({
          status,
          motivo_reprovacao: status === 'reprovado' ? motivo : null
        })
        .eq('id', approvalId);

      if (error) throw error;
      await fetchApprovals();
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar aprovação:', error);
      return { success: false, error };
    }
  };

  return {
    approvals,
    loading,
    updateApprovalStatus,
    refetch: fetchApprovals
  };
}
