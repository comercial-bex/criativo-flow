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
      // Use secure database function that handles sensitive data filtering server-side
      const { data, error: fetchError } = await supabase
        .rpc('get_filtered_customers_list');

      if (fetchError) {
        console.error('Erro ao buscar clientes:', fetchError);
        setError('Erro ao carregar dados dos clientes');
        return;
      }

      // The data is already filtered by the secure database function
      const clientesData = Array.isArray(data) ? data : [];
      
      // Add the sensitive access flag based on what data is present
      const clientesWithFlags: ClienteWithSensitiveFlag[] = clientesData.map((cliente: any) => ({
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone,
        cnpj_cpf: cliente.cnpj_cpf,
        endereco: cliente.endereco,
        status: cliente.status,
        responsavel_id: cliente.responsavel_id,
        assinatura_id: cliente.assinatura_id,
        created_at: cliente.created_at,
        updated_at: cliente.updated_at,
        _hasSensitiveAccess: !!(cliente.email || cliente.telefone || cliente.cnpj_cpf || cliente.endereco)
      }));

      setClientes(clientesWithFlags);
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
      // Use secure database function that handles sensitive data filtering server-side
      const { data, error: fetchError } = await supabase
        .rpc('get_filtered_customer_data', { customer_id: id });

      if (fetchError) {
        console.error('Erro ao buscar cliente:', fetchError);
        return null;
      }

      if (!data) {
        return null;
      }

      // Type assertion since we know the structure from our database function
      const rawData = data as any;
      
      // Add the sensitive access flag based on what data is present
      const clienteData: ClienteWithSensitiveFlag = {
        id: rawData.id,
        nome: rawData.nome,
        email: rawData.email,
        telefone: rawData.telefone,
        cnpj_cpf: rawData.cnpj_cpf,
        endereco: rawData.endereco,
        status: rawData.status,
        responsavel_id: rawData.responsavel_id,
        assinatura_id: rawData.assinatura_id,
        created_at: rawData.created_at,
        updated_at: rawData.updated_at,
        _hasSensitiveAccess: !!(rawData.email || rawData.telefone || rawData.cnpj_cpf || rawData.endereco)
      };

      return clienteData;
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