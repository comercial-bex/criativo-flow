import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RelatorioIA } from '@/components/OnboardingV3/RelatorioIA';
import { Loader2 } from 'lucide-react';

interface Props {
  clienteId: string;
}

export function RelatorioIAWrapper({ clienteId }: Props) {
  const [concorrentes, setConcorrentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConcorrentes() {
      const { data } = await supabase
        .from('concorrentes_analise')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false });
      
      if (data) setConcorrentes(data);
      setLoading(false);
    }
    
    loadConcorrentes();
  }, [clienteId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <RelatorioIA 
      clienteId={clienteId} 
      concorrentes={concorrentes}
    />
  );
}
