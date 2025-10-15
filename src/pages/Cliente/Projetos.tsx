import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Filter, FolderOpen, Users, BarChart3, Plus, Eye } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { MobileProjetoCard } from "@/components/MobileProjetoCard";
import { EditProjetoModal } from '@/components/EditProjetoModal';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useDeviceType } from "@/hooks/useDeviceType";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';

interface Projeto {
  id: string;
  titulo: string;
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
        titulo: "Campanha Digital Q1",
        status: "ativo",
        valor: 45000,
        dataInicio: "2024-01-15",
        dataFim: "2024-03-30",
        progresso: 75,
        tipo: "Marketing Digital"
      },
      {
        id: "p2",
        titulo: "Website Institucional",
        status: "ativo",
        valor: 25000,
        dataInicio: "2024-02-01",
        progresso: 50,
        tipo: "Desenvolvimento"
      },
      {
        id: "p3",
        titulo: "Rebranding Completo",
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
        titulo: "App Mobile",
        status: "ativo",
        valor: 120000,
        dataInicio: "2024-01-10",
        progresso: 30,
        tipo: "Desenvolvimento"
      },
      {
        id: "p5",
        titulo: "Sistema CRM",
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
        titulo: "MVP Development",
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

// Componente de formulário para novo projeto
function ProjetoForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    cliente_id: '',
    valor: '',
    data_inicio: '',
    data_fim: '',
    tipo: 'desenvolvimento'
  });
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome, status')
        .eq('status', 'ativo')
        .order('nome');

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('projetos')
        .insert({
          titulo: formData.nome,
          descricao: formData.descricao,
          cliente_id: formData.cliente_id,
          orcamento: formData.valor ? parseFloat(formData.valor) : null,
          data_inicio: formData.data_inicio || null,
          data_fim: formData.data_fim || null,
          status: 'ativo'
        });

      if (error) throw error;

      toast({
        title: "Projeto criado com sucesso!",
        description: "O novo projeto foi adicionado ao sistema",
      });

      setFormData({
        nome: '',
        descricao: '',
        cliente_id: '',
        valor: '',
        data_inicio: '',
        data_fim: '',
        tipo: 'desenvolvimento'
      });
      
      // Invalidar queries específicas ao invés de reload
      queryClient.invalidateQueries({ queryKey: ['projetos'] });
      onSuccess();
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      toast({
        title: "Erro ao criar projeto",
        description: "Não foi possível criar o projeto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome do Projeto</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Ex: Website Institucional"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cliente">Cliente</Label>
          <Select 
            value={formData.cliente_id} 
            onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent>
              {clientes.map((cliente) => (
                <SelectItem key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="valor">Valor do Projeto (R$)</Label>
          <Input
            id="valor"
            type="number"
            step="0.01"
            value={formData.valor}
            onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
            placeholder="0,00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo de Projeto</Label>
          <Select 
            value={formData.tipo} 
            onValueChange={(value) => setFormData({ ...formData, tipo: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desenvolvimento">Desenvolvimento</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="branding">Branding</SelectItem>
              <SelectItem value="consultoria">Consultoria</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="data_inicio">Data de Início</Label>
          <Input
            id="data_inicio"
            type="date"
            value={formData.data_inicio}
            onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="data_fim">Data de Término</Label>
          <Input
            id="data_fim"
            type="date"
            value={formData.data_fim}
            onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição do Projeto</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          placeholder="Descreva o escopo e objetivos do projeto..."
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? "Criando..." : "Criar Projeto"}
        </Button>
      </div>
    </form>
  );
}

export default function ClienteProjetos() {
  const navigate = useNavigate();
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  const [clientes, setClientes] = useState<ClienteComProjetos[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [projetoEdit, setProjetoEdit] = useState<any>(null);
  const [projetoDeleteId, setProjetoDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  
  // Utility function to check if string is a valid UUID
  const isUuid = (v: string) =>
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(v);

  // Carregar dados reais do Supabase
  useEffect(() => {
    fetchClientesComProjetos();
  }, []);

  const fetchClientesComProjetos = async () => {
    setLoading(true);
    try {
      // Buscar clientes com seus projetos
      const { data: clientesData, error: clientesError } = await supabase
        .from('clientes')
        .select(`
          id,
          nome,
          email,
          status,
          projetos (
            id,
            titulo,
            status,
            orcamento,
            data_inicio,
            data_fim,
            descricao
          )
        `)
        .order('nome');

      if (clientesError) throw clientesError;

      // Transformar dados para o formato esperado
      const clientesFormatados: ClienteComProjetos[] = (clientesData || []).map(cliente => {
        const projetos = (cliente.projetos || []).map(projeto => ({
          id: projeto.id,
          titulo: projeto.titulo,
          status: projeto.status as 'ativo' | 'concluido' | 'pendente' | 'pausado',
          valor: projeto.orcamento || 0,
          dataInicio: projeto.data_inicio || '',
          dataFim: projeto.data_fim || '',
          progresso: projeto.status === 'ativo' ? 50 : 
                    projeto.status === 'pendente' ? 0 : 25,
          tipo: 'Geral'
        }));

        const statusCounts = {
          ativo: projetos.filter(p => p.status === 'ativo').length,
          concluido: projetos.filter(p => p.status === 'concluido').length,
          pendente: projetos.filter(p => p.status === 'pendente').length,
          pausado: projetos.filter(p => p.status === 'pausado').length,
        };

        return {
          id: cliente.id,
          nome: cliente.nome,
          email: cliente.email || '',
          status: cliente.status as 'ativo' | 'inativo' | 'prospecto',
          projetos,
          totalProjetos: projetos.length,
          statusCounts
        };
      });

      setClientes(clientesFormatados);
    } catch (error) {
      console.error('Erro ao carregar clientes e projetos:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os clientes e projetos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const goToClienteDetalhes = async (cliente: any) => {
    try {
      if (isUuid(cliente.id)) {
        navigate(`/clientes/${cliente.id}/detalhes`);
        return;
      }
      // Tenta resolver pelo email primeiro, depois pelo nome
      const byEmail = cliente.email
        ? await supabase.from('clientes').select('id').eq('email', cliente.email).maybeSingle()
        : { data: null } as any;
      const resolvedId = byEmail.data?.id
        ? byEmail.data.id
        : (await supabase.from('clientes').select('id').eq('nome', cliente.nome).maybeSingle()).data?.id;

      if (resolvedId) {
        navigate(`/clientes/${resolvedId}/detalhes`);
      } else {
        toast({ title: 'Cliente não encontrado', description: 'Não foi possível localizar este cliente no banco.', variant: 'destructive' });
      }
    } catch (e) {
      console.error('Falha ao abrir detalhes do cliente:', e);
      toast({ title: 'Erro', description: 'Falha ao abrir detalhes do cliente.', variant: 'destructive' });
    }
  };

  const handleUpdateProjeto = async (projetoId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('projetos')
        .update(updates)
        .eq('id', projetoId);

      if (error) throw error;

      toast({
        title: "Projeto atualizado",
        description: "As alterações foram salvas com sucesso",
      });

      setProjetoEdit(null);
      fetchClientesComProjetos();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o projeto",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDeleteProjeto = async () => {
    if (!projetoDeleteId) return;

    try {
      const { error } = await supabase
        .from('projetos')
        .delete()
        .eq('id', projetoDeleteId);

      if (error) throw error;

      toast({
        title: "Projeto excluído",
        description: "O projeto foi removido com sucesso",
      });

      setProjetoDeleteId(null);
      fetchClientesComProjetos();
    } catch (error) {
      console.error('Erro ao excluir projeto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o projeto",
        variant: "destructive",
      });
    }
  };

  const filteredClientes = clientes
    .filter(cliente => cliente.status === 'ativo') // Apenas clientes ativos têm projetos
    .filter(cliente => {
      const matchesSearch = cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cliente.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "todos" || cliente.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

  return (
    <div className={`${isMobile ? 'p-4 space-y-6' : 'p-6 space-y-6'}`}>
      <SectionHeader
        title={isMobile ? "Projetos" : "Projetos por Cliente"}
        description={isMobile ? "Visualize e gerencie projetos" : "Visualize e gerencie todos os projetos organizados por cliente"}
        action={{
          label: isMobile ? "Novo" : "Novo Projeto",
          onClick: () => setDialogOpen(true),
          icon: Plus
        }}
      />

      {/* Filtros - Mobile Optimized */}
      <div className={`flex gap-4 ${isMobile ? 'flex-col space-y-3' : 'flex-col sm:flex-row'}`}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isMobile ? "Buscar..." : "Buscar cliente..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 ${isMobile ? 'h-12 text-base' : ''}`}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className={isMobile ? 'h-12' : 'w-full sm:w-48'}>
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar clientes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos Clientes Ativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Resumo Geral - Mobile Optimized */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-4'}`}>
        <Card>
          <CardContent className={isMobile ? 'p-3' : 'p-4'}>
            <div className={`flex items-center space-x-2 ${isMobile ? 'flex-col space-x-0 space-y-1' : ''}`}>
              <Users className={`${isMobile ? 'h-6 w-6' : 'h-5 w-5'} text-primary`} />
              <div className={isMobile ? 'text-center' : ''}>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
                  {isMobile ? 'Ativos' : 'Clientes Ativos'}
                </p>
                <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>
                  {clientes.filter(c => c.status === 'ativo').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className={isMobile ? 'p-3' : 'p-4'}>
            <div className={`flex items-center space-x-2 ${isMobile ? 'flex-col space-x-0 space-y-1' : ''}`}>
              <FolderOpen className={`${isMobile ? 'h-6 w-6' : 'h-5 w-5'} text-blue-600`} />
              <div className={isMobile ? 'text-center' : ''}>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
                  {isMobile ? 'Total' : 'Total Projetos'}
                </p>
                <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>
                  {clientes.filter(c => c.status === 'ativo').reduce((sum, cliente) => sum + cliente.totalProjetos, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className={isMobile ? 'p-3' : 'p-4'}>
            <div className={`flex items-center space-x-2 ${isMobile ? 'flex-col space-x-0 space-y-1' : ''}`}>
              <BarChart3 className={`${isMobile ? 'h-6 w-6' : 'h-5 w-5'} text-green-600`} />
              <div className={isMobile ? 'text-center' : ''}>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
                  {isMobile ? 'Ativos' : 'Projetos Ativos'}
                </p>
                <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>
                  {clientes.filter(c => c.status === 'ativo').reduce((sum, cliente) => sum + cliente.statusCounts.ativo, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className={isMobile ? 'p-3' : 'p-4'}>
            <div className={`flex items-center space-x-2 ${isMobile ? 'flex-col space-x-0 space-y-1' : ''}`}>
              <BarChart3 className={`${isMobile ? 'h-6 w-6' : 'h-5 w-5'} text-blue-600`} />
              <div className={isMobile ? 'text-center' : ''}>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
                  {isMobile ? 'Feitos' : 'Projetos Concluídos'}
                </p>
                <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>
                  {clientes.filter(c => c.status === 'ativo').reduce((sum, cliente) => sum + cliente.statusCounts.concluido, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Principal - Mobile vs Desktop */}
      {isMobile ? (
        /* Mobile: Cards Layout */
        <div className="space-y-4">
          {filteredClientes.map((cliente) => (
            <MobileProjetoCard
              key={cliente.id}
              cliente={cliente}
              onViewDetails={() => goToClienteDetalhes(cliente)}
              onEditProjeto={(projeto) => setProjetoEdit(projeto)}
              onDeleteProjeto={(projetoId) => setProjetoDeleteId(projetoId)}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
              getClienteStatusColor={getClienteStatusColor}
            />
          ))}
        </div>
      ) : (
        /* Desktop: Table Layout */
        <Card>
          <CardHeader>
            <CardTitle>Clientes e Projetos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-center">Total Projetos</TableHead>
                  <TableHead className="text-center">Ativos</TableHead>
                  <TableHead className="text-center">Concluídos</TableHead>
                  <TableHead className="text-center">Pendentes</TableHead>
                  <TableHead className="text-center">Pausados</TableHead>
                  <TableHead>Status Cliente</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id} className="hover:bg-muted/50">
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
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => goToClienteDetalhes(cliente)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {filteredClientes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum cliente ativo com projetos encontrado.</p>
        </div>
      )}

      {/* Dialog para criar novo projeto - Mobile Optimized */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className={isMobile ? "" : "max-w-2xl"}>
          <DialogHeader>
            <DialogTitle className={isMobile ? "text-lg" : ""}>Criar Novo Projeto</DialogTitle>
            <DialogDescription>
              Crie um novo projeto para um cliente ativo
            </DialogDescription>
          </DialogHeader>
          <ProjetoForm onSuccess={() => {
            setDialogOpen(false);
            fetchClientesComProjetos(); // Recarregar dados
          }} />
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Projeto */}
      <EditProjetoModal
        open={!!projetoEdit}
        onOpenChange={(open) => !open && setProjetoEdit(null)}
        projeto={projetoEdit ? {
          id: projetoEdit.id,
          titulo: projetoEdit.titulo,
          descricao: null,
          status: projetoEdit.status,
          data_inicio: projetoEdit.dataInicio,
          data_fim: projetoEdit.dataFim || null,
          orcamento: projetoEdit.valor,
          responsavel_id: null,
        } : null}
        onSave={handleUpdateProjeto}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationDialog
        open={!!projetoDeleteId}
        onOpenChange={(open) => !open && setProjetoDeleteId(null)}
        title="Excluir Projeto?"
        description="Esta ação não pode ser desfeita. O projeto e todas as suas tarefas vinculadas serão permanentemente removidos."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleDeleteProjeto}
        variant="destructive"
      />
    </div>
  );
}