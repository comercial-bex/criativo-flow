import { useState, useEffect } from 'react';
import { useUserRole } from './useUserRole';
import { supabase } from '@/integrations/supabase/client';

interface Submodulo {
  id: string;
  nome: string;
  slug: string;
  rota: string;
  icone: string;
  ordem: number;
}

interface Modulo {
  id: string;
  nome: string;
  slug: string;
  icone: string;
  ordem: number;
  roles_permitidos: string[];
  submodulos: Submodulo[];
}

export function useDynamicModules() {
  const { role } = useUserRole();
  const [modules, setModules] = useState<Modulo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      if (!role) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Buscar módulos permitidos para o role do usuário
        const { data: modulosData, error: modulosError } = await supabase
          .from('modulos')
          .select('*')
          .eq('ativo', true)
          .contains('roles_permitidos', [role])
          .order('ordem', { ascending: true });

        if (modulosError) {
          console.error('Erro ao buscar módulos:', modulosError);
          setModules([]);
          setLoading(false);
          return;
        }

        if (!modulosData || modulosData.length === 0) {
          setModules([]);
          setLoading(false);
          return;
        }

        // Buscar submódulos de todos os módulos de uma vez
        const { data: submodulosData, error: submodulosError } = await supabase
          .from('submodulos')
          .select('*')
          .in('modulo_id', modulosData.map(m => m.id))
          .eq('ativo', true)
          .order('ordem', { ascending: true });

        if (submodulosError) {
          console.error('Erro ao buscar submódulos:', submodulosError);
        }

        // Montar estrutura de módulos com submódulos
        const modulosComSubmodulos: Modulo[] = modulosData.map(modulo => ({
          id: modulo.id,
          nome: modulo.nome,
          slug: modulo.slug,
          icone: modulo.icone,
          ordem: modulo.ordem,
          roles_permitidos: modulo.roles_permitidos || [],
          submodulos: (submodulosData || [])
            .filter(sub => sub.modulo_id === modulo.id)
            .map(sub => ({
              id: sub.id,
              nome: sub.nome,
              slug: sub.slug,
              rota: sub.rota,
              icone: sub.icone,
              ordem: sub.ordem
            }))
        }));

        setModules(modulosComSubmodulos);
      } catch (error) {
        console.error('Erro inesperado ao buscar módulos:', error);
        setModules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [role]);

  return { modules, loading };
}
