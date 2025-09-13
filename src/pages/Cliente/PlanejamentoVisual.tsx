import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Calendar, Plus, Settings, Image, Instagram, Facebook, Loader2, Wand2, Eye } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Planejamento {
  id: string;
  titulo: string;
  status: string;
  descricao?: string;
}

interface Post {
  id: string;
  titulo: string;
  data_postagem: string;
  tipo_criativo: string;
  objetivo_postagem: string;
  anexo_url?: string;
  planejamento_id: string;
  created_at?: string;
  updated_at?: string;
}

interface ClienteData {
  assinatura_id: string;
}

interface Objetivo {
  tipo: string;
  descricao: string;
}

export default function PlanejamentoVisual() {
  const { clienteId, projetoId } = useParams<{ clienteId: string; projetoId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [planejamento, setPlanejamento] = useState<Planejamento | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [clienteData, setClienteData] = useState<ClienteData | null>(null);
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [newPost, setNewPost] = useState({
    titulo: '',
    data_postagem: '',
    tipo_criativo: '',
    objetivo_postagem: ''
  });

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
        .select('id, titulo, status, descricao')
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

      // Buscar dados do cliente
      const { data: clienteInfo, error: clienteError } = await supabase
        .from('clientes')
        .select('assinatura_id')
        .eq('id', clienteId)
        .single();

      if (!clienteError && clienteInfo) {
        setClienteData(clienteInfo);
      }

      // Buscar objetivos do cliente
      const { data: objetivosData, error: objetivosError } = await supabase
        .from('cliente_onboarding')
        .select('objetivos_digitais')
        .eq('cliente_id', clienteId)
        .single();

      if (!objetivosError && objetivosData?.objetivos_digitais && Array.isArray(objetivosData.objetivos_digitais)) {
        setObjetivos(objetivosData.objetivos_digitais);
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

  const generateImage = async (prompt: string) => {
    try {
      setGeneratingImage(true);
      const { data, error } = await supabase.functions.invoke('generate-post-image', {
        body: { prompt, style: 'modern social media post', size: '1024x1024' }
      });

      if (error) throw error;
      return data.imageUrl;
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar imagem. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setGeneratingImage(false);
    }
  };

  const createPost = async () => {
    if (!planejamento || !newPost.titulo || !newPost.data_postagem) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreatingPost(true);

      // Gerar imagem automaticamente baseada no título
      const imagePrompt = `${newPost.titulo}. Professional social media post, modern design, high quality`;
      const imageUrl = await generateImage(imagePrompt);

      const { data, error } = await supabase
        .from('posts_planejamento')
        .insert({
          planejamento_id: planejamento.id,
          titulo: newPost.titulo,
          data_postagem: newPost.data_postagem,
          tipo_criativo: newPost.tipo_criativo,
          objetivo_postagem: newPost.objetivo_postagem,
          anexo_url: imageUrl
        })
        .select()
        .single();

      if (error) throw error;

      setPosts([...posts, data]);
      setNewPost({
        titulo: '',
        data_postagem: '',
        tipo_criativo: '',
        objetivo_postagem: ''
      });

      toast({
        title: "Sucesso",
        description: "Post criado com sucesso!",
      });

    } catch (error) {
      console.error('Erro ao criar post:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar post. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingPost(false);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/clientes/${clienteId}/projetos/${projetoId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <SectionHeader
            title="Planejamento Visual"
            description={`Visualização detalhada: ${planejamento.titulo}`}
          />
        </div>
        
        <div className="flex gap-2">
          <Badge className={getStatusColor(planejamento.status)}>
            {getStatusText(planejamento.status)}
          </Badge>
        </div>
      </div>

      {/* Planejamento Detalhado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {planejamento.titulo}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {planejamento.descricao && (
            <div className="whitespace-pre-wrap text-sm space-y-4">
              {planejamento.descricao}
            </div>
          )}
        </CardContent>
      </Card>


      {/* Gerenciamento de Posts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Instagram className="h-5 w-5" />
              Posts do Planejamento ({posts.length})
            </CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Novo Post</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Título do Post</label>
                      <Input
                        value={newPost.titulo}
                        onChange={(e) => setNewPost({...newPost, titulo: e.target.value})}
                        placeholder="Digite o título..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Data de Postagem</label>
                      <Input
                        type="date"
                        value={newPost.data_postagem}
                        onChange={(e) => setNewPost({...newPost, data_postagem: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Tipo Criativo</label>
                      <Select value={newPost.tipo_criativo} onValueChange={(value) => setNewPost({...newPost, tipo_criativo: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="post">Post</SelectItem>
                          <SelectItem value="story">Story</SelectItem>
                          <SelectItem value="reel">Reel</SelectItem>
                          <SelectItem value="carrossel">Carrossel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Objetivo da Postagem</label>
                      <Select value={newPost.objetivo_postagem} onValueChange={(value) => setNewPost({...newPost, objetivo_postagem: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {objetivos.map((obj, index) => (
                            <SelectItem key={index} value={obj.tipo}>
                              {obj.tipo.replace('_', ' ').toUpperCase()}
                            </SelectItem>
                          ))}
                          <SelectItem value="reconhecimento_marca">Reconhecimento de Marca</SelectItem>
                          <SelectItem value="crescimento_seguidores">Crescimento de Seguidores</SelectItem>
                          <SelectItem value="aquisicao_leads">Aquisição de Leads</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      onClick={createPost} 
                      disabled={isCreatingPost || generatingImage}
                      className="min-w-[140px]"
                    >
                      {isCreatingPost ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Criando...
                        </>
                      ) : generatingImage ? (
                        <>
                          <Wand2 className="h-4 w-4 mr-2 animate-pulse" />
                          Gerando Imagem...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Criar Post
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <Instagram className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-medium mb-2">Nenhum post criado ainda</h3>
              <p className="text-sm text-muted-foreground">
                Clique em "Novo Post" para começar a criar conteúdo para as redes sociais.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => (
                <Card key={post.id} className="overflow-hidden">
                  {post.anexo_url && (
                    <div className="aspect-square relative">
                      <img 
                        src={post.anexo_url} 
                        alt={post.titulo}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-background/80">
                          <Image className="h-3 w-3" />
                        </Badge>
                      </div>
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {post.tipo_criativo.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(post.data_postagem).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <h4 className="font-medium text-sm line-clamp-2">{post.titulo}</h4>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {post.objetivo_postagem.replace('_', ' ')}
                        </Badge>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}