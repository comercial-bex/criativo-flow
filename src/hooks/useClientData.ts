import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from './useUserRole';

export interface Cliente {
  id: string;
  nome: string;
  email?: string | null; // Sensitive data - may be filtered
  telefone?: string | null; // Sensitive data - may be filtered
  cnpj_cpf?: string | null; // Sensitive data - may be filtered
  endereco?: string | null; // Sensitive data - may be filtered
  status: 'ativo' | 'inativo' | 'pendente' | 'arquivado';
  responsavel_id?: string;
  assinatura_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface ClienteWithSensitiveFlag extends Cliente {
  _hasSensitiveAccess?: boolean;
}

/**
 * Hook to manage client data access with security filtering
 * Automatically filters sensitive personal data based on user role and permissions
 */
export function useClientData() {
  const { role } = useUserRole();
  const [clientes, setClientes] = useState<ClienteWithSensitiveFlag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClientes = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Erro ao buscar clientes:', fetchError);
        setError('Erro ao carregar dados dos clientes');
        return;
      }

      // Apply security filtering based on user role
      const filteredClientes = (data || []).map((cliente: any) => {
        const hasFullAccess = role === 'admin' || cliente.responsavel_id === (supabase.auth.getUser().then(u => u.data.user?.id));
        
        // Filter sensitive data for limited access roles
        if (!hasFullAccess && (role === 'gestor' || role === 'financeiro')) {
          return {
            ...cliente,
            email: null, // Hide sensitive personal data
            telefone: null,
            cnpj_cpf: null,
            endereco: null,
            _hasSensitiveAccess: false
          };
        }

        return {
          ...cliente,
          _hasSensitiveAccess: true
        };
      });

      setClientes(filteredClientes);
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Erro inesperado ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const createCliente = async (clienteData: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error: createError } = await supabase
        .from('clientes')
        .insert([clienteData])
        .select()
        .single();

      if (createError) {
        throw new Error(createError.message);
      }

      // Refresh the list
      await fetchClientes();
      
      return { data, error: null };
    } catch (err: any) {
      console.error('Erro ao criar cliente:', err);
      return { data: null, error: err.message };
    }
  };

  const updateCliente = async (id: string, clienteData: Partial<Omit<Cliente, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('clientes')
        .update(clienteData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Refresh the list
      await fetchClientes();
      
      return { data, error: null };
    } catch (err: any) {
      console.error('Erro ao atualizar cliente:', err);
      return { data: null, error: err.message };
    }
  };

  const deleteCliente = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      // Refresh the list
      await fetchClientes();
      
      return { error: null };
    } catch (err: any) {
      console.error('Erro ao deletar cliente:', err);
      return { error: err.message };
    }
  };

  const getClienteById = async (id: string): Promise<ClienteWithSensitiveFlag | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar cliente:', fetchError);
        return null;
      }

      // Apply same security filtering for individual client fetch
      const user = await supabase.auth.getUser();
      const hasFullAccess = role === 'admin' || data.responsavel_id === user.data.user?.id;

      if (!hasFullAccess && (role === 'gestor' || role === 'financeiro')) {
        return {
          ...data,
          email: null,
          telefone: null,
          cnpj_cpf: null,
          endereco: null,
          _hasSensitiveAccess: false
        };
      }

      return {
        ...data,
        _hasSensitiveAccess: true
      };
    } catch (err) {
      console.error('Erro inesperado ao buscar cliente:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchClientes();
  }, [role]); // Refetch when role changes

  return {
    clientes,
    loading,
    error,
    fetchClientes,
    createCliente,
    updateCliente,
    deleteCliente,
    getClienteById
  };
}