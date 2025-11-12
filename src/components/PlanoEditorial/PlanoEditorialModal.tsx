import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlanoEditorialHeader } from "./PlanoEditorialHeader";
import { PlanoEditorialDashboard } from "./PlanoEditorialDashboard";
import { PlanoEditorialTable } from "./PlanoEditorialTable";
import { PlanoEditorialObservacoes } from "./PlanoEditorialObservacoes";
import { ExportPDFButton } from "./ExportPDFButton";
import { Button } from "@/components/ui/button";
import { Save, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast-compat";

interface PlanoEditorialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planejamentoId: string;
  onRefresh?: () => void;
}

export function PlanoEditorialModal({
  open,
  onOpenChange,
  planejamentoId,
  onRefresh
}: PlanoEditorialModalProps) {
  const [planejamento, setPlanejamento] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Buscar planejamento
      const { data: planData, error: planError } = await supabase
        .from('planejamentos')
        .select(`
          *,
          clientes (id, nome),
          responsavel:pessoas!planejamentos_responsavel_id_fkey (id, nome)
        `)
        .eq('id', planejamentoId)
        .single();

      if (planError) throw planError;
      setPlanejamento(planData);

      // Buscar posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts_planejamento')
        .select(`
          *,
          responsavel:pessoas!posts_planejamento_responsavel_id_fkey (id, nome)
        `)
        .eq('planejamento_id', planejamentoId)
        .order('data_postagem', { ascending: true });

      if (postsError) throw postsError;
      setPosts(postsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do plano editorial');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRascunho = async () => {
    try {
      const { error } = await supabase
        .from('planejamentos')
        .update({ status_plano: 'em_andamento' })
        .eq('id', planejamentoId);

      if (error) throw error;
      toast.success('Rascunho salvo com sucesso');
      onRefresh?.();
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
      toast.error('Erro ao salvar rascunho');
    }
  };

  const handleAprovarPlano = async () => {
    try {
      const { error } = await supabase
        .from('planejamentos')
        .update({ status_plano: 'aprovado' })
        .eq('id', planejamentoId);

      if (error) throw error;
      toast.success('Plano aprovado com sucesso!');
      onRefresh?.();
      fetchData();
    } catch (error) {
      console.error('Erro ao aprovar plano:', error);
      toast.error('Erro ao aprovar plano');
    }
  };

  useState(() => {
    if (open) {
      fetchData();
    }
  });

  if (!planejamento) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] h-[95vh] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold">
            📋 Plano Editorial Mensal
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <PlanoEditorialHeader
            planejamento={planejamento}
            onUpdate={fetchData}
          />

          <Tabs defaultValue="dashboard" className="flex-1 flex flex-col">
            <TabsList className="mx-6 mt-4 w-fit">
              <TabsTrigger value="dashboard">📊 Visão Geral</TabsTrigger>
              <TabsTrigger value="posts">📝 Posts</TabsTrigger>
              <TabsTrigger value="observacoes">💬 Observações</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="flex-1 overflow-auto px-6 pb-6">
              <PlanoEditorialDashboard
                posts={posts}
                planejamento={planejamento}
              />
            </TabsContent>

            <TabsContent value="posts" className="flex-1 overflow-auto px-6 pb-6">
              <PlanoEditorialTable
                posts={posts}
                planejamentoId={planejamentoId}
                onRefresh={fetchData}
              />
            </TabsContent>

            <TabsContent value="observacoes" className="flex-1 overflow-auto px-6 pb-6">
              <PlanoEditorialObservacoes
                planejamentoId={planejamentoId}
                observacoes={planejamento.observacoes_estrategista}
                onSave={fetchData}
              />
            </TabsContent>
          </Tabs>

          <div className="border-t px-6 py-4 flex items-center justify-between bg-muted/30">
            <div className="flex gap-2">
              <Button onClick={handleSaveRascunho} variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Salvar Rascunho
              </Button>
              <Button onClick={handleAprovarPlano}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Aprovar Plano
              </Button>
            </div>
            <ExportPDFButton planejamentoId={planejamentoId} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
