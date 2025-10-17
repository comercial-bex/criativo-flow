import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useRealtimeNotifications() {
  const { user } = useAuth();
  const [clienteId, setClienteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchClienteId = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('cliente_id')
        .eq('id', user.id)
        .single();
        
      if (data?.cliente_id) {
        setClienteId(data.cliente_id);
      }
    };

    fetchClienteId();
  }, [user]);

  useEffect(() => {
    if (!clienteId) return;

    const channel = supabase
      .channel('client_notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'aprovacoes_cliente',
        filter: `cliente_id=eq.${clienteId}`
      }, (payload: any) => {
        toast.info(`Nova solicitação de aprovação: ${payload.new.titulo}`, {
          action: {
            label: 'Ver agora',
            onClick: () => window.location.href = '/cliente/painel?tab=approvals'
          }
        });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'cliente_metas',
        filter: `cliente_id=eq.${clienteId}`
      }, (payload: any) => {
        const progresso = payload.new.progresso_percent;
        if (progresso >= 100) {
          toast.success(`🎉 Meta alcançada: ${payload.new.titulo}!`);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [clienteId]);
}
