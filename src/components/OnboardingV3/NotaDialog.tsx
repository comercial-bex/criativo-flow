import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, FileText, TrendingUp, Target, Lightbulb, Link as LinkIcon } from "lucide-react";
import { toast } from '@/lib/toast-compat';
import { supabase } from "@/integrations/supabase/client";
import { NotaOnboarding } from "./NotasOnboardingStep";
import { FileUploader } from "./FileUploader";
import { useMutation } from "@tanstack/react-query";

interface NotaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clienteId: string;
  onboardingId?: string;
  editingNota?: NotaOnboarding;
  onSuccess: () => void;
}

const tipoOptions = [
  { value: 'briefing', label: 'Briefing', icon: FileText },
  { value: 'mercado', label: 'Análise de Mercado', icon: TrendingUp },
  { value: 'swot', label: 'SWOT', icon: Target },
  { value: 'estrategia', label: 'Estratégia', icon: Lightbulb },
  { value: 'geral', label: 'Geral', icon: FileText },
];

export function NotaDialog({ 
  open, 
  onOpenChange, 
  clienteId, 
  onboardingId,
  editingNota,
  onSuccess 
}: NotaDialogProps) {
  const [titulo, setTitulo] = useState(editingNota?.titulo || "");
  const [conteudo, setConteudo] = useState(editingNota?.conteudo || "");
  const [tipoNota, setTipoNota] = useState<string>(editingNota?.tipo_nota || 'geral');
  const [linkChatgpt, setLinkChatgpt] = useState(editingNota?.link_chatgpt || "");
  const [arquivoUrl, setArquivoUrl] = useState(editingNota?.arquivo_anexo_url || "");
  const [arquivoNome, setArquivoNome] = useState(editingNota?.arquivo_nome || "");
  const [analiseIA, setAnaliseIA] = useState(editingNota?.analise_ia);
  const [keywords, setKeywords] = useState<string[]>(editingNota?.keywords || []);
  const [relevanciaScore, setRelevanciaScore] = useState<number | undefined>(editingNota?.relevancia_score);

  const salvarNotaMutation = useMutation({
    mutationFn: async () => {
      const notaData = {
        cliente_id: clienteId,
        onboarding_id: onboardingId,
        titulo,
        conteudo,
        tipo_nota: tipoNota,
        link_chatgpt: linkChatgpt || null,
        arquivo_anexo_url: arquivoUrl || null,
        arquivo_nome: arquivoNome || null,
        analise_ia: analiseIA,
        keywords,
        relevancia_score: relevanciaScore,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      };

      if (editingNota?.id) {
        const { error } = await supabase
          .from('notas_onboarding')
          .update(notaData)
          .eq('id', editingNota.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notas_onboarding')
          .insert(notaData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingNota ? "Nota atualizada!" : "Nota criada com sucesso!");
      onSuccess();
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      console.error("Erro ao salvar nota:", error);
      toast.error("Falha ao salvar nota");
    }
  });

  const analisarComIAMutation = useMutation({
    mutationFn: async () => {
      if (!titulo || !conteudo) {
        throw new Error("Preencha título e conteúdo antes de analisar");
      }

      // Primeiro salvar a nota
      let notaId = editingNota?.id;
      if (!notaId) {
        const { data, error } = await supabase
          .from('notas_onboarding')
          .insert({
            cliente_id: clienteId,
            onboarding_id: onboardingId,
            titulo,
            conteudo,
            tipo_nota: tipoNota,
            link_chatgpt: linkChatgpt || null,
            created_by: (await supabase.auth.getUser()).data.user?.id,
          })
          .select()
          .single();

        if (error) throw error;
        notaId = data.id;
      }

      // Chamar edge function de análise
      const { data, error } = await supabase.functions.invoke('analyze-nota-onboarding', {
        body: { 
          notaId, 
          titulo, 
          conteudo, 
          tipoNota 
        }
      });

      if (error) throw error;
      return { notaId, analise: data.analise };
    },
    onSuccess: ({ analise }) => {
      setAnaliseIA(analise.insights);
      setKeywords(analise.keywords);
      setRelevanciaScore(analise.relevancia_score);
      toast.success("Análise IA concluída!");
      onSuccess();
    },
    onError: (error: any) => {
      console.error("Erro na análise IA:", error);
      if (error.message?.includes("429")) {
        toast.error("Limite de requisições excedido. Aguarde alguns instantes.");
      } else if (error.message?.includes("402")) {
        toast.error("Créditos insuficientes. Adicione créditos em Settings.");
      } else {
        toast.error("Falha na análise IA");
      }
    }
  });

  const resetForm = () => {
    setTitulo("");
    setConteudo("");
    setTipoNota('geral');
    setLinkChatgpt("");
    setArquivoUrl("");
    setArquivoNome("");
    setAnaliseIA(undefined);
    setKeywords([]);
    setRelevanciaScore(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="gaming" className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingNota ? "Editar Nota Estratégica" : "Nova Nota Estratégica"}
          </DialogTitle>
          <DialogDescription>
            Centralize informações do ChatGPT, briefings e insights de mercado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Análise de Concorrência Digital"
              maxLength={200}
            />
          </div>

          {/* Tipo de Nota */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Nota *</Label>
            <Select value={tipoNota} onValueChange={setTipoNota}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {tipoOptions.map(opt => {
                  const Icon = opt.icon;
                  return (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {opt.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Conteúdo */}
          <div className="space-y-2">
            <Label htmlFor="conteudo">Conteúdo *</Label>
            <Textarea
              id="conteudo"
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Cole aqui informações do ChatGPT, briefing do cliente, análise de mercado..."
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Suporta Markdown • {conteudo.length} caracteres
            </p>
          </div>

          {/* Link ChatGPT */}
          <div className="space-y-2">
            <Label htmlFor="link">Link do ChatGPT (opcional)</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="link"
                  value={linkChatgpt}
                  onChange={(e) => setLinkChatgpt(e.target.value)}
                  placeholder="https://chat.openai.com/share/..."
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* File Upload */}
          <FileUploader
            onFileUploaded={(url, nome) => {
              setArquivoUrl(url);
              setArquivoNome(nome);
            }}
            currentFile={arquivoNome}
          />

          {/* Preview da Análise IA */}
          {analiseIA && (
            <div className="space-y-3 p-4 border rounded-lg bg-primary/5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">Análise IA</span>
                {relevanciaScore && (
                  <Badge variant="default" className="ml-auto">
                    {relevanciaScore.toFixed(1)}/10
                  </Badge>
                )}
              </div>

              {keywords.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Keywords:</p>
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((kw, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {analiseIA.objetivos?.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium">Objetivos ({analiseIA.objetivos.length}):</p>
                  <ul className="text-xs text-muted-foreground list-disc list-inside">
                    {analiseIA.objetivos.slice(0, 3).map((obj: string, i: number) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => analisarComIAMutation.mutate()}
              disabled={!titulo || !conteudo || analisarComIAMutation.isPending}
              className="gap-2"
            >
              {analisarComIAMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analisar com IA
                </>
              )}
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => salvarNotaMutation.mutate()}
                disabled={!titulo || !conteudo || salvarNotaMutation.isPending}
              >
                {salvarNotaMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  editingNota ? "Atualizar" : "Criar Nota"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}