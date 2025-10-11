import { useNavigate } from "react-router-dom";
import { useClientData } from "@/hooks/useClientData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Search, 
  Users, 
  Briefcase,
  ArrowRight,
  Filter
} from "lucide-react";
import { useState } from "react";

export default function GRSClientes() {
  const navigate = useNavigate();
  const { clientes, loading } = useClientData();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClientes = clientes?.filter(cliente =>
    cliente.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cnpj_cpf?.includes(searchTerm)
  ) || [];

  const getStatusColor = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
      case 'ativo': return 'default';
      case 'inativo': return 'secondary';
      case 'suspenso': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bex-green mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="h-8 w-8 text-bex-green" />
            Meus Clientes
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os projetos e planejamentos dos seus clientes
          </p>
        </div>
        
        <Badge variant="outline" className="text-lg px-4 py-2">
          {filteredClientes.length} {filteredClientes.length === 1 ? 'cliente' : 'clientes'}
        </Badge>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou CNPJ/CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
      {filteredClientes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum cliente encontrado</h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? "Tente ajustar os filtros de busca" 
                : "Você ainda não possui clientes atribuídos"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClientes.map((cliente) => (
            <Card 
              key={cliente.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => navigate(`/grs/cliente/${cliente.id}/projetos`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 group-hover:text-bex-green transition-colors">
                      {cliente.nome}
                    </CardTitle>
                    {cliente.cnpj_cpf && (
                      <p className="text-sm text-muted-foreground">
                        {cliente.cnpj_cpf}
                      </p>
                    )}
                  </div>
                  <Badge variant={getStatusColor(cliente.status || 'ativo')}>
                    {cliente.status || 'ativo'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {/* Informações de contato */}
                  {cliente.email && (
                    <p className="text-sm text-muted-foreground truncate">
                      ✉ {cliente.email}
                    </p>
                  )}
                  {cliente.telefone && (
                    <p className="text-sm text-muted-foreground">
                      ☎ {cliente.telefone}
                    </p>
                  )}

                  {/* Ações */}
                  <div className="pt-3 border-t grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/grs/cliente/${cliente.id}/projetos`);
                      }}
                      className="gap-2"
                    >
                      <Briefcase className="h-3 w-3" />
                      Projetos
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/grs/cliente/${cliente.id}/planejamentos`);
                      }}
                      className="gap-2"
                    >
                      <Briefcase className="h-3 w-3" />
                      Planos
                    </Button>
                  </div>

                  {/* Ver detalhes */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full gap-2 group-hover:bg-bex-green group-hover:text-white transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/grs/cliente/${cliente.id}/projetos`);
                    }}
                  >
                    Ver Detalhes
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
