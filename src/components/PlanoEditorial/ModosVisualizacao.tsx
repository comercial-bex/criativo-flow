import { Button } from "@/components/ui/button";
import { List, Calendar as CalendarIcon, KanbanSquare } from "lucide-react";

type ModoVisualizacao = 'lista' | 'calendario' | 'kanban';

interface ModosVisualizacaoProps {
  modoAtual: ModoVisualizacao;
  onModoChange: (modo: ModoVisualizacao) => void;
}

export const ModosVisualizacao = ({ modoAtual, onModoChange }: ModosVisualizacaoProps) => {
  return (
    <div className="flex gap-2 bg-muted/30 p-1 rounded-lg">
      <Button
        variant={modoAtual === 'lista' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModoChange('lista')}
        className="gap-2"
      >
        <List className="h-4 w-4" />
        Lista
      </Button>
      <Button
        variant={modoAtual === 'calendario' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModoChange('calendario')}
        className="gap-2"
      >
        <CalendarIcon className="h-4 w-4" />
        Calendário
      </Button>
      <Button
        variant={modoAtual === 'kanban' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModoChange('kanban')}
        className="gap-2"
      >
        <KanbanSquare className="h-4 w-4" />
        Kanban
      </Button>
    </div>
  );
};
