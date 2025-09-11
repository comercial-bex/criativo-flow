import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, Filter, ChevronDown, FolderOpen, Users, BarChart3 } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";

interface Projeto {
  id: string;
  nome: string;
  status: 'ativo' | 'concluido' | 'pendente' | 'pausado';
  valor: number;
  dataInicio: string;
  dataFim?: string;
  progresso: number;
  tipo: string;
}

interface ClienteComProjetos {
  id: string;
  nome: string;
  email: string;
  status: 'ativo' | 'inativo' | 'prospecto';
  projetos: Projeto[];
  totalProjetos: number;
  statusCounts: {
    ativo: number;
    concluido: number;
    pendente: number;
    pausado: number;
  };
}

const mockClientesComProjetos: ClienteComProjetos[] = [
  {
    id: "1",
    nome: "Tech Solutions Ltda",
    email: "contato@techsolutions.com",
    status: "ativo",
    totalProjetos: 3,
    statusCounts: {
      ativo: 2,
      concluido: 1,
      pendente: 0,
      pausado: 0
    },
    projetos: [
      {
        id: "p1",
        nome: "Campanha Digital Q1",
        status: "ativo",
        valor: 45000,
        dataInicio: "2024-01-15",
        dataFim: "2024-03-30",
        progresso: 75,
        tipo: "Marketing Digital"
      },
      {
        id: "p2",
        nome: "Website Institucional",
        status: "ativo",
        valor: 25000,
        dataInicio: "2024-02-01",
        progresso: 50,
        tipo: "Desenvolvimento"
      },
      {
        id: "p3",
        nome: "Rebranding Completo",
        status: "concluido",
        valor: 80000,
        dataInicio: "2023-11-01",
        dataFim: "2024-01-20",
        progresso: 100,
        tipo: "Branding"
      }
    ]
  },
  {
    id: "2",
    nome: "Inovação Corp",
    email: "comercial@inovacao.com",
    status: "ativo",
    totalProjetos: 2,
    statusCounts: {
      ativo: 1,
      concluido: 0,
      pendente: 1,
      pausado: 0
    },
    projetos: [
      {
        id: "p4",
        nome: "App Mobile",
        status: "ativo",
        valor: 120000,
        dataInicio: "2024-01-10",
        progresso: 30,
        tipo: "Desenvolvimento"
      },
      {
        id: "p5",
        nome: "Sistema CRM",
        status: "pendente",
        valor: 75000,
        dataInicio: "2024-03-01",
        progresso: 0,
        tipo: "Desenvolvimento"
      }
    ]
  },
  {
    id: "3",
    nome: "Loja Virtual Plus",
    email: "suporte@lojavirtual.com",
    status: "prospecto",
    totalProjetos: 0,
    statusCounts: {
      ativo: 0,
      concluido: 0,
      pendente: 0,
      pausado: 0
    },
    projetos: []
  },
  {
    id: "4",
    nome: "Empresa Inativa S.A.",
    email: "contato@empresainativa.com",
    status: "inativo",
    totalProjetos: 0,
    statusCounts: {
      ativo: 0,
      concluido: 0,
      pendente: 0,
      pausado: 0
    },
    projetos: []
  },
  {
    id: "5",
    nome: "StartupTech Ltda",
    email: "hello@startuptech.com",
    status: "ativo",
    totalProjetos: 1,
    statusCounts: {
      ativo: 0,
      concluido: 0,
      pendente: 0,
      pausado: 1
    },
    projetos: [
      {
        id: "p6",
        nome: "MVP Development",
        status: "pausado",
        valor: 35000,
        dataInicio: "2024-02-01",
        progresso: 20,
        tipo: "Desenvolvimento"
      }
    ]
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ativo': return 'bg-green-100 text-green-800';
    case 'concluido': return 'bg-blue-100 text-blue-800';
    case 'pendente': return 'bg-yellow-100 text-yellow-800';
    case 'pausado': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'ativo': return 'Ativo';
    case 'concluido': return 'Concluído';
    case 'pendente': return 'Pendente';
    case 'pausado': return 'Pausado';
    default: return status;
  }
};

