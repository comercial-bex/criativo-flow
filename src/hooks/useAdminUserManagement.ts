import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAdminUserManagement = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const deleteUser = async (userId: string) => {
    setLoading(true);
    console.log('🗑️ Iniciando deleção via edge function:', userId);
    
    try {
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: {
          action: 'delete-user',
          user_id: userId
        }
      });

      if (error) {
        console.error('❌ Erro na edge function:', error);
        throw error;
      }

      if (!data?.success) {
        console.error('❌ Edge function retornou erro:', data);
        throw new Error(data?.error || 'Falha ao deletar usuário');
      }

      console.log('✅ Usuário deletado:', data);
      
      toast({
        title: '✅ Usuário deletado com sucesso',
        description: `${data.deleted_user?.nome || 'Usuário'} foi removido permanentemente`,
      });

      return { success: true, data };
    } catch (error: any) {
      console.error('💥 Erro crítico:', error);
      
      toast({
        title: '❌ Erro ao deletar usuário',
        description: error.message || 'Erro desconhecido. Verifique os logs.',
        variant: 'destructive',
      });

      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return { deleteUser, loading };
};
