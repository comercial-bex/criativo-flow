import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  User, 
  Clock,
  Target,
  BarChart3,
  FolderOpen,
  AlertCircle,
  CheckCircle2,
  PlayCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';

interface Cliente {
  id: string;
  nome: string;
  status: string;
}

interface Projeto {
  id: string;
  cliente_id: string | null;
  nome: string;
  descricao: string | null;
  status: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  orcamento: number | null;
  responsavel_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  profiles?: {
    nome: string;
  };
}

export default function ClienteProjetos() {
  const { clienteId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { startTutorial, hasSeenTutorial } = useTutorial('grs-cliente-projetos');
  
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [profiles, setProfiles] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    status: 'ativo',
    data_inicio: '',
    data_fim: '',
    orcamento: '',
    responsavel_id: ''
  });

  useEffect(() => {
    if (clienteId) {
      fetchClienteData();
      fetchProjetos();
      fetchProfiles();
    }
  }, [clienteId]);

  const fetchClienteData = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome, status')
        .eq('id', clienteId)
        .single();

      if (error) throw error;
      setCliente(data);
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do cliente.",
        variant: "destructive",
      });
    }
  };

  const fetchProjetos = async () => {
    try {
      const { data, error } = await supabase
        .from('projetos')
        .select(`
          *,
          profiles:responsavel_id (nome)
        `)
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjetos(data || []);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar projetos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, especialidade');

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Erro ao buscar profiles:', error);
    }
  };

  const handleCreateProjeto = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('projetos')
        .insert({
          cliente_id: clienteId,
          nome: formData.nome,
          descricao: formData.descricao,
          status: formData.status,
          data_inicio: formData.data_inicio || null,
          data_fim: formData.data_fim || null,
          orcamento: formData.orcamento ? parseFloat(formData.orcamento) : null,
          responsavel_id: formData.responsavel_id || null
        } as any);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Projeto criado com sucesso!",
      });

      setDialogOpen(false);
      setFormData({
        nome: '',
        descricao: '',
        status: 'ativo',
        data_inicio: '',
        data_fim: '',
        orcamento: '',
        responsavel_id: ''
      });
      
      fetchProjetos();
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar projeto.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string | null) => {
    const statusConfig = {
      ativo: { color: 'bg-green-100 text-green-800 border-green-200', icon: <Target className="h-3 w-3" /> },
      inativo: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: <PlayCircle className="h-3 w-3" /> },
      pendente: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <Clock className="h-3 w-3" /> },
      arquivado: { color: 'bg-red-100 text-red-800 border-red-200', icon: <AlertCircle className="h-3 w-3" /> }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ativo;
    
    return (
      <Badge className={`${config.color} border font-medium`}>
        {config.icon}
        <span className="ml-1 capitalize">{status || 'Ativo'}</span>
      </Badge>
    );
  };

  const handleAbrirProjeto = (projetoId: string) => {
    navigate(`/grs/cliente/${clienteId}/projeto/${projetoId}/tarefas`);
  };

  return (
    <div className="space-y-6">
      {/* Header com breadcrumbs */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/grs/dashboard')}
              className="px-0 hover:bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard GRS
            </Button>
            <span>/</span>
            <span className="font-medium text-foreground">{cliente?.nome}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <FolderOpen className="h-8 w-8 text-primary" />
              Projetos - {cliente?.nome}
            </h1>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Projeto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Projeto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateProjeto} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Projeto</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Planejamento Mensal Janeiro"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="arquivado">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descreva os objetivos e escopo do projeto..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_inicio">Data Início</Label>
                  <Input
                    id="data_inicio"
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_fim">Data Fim</Label>
                  <Input
                    id="data_fim"
                    type="date"
                    value={formData.data_fim}
                    onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="responsavel_id">Responsável</Label>
                  <Select value={formData.responsavel_id} onValueChange={(value) => setFormData({ ...formData, responsavel_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orcamento">Orçamento (R$)</Label>
                  <Input
                    id="orcamento"
                    type="number"
                    step="0.01"
                    value={formData.orcamento}
                    onChange={(e) => setFormData({ ...formData, orcamento: e.target.value })}
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Criar Projeto
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Projetos */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Carregando projetos...</p>
        </div>
      ) : projetos.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum projeto encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Este cliente ainda não possui projetos. Crie o primeiro projeto para começar.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Projeto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projetos.map((projeto) => (
            <Card key={projeto.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg font-semibold line-clamp-2">
                    {projeto.nome}
                  </CardTitle>
                  <div className="flex gap-1">
                    {getStatusBadge(projeto.status)}
                  </div>
                </div>
                {projeto.descricao && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                    {projeto.descricao}
                  </p>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  {projeto.orcamento && (
                    <Badge variant="outline" className="text-xs">
                      R$ {projeto.orcamento.toLocaleString('pt-BR')}
                    </Badge>
                  )}
                </div>

                {/* Status do projeto */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <span className="text-sm text-muted-foreground">{projeto.status || 'Ativo'}</span>
                  </div>
                </div>

                {/* Datas */}
                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                  {projeto.data_inicio && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Início: {format(new Date(projeto.data_inicio), 'dd/MM/yy')}</span>
                    </div>
                  )}
                  {projeto.data_fim && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Fim: {format(new Date(projeto.data_fim), 'dd/MM/yy')}</span>
                    </div>
                  )}
                </div>

                {/* Responsável */}
                {projeto.profiles && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">por</span>
                    <span className="font-medium">{projeto.profiles.nome}</span>
                  </div>
                )}

                <Button 
                  onClick={() => handleAbrirProjeto(projeto.id)}
                  className="w-full mt-4"
                  variant="outline"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Abrir Projeto
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}