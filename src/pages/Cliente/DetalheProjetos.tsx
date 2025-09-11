import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Calendar, DollarSign, Eye, Edit, Plus } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

interface ClienteDetalhes {
  id: string;
  nome: string;
  email: string;
  status: 'ativo' | 'inativo' | 'prospecto';
  projetos: Projeto[];
}

// Mock data - em produção viria da API
const mockClienteDetalhes: Record<string, ClienteDetalhes> = {
  "1": {
    id: "1",
    nome: "Tech Solutions Ltda",
    email: "contato@techsolutions.com",
    status: "ativo",
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
  "2": {
    id: "2",
    nome: "Inovação Corp",
    email: "comercial@inovacao.com",
    status: "ativo",
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
  "5": {
    id: "5",
    nome: "StartupTech Ltda",
    email: "hello@startuptech.com",
    status: "ativo",
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
};

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

// Componente de formulário para novo projeto
function ProjetoForm({ clienteId, onSuccess }: { clienteId: string; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    valor: '',
    data_inicio: '',
    data_fim: '',
    tipo: 'desenvolvimento'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('projetos')
        .insert({
          nome: formData.nome,
          descricao: formData.descricao,
          cliente_id: clienteId,
          orcamento: formData.valor ? parseFloat(formData.valor) : null,
          data_inicio: formData.data_inicio || null,
          data_fim: formData.data_fim || null,
          status: 'ativo'
        });

      if (error) throw error;

      toast({
        title: "Projeto criado com sucesso!",
        description: "O novo projeto foi adicionado ao cliente",
      });

      setFormData({
        nome: '',
        descricao: '',
        valor: '',
        data_inicio: '',
        data_fim: '',
        tipo: 'desenvolvimento'
      });
      
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

export default function DetalheProjetos() {
  const { clienteId } = useParams<{ clienteId: string }>();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<ClienteDetalhes | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [realClienteId, setRealClienteId] = useState<string | null>(null);

  const isUuid = (v: string) =>
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(v);

  useEffect(() => {
    if (clienteId && mockClienteDetalhes[clienteId]) {
      setCliente(mockClienteDetalhes[clienteId]);
    }
    setLoading(false);
  }, [clienteId]);

  useEffect(() => {
    const resolveId = async () => {
      if (!clienteId) return;
      if (isUuid(clienteId)) {
        setRealClienteId(clienteId);
        return;
      }
      if (cliente?.email) {
        const { data } = await supabase
          .from('clientes')
          .select('id')
          .eq('email', cliente.email)
          .maybeSingle();
        if (data?.id) {
          setRealClienteId(data.id);
          return;
        }
      }
      if (cliente?.nome) {
        const { data } = await supabase
          .from('clientes')
          .select('id')
          .eq('nome', cliente.nome)
          .maybeSingle();
        if (data?.id) setRealClienteId(data.id);
      }
    };
    resolveId();
  }, [clienteId, cliente?.email]);


  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Cliente não encontrado</h2>
          <p className="text-muted-foreground mb-4">O cliente solicitado não foi encontrado.</p>
          <Button onClick={() => navigate('/clientes/projetos')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/clientes/projetos')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <SectionHeader
          title={`Projetos de ${cliente.nome}`}
          description={`Visualize todos os projetos do cliente ${cliente.email}`}
          action={{
            label: "Novo Projeto",
            onClick: () => setDialogOpen(true),
            icon: Plus
          }}
        />
      </div>

      {/* Resumo do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Projetos</p>
              <p className="text-2xl font-bold">{cliente.projetos.length}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
              <p className="text-2xl font-bold">
                R$ {cliente.projetos.reduce((sum, p) => sum + p.valor, 0).toLocaleString('pt-BR')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Projetos Ativos</p>
              <p className="text-2xl font-bold">
                {cliente.projetos.filter(p => p.status === 'ativo').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Projetos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cliente.projetos.map((projeto) => (
          <Card key={projeto.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{projeto.nome}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{projeto.tipo}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(projeto.status)}>
                    {getStatusText(projeto.status)}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      console.log('Editar projeto:', projeto.id);
                      // Implementar modal ou navegação para edição do projeto
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      console.log('Ver detalhes do projeto:', projeto.id);
                      // Implementar navegação para detalhes específicos do projeto
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4 mr-2" />
                  R$ {projeto.valor.toLocaleString('pt-BR')}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  Início: {new Date(projeto.dataInicio).toLocaleDateString('pt-BR')}
                </div>
                {projeto.dataFim && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
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
            </CardContent>
          </Card>
        ))}
      </div>

      {cliente.projetos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum projeto encontrado para este cliente.</p>
        </div>
      )}

      {/* Dialog para criar novo projeto */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar Novo Projeto</DialogTitle>
            <DialogDescription>
              Crie um novo projeto para {cliente?.nome}
            </DialogDescription>
          </DialogHeader>
          {realClienteId ? (
            <ProjetoForm 
              clienteId={realClienteId} 
              onSuccess={() => setDialogOpen(false)} 
            />
          ) : (
            <div className="text-sm text-muted-foreground">
              Não foi possível identificar o cliente no banco. Verifique o cadastro do cliente antes de criar um projeto.
            </div>
          )}

        </DialogContent>
      </Dialog>
    </div>
  );
}