const getClienteStatusColor = (status: string) => {
  switch (status) {
    case 'ativo': return 'bg-green-100 text-green-800';
    case 'inativo': return 'bg-red-100 text-red-800';
    case 'prospecto': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function ClienteProjetos() {
  const [clientes, setClientes] = useState<ClienteComProjetos[]>(mockClientesComProjetos);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());

  const filteredClientes = clientes.filter(cliente => {
    const matchesSearch = cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cliente.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || cliente.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleClientExpansion = (clienteId: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clienteId)) {
      newExpanded.delete(clienteId);
    } else {
      newExpanded.add(clienteId);
    }
    setExpandedClients(newExpanded);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Projetos por Cliente"
        description="Visualize e gerencie todos os projetos organizados por cliente"
      />

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status do cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
            <SelectItem value="prospecto">Prospecto</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Clientes</p>
                <p className="text-2xl font-bold">{filteredClientes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FolderOpen className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Projetos</p>
                <p className="text-2xl font-bold">
                  {filteredClientes.reduce((sum, cliente) => sum + cliente.totalProjetos, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Projetos Ativos</p>
                <p className="text-2xl font-bold">
                  {filteredClientes.reduce((sum, cliente) => sum + cliente.statusCounts.ativo, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Projetos Concluídos</p>
                <p className="text-2xl font-bold">
                  {filteredClientes.reduce((sum, cliente) => sum + cliente.statusCounts.concluido, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Clientes e Projetos */}
      <Card>
        <CardHeader>
          <CardTitle>Clientes e Projetos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-center">Total Projetos</TableHead>
                <TableHead className="text-center">Ativos</TableHead>
                <TableHead className="text-center">Concluídos</TableHead>
                <TableHead className="text-center">Pendentes</TableHead>
                <TableHead className="text-center">Pausados</TableHead>
                <TableHead>Status Cliente</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.map((cliente) => (
                <>
                  <TableRow 
                    key={cliente.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleClientExpansion(cliente.id)}
                  >
                    <TableCell>
                      <ChevronDown 
                        className={`h-4 w-4 transition-transform ${
                          expandedClients.has(cliente.id) ? 'rotate-180' : ''
                        }`} 
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{cliente.nome}</p>
                        <p className="text-sm text-muted-foreground">{cliente.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium">{cliente.totalProjetos}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {cliente.statusCounts.ativo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {cliente.statusCounts.concluido}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                        {cliente.statusCounts.pendente}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        {cliente.statusCounts.pausado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getClienteStatusColor(cliente.status)}>
                        {cliente.status.charAt(0).toUpperCase() + cliente.status.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  
                  {/* Projetos Expandidos */}
                  {expandedClients.has(cliente.id) && (
                    <TableRow>
                      <TableCell colSpan={8} className="p-0">
                        <div className="bg-muted/30 p-4">
                          <h4 className="font-medium mb-3">Projetos de {cliente.nome}</h4>
                          {cliente.projetos.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {cliente.projetos.map((projeto) => (
                                <Card key={projeto.id} className="border border-border/50">
                                  <CardContent className="p-4">
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-start">
                                        <h5 className="font-medium text-sm">{projeto.nome}</h5>
                                        <Badge className={getStatusColor(projeto.status)}>
                                          {getStatusText(projeto.status)}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground">{projeto.tipo}</p>
                                      <p className="text-sm font-medium">
                                        R$ {projeto.valor.toLocaleString('pt-BR')}
                                      </p>
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                          <span>Progresso</span>
                                          <span>{projeto.progresso}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                          <div 
                                            className="bg-primary h-1.5 rounded-full" 
                                            style={{ width: `${projeto.progresso}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-sm">
                              {cliente.status === 'ativo' ? 'Nenhum projeto encontrado para este cliente.' : 'Cliente não ativo - sem projetos.'}
                            </p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredClientes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
        </div>
      )}
    </div>
  );
}