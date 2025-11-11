import { useCliente } from "@/hooks/useClientes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Filter, 
  Plus,
  FolderPlus,
  Upload,
  FileText,
  Home,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";

interface ClientHeaderProps {
  clienteId: string;
}

export function ClientHeader({ clienteId }: ClientHeaderProps) {
  const { data: cliente } = useCliente(clienteId);

  return (
    <div className="border-b bg-background p-4 space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">
          <Home className="h-4 w-4" />
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/clientes" className="hover:text-foreground transition-colors">
          Clientes
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">{cliente?.nome || 'Carregando...'}</span>
      </div>

      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Cliente – {cliente?.nome || '...'}</h1>
        
        <div className="flex items-center gap-3">
          {/* Busca */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="pl-10"
            />
          </div>

          {/* Filtros */}
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>

          {/* Ações Rápidas */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ações
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <FolderPlus className="h-4 w-4 mr-2" />
                Novo Projeto
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Upload className="h-4 w-4 mr-2" />
                Upload de Arquivo
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Nova Solicitação
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
