// BEX 3.0 - Filtros Avançados de Tarefas
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';

interface TaskFiltersProps {
  filters: {
    tipo?: string;
    prioridade?: string;
    executor?: string;
    status?: string;
    search?: string;
  };
  onFilterChange: (filters: any) => void;
  profiles?: any[];
}

export function TaskFilters({ filters, onFilterChange, profiles = [] }: TaskFiltersProps) {
  const hasActiveFilters = Object.values(filters).some(v => v);

  const clearFilters = () => {
    onFilterChange({});
  };

  return (
    <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">Filtros</span>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-3 w-3 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Busca */}
        <Input
          placeholder="Buscar tarefas..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          className="col-span-1"
        />

        {/* Tipo */}
        <Select 
          value={filters.tipo || ''} 
          onValueChange={(tipo) => onFilterChange({ ...filters, tipo })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="roteiro_reels">🎬 Roteiro Reels</SelectItem>
            <SelectItem value="criativo_card">🎨 Card</SelectItem>
            <SelectItem value="criativo_carrossel">📸 Carrossel</SelectItem>
            <SelectItem value="planejamento_estrategico">📊 Planejamento</SelectItem>
            <SelectItem value="datas_comemorativas">🎉 Datas</SelectItem>
            <SelectItem value="trafego_pago">💰 Tráfego</SelectItem>
            <SelectItem value="contrato">📄 Contrato</SelectItem>
          </SelectContent>
        </Select>

        {/* Prioridade */}
        <Select 
          value={filters.prioridade || ''} 
          onValueChange={(prioridade) => onFilterChange({ ...filters, prioridade })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas</SelectItem>
            <SelectItem value="baixa">🟢 Baixa</SelectItem>
            <SelectItem value="media">🟡 Média</SelectItem>
            <SelectItem value="alta">🔴 Alta</SelectItem>
            <SelectItem value="urgente">🔥 Urgente</SelectItem>
          </SelectContent>
        </Select>

        {/* Executor */}
        <Select 
          value={filters.executor || ''} 
          onValueChange={(executor) => onFilterChange({ ...filters, executor })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Executor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            {profiles.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Filtros ativos:</span>
          {Object.entries(filters).map(([key, value]) => 
            value ? (
              <Badge key={key} variant="secondary" className="text-xs">
                {key}: {value}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => onFilterChange({ ...filters, [key]: '' })}
                />
              </Badge>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
