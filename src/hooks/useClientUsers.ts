import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { smartToast } from "@/lib/smart-toast";

export interface ClientUser {
  id: string;
  user_id: string;
  cliente_id: string;
  role_cliente: string;
  permissoes: any;
  ativo: boolean;
  created_at: string;
  profiles: {
    nome: string;
    email: string;
  };
}

export function useClientUsers(clienteId: string) {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["client-users", clienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cliente_usuarios")
        .select(`
          *,
          profiles!user_id (nome, email)
        `)
        .eq("cliente_id", clienteId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as any as ClientUser[];
    },
    enabled: !!clienteId,
  });

  const deactivateMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("cliente_usuarios")
        .update({ ativo: false })
        .eq("user_id", userId)
        .eq("cliente_id", clienteId);

      if (error) throw error;
    },
    onSuccess: () => {
      smartToast.success("Usuário desativado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["client-users", clienteId] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao desativar usuário", error.message);
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role, permissoes }: { userId: string; role: any; permissoes: any }) => {
      const { error } = await supabase
        .from("cliente_usuarios")
        .update({ role_cliente: role as any, permissoes })
        .eq("user_id", userId)
        .eq("cliente_id", clienteId);

      if (error) throw error;
    },
    onSuccess: () => {
      smartToast.success("Usuário atualizado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["client-users", clienteId] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao atualizar usuário", error.message);
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: { 
      email: string; 
      password: string; 
      nome: string; 
      role_cliente: string;
    }) => {
      const { data, error } = await supabase.functions.invoke(
        'create-client-user',
        {
          body: {
            email: userData.email,
            password: userData.password,
            nome: userData.nome,
            cliente_id: clienteId,
            role: 'cliente',
            role_cliente: userData.role_cliente
          }
        }
      );
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      smartToast.success("Usuário criado com sucesso!");
      smartToast.info(`Email: ${data.email} | Senha: ${data.password}`);
      queryClient.invalidateQueries({ queryKey: ["client-users", clienteId] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao criar usuário", error.message);
    }
  });

  return {
    users,
    loading: isLoading,
    deactivateUser: deactivateMutation.mutate,
    updateRole: updateRoleMutation.mutate,
    createUser: createUserMutation.mutate,
    creatingUser: createUserMutation.isPending,
  };
}
