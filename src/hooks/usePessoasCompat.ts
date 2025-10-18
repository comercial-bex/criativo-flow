/**
 * Hook de compatibilidade para migração gradual de profiles → pessoas
 * 
 * FASE 1: Wrapper que busca dados de pessoas mas retorna no formato profile
 * FASE 2: Componentes migram para usar usePessoas diretamente
 * FASE 3: Este hook será removido
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProfileCompat {
  id: string;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  avatar_url?: string | null;
  especialidade?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  status?: string;
}

export function usePessoasCompat() {
  return useQuery({
    queryKey: ['profiles-compat'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pessoas')
        .select('*')
        .not('profile_id', 'is', null)
        .order('nome');
      
      if (error) throw error;
      
      // Converter pessoas para formato profile
      return (data || []).map((pessoa): ProfileCompat => ({
        id: pessoa.profile_id!,
        nome: pessoa.nome,
        email: pessoa.email,
        telefone: Array.isArray(pessoa.telefones) ? pessoa.telefones[0] : null,
        avatar_url: null,
        especialidade: pessoa.papeis?.includes('especialista') ? 'especialista' : null,
        created_at: pessoa.created_at,
        updated_at: pessoa.updated_at,
        status: pessoa.status
      }));
    }
  });
}

export async function getProfileByIdCompat(profileId: string): Promise<ProfileCompat | null> {
  const { data, error } = await supabase
    .from('pessoas')
    .select('*')
    .eq('profile_id', profileId)
    .maybeSingle();
  
  if (error || !data) return null;
  
  return {
    id: data.profile_id!,
    nome: data.nome,
    email: data.email,
    telefone: Array.isArray(data.telefones) ? data.telefones[0] : null,
    avatar_url: null,
    especialidade: data.papeis?.includes('especialista') ? 'especialista' : null,
    created_at: data.created_at,
    updated_at: data.updated_at,
    status: data.status
  };
}
