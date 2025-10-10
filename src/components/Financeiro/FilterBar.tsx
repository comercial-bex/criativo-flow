import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
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
    <Card className="bg-gradient-to-r from-card via-muted/30 to-card border-2 border-primary/20 shadow-md hover:shadow-xl transition-all duration-300">
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <Label htmlFor="periodo" className="text-sm font-semibold">Período</Label>
            <Select value={periodo} onValueChange={(value: any) => setPeriodo(value)}>
              <SelectTrigger id="periodo" className="mt-1.5 border-primary/30 focus:border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mes">Este Mês</SelectItem>
                <SelectItem value="trimestre">Último Trimestre</SelectItem>
                <SelectItem value="ano">Este Ano</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Label htmlFor="tipo" className="text-sm font-semibold">Tipo</Label>
            <Select value={tipo} onValueChange={(value: any) => setTipo(value)}>
              <SelectTrigger id="tipo" className="mt-1.5 border-primary/30 focus:border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="receita">Receitas</SelectItem>
                <SelectItem value="despesa">Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleApply} 
            className="w-full md:w-auto bg-primary hover:bg-primary/90 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-primary/50"
          >
            <Filter className="mr-2 h-4 w-4" />
            Aplicar Filtros
          </Button>
        </div>
      </div>
    </Card>
  );
}
