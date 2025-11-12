import { Button } from "@/components/ui/button";
import { List, Calendar as CalendarIcon, LayoutGrid } from "lucide-react";

type ModoVisualizacao = 'lista' | 'calendario' | 'cartao';

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
        variant={modoAtual === 'cartao' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModoChange('cartao')}
        className="gap-2"
      >
        <LayoutGrid className="h-4 w-4" />
        Cartões
      </Button>
    </div>
  );
};
