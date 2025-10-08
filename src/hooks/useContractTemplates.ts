import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { smartToast } from "@/lib/smart-toast";
import mammoth from "mammoth";

export interface ContractTemplate {
  id: string;
  nome: string;
  descricao?: string;
  categoria?: string;
  tipo_original: 'html' | 'docx';
  corpo_html: string;
  arquivo_original_url?: string;
  variaveis_disponiveis?: string[];
  ativo: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export function useContractTemplates() {
  const queryClient = useQueryClient();

  // Detectar merge tags no formato {{variavel}}
  const detectMergeTags = (html: string): string[] => {
    const regex = /\{\{([a-zA-Z0-9_]+)\}\}/g;
    const tags = new Set<string>();
    let match;
    
    while ((match = regex.exec(html)) !== null) {
      tags.add(match[1]);
    }
    
    return Array.from(tags);
  };

  // Buscar templates
  const { data: templates = [], isLoading: loading } = useQuery({
    queryKey: ["contract-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contrato_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ContractTemplate[];
    },
  });

  // Buscar template único
  const fetchTemplate = async (id: string): Promise<ContractTemplate | null> => {
    const { data, error } = await supabase
      .from("contrato_templates")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as ContractTemplate;
  };

  // Upload de arquivo original para storage
  const uploadOriginalFile = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from("contract-templates")
      .upload(fileName, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from("contract-templates")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  // Converter DOCX para HTML usando mammoth.js
  const convertDocxToHtml = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    
    if (result.messages.length > 0) {
      console.warn("Avisos da conversão DOCX:", result.messages);
    }
    
    return result.value;
  };

  // Criar template
  const createMutation = useMutation({
    mutationFn: async (data: {
      nome: string;
      descricao?: string;
      categoria?: string;
      tipo_original: 'html' | 'docx';
      corpo_html: string;
      arquivo_original_url?: string;
    }) => {
      const tags = detectMergeTags(data.corpo_html);
      
      const { data: result, error } = await supabase
        .from("contrato_templates")
        .insert([{
          ...data,
          variaveis_disponiveis: tags,
          ativo: true,
        }])
        .select()
        .single();

      if (error) throw error;

      // Log de atividade
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc("criar_log_atividade", {
          p_cliente_id: null,
          p_usuario_id: user.id,
          p_acao: "insert",
          p_entidade_tipo: "contrato_template",
          p_entidade_id: result.id,
          p_descricao: `Template "${data.nome}" criado`,
          p_metadata: { nome: data.nome, tags_detectadas: tags.length },
        });
      }

      return result;
    },
    onSuccess: () => {
      smartToast.success("Template criado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["contract-templates"] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao criar template", error.message);
    },
  });

  // Atualizar template
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<ContractTemplate> & { id: string }) => {
      const updates: any = { ...data };
      
      if (data.corpo_html) {
        updates.variaveis_disponiveis = detectMergeTags(data.corpo_html);
      }

      const { error } = await supabase
        .from("contrato_templates")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      // Log de atividade
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc("criar_log_atividade", {
          p_cliente_id: null,
          p_usuario_id: user.id,
          p_acao: "update",
          p_entidade_tipo: "contrato_template",
          p_entidade_id: id,
          p_descricao: `Template atualizado`,
          p_metadata: data,
        });
      }
    },
    onSuccess: () => {
      smartToast.success("Template atualizado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["contract-templates"] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao atualizar template", error.message);
    },
  });

  // Toggle ativo/inativo
  const toggleAtivoMutation = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase
        .from("contrato_templates")
        .update({ ativo })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      smartToast.success(variables.ativo ? "Template ativado" : "Template desativado");
      queryClient.invalidateQueries({ queryKey: ["contract-templates"] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao atualizar status", error.message);
    },
  });

  // Deletar template
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("contrato_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Log
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc("criar_log_atividade", {
          p_cliente_id: null,
          p_usuario_id: user.id,
          p_acao: "delete",
          p_entidade_tipo: "contrato_template",
          p_entidade_id: id,
          p_descricao: "Template excluído",
          p_metadata: {},
        });
      }
    },
    onSuccess: () => {
      smartToast.success("Template excluído com sucesso");
      queryClient.invalidateQueries({ queryKey: ["contract-templates"] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao excluir template", error.message);
    },
  });

  // Duplicar template
  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      const original = await fetchTemplate(id);
      if (!original) throw new Error("Template não encontrado");

      const { data, error } = await supabase
        .from("contrato_templates")
        .insert([{
          nome: `${original.nome} (Cópia)`,
          descricao: original.descricao,
          categoria: original.categoria,
          tipo_original: original.tipo_original,
          corpo_html: original.corpo_html,
          variaveis_disponiveis: original.variaveis_disponiveis,
          ativo: true,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      smartToast.success("Template duplicado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["contract-templates"] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao duplicar template", error.message);
    },
  });

  return {
    templates,
    loading,
    detectMergeTags,
    uploadOriginalFile,
    convertDocxToHtml,
    fetchTemplate,
    createTemplate: createMutation.mutate,
    updateTemplate: updateMutation.mutate,
    toggleAtivo: toggleAtivoMutation.mutate,
    deleteTemplate: deleteMutation.mutate,
    duplicateTemplate: duplicateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
