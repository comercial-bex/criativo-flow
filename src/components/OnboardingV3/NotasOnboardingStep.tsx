import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Link as LinkIcon, Sparkles, Archive } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NotaDialog } from "./NotaDialog";
import { NotaCard } from "./NotaCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface NotaOnboarding {
  id?: string;
  titulo: string;
  conteudo: string;
  tipo_nota: 'briefing' | 'mercado' | 'swot' | 'estrategia' | 'geral';
  link_chatgpt?: string;
  arquivo_anexo_url?: string;
  arquivo_nome?: string;
  arquivo_tipo?: string;
  analise_ia?: any;
  keywords?: string[];
  categoria_ia?: string;
  relevancia_score?: number;
  created_at?: string;
  updated_at?: string;
}

interface NotasOnboardingStepProps {
  clienteId: string;
  onboardingId?: string;
}

export function NotasOnboardingStep({ clienteId, onboardingId }: NotasOnboardingStepProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNota, setEditingNota] = useState<NotaOnboarding | undefined>();

  const { data: notas = [], isLoading, refetch } = useQuery({
    queryKey: ['notas-onboarding', clienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notas_onboarding')
        .select('*')
        .eq('cliente_id', clienteId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as NotaOnboarding[];
    },
  });

  const handleNovaNota = () => {
    setEditingNota(undefined);
    setDialogOpen(true);
  };

  const handleEditNota = (nota: NotaOnboarding) => {
    setEditingNota(nota);
    setDialogOpen(true);
  };

  const handleArquivarNota = async (notaId: string) => {
    try {
      const { error } = await supabase
        .from('notas_onboarding')
        .update({ is_archived: true, is_active: false })
        .eq('id', notaId);

      if (error) throw error;

      toast.success("Nota arquivada com sucesso");
      refetch();
    } catch (error) {
      console.error("Erro ao arquivar nota:", error);
      toast.error("Falha ao arquivar nota");
    }
  };

  const notasAtivas = notas.filter(n => !n.id?.includes('archived'));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card variant="gaming" withGlow>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Notas Internas Estratégicas</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Centralize informações do ChatGPT, briefings e insights de mercado
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm">
                {notasAtivas.length} {notasAtivas.length === 1 ? 'nota' : 'notas'}
              </Badge>
              <Button onClick={handleNovaNota} className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Nota
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Grid de Notas */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} variant="gaming" className="animate-pulse">
              <CardContent className="p-6 space-y-4">
                <div className="h-6 bg-muted rounded" />
                <div className="h-20 bg-muted rounded" />
                <div className="flex gap-2">
                  <div className="h-6 w-20 bg-muted rounded" />
                  <div className="h-6 w-20 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : notasAtivas.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 space-y-4"
        >
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Nenhuma nota cadastrada</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Crie sua primeira nota para centralizar informações estratégicas do cliente
          </p>
          <Button onClick={handleNovaNota} className="gap-2 mt-4">
            <Plus className="h-4 w-4" />
            Criar Primeira Nota
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {notasAtivas.map((nota, index) => (
              <NotaCard
                key={nota.id}
                nota={nota}
                index={index}
                onEdit={handleEditNota}
                onArchive={handleArquivarNota}
                onAnalyze={() => {
                  setEditingNota(nota);
                  setDialogOpen(true);
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Dialog de Criação/Edição */}
      <NotaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        clienteId={clienteId}
        onboardingId={onboardingId}
        editingNota={editingNota}
        onSuccess={refetch}
      />
    </div>
  );
}