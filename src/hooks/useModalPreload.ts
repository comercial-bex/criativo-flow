// FASE 4: Hook para pré-carregar dados de modais
// Carrega dados comuns em background usando requestIdleCallback

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useModalPreload() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const preloadData = async () => {
      try {
        // Pré-carregar clientes (usado em vários modais)
        const { data: clientes } = await supabase
          .from('clientes')
          .select('id, nome, email, status')
          .limit(50);

        if (clientes) {
          queryClient.setQueryData(['clientes-simple'], clientes);
        }

        // Pré-carregar especialistas de pessoas com papeis específicos
        const { data: especialistas } = await supabase
          .from('pessoas')
          .select('id, nome, papeis, status, profile_id')
          .contains('papeis', ['grs', 'design', 'audiovisual'])
          .eq('status', 'aprovado')
          .limit(50);

        if (especialistas) {
          queryClient.setQueryData(['especialistas-simple'], especialistas);
        }

        // Pré-carregar assinaturas
        const { data: assinaturas } = await supabase
          .from('assinaturas')
          .select('*')
          .eq('status', 'ativo');

        if (assinaturas) {
          queryClient.setQueryData(['assinaturas'], assinaturas);
        }

        console.log('✅ Dados de modais pré-carregados');
      } catch (error) {
        console.error('❌ Erro ao pré-carregar dados:', error);
      }
    };

    // Usar requestIdleCallback para não bloquear a thread principal
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => preloadData(), { timeout: 2000 });
    } else {
      setTimeout(preloadData, 1000);
    }
  }, [queryClient]);
}
