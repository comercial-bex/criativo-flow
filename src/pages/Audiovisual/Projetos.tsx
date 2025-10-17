import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Video, Edit, Plus, Calendar, Clock, FileVideo, Image, Zap } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';

interface ProjetoAudiovisual {
  id: string;
  planejamento_id: string | null;
  titulo: string;
  tipo_projeto: string;
  deadline: string | null;
  assets_url: string | null;
  status_review: string;
  feedback_cliente: string | null;
  especialista_id: string;
  created_at: string;
}

interface Planejamento {
  id: string;
  titulo: string;
  cliente_id: string;
  clientes?: { nome: string };
}

export default function ProjetosAudiovisuais() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { startTutorial, hasSeenTutorial } = useTutorial('audiovisual-projetos');
  const [projetos, setProjetos] = useState<ProjetoAudiovisual[]>([]);
  const [planejamentos, setPlanejamentos] = useState<Planejamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProjeto, setEditingProjeto] = useState<ProjetoAudiovisual | null>(null);
  const [activeTab, setActiveTab] = useState("todos");

  const [formData, setFormData] = useState({
    titulo: "",
    tipo_projeto: "",
    planejamento_id: "",
    deadline: "",
    assets_url: "",
    status_review: "aguardando",
    feedback_cliente: ""
  });

  useEffect(() => {
    if (user) {
      fetchProjetos();
      fetchPlanejamentos();
    }
  }, [user]);

  const fetchProjetos = async () => {
    try {
      const { data, error } = await supabase
        .from('projetos_audiovisual')
        .select(`
          *,
          planejamentos:planejamento_id(
            titulo,
            clientes:cliente_id(nome)
          )
        `)
        .eq('especialista_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjetos(data || []);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os projetos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPlanejamentos = async () => {
    try {
      const { data, error } = await supabase
        .from('planejamentos')
        .select(`
          id,
          titulo,
          cliente_id,
          clientes:cliente_id(nome)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlanejamentos(data || []);
    } catch (error) {
      console.error('Erro ao carregar planejamentos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const projetoData = {
        titulo: formData.titulo,
        tipo_projeto: formData.tipo_projeto,
        planejamento_id: formData.planejamento_id || null,
        deadline: formData.deadline || null,
        assets_url: formData.assets_url || null,
        status_review: formData.status_review,
        feedback_cliente: formData.feedback_cliente || null,
        especialista_id: user?.id
      };

      if (editingProjeto) {
        const { error } = await supabase
          .from('projetos_audiovisual')
          .update(projetoData)
          .eq('id', editingProjeto.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Projeto atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('projetos_audiovisual')
          .insert([projetoData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Projeto criado com sucesso!",
        });
      }

      setFormData({
        titulo: "",
        tipo_projeto: "",
        planejamento_id: "",
        deadline: "",
        assets_url: "",
        status_review: "aguardando",
        feedback_cliente: ""
      });
      setEditingProjeto(null);
      setIsDialogOpen(false);
      fetchProjetos();

    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o projeto.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (projeto: ProjetoAudiovisual) => {
    setEditingProjeto(projeto);
    setFormData({
      titulo: projeto.titulo,
      tipo_projeto: projeto.tipo_projeto,
      planejamento_id: projeto.planejamento_id || "",
      deadline: projeto.deadline ? format(new Date(projeto.deadline), "yyyy-MM-dd") : "",
      assets_url: projeto.assets_url || "",
      status_review: projeto.status_review,
      feedback_cliente: projeto.feedback_cliente || ""
    });
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aguardando': return 'bg-gray-500';
      case 'em_andamento': return 'bg-blue-500';
      case 'review': return 'bg-yellow-500';
      case 'aprovado': return 'bg-green-500';
      case 'revisao': return 'bg-orange-500';
      case 'entregue': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'motion': return <Zap className="h-4 w-4" />;
      case 'edicao': return <Edit className="h-4 w-4" />;
      case 'foto': return <Image className="h-4 w-4" />;
      default: return <FileVideo className="h-4 w-4" />;
    }
  };

  const getProgressByStatus = (status: string) => {
    switch (status) {
      case 'aguardando': return 0;
      case 'em_andamento': return 30;
      case 'review': return 70;
      case 'revisao': return 85;
      case 'aprovado': return 95;
      case 'entregue': return 100;
      default: return 0;
    }
  };

  const filteredProjetos = projetos.filter(projeto => {
    if (activeTab === "todos") return true;
    if (activeTab === "ativo") return ['aguardando', 'em_andamento', 'review', 'revisao'].includes(projeto.status_review);
    if (activeTab === "concluido") return ['aprovado', 'entregue'].includes(projeto.status_review);
    return true;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Video className="h-8 w-8" />
            Projetos Audiovisuais
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus projetos de vídeo, motion e edição
          </p>
        </div>
        <TutorialButton onStart={startTutorial} hasSeenTutorial={hasSeenTutorial} />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-tour="novo-projeto">
              <Plus className="h-4 w-4" />
              Novo Projeto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProjeto ? 'Editar Projeto' : 'Novo Projeto'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="titulo">Título do Projeto</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="tipo_projeto">Tipo de Projeto</Label>
                  <Select value={formData.tipo_projeto} onValueChange={(value) => setFormData({ ...formData, tipo_projeto: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Vídeo</SelectItem>
                      <SelectItem value="motion">Motion Graphics</SelectItem>
                      <SelectItem value="edicao">Edição</SelectItem>
                      <SelectItem value="foto">Fotografia</SelectItem>
                      <SelectItem value="animacao">Animação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status_review">Status</Label>
                  <Select value={formData.status_review} onValueChange={(value) => setFormData({ ...formData, status_review: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aguardando">Aguardando</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="review">Em Review</SelectItem>
                      <SelectItem value="revisao">Revisão</SelectItem>
                      <SelectItem value="aprovado">Aprovado</SelectItem>
                      <SelectItem value="entregue">Entregue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="planejamento_id">Planejamento (Opcional)</Label>
                  <Select value={formData.planejamento_id} onValueChange={(value) => setFormData({ ...formData, planejamento_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um planejamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {planejamentos.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.titulo} - {(plan as any).clientes?.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="assets_url">URL dos Assets</Label>
                  <Input
                    id="assets_url"
                    value={formData.assets_url}
                    onChange={(e) => setFormData({ ...formData, assets_url: e.target.value })}
                    placeholder="Link para Drive, Dropbox, etc."
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="feedback_cliente">Feedback do Cliente</Label>
                  <Textarea
                    id="feedback_cliente"
                    value={formData.feedback_cliente}
                    onChange={(e) => setFormData({ ...formData, feedback_cliente: e.target.value })}
                    placeholder="Comentários, solicitações de mudança, aprovações..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingProjeto ? 'Atualizar' : 'Criar'} Projeto
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-tour="filtro-tabs">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="ativo">Em Andamento</TabsTrigger>
          <TabsTrigger value="concluido">Concluídos</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredProjetos.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum projeto encontrado</h3>
                <p className="text-muted-foreground">
                  {activeTab === "todos" 
                    ? "Clique em 'Novo Projeto' para começar" 
                    : `Nenhum projeto ${activeTab === "ativo" ? "em andamento" : "concluído"} encontrado`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4" data-tour="lista-projetos">
              {filteredProjetos.map((projeto) => (
                <Card key={projeto.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                          {getTipoIcon(projeto.tipo_projeto)}
                          <h3 className="text-lg font-semibold">{projeto.titulo}</h3>
                          <Badge variant="outline" className={`${getStatusColor(projeto.status_review)} text-white`} data-tour="status-badge">
                            {projeto.status_review}
                          </Badge>
                          {(() => {
                            const diasCriacao = Math.ceil(
                              (new Date().getTime() - new Date(projeto.created_at).getTime()) / (1000 * 60 * 60 * 24)
                            );
                            if (diasCriacao <= 3) {
                              return <Badge className="bg-blue-500 text-white animate-pulse">NOVO</Badge>;
                            }
                            return null;
                          })()}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progresso</span>
                            <span className="font-medium">{getProgressByStatus(projeto.status_review)}%</span>
                          </div>
                          <Progress value={getProgressByStatus(projeto.status_review)} className="h-2" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{projeto.tipo_projeto}</Badge>
                          </div>

                          {projeto.deadline && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(projeto.deadline), 'dd/MM/yyyy', { locale: ptBR })}
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {format(new Date(projeto.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                          </div>
                        </div>

                        {(projeto as any).planejamentos && (
                          <div className="text-sm">
                            <span className="font-medium">Planejamento: </span>
                            <span className="text-muted-foreground">
                              {(projeto as any).planejamentos.titulo} - {(projeto as any).planejamentos.clientes?.nome}
                            </span>
                          </div>
                        )}

                        {projeto.feedback_cliente && (
                          <div className="bg-muted p-3 rounded-md">
                            <p className="text-sm font-medium mb-1 flex items-center gap-2">
                              💬 Feedback do Cliente:
                              {projeto.status_review === 'review' && (
                                <Badge className="bg-orange-500 text-white text-xs">
                                  AGUARDANDO REVISÃO
                                </Badge>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">{projeto.feedback_cliente}</p>
                          </div>
                        )}

                        {projeto.assets_url && (
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <a href={projeto.assets_url} target="_blank" rel="noopener noreferrer">
                                Ver Assets
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>

                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(projeto)}
                        className="ml-4"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}