import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Calendar, Users, Clock, CheckCircle, XCircle, FileText, Send, Edit, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { VisaoGeral } from "@/components/VisaoGeral";
import { DetalhesPlano } from "@/components/DetalhesPlano";
import { TarefasKanban } from "@/components/TarefasKanban";
import PlanoEditorial from "@/components/PlanoEditorial";
import { InstagramPreview } from "@/components/InstagramPreview";
import { PlanejamentoEditorialWizard } from "@/components/PlanejamentoEditorialWizard";
import { toast } from "sonner";


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
  descricao: string | null;
  clientes: Cliente;
}

interface Post {
  id: string;
  titulo: string;
  data_postagem: string;
  tipo_criativo: string;
  formato_postagem: string;
  objetivo_postagem: string;
  anexo_url: string | null;
  planejamento_id: string;
  status?: string;
}

export default function GRSPlanejamentoDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [planejamento, setPlanejamento] = useState<Planejamento | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Suportar query param ?tab=... ou defaultar para plano-editorial
  const queryParams = new URLSearchParams(location.search);
  const tabFromQuery = queryParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromQuery || 'plano-editorial');
  
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPlanejamento();
      fetchPosts();
    }
  }, [id]);


  const fetchPlanejamento = async () => {
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
          descricao,
          clientes (
            id,
            nome
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setPlanejamento(data);
    } catch (error) {
      console.error('Erro ao buscar planejamento:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts_planejamento')
        .select('*')
        .eq('planejamento_id', id)
        .order('data_postagem', { ascending: true });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Carregando planejamento...</div>
      </div>
    );
  }

  if (!planejamento) {
    return (
      <div className="p-6 space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Planejamento não encontrado</h3>
            <p className="text-muted-foreground mb-4">
              O planejamento solicitado não foi encontrado ou você não tem permissão para acessá-lo.
            </p>
            <Button onClick={() => navigate('/grs/planejamentos')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Lista
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(planejamento.status);

  return (
    <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/grs/planejamentos')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{planejamento.titulo}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{planejamento.clientes.nome}</span>
              <span>•</span>
              <Calendar className="h-4 w-4" />
              <span>{new Date(planejamento.mes_referencia).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className={`${getStatusColor(planejamento.status)} text-white`}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {getStatusText(planejamento.status)}
          </Badge>
          
          {planejamento.status === 'rascunho' && (
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Enviar para Aprovação
            </Button>
          )}
          
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Status Timeline */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Criado:</span> {new Date(planejamento.mes_referencia).toLocaleDateString('pt-BR')}
            </div>
            {planejamento.data_envio_cliente && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Enviado:</span> {new Date(planejamento.data_envio_cliente).toLocaleDateString('pt-BR')}
              </div>
            )}
            {planejamento.data_aprovacao_cliente && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Aprovado:</span> {new Date(planejamento.data_aprovacao_cliente).toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Observações do Cliente */}
      {planejamento.observacoes_cliente && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Observações do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{planejamento.observacoes_cliente}</p>
          </CardContent>
        </Card>
      )}

      {/* Conteúdo em Abas */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
          <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
          <TabsTrigger value="plano-editorial">Plano Editorial</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-6">
          <VisaoGeral 
            planejamento={planejamento}
            clienteId={planejamento.clientes.id}
            projetoId={planejamento.id}
          />
        </TabsContent>

        <TabsContent value="detalhes" className="space-y-6">
          <DetalhesPlano 
            planejamento={planejamento}
            setPlanejamento={setPlanejamento}
            clienteId={planejamento.clientes.id}
          />
        </TabsContent>

        <TabsContent value="tarefas" className="space-y-6">
          <TarefasKanban 
            planejamento={planejamento}
            clienteId={planejamento.clientes.id}
            projetoId={planejamento.id}
          />
        </TabsContent>

        <TabsContent value="plano-editorial" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Plano Editorial BEX</CardTitle>
                <Button 
                  onClick={() => setWizardOpen(true)}
                  variant="default"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {posts.length > 0 ? 'Editar Wizard BEX' : 'Iniciar Wizard BEX'}
                </Button>
              </div>
            </CardHeader>
          </Card>
          
          <PlanoEditorial
            planejamento={{
              id: planejamento.id,
              titulo: planejamento.titulo,
              cliente_id: planejamento.clientes.id
            }}
            clienteId={planejamento.clientes.id}
            projetoId={planejamento.id}
            posts={posts}
            setPosts={setPosts}
            onPreviewPost={setSelectedPost}
          />
        </TabsContent>
      </Tabs>

      {/* Instagram Preview Modal */}
      {selectedPost && (
        <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
          <DialogContent className="max-w-md">
            <InstagramPreview post={selectedPost} />
          </DialogContent>
        </Dialog>
      )}

      {/* BEX Wizard Modal */}
      <PlanejamentoEditorialWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        clienteId={planejamento.clientes.id}
        planejamentoId={id!}
        onComplete={() => {
          toast.success('Planejamento BEX concluído com sucesso!');
          setWizardOpen(false);
          fetchPosts();
          setActiveTab('plano-editorial');
        }}
      />
    </div>
  );
}