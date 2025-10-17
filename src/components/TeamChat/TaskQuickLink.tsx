import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TaskQuickLinkProps {
  onTaskSelect: (taskInfo: string) => void;
}

export function TaskQuickLink({ onTaskSelect }: TaskQuickLinkProps) {
  const [open, setOpen] = useState(false);

  // Buscar tarefas recentes e concluídas
  const { data: tasks } = useQuery({
    queryKey: ['recent-completed-tasks'],
    queryFn: async () => {
      const { data } = await supabase
        .from('tarefa')
        .select('id, titulo, projeto:projetos(titulo)')
        .eq('status', 'concluido')
        .order('updated_at', { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: open
  });

  const handleTaskSelect = (task: any) => {
    const message = `✅ **Tarefa Concluída!**\n\n**${task.titulo}**\n${task.projeto?.titulo ? `Projeto: ${task.projeto.titulo}\n` : ''}[Ver detalhes](/tarefas/${task.id})`;
    onTaskSelect(message);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 text-xs">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Tarefa Pronta
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Tarefas Recentes Concluídas
          </h4>
          <div className="space-y-1 max-h-[200px] overflow-y-auto">
            {tasks?.map((task) => (
              <Button
                key={task.id}
                variant="ghost"
                className="w-full justify-start text-left h-auto py-2"
                onClick={() => handleTaskSelect(task)}
              >
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className="text-sm font-medium truncate">{task.titulo}</span>
                  {task.projeto?.titulo && (
                    <span className="text-xs text-muted-foreground truncate">
                      {task.projeto.titulo}
                    </span>
                  )}
                </div>
                <ExternalLink className="w-3 h-3 ml-2 shrink-0" />
              </Button>
            ))}
            {(!tasks || tasks.length === 0) && (
              <p className="text-xs text-muted-foreground text-center py-4">
                Nenhuma tarefa concluída recentemente
              </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
