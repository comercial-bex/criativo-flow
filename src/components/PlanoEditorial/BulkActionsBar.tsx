import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Calendar, Trash2, Tag, X } from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  onApproveAll: () => void;
  onRescheduleAll: () => void;
  onDeleteAll: () => void;
  onAddTags: () => void;
  onClearSelection: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onApproveAll,
  onRescheduleAll,
  onDeleteAll,
  onAddTags,
  onClearSelection
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <Card className="p-4 bg-primary/5 border-primary/20">
      <div className="flex items-center gap-4">
        <Badge variant="default" className="text-base">
          {selectedCount} selecionado{selectedCount > 1 ? 's' : ''}
        </Badge>

        <div className="flex gap-2 flex-1">
          <Button size="sm" onClick={onApproveAll}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Aprovar Todos
          </Button>
          <Button size="sm" variant="outline" onClick={onRescheduleAll}>
            <Calendar className="w-4 h-4 mr-2" />
            Reagendar
          </Button>
          <Button size="sm" variant="outline" onClick={onAddTags}>
            <Tag className="w-4 h-4 mr-2" />
            Adicionar Tags
          </Button>
          <Button size="sm" variant="destructive" onClick={onDeleteAll}>
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </Button>
        </div>

        <Button size="sm" variant="ghost" onClick={onClearSelection}>
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </Card>
  );
}
