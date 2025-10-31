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

  // ✅ ATUALIZADO: Usar decrypt_credential do backend
  const getCredentialDecrypted = useMutation({
    mutationFn: async (credId: string) => {
      const { data: cred, error } = await supabase
        .from('credenciais_cliente')
        .select('id, cliente_id, projeto_id, senha, tokens_api, plataforma, categoria, usuario_login, extra, updated_at')
        .eq('id', credId)
        .single();

      if (error) throw error;

      // Descriptografar senha usando função do backend
      const { data: senhaDecrypted } = await supabase.rpc('decrypt_credential', {
        encrypted_text: cred.senha
      });

      return {
        id: cred.id,
        cliente_id: cred.cliente_id,
        projeto_id: cred.projeto_id,
        plataforma: cred.plataforma,
        categoria: cred.categoria,
        usuario_login: cred.usuario_login,
        senha_decrypted: senhaDecrypted || '[ERRO]',
        tokens_api_decrypted: cred.tokens_api || {},
        url: null,
        extra: cred.extra || {},
        updated_at: cred.updated_at
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
