import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSyncFeriados = () => {
  const [isSyncing, setIsSyncing] = useState(false);

  const syncFeriados = async (ano?: number) => {
    setIsSyncing(true);
    
    try {
      const anoAtual = ano || new Date().getFullYear();
      
      toast.loading(`Sincronizando feriados de ${anoAtual}...`, { id: 'sync-feriados' });

      const { data, error } = await supabase.functions.invoke('sync-feriados', {
        body: { ano: anoAtual }
      });

      if (error) throw error;

      toast.success(`✅ ${data.data.total_importados} feriados sincronizados!`, { 
        id: 'sync-feriados',
        description: `Ano ${anoAtual} atualizado com sucesso`
      });

      return data;
    } catch (error: any) {
      console.error('Erro ao sincronizar feriados:', error);
      toast.error('Erro ao sincronizar feriados', { 
        id: 'sync-feriados',
        description: error.message 
      });
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  return { syncFeriados, isSyncing };
};
