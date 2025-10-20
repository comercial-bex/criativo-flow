import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from './useUserRole';

export interface Profile {
  id: string;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  avatar_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface ProfileWithAccessFlag extends Profile {
  _hasFullAccess?: boolean;
}

export function useProfileData() {
  const { role } = useUserRole();
  const [profiles, setProfiles] = useState<ProfileWithAccessFlag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('pessoas')
        .select('id, nome, email, telefones, profile_id, created_at, updated_at')
        .not('profile_id', 'is', null)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Erro ao buscar perfis:', fetchError);
        setError('Erro ao carregar dados dos perfis');
        return;
      }

      const profilesWithAccess = (data || []).map((pessoa: any) => ({
        id: pessoa.profile_id,
        nome: pessoa.nome,
        email: pessoa.email,
        telefone: Array.isArray(pessoa.telefones) ? pessoa.telefones[0] : null,
        avatar_url: null,
        created_at: pessoa.created_at,
        updated_at: pessoa.updated_at,
        _hasFullAccess: true
      }));

      setProfiles(profilesWithAccess);
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Erro inesperado ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getProfileById = async (id: string): Promise<ProfileWithAccessFlag | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('pessoas')
        .select('*')
        .eq('profile_id', id)
        .maybeSingle();

      if (fetchError) {
        console.error('Erro ao buscar perfil:', fetchError);
        return null;
      }

      if (!data) return null;

      return {
        id: data.profile_id!,
        nome: data.nome,
        email: data.email,
        telefone: Array.isArray(data.telefones) ? data.telefones[0] : null,
        avatar_url: null,
        created_at: data.created_at,
        updated_at: data.updated_at,
        _hasFullAccess: true
      };
    } catch (err) {
      console.error('Erro inesperado ao buscar perfil:', err);
      return null;
    }
  };

  const updateProfile = async (id: string, profileData: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('pessoas')
        .update({
          nome: profileData.nome,
          email: profileData.email,
          telefones: profileData.telefone ? [profileData.telefone] : []
        })
        .eq('profile_id', id)
        .select()
        .maybeSingle();

      if (updateError) {
        throw new Error(updateError.message);
      }

      await fetchProfiles();
      
      return { data, error: null };
    } catch (err: any) {
      console.error('Erro ao atualizar perfil:', err);
      return { data: null, error: err.message };
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [role]);

  return {
    profiles,
    loading,
    error,
    fetchProfiles,
    getProfileById,
    updateProfile
  };
}