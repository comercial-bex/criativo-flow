import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';

export function useEspecialistaData(especialistaId: string | null) {
  const { role } = useUserRole();

  return useQuery({
    queryKey: ['especialista-data', especialistaId],
    queryFn: async () => {
      if (!especialistaId) return null;

      // Validar permissão
      if (!['grs', 'gestor', 'admin'].includes(role || '')) {
        throw new Error('Sem permissão para visualizar dados de especialistas');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, email, especialidade, telefone')
        .eq('id', especialistaId)
        .single();

      if (error) {
        console.error('Erro ao buscar dados do especialista:', error);
        throw error;
      }

      return data;
    },
    enabled: !!especialistaId && !!role
  });
}
