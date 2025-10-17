import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TarefasKanban } from "@/components/TarefasKanban";
import { ProjectWithTasks } from "@/hooks/useClientDashboard";

interface ProjectTasksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projeto: ProjectWithTasks;
  clienteId: string;
}

export function ProjectTasksModal({ 
  open, 
  onOpenChange, 
  projeto, 
  clienteId 
}: ProjectTasksModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        size="screen"
        height="full"
        overflow="hidden"
        className="flex flex-col"
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{projeto.titulo}</DialogTitle>
          <DialogDescription>
            Visualização das tarefas do projeto
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto min-h-0 p-4">
          <div className="min-w-max">
            <TarefasKanban
              planejamento={{ id: projeto.id }}
              clienteId={clienteId}
              projetoId={projeto.id}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
