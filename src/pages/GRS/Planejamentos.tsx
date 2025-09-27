import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Search, Eye, FileText, Clock, CheckCircle, XCircle, Users, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { SubMenuGRS } from "@/components/SubMenuGRS";

interface Cliente {
  id: string;
  nome: string;
}

interface Planejamento {
  id: string;
  titulo: string;
  status: string;
  mes_referencia: string;
  data_envio_cliente: string | null;
  data_aprovacao_cliente: string | null;
  observacoes_cliente: string | null;
  clientes: Cliente;
}

export default function GRSPlanejamentos() {
  const [planejamentos, setPlanejamentos] = useState<Planejamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlanejamentos();
  }, []);

  const fetchPlanejamentos = async () => {
    try {
      const { data, error } = await supabase
        .from('planejamentos')
        .select(`
          id,
          titulo,
          status,
          mes_referencia,
          data_envio_cliente,
          data_aprovacao_cliente,
          observacoes_cliente,
          clientes (
            id,
            nome
          )
        `)
        .order('mes_referencia', { ascending: false });

      if (error) throw error;
      setPlanejamentos(data || []);
    } catch (error) {
      console.error('Erro ao buscar planejamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado': return 'bg-green-500';
      case 'reprovado': return 'bg-red-500';
      case 'em_aprovacao': return 'bg-yellow-500';
      case 'enviado': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'aprovado': return 'Aprovado';
      case 'reprovado': return 'Reprovado';
      case 'em_aprovacao': return 'Em Aprovação';
      case 'enviado': return 'Enviado';
      case 'rascunho': return 'Rascunho';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprovado': return CheckCircle;
      case 'reprovado': return XCircle;
      case 'em_aprovacao': case 'enviado': return Clock;
      default: return FileText;
    }
  };

  const filteredPlanejamentos = planejamentos.filter(planejamento => {
    const matchesSearch = planejamento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         planejamento.clientes.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || planejamento.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Planejamentos</h1>
        </div>
        <div className="text-center py-8">Carregando planejamentos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SubMenuGRS />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Planejamentos
          </h1>
          <p className="text-muted-foreground">Gerencie todos os planejamentos dos clientes</p>
        </div>
        <Button onClick={() => navigate('/grs/dashboard')}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Planejamento
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por cliente ou título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value="rascunho">Rascunho</SelectItem>
            <SelectItem value="enviado">Enviado</SelectItem>
            <SelectItem value="em_aprovacao">Em Aprovação</SelectItem>
            <SelectItem value="aprovado">Aprovado</SelectItem>
            <SelectItem value="reprovado">Reprovado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{planejamentos.length}</div>
            <p className="text-xs text-muted-foreground">planejamentos cadastrados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Aprovação</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {planejamentos.filter(p => p.status === 'em_aprovacao').length}
            </div>
            <p className="text-xs text-muted-foreground">aguardando aprovação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {planejamentos.filter(p => p.status === 'aprovado').length}
            </div>
            <p className="text-xs text-muted-foreground">este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reprovados</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {planejamentos.filter(p => p.status === 'reprovado').length}
            </div>
            <p className="text-xs text-muted-foreground">precisam revisão</p>
          </CardContent>
        </Card>
      </div>

      {/* Planejamentos List */}
      <div className="grid gap-4">
        {filteredPlanejamentos.map((planejamento) => {
          const StatusIcon = getStatusIcon(planejamento.status);
          
          return (
            <Card key={planejamento.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {planejamento.clientes.nome.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{planejamento.titulo}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{planejamento.clientes.nome}</span>
                        <span>•</span>
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(planejamento.mes_referencia).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className={`${getStatusColor(planejamento.status)} text-white`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {getStatusText(planejamento.status)}
                    </Badge>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/grs/planejamento/${planejamento.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                  </div>
                </div>
                
                {planejamento.observacoes_cliente && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Observações do Cliente:</strong> {planejamento.observacoes_cliente}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredPlanejamentos.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum planejamento encontrado</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== "todos" 
                ? "Tente ajustar os filtros de busca" 
                : "Não há planejamentos cadastrados ainda"
              }
            </p>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}