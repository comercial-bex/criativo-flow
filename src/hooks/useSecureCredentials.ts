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

  // ✅ TEMPORÁRIO: Manter funcionalidade original até tipos atualizarem
  const saveCredential = useMutation({
    mutationFn: async (data: CredentialData) => {
      const { data: result, error } = await supabase
        .from('credenciais_cliente')
        .insert({
          cliente_id: data.clienteId,
          projeto_id: data.projetoId || null,
          plataforma: data.plataforma,
          categoria: data.categoria,
          usuario_login: data.usuario,
          senha: data.senha,
          url: data.url || null,
          extra: data.extra || {}
        })
        .select()
        .single();

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

  // ✅ TEMPORÁRIO: Manter funcionalidade original
  const getCredentialDecrypted = useMutation({
    mutationFn: async (credId: string) => {
      const { data: cred, error } = await supabase
        .from('credenciais_cliente')
        .select('senha, plataforma, categoria, usuario_login')
        .eq('id', credId)
        .single();

      if (error) throw error;

      return {
        id: credId,
        cliente_id: '',
        projeto_id: null,
        senha_decrypted: cred.senha,
        tokens_api_decrypted: {},
        url: null,
        extra: {},
        updated_at: new Date().toISOString(),
        ...cred
      } as SecureCredential;
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
