import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Clock, DollarSign, Search, Filter } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";

interface ClienteProjeto {
  id: string;
  nome: string;
  cliente: string;
  status: 'em-andamento' | 'concluido' | 'pendente' | 'cancelado';
  valor: number;
  dataInicio: string;
  dataFim?: string;
  progresso: number;
  tipo: string;
}

const mockProjetos: ClienteProjeto[] = [
  {
    id: "1",
    nome: "Campanha Digital Q1",
    cliente: "Tech Solutions Ltda",
    status: "em-andamento",
    valor: 45000,
    dataInicio: "2024-01-15",
    dataFim: "2024-03-30",
    progresso: 75,
    tipo: "Marketing Digital"
  },
  {
    id: "2",
    nome: "Rebranding Completo",
    cliente: "Inovação Corp",
    status: "concluido",
    valor: 80000,
    dataInicio: "2023-11-01",
    dataFim: "2024-01-20",
    progresso: 100,
    tipo: "Branding"
  },
  {
    id: "3",
    nome: "Website E-commerce",
    cliente: "Loja Virtual Plus",
    status: "pendente",
    valor: 35000,
    dataInicio: "2024-02-01",
    progresso: 0,
    tipo: "Desenvolvimento"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'em-andamento': return 'bg-blue-100 text-blue-800';
    case 'concluido': return 'bg-green-100 text-green-800';
    case 'pendente': return 'bg-yellow-100 text-yellow-800';
    case 'cancelado': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'em-andamento': return 'Em Andamento';
    case 'concluido': return 'Concluído';
    case 'pendente': return 'Pendente';
    case 'cancelado': return 'Cancelado';
    default: return status;
  }
};

export default function ClienteProjetos() {
  const [projetos, setProjetos] = useState<ClienteProjeto[]>(mockProjetos);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  const filteredProjetos = projetos.filter(projeto => {
    const matchesSearch = projeto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         projeto.cliente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || projeto.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Projetos dos Clientes"
        description="Visualize e gerencie todos os projetos em andamento e finalizados"
      />

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por projeto ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value="em-andamento">Em Andamento</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid de Projetos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjetos.map((projeto) => (
          <Card key={projeto.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{projeto.nome}</CardTitle>
                  <CardDescription className="mt-1">{projeto.cliente}</CardDescription>
                </div>
                <Badge className={getStatusColor(projeto.status)}>
                  {getStatusText(projeto.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4 mr-2" />
                  R$ {projeto.valor.toLocaleString('pt-BR')}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Início: {new Date(projeto.dataInicio).toLocaleDateString('pt-BR')}
                </div>
                {projeto.dataFim && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    Fim: {new Date(projeto.dataFim).toLocaleDateString('pt-BR')}
                  </div>
                )}
              </div>

              {/* Barra de Progresso */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso</span>
                  <span>{projeto.progresso}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${projeto.progresso}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-2">
                <Button variant="outline" className="w-full">
                  Ver Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjetos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum projeto encontrado.</p>
        </div>
      )}
    </div>
  );
}