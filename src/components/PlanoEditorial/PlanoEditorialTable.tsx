import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PlanoEditorialPostRow } from "./PlanoEditorialPostRow";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast-compat";

interface PlanoEditorialTableProps {
  posts: any[];
  planejamentoId: string;
  onRefresh: () => void;
}

export function PlanoEditorialTable({ posts, planejamentoId, onRefresh }: PlanoEditorialTableProps) {
  const [adding, setAdding] = useState(false);

  const handleAddPost = async () => {
    setAdding(true);
    try {
      const nextDay = posts.length > 0 
        ? new Date(Math.max(...posts.map(p => new Date(p.data_postagem).getTime())))
        : new Date();
      
      nextDay.setDate(nextDay.getDate() + 1);

      const { error } = await supabase
        .from('posts_planejamento')
        .insert({
          planejamento_id: planejamentoId,
          titulo: 'Novo Post',
          data_postagem: nextDay.toISOString(),
          tipo_criativo: 'card',
          formato_postagem: 'feed',
          objetivo_postagem: 'educar',
          status: 'rascunho'
        });

      if (error) throw error;
      toast.success('Post adicionado com sucesso');
      onRefresh();
    } catch (error) {
      console.error('Erro ao adicionar post:', error);
      toast.error('Erro ao adicionar post');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">📝 Tabela de Posts</h3>
        <Button onClick={handleAddPost} disabled={adding} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Post
        </Button>
      </div>

      <div className="rounded-2xl border bg-card shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[60px] font-bold">#</TableHead>
                <TableHead className="font-bold">Data</TableHead>
                <TableHead className="font-bold">Criativo</TableHead>
                <TableHead className="font-bold">Objetivo</TableHead>
                <TableHead className="font-bold min-w-[300px]">Legenda</TableHead>
                <TableHead className="font-bold">Responsável</TableHead>
                <TableHead className="font-bold">Observações</TableHead>
                <TableHead className="w-[150px] font-bold">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhum post cadastrado. Clique em "Adicionar Post" para começar.
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post, index) => (
                  <PlanoEditorialPostRow
                    key={post.id}
                    post={post}
                    index={index + 1}
                    onRefresh={onRefresh}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
