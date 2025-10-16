import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, Edit, Clock, User, Building2, Paperclip } from "lucide-react";
import { TarefaCalendario, EventoCalendario } from '../types';
import { getPrioridadeColor, getStatusColor, getTarefaData } from '../utils/taskHelpers';
import { formatDate } from '../utils/dateHelpers';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QuickViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tarefa?: TarefaCalendario | null;
  evento?: EventoCalendario | null;
  onStatusChange?: () => void;
}

export const QuickViewModal = ({ 
  open, 
  onOpenChange, 
  tarefa, 
  evento,
  onStatusChange 
}: QuickViewModalProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);

  const handleOpenFull = () => {
    if (tarefa) {
      const baseRoute = tarefa.executor_area === 'Criativo' || tarefa.executor_area === 'Design' 
        ? '/design' 
        : tarefa.executor_area === 'Audiovisual' 
        ? '/audiovisual' 
        : '/grs';
      
      navigate(`${baseRoute}/tarefas/${tarefa.id}`);
      onOpenChange(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!tarefa) return;
    
    try {
      setUpdating(true);
      const { error } = await supabase
        .from('tarefa')
        .update({ status: newStatus as any })
        .eq('id', tarefa.id);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: `Tarefa marcada como: ${newStatus}`,
      });
      
      onStatusChange?.();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  if (!tarefa && !evento) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl pr-8">
            {tarefa ? tarefa.titulo : evento?.titulo}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {tarefa && (
            <>
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge className={getPrioridadeColor(tarefa.prioridade) + " text-white"}>
                  {tarefa.prioridade}
                </Badge>
                <Badge className={getStatusColor(tarefa.status) + " text-white"}>
                  {tarefa.status}
                </Badge>
              </div>

              {/* Informações */}
              <div className="space-y-3 text-sm">
                {tarefa.executor_nome && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Responsável:</span>
                    <span>{tarefa.executor_nome}</span>
                  </div>
                )}

                {getTarefaData(tarefa) && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Prazo:</span>
                    <span>{formatDate(new Date(getTarefaData(tarefa)!), "dd/MM/yyyy 'às' HH:mm")}</span>
                  </div>
                )}

                {tarefa.anexos_count && tarefa.anexos_count > 0 && (
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Anexos:</span>
                    <span>{tarefa.anexos_count} arquivo(s)</span>
                  </div>
                )}

                {tarefa.descricao && (
                  <div className="pt-2 border-t">
                    <p className="font-medium mb-1">Descrição:</p>
                    <p className="text-muted-foreground whitespace-pre-wrap">{tarefa.descricao}</p>
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                <Button onClick={handleOpenFull} className="flex-1 gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Abrir Tarefa Completa
                </Button>
                
                <Select onValueChange={handleStatusChange} disabled={updating}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Atualizar Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                    <SelectItem value="Em Revisão">Em Revisão</SelectItem>
                    <SelectItem value="Concluída">Concluída</SelectItem>
                    <SelectItem value="Atrasada">Atrasada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {evento && (
            <>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Início:</span>
                  <span>{formatDate(new Date(evento.data_inicio), "dd/MM/yyyy 'às' HH:mm")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Fim:</span>
                  <span>{formatDate(new Date(evento.data_fim), "dd/MM/yyyy 'às' HH:mm")}</span>
                </div>
                {evento.responsavel_nome && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Responsável:</span>
                    <span>{evento.responsavel_nome}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
