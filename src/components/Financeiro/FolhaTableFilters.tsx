import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface FolhaTableFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export function FolhaTableFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
}: FolhaTableFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div className="space-y-2">
        <Label htmlFor="search" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Buscar colaborador
        </Label>
        <Input
          id="search"
          placeholder="Nome ou CPF..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="status" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Status de Pagamento
        </Label>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger id="status">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="sort">Ordenar por</Label>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger id="sort">
            <SelectValue placeholder="Nome (A-Z)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nome-asc">Nome (A-Z)</SelectItem>
            <SelectItem value="nome-desc">Nome (Z-A)</SelectItem>
            <SelectItem value="liquido-desc">Maior Líquido</SelectItem>
            <SelectItem value="liquido-asc">Menor Líquido</SelectItem>
            <SelectItem value="cargo-asc">Cargo (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
