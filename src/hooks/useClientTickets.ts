import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ClienteTicket {
  id: string;
  assunto: string;
  descricao: string;
  prioridade: string;
  status: string;
  categoria: string;
  created_at: string;
  updated_at: string;
}

export function useClientTickets(clienteId?: string) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<ClienteTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    if (!clienteId) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('cliente_tickets')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets((data || []) as ClienteTicket[]);
    } catch (error) {
      console.error('Erro ao carregar tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (ticket: Partial<ClienteTicket>) => {
    try {
      const { data, error } = await supabase
        .from('cliente_tickets')
        .insert([{
          assunto: ticket.assunto || '',
          descricao: ticket.descricao || '',
          prioridade: ticket.prioridade || 'media',
          status: ticket.status || 'aberto',
          categoria: ticket.categoria || 'suporte',
          cliente_id: clienteId,
          criado_por: user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      await fetchTickets();
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao criar ticket:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchTickets();

    if (!clienteId) return;

    // Realtime
    const channel = supabase
      .channel('tickets_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'cliente_tickets',
        filter: `cliente_id=eq.${clienteId}`
      }, () => fetchTickets())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [clienteId]);

  return { tickets, loading, createTicket, refetch: fetchTickets };
}
