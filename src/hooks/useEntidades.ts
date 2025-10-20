import { useQuery } from "@tanstack/react-query";
import { smartToast } from "@/lib/smart-toast";

export interface Entidade {
  id: string;
  nome: string;
}

const SUPABASE_URL = "https://xvpqgwbktpfodbuhwqhh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cHFnd2JrdHBmb2RidWh3cWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NDA0MzUsImV4cCI6MjA3MzExNjQzNX0.slj0vNEGfgTFv_vB_4ieLH1zuHSP_A6dAZsMmHVWnto";

async function fetchEntidades(tipo: 'pagar' | 'receber'): Promise<Entidade[]> {
  const tabela = tipo === 'receber' ? 'clientes' : 'fornecedores';
  const url = `${SUPABASE_URL}/rest/v1/${tabela}?select=id,razao_social,nome_fantasia&ativo=eq.true&order=razao_social.asc`;
  
  const token = localStorage.getItem('sb-xvpqgwbktpfodbuhwqhh-auth-token');
  const authToken = token ? JSON.parse(token).access_token : null;
  
  const response = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${authToken || SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Erro ao buscar ${tabela}:`, errorText);
    
    if (response.status === 400 || response.status === 403) {
      smartToast.error("Sem permissão", `Você não tem permissão para acessar ${tabela}`);
    }
    
    throw new Error(`Erro ${response.status}: ${errorText}`);
  }
  
  const data = await response.json();
  
  return (data || []).map((item: any) => ({
    id: item.id,
    nome: item.nome_fantasia || item.razao_social,
  }));
}

export function useEntidades(tipo: 'pagar' | 'receber') {
  return useQuery<Entidade[]>({
    queryKey: [tipo === 'receber' ? 'clientes' : 'fornecedores', 'entidades'],
    queryFn: () => fetchEntidades(tipo),
    retry: 1,
  });
}
