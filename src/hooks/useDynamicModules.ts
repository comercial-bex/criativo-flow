import { useState, useEffect } from 'react';
import { useUserRole } from './useUserRole';

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
    // Por enquanto, retornar array vazio para usar fallback
    // Quando as tabelas estiverem no tipo do Supabase, implementaremos a query
    setLoading(false);
    setModules([]);
  }, [role]);

  return { modules, loading };
}
