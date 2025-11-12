import { Button } from "@/components/ui/button";
import { LayoutGrid, Table, Calendar as CalendarIcon } from "lucide-react";

type ModoVisualizacao = 'cartao' | 'tabela' | 'calendario';

interface ModosVisualizacaoProps {
  modoAtual: ModoVisualizacao;
  onModoChange: (modo: ModoVisualizacao) => void;
}

export const ModosVisualizacao = ({ modoAtual, onModoChange }: ModosVisualizacaoProps) => {
  return (
    <div className="flex gap-2 bg-muted/30 p-1 rounded-lg">
      <Button
        variant={modoAtual === 'cartao' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModoChange('cartao')}
        className="gap-2"
      >
        <LayoutGrid className="h-4 w-4" />
        Cartão
      </Button>
      <Button
        variant={modoAtual === 'tabela' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModoChange('tabela')}
        className="gap-2"
      >
        <Table className="h-4 w-4" />
        Tabela
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
    </div>
  );
};
