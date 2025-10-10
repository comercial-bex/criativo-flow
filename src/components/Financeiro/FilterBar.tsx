import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";
import { startOfMonth, endOfMonth, subMonths, startOfYear } from "date-fns";

export interface FilterValues {
  periodo: "mes" | "trimestre" | "ano";
  tipo: "all" | "receita" | "despesa";
}

interface FilterBarProps {
  onApply: (filters: FilterValues) => void;
}

export function FilterBar({ onApply }: FilterBarProps) {
  const [periodo, setPeriodo] = useState<"mes" | "trimestre" | "ano">("mes");
  const [tipo, setTipo] = useState<"all" | "receita" | "despesa">("all");

  const handleApply = () => {
    onApply({ periodo, tipo });
  };

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-card border rounded-lg">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filtros:</span>
      </div>

      <Select value={periodo} onValueChange={(value: any) => setPeriodo(value)}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="mes">Mês Atual</SelectItem>
          <SelectItem value="trimestre">Trimestre</SelectItem>
          <SelectItem value="ano">Ano</SelectItem>
        </SelectContent>
      </Select>

      <Select value={tipo} onValueChange={(value: any) => setTipo(value)}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Receitas e Despesas</SelectItem>
          <SelectItem value="receita">Apenas Receitas</SelectItem>
          <SelectItem value="despesa">Apenas Despesas</SelectItem>
        </SelectContent>
      </Select>

      <Button onClick={handleApply} size="sm">
        Aplicar Filtros
      </Button>
    </div>
  );
}
