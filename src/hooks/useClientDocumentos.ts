import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ClienteDocumento {
  id: string;
  categoria: string;
  titulo: string;
  descricao: string | null;
  arquivo_url: string;
  tamanho_kb: number;
  mime_type: string;
  created_at: string;
}

export function useClientDocumentos(clienteId?: string) {
  const [documentos, setDocumentos] = useState<ClienteDocumento[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocumentos = async () => {
    if (!clienteId) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('cliente_documentos')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocumentos((data || []) as ClienteDocumento[]);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentos();
  }, [clienteId]);

  return { documentos, loading, refetch: fetchDocumentos };
}
