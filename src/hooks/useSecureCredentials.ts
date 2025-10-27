import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { smartToast } from "@/lib/smart-toast";

interface CredentialData {
  clienteId: string;
  projetoId?: string;
  plataforma: string;
  categoria: string;
  usuario: string;
  senha: string;
  tokens?: Record<string, any>;
  url?: string;
  extra?: Record<string, any>;
}

interface SecureCredential {
  id: string;
  cliente_id: string;
  projeto_id: string | null;
  plataforma: string;
  categoria: string;
  usuario_login: string;
  senha_decrypted: string;
  tokens_api_decrypted: Record<string, any>;
  url: string | null;
  extra: Record<string, any>;
  updated_at: string;
}

export function useSecureCredentials(clienteId?: string) {
  const queryClient = useQueryClient();

  // ✅ SPRINT 1: Mutation - Salvar credencial criptografada (AES-256)
  const saveCredential = useMutation({
    mutationFn: async (data: CredentialData) => {
      const { data: result, error } = await supabase.rpc('save_credential_secure', {
        p_cliente_id: data.clienteId,
        p_projeto_id: data.projetoId || null,
        p_plataforma: data.plataforma,
        p_categoria: data.categoria,
        p_usuario_login: data.usuario,
        p_senha_plain: data.senha,
        p_tokens_api_plain: data.tokens || {},
        p_url: data.url || null,
        p_extra: data.extra || {}
      });

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      smartToast.success("🔒 Credencial salva com criptografia AES-256");
      queryClient.invalidateQueries({ queryKey: ['credentials', clienteId] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao salvar credencial", error.message);
    }
  });

  // ✅ SPRINT 1: Mutation - Recuperar credencial descriptografada (segura)
  const getCredentialDecrypted = useMutation({
    mutationFn: async (credId: string) => {
      const { data, error } = await supabase.rpc('get_credential_secure', {
        p_cred_id: credId
      });

      if (error) throw error;
      
      // ⚠️ NUNCA logar dados decriptados em produção
      return data[0] as SecureCredential;
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao acessar credencial", error.message);
    }
  });

  // Query: Listar credenciais (apenas metadados, sem senhas)
  const { data: credentials = [], isLoading } = useQuery({
    queryKey: ['credentials', clienteId],
    queryFn: async () => {
      if (!clienteId) return [];

      const { data, error } = await supabase
        .from('credenciais_cliente')
        .select('id, plataforma, categoria, usuario_login, url, updated_at')
        .eq('cliente_id', clienteId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!clienteId
  });

  return {
    saveCredential: saveCredential.mutate,
    isSaving: saveCredential.isPending,
    getCredentialDecrypted: getCredentialDecrypted.mutateAsync,
    isDecrypting: getCredentialDecrypted.isPending,
    credentials,
    isLoading
  };
}
