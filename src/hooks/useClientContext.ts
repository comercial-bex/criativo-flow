import { useLocation, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ClientContext {
  clienteId?: string;
  clienteName?: string;
  planejamentoId?: string;
  isInClientContext: boolean;
}

export function useClientContext(): ClientContext {
  const location = useLocation();
  const params = useParams();
  const [clientContext, setClientContext] = useState<ClientContext>({
    isInClientContext: false
  });

  useEffect(() => {
    const detectClientContext = async () => {
      const path = location.pathname;
      
      // Detect if we're in a client-specific planning context
      if (path.includes('/grs/planejamentos/') || path.includes('/cliente/')) {
        const clienteId = params.clienteId;
        const planejamentoId = params.projetoId; // planejamento ID from URL
        
        if (clienteId) {
          try {
            // Fetch client name
            const { data: cliente } = await supabase
              .from('clientes')
              .select('nome')
              .eq('id', clienteId)
              .single();

            setClientContext({
              clienteId,
              clienteName: cliente?.nome,
              planejamentoId,
              isInClientContext: true
            });
          } catch (error) {
            console.error('Error fetching client context:', error);
            setClientContext({
              clienteId,
              planejamentoId,
              isInClientContext: true
            });
          }
        }
      } else {
        setClientContext({
          isInClientContext: false
        });
      }
    };

    detectClientContext();
  }, [location.pathname, params]);

  return clientContext;
}