import { Badge } from "@/components/ui/badge";

interface OrigemLancamentoCellProps {
  tipo_origem: string | null;
  tarefa_titulo?: string | null;
  evento_titulo?: string | null;
  folha_descricao?: string | null;
}

export function OrigemLancamentoCell({ 
  tipo_origem, 
  tarefa_titulo, 
  evento_titulo, 
  folha_descricao 
}: OrigemLancamentoCellProps) {
  if (!tipo_origem) {
    return (
      <div>
        <Badge variant="outline">Manual</Badge>
        <div className="text-xs text-muted-foreground mt-1">Lançamento Manual</div>
      </div>
    );
  }

  const label = tipo_origem === 'tarefa' ? tarefa_titulo :
                tipo_origem === 'evento' ? evento_titulo :
                tipo_origem === 'folha' ? folha_descricao : 
                'Lançamento Manual';

  const variantMap: Record<string, "default" | "secondary" | "outline"> = {
    tarefa: "default",
    evento: "secondary",
    folha: "outline",
  };
  
  return (
    <div>
      <Badge variant={variantMap[tipo_origem] || "outline"}>
        {tipo_origem}
      </Badge>
      {label && <div className="text-xs text-muted-foreground mt-1">{label}</div>}
    </div>
  );
}
