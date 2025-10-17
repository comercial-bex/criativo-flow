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
      <DialogContent className="max-w-[95vw] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{projeto.titulo}</DialogTitle>
          <DialogDescription>
            Visualização das tarefas do projeto
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto -mx-6 px-6">
          <TarefasKanban
            planejamento={{ id: projeto.id }}
            clienteId={clienteId}
            projetoId={projeto.id}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
