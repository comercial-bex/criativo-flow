import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ClipboardList, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast-compat";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateTaskFromPostButtonProps {
  post: any;
  onTaskCreated?: () => void;
}

export function CreateTaskFromPostButton({ post, onTaskCreated }: CreateTaskFromPostButtonProps) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreateTask = async () => {
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-task-from-post', {
        body: { post_id: post.id }
      });

      if (error) throw error;

      toast.success('Tarefa criada com sucesso!');
      setOpen(false);
      onTaskCreated?.();
    } catch (error: any) {
      console.error('Erro ao criar tarefa:', error);
      toast.error(error.message || 'Erro ao criar tarefa a partir do post');
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setOpen(true)}
        title="Criar tarefa a partir deste post"
      >
        <ClipboardList className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Tarefa a Partir do Post</DialogTitle>
            <DialogDescription>
              Uma nova tarefa será criada com as informações deste post pré-preenchidas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div>
              <strong className="text-sm">Post:</strong>
              <p className="text-sm text-muted-foreground">{post.titulo || 'Sem título'}</p>
            </div>
            <div>
              <strong className="text-sm">Data de Publicação:</strong>
              <p className="text-sm text-muted-foreground">
                {new Date(post.data_postagem).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div>
              <strong className="text-sm">Tipo:</strong>
              <p className="text-sm text-muted-foreground">{post.tipo_criativo}</p>
            </div>
            <div>
              <strong className="text-sm">Objetivo:</strong>
              <p className="text-sm text-muted-foreground">{post.objetivo_postagem}</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={creating}>
              Cancelar
            </Button>
            <Button onClick={handleCreateTask} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Criar Tarefa
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
