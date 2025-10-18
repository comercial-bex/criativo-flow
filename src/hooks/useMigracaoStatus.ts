import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProgressoMigracao {
  pendentes?: number;
  migrados?: number;
  com_erro?: number;
  conflitos?: number;
  total?: number;
  percentual_concluido?: number;
}

interface AuditoriaMigracao {
  id: string;
  cliente_id: string;
  status: string;
  dados_originais: any;
  tentativas?: number;
  ultima_tentativa?: string;
  erro_mensagem?: string;
  migrado_em?: string;
}

interface ConflitoDuplicata {
  cliente_id: string;
  cliente_nome: string;
  cliente_email: string;
  cliente_cnpj: string;
  pessoa_id: string;
  pessoa_nome: string;
  pessoa_email: string;
  pessoa_cpf: string;
  tipo_conflito: string;
  pessoa_ja_eh_cliente: boolean;
}

export function useMigracaoStatus() {
  // Buscar progresso
  const { data: progresso, isLoading: loadingProgresso, refetch: refetchProgresso } = useQuery({
    queryKey: ['migracao-progresso'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_progresso_migracao_clientes')
        .select('*')
        .single();

      if (error) throw error;
      return data as ProgressoMigracao;
    }
  });

  // Buscar auditoria
  const { data: auditoria, isLoading: loadingAuditoria, refetch: refetchAuditoria } = useQuery({
    queryKey: ['migracao-auditoria'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('migracao_clientes_audit')
        .select('*')
        .order('criado_em', { ascending: false });

      if (error) throw error;
      return data as AuditoriaMigracao[];
    }
  });

  // Buscar conflitos
  const { data: conflitos, isLoading: loadingConflitos, refetch: refetchConflitos } = useQuery({
    queryKey: ['migracao-conflitos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_conflitos_migracao_clientes')
        .select('*');

      if (error) throw error;
      return data as ConflitoDuplicata[];
    }
  });

  const refetch = () => {
    refetchProgresso();
    refetchAuditoria();
    refetchConflitos();
  };

  return {
    progresso,
    auditoria,
    conflitos,
    isLoading: loadingProgresso || loadingAuditoria || loadingConflitos,
    refetch
  };
}
