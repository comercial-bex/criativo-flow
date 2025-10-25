import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Subtarefa {
  id: string;
  titulo: string;
  descricao?: string;
  status: string;
  ordem: number;
  responsavel_id?: string;
  data_conclusao?: string;
}

interface SubtarefasManagerProps {
  tarefaId: string;
}

function SortableSubtarefa({ 
  subtarefa, 
  onToggle, 
  onDelete 
}: { 
  subtarefa: Subtarefa; 
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: subtarefa.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCompleted = subtarefa.status === 'concluida';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <Checkbox
        checked={isCompleted}
        onCheckedChange={() => onToggle(subtarefa.id)}
        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
      
      <span className={`flex-1 ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
        {subtarefa.titulo}
      </span>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(subtarefa.id)}
        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function SubtarefasManager({ tarefaId }: SubtarefasManagerProps) {
  const [subtarefas, setSubtarefas] = useState<Subtarefa[]>([]);
  const [novaSubtarefa, setNovaSubtarefa] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchSubtarefas();
  }, [tarefaId]);

  const fetchSubtarefas = async () => {
    try {
      const { data, error } = await supabase
        .from('subtarefas')
        .select('*')
        .eq('tarefa_pai_id', tarefaId)
        .order('ordem', { ascending: true });

      if (error) throw error;
      setSubtarefas(data || []);
    } catch (error) {
      console.error('Erro ao buscar subtarefas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar subtarefas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSubtarefa = async () => {
    if (!novaSubtarefa.trim()) return;

    try {
      const { error } = await supabase
        .from('subtarefas')
        .insert({
          tarefa_pai_id: tarefaId,
          titulo: novaSubtarefa,
          ordem: subtarefas.length,
          status: 'backlog',
        });

      if (error) throw error;

      setNovaSubtarefa("");
      await fetchSubtarefas();

      toast({
        title: "Sucesso",
        description: "Subtarefa adicionada!",
      });
    } catch (error) {
      console.error('Erro ao adicionar subtarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar subtarefa",
        variant: "destructive",
      });
    }
  };

  const toggleSubtarefa = async (id: string) => {
    const subtarefa = subtarefas.find(s => s.id === id);
    if (!subtarefa) return;

    const novoStatus = subtarefa.status === 'concluida' ? 'backlog' : 'concluida';
    const dataConclusao = novoStatus === 'concluida' ? new Date().toISOString() : null;

    try {
      const { error } = await supabase
        .from('subtarefas')
        .update({ 
          status: novoStatus,
          data_conclusao: dataConclusao 
        })
        .eq('id', id);

      if (error) throw error;
      await fetchSubtarefas();
    } catch (error) {
      console.error('Erro ao atualizar subtarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar subtarefa",
        variant: "destructive",
      });
    }
  };

  const deleteSubtarefa = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subtarefas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchSubtarefas();

      toast({
        title: "Sucesso",
        description: "Subtarefa removida",
      });
    } catch (error) {
      console.error('Erro ao deletar subtarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar subtarefa",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = subtarefas.findIndex(s => s.id === active.id);
    const newIndex = subtarefas.findIndex(s => s.id === over.id);

    const reordered = arrayMove(subtarefas, oldIndex, newIndex).map((s, idx) => ({
      ...s,
      ordem: idx,
    }));

    setSubtarefas(reordered);

    try {
      const updates = reordered.map(s => ({
        id: s.id,
        ordem: s.ordem,
      }));

      for (const update of updates) {
        await supabase
          .from('subtarefas')
          .update({ ordem: update.ordem })
          .eq('id', update.id);
      }
    } catch (error) {
      console.error('Erro ao reordenar:', error);
      await fetchSubtarefas();
    }
  };

  const concluidas = subtarefas.filter(s => s.status === 'concluida').length;
  const total = subtarefas.length;
  const progresso = total > 0 ? (concluidas / total) * 100 : 0;

  if (loading) return <div className="text-center py-4">Carregando...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Subtarefas</span>
          <span className="text-sm text-muted-foreground">
            {concluidas}/{total} concluídas
          </span>
        </CardTitle>
        {total > 0 && (
          <Progress value={progresso} className="h-2" />
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Nova subtarefa..."
            value={novaSubtarefa}
            onChange={(e) => setNovaSubtarefa(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addSubtarefa()}
          />
          <Button onClick={addSubtarefa} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={subtarefas.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {subtarefas.map((subtarefa) => (
                <SortableSubtarefa
                  key={subtarefa.id}
                  subtarefa={subtarefa}
                  onToggle={toggleSubtarefa}
                  onDelete={deleteSubtarefa}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {subtarefas.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma subtarefa ainda. Adicione uma acima!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
