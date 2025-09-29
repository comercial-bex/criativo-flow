import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface GRSContextData {
  selectedClientId: string | null;
  setSelectedClientId: (clientId: string | null) => void;
  clientName: string | null;
  isLoading: boolean;
  breadcrumb: string[];
  refreshData: () => Promise<void>;
}

const GRSContext = createContext<GRSContextData | undefined>(undefined);

export function useGRSContext() {
  const context = useContext(GRSContext);
  if (!context) {
    throw new Error('useGRSContext must be used within a GRSProvider');
  }
  return context;
}

export function useGRSData() {
  const location = useLocation();
  const params = useParams();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientName, setClientName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-detect client from URL
  useEffect(() => {
    if (params.clienteId && params.clienteId !== selectedClientId) {
      setSelectedClientId(params.clienteId);
    }
  }, [params.clienteId, selectedClientId]);

  // Fetch client name when client is selected
  useEffect(() => {
    if (selectedClientId && !clientName) {
      fetchClientName();
    }
  }, [selectedClientId, clientName]);

  const fetchClientName = async () => {
    if (!selectedClientId) return;
    
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('clientes')
        .select('nome')
        .eq('id', selectedClientId)
        .single();
      
      setClientName(data?.nome || null);
    } catch (error) {
      console.error('Error fetching client name:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    if (selectedClientId) {
      await fetchClientName();
    }
  };

  // Generate breadcrumb
  const breadcrumb = ['GRS'];
  if (clientName) {
    breadcrumb.push(clientName);
  }
  
  const pathSegments = location.pathname.split('/').filter(Boolean);
  if (pathSegments.length > 1) {
    const page = pathSegments[1];
    const pageNames: Record<string, string> = {
      'planejamentos': 'Planejamentos',
      'calendario-editorial': 'Calendário Editorial',
      'agendamento-social': 'Agendamento Social',
      'aprovacoes': 'Aprovações',
      'relatorios': 'Relatórios'
    };
    
    if (pageNames[page]) {
      breadcrumb.push(pageNames[page]);
    }
  }

  return {
    selectedClientId,
    setSelectedClientId,
    clientName,
    isLoading,
    breadcrumb,
    refreshData
  };
}

interface GRSProviderProps {
  children: ReactNode;
}

export function GRSProvider({ children }: GRSProviderProps) {
  const grsData = useGRSData();
  
  return (
    <GRSContext.Provider value={grsData}>
      {children}
    </GRSContext.Provider>
  );
}