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
  // Logo da empresa
  logo_url?: string | null;
  // Novos campos CNPJ
  razao_social?: string | null;
  nome_fantasia?: string | null;
  situacao_cadastral?: string | null;
  cnae_principal?: string | null;
  cnpj_fonte?: string | null;
  cnpj_ultima_consulta?: string | null;
  // Campos para sistema de login
  email_login?: string;
  senha_temporaria?: string;
  criar_conta?: boolean;
  status_conta?: string;
}

interface ClienteWithSensitiveFlag extends Cliente {
  _hasSensitiveAccess?: boolean;
}

/**
 * Hook to manage client data access with security filtering
 * Uses database-level security functions to ensure proper data protection
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
      // Use secure database function to get filtered customer data
      const { data: filteredData, error: fetchError } = await supabase
        .rpc('get_filtered_customers_list');

      if (fetchError) {
        console.error('Erro ao buscar clientes:', fetchError);
        setError('Erro ao carregar dados dos clientes');
        return;
      }

      // Convert JSONB array to TypeScript objects and add sensitive access flag
      const clientesArray = Array.isArray(filteredData) ? filteredData : [];
      const clientes = clientesArray.map((cliente: any) => ({
        ...cliente,
        _hasSensitiveAccess: !!(cliente.email || cliente.telefone || cliente.cnpj_cpf || cliente.endereco)
      }));

      setClientes(clientes);
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

      // Refresh the list with secure data
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

      // Refresh the list with secure data
      await fetchClientes();
      
      return { data, error: null };
    } catch (err: any) {
      console.error('Erro ao atualizar cliente:', err);
      return { data: null, error: err.message };
    }
  };

  const deleteCliente = async (id: string) => {
    try {
      // FASE 2: Atualizar estado local imediatamente para feedback visual instantâneo
      setClientes(prev => prev.filter(cliente => cliente.id !== id));

      const { error: deleteError } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (deleteError) {
        // Se houver erro, reverter o estado local
        await fetchClientes();
        throw new Error(deleteError.message);
      }

      // Confirmar exclusão com refetch
      await fetchClientes();
      
      return { error: null };
    } catch (err: any) {
      console.error('Erro ao deletar cliente:', err);
      return { error: err.message };
    }
  };

  const getClienteById = async (id: string): Promise<ClienteWithSensitiveFlag | null> => {
    try {
      // Use secure database function to get filtered customer data
      const { data: filteredData, error: fetchError } = await supabase
        .rpc('get_filtered_customer_data', { customer_id: id });

      if (fetchError) {
        console.error('Erro ao buscar cliente:', fetchError);
        return null;
      }

      if (!filteredData) {
        return null;
      }

      // Add sensitive access flag based on whether sensitive data is present  
      const cliente = filteredData as any;
      return {
        ...cliente,
        _hasSensitiveAccess: !!(cliente.email || cliente.telefone || cliente.cnpj_cpf || cliente.endereco)
      } as ClienteWithSensitiveFlag;
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