import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Eye, BarChart3, FileText, Kanban, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InstagramPreview } from "@/components/InstagramPreview";
import { VisaoGeral } from "@/components/VisaoGeral";
import { DetalhesPlano } from "@/components/DetalhesPlano";
import { TarefasKanban } from "@/components/TarefasKanban";
import PlanoEditorial from "@/components/PlanoEditorial";

interface Planejamento {
  id: string;
  titulo: string;
  status: string;
  cliente_id: string;
  descricao?: string;
  data_envio_cliente?: string;
  data_aprovacao_cliente?: string;
  responsavel_grs_id?: string;
  observacoes_cliente?: string;
}

interface Post {
  id: string;
  titulo: string;
  data_postagem: string;
  tipo_criativo: string;
  formato_postagem: string;
  objetivo_postagem: string;
  anexo_url?: string;
  planejamento_id: string;
  created_at?: string;
  updated_at?: string;
  descricao?: string;
}

export default function PlanejamentoVisual() {
  const { clienteId, projetoId } = useParams<{ clienteId: string; projetoId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [planejamento, setPlanejamento] = useState<Planejamento | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showInstagramPreview, setShowInstagramPreview] = useState(false);
  const [activeTab, setActiveTab] = useState("visao-geral");

  useEffect(() => {
    fetchData();
  }, [projetoId, clienteId]);

  const fetchData = async () => {
    if (!projetoId || !clienteId) return;
    
    try {
      // Buscar planejamento do mês atual
      const mesReferenciaDate = `${new Date().toISOString().slice(0, 7)}-01`;
      const { data: planejamentoData, error: planejamentoError } = await supabase
        .from('planejamentos')
        .select('*')
        .eq('cliente_id', clienteId)
        .eq('mes_referencia', mesReferenciaDate)
        .maybeSingle();

      if (planejamentoError) throw planejamentoError;

      // Buscar posts do planejamento
      if (planejamentoData) {
        const { data: postsData, error: postsError } = await supabase
          .from('posts_planejamento')
          .select('*')
          .eq('planejamento_id', planejamentoData.id)
          .order('data_postagem');

        if (postsError) throw postsError;
        setPosts(postsData || []);
      }

      setPlanejamento(planejamentoData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do planejamento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'rascunho': return 'bg-gray-100 text-gray-800';
      case 'em_revisao': return 'bg-blue-100 text-blue-800';
      case 'aprovado_cliente': return 'bg-green-100 text-green-800';
      case 'em_producao': return 'bg-yellow-100 text-yellow-800';
      case 'em_aprovacao_final': return 'bg-purple-100 text-purple-800';
      case 'finalizado': return 'bg-green-100 text-green-800';
      case 'reprovado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'rascunho': return 'Rascunho';
      case 'em_revisao': return 'Em Revisão';
      case 'aprovado_cliente': return 'Aprovado';
      case 'em_producao': return 'Em Produção';
      case 'em_aprovacao_final': return 'Aprovação Final';
      case 'finalizado': return 'Finalizado';
      case 'reprovado': return 'Reprovado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!planejamento) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Planejamento não encontrado</h2>
          <p className="text-muted-foreground mb-4">
            É necessário criar um planejamento antes de acessar a visualização detalhada.
            <br />
            Volte para a página do projeto e clique em "Criar Novo Plano".
          </p>
          <Button onClick={() => navigate(`/clientes/${clienteId}/projetos/${projetoId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para o Projeto
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/clientes/${clienteId}/projetos/${projetoId}`)}
              className="hover:scale-105 transition-transform"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Planejamento de Conteúdo
              </h1>
              <p className="text-muted-foreground mt-1">
                {planejamento.titulo}
              </p>
            </div>
          </div>
          
          <Badge className={`${getStatusColor(planejamento.status)} px-3 py-1 font-medium`}>
            {getStatusText(planejamento.status)}
          </Badge>
        </div>

        {/* Sistema de Abas */}
        <Card className="backdrop-blur-sm bg-card/95 border-primary/10 shadow-lg">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-muted/50">
              <TabsTrigger 
                value="visao-geral" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <BarChart3 className="h-4 w-4" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger 
                value="detalhes"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <FileText className="h-4 w-4" />
                Detalhes
              </TabsTrigger>
              <TabsTrigger 
                value="tarefas"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Kanban className="h-4 w-4" />
                Tarefas
              </TabsTrigger>
              <TabsTrigger 
                value="plano-editorial"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Calendar className="h-4 w-4" />
                Plano Editorial
              </TabsTrigger>
            </TabsList>

            <TabsContent value="visao-geral" className="mt-6">
              <VisaoGeral 
                planejamento={planejamento}
                clienteId={clienteId!}
                projetoId={projetoId!}
              />
            </TabsContent>

            <TabsContent value="detalhes" className="mt-6">
              <DetalhesPlano 
                planejamento={planejamento}
                setPlanejamento={setPlanejamento}
                clienteId={clienteId!}
              />
            </TabsContent>

            <TabsContent value="tarefas" className="mt-6">
              <TarefasKanban 
                planejamento={planejamento}
                clienteId={clienteId!}
                projetoId={projetoId!}
              />
            </TabsContent>

            <TabsContent value="plano-editorial" className="mt-6">
              <PlanoEditorial 
                planejamento={planejamento}
                clienteId={clienteId!}
                posts={posts}
                setPosts={setPosts}
                onPreviewPost={(post) => {
                  setSelectedPost(post);
                  setShowInstagramPreview(true);
                }}
              />
            </TabsContent>
          </Tabs>
        </Card>

        {/* Instagram Preview Modal */}
        {showInstagramPreview && selectedPost && (
          <InstagramPreview
            isOpen={showInstagramPreview}
            onClose={() => setShowInstagramPreview(false)}
            post={selectedPost}
          />
        )}
      </div>
    </div>
  );
}