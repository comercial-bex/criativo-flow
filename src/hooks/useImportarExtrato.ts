import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { smartToast } from "@/lib/smart-toast";

export interface ExtratoImportado {
  id: string;
  conta_bancaria_id: string;
  arquivo_nome: string;
  arquivo_url: string;
  formato: 'ofx' | 'csv';
  data_importacao: string;
  periodo_inicio?: string;
  periodo_fim?: string;
  total_transacoes: number;
  transacoes_processadas: number;
  status: 'processando' | 'concluido' | 'erro';
  metadados: any;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface TransacaoTemp {
  id: string;
  extrato_id: string;
  data_transacao: string;
  descricao: string;
  valor: number;
  tipo_movimento: 'credito' | 'debito';
  saldo_apos_transacao?: number;
  numero_documento?: string;
  categoria_sugerida?: string;
  cliente_sugerido_id?: string;
  fornecedor_sugerido_id?: string;
  confianca_vinculo: number;
  titulo_vinculado_id?: string;
  status_processamento: 'pendente' | 'revisado' | 'importado' | 'descartado';
  observacoes_usuario?: string;
  comprovante_url?: string;
  created_at: string;
}

export function useImportarExtrato() {
  const queryClient = useQueryClient();

  // Query: Listar extratos importados
  const { data: extratos = [], isLoading: loadingExtratos } = useQuery({
    queryKey: ["extratos-importados"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("extratos_importados")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ExtratoImportado[];
    },
  });

  // Mutation: Upload do arquivo e criar extrato
  const uploadExtratoMutation = useMutation({
    mutationFn: async ({ file, contaBancariaId }: { file: File; contaBancariaId: string }) => {
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `extratos/${fileName}`;

      // Upload para Storage
      const { error: uploadError } = await supabase.storage
        .from("extratos_bancarios")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from("extratos_bancarios")
        .getPublicUrl(filePath);

      // Criar registro de extrato
      const formato = file.name.toLowerCase().endsWith('.ofx') ? 'ofx' : 'csv';
      
      const { data, error } = await supabase
        .from("extratos_importados")
        .insert([{
          conta_bancaria_id: contaBancariaId,
          arquivo_nome: file.name,
          arquivo_url: publicUrl,
          formato,
          status: 'processando'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      smartToast.success("Arquivo enviado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["extratos-importados"] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao enviar arquivo", error.message);
    },
  });

  // Mutation: Processar extrato (chamar Edge Function de parse)
  const parseExtratoMutation = useMutation({
    mutationFn: async ({ extratoId, config }: { extratoId: string; config?: any }) => {
      const { data: extrato } = await supabase
        .from("extratos_importados")
        .select("*")
        .eq("id", extratoId)
        .single();

      if (!extrato) throw new Error("Extrato não encontrado");

      const functionName = extrato.formato === 'ofx' ? 'parse-extrato-ofx' : 'parse-extrato-csv';
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { extratoId, config },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      smartToast.success("Extrato processado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["extratos-importados"] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao processar extrato", error.message);
    },
  });

  // Mutation: Processar transações (sugestões de vinculação)
  const processarTransacoesMutation = useMutation({
    mutationFn: async (extratoId: string) => {
      const { data, error } = await supabase.functions.invoke("process-extrato-transacoes", {
        body: { extratoId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      smartToast.success("Sugestões de vinculação geradas");
      queryClient.invalidateQueries({ queryKey: ["transacoes-temp"] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao processar transações", error.message);
    },
  });

  // Mutation: Atualizar transação temp
  const atualizarTransacaoMutation = useMutation({
    mutationFn: async ({ transacaoId, updates }: { transacaoId: string; updates: Partial<TransacaoTemp> }) => {
      const { data, error } = await supabase
        .from("extratos_transacoes_temp")
        .update(updates)
        .eq("id", transacaoId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transacoes-temp"] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao atualizar transação", error.message);
    },
  });

  // Mutation: Importar transações selecionadas
  const importarSelecionadasMutation = useMutation({
    mutationFn: async ({ extratoId, transacoesIds }: { extratoId: string; transacoesIds: string[] }) => {
      const { data, error } = await supabase.functions.invoke("importar-transacoes-aprovadas", {
        body: { extratoId, transacoesIds },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      smartToast.success(`${data.imported_count} transações importadas com sucesso`);
      queryClient.invalidateQueries({ queryKey: ["extratos-importados"] });
      queryClient.invalidateQueries({ queryKey: ["transacoes-temp"] });
      queryClient.invalidateQueries({ queryKey: ["titulos-financeiros"] });
      queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao importar transações", error.message);
    },
  });

  // Mutation: Upload de comprovante
  const uploadComprovanteMutation = useMutation({
    mutationFn: async ({ transacaoId, file }: { transacaoId: string; file: File }) => {
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `comprovantes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("extratos_bancarios")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("extratos_bancarios")
        .getPublicUrl(filePath);

      const { data, error } = await supabase
        .from("extratos_transacoes_temp")
        .update({ comprovante_url: publicUrl })
        .eq("id", transacaoId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      smartToast.success("Comprovante anexado");
      queryClient.invalidateQueries({ queryKey: ["transacoes-temp"] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao anexar comprovante", error.message);
    },
  });

  // Mutation: Deletar extrato
  const deletarExtratoMutation = useMutation({
    mutationFn: async (extratoId: string) => {
      const { error } = await supabase
        .from("extratos_importados")
        .delete()
        .eq("id", extratoId);

      if (error) throw error;
    },
    onSuccess: () => {
      smartToast.success("Extrato excluído");
      queryClient.invalidateQueries({ queryKey: ["extratos-importados"] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao excluir extrato", error.message);
    },
  });

  return {
    extratos,
    loadingExtratos,
    uploadExtrato: uploadExtratoMutation.mutate,
    uploadingExtrato: uploadExtratoMutation.isPending,
    parseExtrato: parseExtratoMutation.mutate,
    parsingExtrato: parseExtratoMutation.isPending,
    processarTransacoes: processarTransacoesMutation.mutate,
    processandoTransacoes: processarTransacoesMutation.isPending,
    atualizarTransacao: atualizarTransacaoMutation.mutate,
    importarSelecionadas: importarSelecionadasMutation.mutate,
    importando: importarSelecionadasMutation.isPending,
    uploadComprovante: uploadComprovanteMutation.mutate,
    deletarExtrato: deletarExtratoMutation.mutate,
  };
}

export function useTransacoesExtrato(extratoId: string | null) {
  const { data: transacoes = [], isLoading } = useQuery({
    queryKey: ["transacoes-temp", extratoId],
    queryFn: async () => {
      if (!extratoId) return [];
      
      const { data, error } = await supabase
        .from("extratos_transacoes_temp")
        .select("*")
        .eq("extrato_id", extratoId)
        .order("data_transacao", { ascending: false });

      if (error) throw error;
      return data as TransacaoTemp[];
    },
    enabled: !!extratoId,
  });

  return {
    transacoes,
    isLoading,
  };
}
