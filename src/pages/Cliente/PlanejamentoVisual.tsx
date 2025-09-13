import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Calendar, Plus, Settings, Image, Instagram, Facebook, Loader2, Wand2, Eye, CalendarDays } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InstagramPreview } from "@/components/InstagramPreview";
import { CalendarioEditorial } from "@/components/CalendarioEditorial";

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
  formato_postagem: string;
  objetivo_postagem: string;
  anexo_url?: string;
  planejamento_id: string;
  created_at?: string;
  updated_at?: string;
  descricao?: string;
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
    formato_postagem: '',
    objetivo_postagem: ''
  });
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showInstagramPreview, setShowInstagramPreview] = useState(false);
  const [showCalendarioEditorial, setShowCalendarioEditorial] = useState(false);

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

  const generateImage = async (prompt: string, formato: string) => {
    try {
      setGeneratingImage(true);
      
      // Definir tamanhos baseados no formato da postagem do Instagram
      let size = '1024x1024'; // padrão
      
      switch (formato) {
        case 'post':
          size = '1080x1080'; // Post quadrado do Instagram
          break;
        case 'story':
          size = '1080x1920'; // Story do Instagram (9:16)
          break;
        case 'carrossel':
          size = '1080x1080'; // Carrossel quadrado do Instagram
          break;
        case 'reel':
          size = '1080x1920'; // Reel do Instagram (9:16)
          break;
      }
      
      const { data, error } = await supabase.functions.invoke('generate-post-image', {
        body: { 
          prompt: `${prompt}. Professional Instagram ${formato}, modern design, high quality, optimized for ${formato}`, 
          style: `modern Instagram ${formato}`, 
          size: size 
        }
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
    if (!planejamento || !newPost.titulo || !newPost.data_postagem || !newPost.tipo_criativo || !newPost.formato_postagem) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreatingPost(true);

      // Gerar imagem automaticamente baseada no título e formato
      const imagePrompt = `${newPost.titulo}. Professional Instagram ${newPost.formato_postagem}, modern design, high quality`;
      const imageUrl = await generateImage(imagePrompt, newPost.formato_postagem);

      const { data, error } = await supabase
        .from('posts_planejamento')
        .insert({
          planejamento_id: planejamento.id,
          titulo: newPost.titulo,
          data_postagem: newPost.data_postagem,
          tipo_criativo: newPost.tipo_criativo,
          formato_postagem: newPost.formato_postagem,
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
        formato_postagem: '',
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
                Planejamento Visual
              </h1>
              <p className="text-muted-foreground mt-1">
                {planejamento.titulo}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCalendarioEditorial(true)}
              className="hover:scale-105 transition-transform"
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Calendário Editorial
            </Button>
            <Badge className={`${getStatusColor(planejamento.status)} px-3 py-1 font-medium`}>
              {getStatusText(planejamento.status)}
            </Badge>
          </div>
        </div>

        {/* Planejamento Detalhado */}
        <Card className="backdrop-blur-sm bg-card/95 border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-full bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              {planejamento.titulo}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {planejamento.descricao && (
              <div className="whitespace-pre-wrap text-sm space-y-4 leading-relaxed">
                {planejamento.descricao}
              </div>
            )}
          </CardContent>
        </Card>


        {/* Gerenciamento de Posts */}
        <Card className="backdrop-blur-sm bg-card/95 border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10">
                  <Instagram className="h-5 w-5 text-pink-500" />
                </div>
                Posts do Planejamento 
                <Badge variant="secondary" className="ml-2 px-2 py-1 text-xs">
                  {posts.length}
                </Badge>
              </CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Post
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-2xl bg-gradient-to-br from-background to-muted/30 border-primary/20">
                <DialogHeader className="text-center pb-6">
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    ✨ Criar Novo Post
                  </DialogTitle>
                  <p className="text-muted-foreground text-sm">
                    Crie um post incrível com imagem gerada por IA
                  </p>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Título do Post</label>
                      <Input
                        value={newPost.titulo}
                        onChange={(e) => setNewPost({...newPost, titulo: e.target.value})}
                        placeholder="Digite um título criativo..."
                        className="border-primary/20 focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Data de Postagem</label>
                      <Input
                        type="date"
                        value={newPost.data_postagem}
                        onChange={(e) => setNewPost({...newPost, data_postagem: e.target.value})}
                        className="border-primary/20 focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Tipo Criativo</label>
                      <Select value={newPost.tipo_criativo} onValueChange={(value) => setNewPost({...newPost, tipo_criativo: value})}>
                        <SelectTrigger className="border-primary/20 focus:border-primary transition-colors">
                          <SelectValue placeholder="Selecione o tipo..." />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-primary/20 z-50">
                          <SelectItem value="imagem" className="hover:bg-primary/5">🖼️ Imagem</SelectItem>
                          <SelectItem value="video" className="hover:bg-primary/5">🎬 Vídeo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Formato da Postagem</label>
                      <Select value={newPost.formato_postagem} onValueChange={(value) => setNewPost({...newPost, formato_postagem: value})}>
                        <SelectTrigger className="border-primary/20 focus:border-primary transition-colors">
                          <SelectValue placeholder="Selecione o formato..." />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-primary/20 z-50">
                          <SelectItem value="post" className="hover:bg-primary/5">📱 Post</SelectItem>
                          <SelectItem value="story" className="hover:bg-primary/5">📸 Story</SelectItem>
                          <SelectItem value="carrossel" className="hover:bg-primary/5">🎠 Carrossel</SelectItem>
                          <SelectItem value="reel" className="hover:bg-primary/5">🎬 Reel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Objetivo da Postagem</label>
                    <Select value={newPost.objetivo_postagem} onValueChange={(value) => setNewPost({...newPost, objetivo_postagem: value})}>
                      <SelectTrigger className="border-primary/20 focus:border-primary transition-colors">
                        <SelectValue placeholder="Selecione o objetivo..." />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-primary/20 z-50">
                        {objetivos.map((obj, index) => (
                          <SelectItem key={index} value={obj.tipo} className="hover:bg-primary/5">
                            🎯 {obj.tipo.replace('_', ' ').toUpperCase()}
                          </SelectItem>
                        ))}
                        <SelectItem value="reconhecimento_marca" className="hover:bg-primary/5">🏆 Reconhecimento de Marca</SelectItem>
                        <SelectItem value="crescimento_seguidores" className="hover:bg-primary/5">📈 Crescimento de Seguidores</SelectItem>
                        <SelectItem value="aquisicao_leads" className="hover:bg-primary/5">🎯 Aquisição de Leads</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-primary/10">
                    <Button 
                      onClick={createPost} 
                      disabled={isCreatingPost || generatingImage}
                      className="min-w-[160px] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      {isCreatingPost ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Criando Post...
                        </>
                      ) : generatingImage ? (
                        <>
                          <Wand2 className="h-4 w-4 mr-2 animate-pulse text-yellow-400" />
                          Gerando Imagem IA...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          ✨ Criar Post
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
          <CardContent className="pt-6">
            {posts.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-br from-muted/30 to-transparent rounded-lg border border-dashed border-primary/20">
                <div className="p-4 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Instagram className="h-12 w-12 text-pink-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Nenhum post criado ainda</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Clique em "Novo Post" para começar a criar conteúdo incrível para as redes sociais com imagens geradas por IA.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post, index) => (
                  <Card 
                    key={post.id} 
                    className="group overflow-hidden bg-gradient-to-br from-card to-card/80 border-primary/10 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {post.anexo_url && (
                      <div className={`relative overflow-hidden ${
                        post.formato_postagem === 'story' || post.formato_postagem === 'reel' 
                          ? 'aspect-[9/16]' 
                          : 'aspect-square'
                      }`}>
                        <img 
                          src={post.anexo_url} 
                          alt={post.titulo}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-background/90 text-foreground border-primary/20 shadow-lg">
                            <Image className="h-3 w-3 mr-1" />
                            IA
                          </Badge>
                        </div>
                      </div>
                    )}
                    <CardContent className="p-5">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className="text-xs font-medium bg-primary/5 border-primary/20 text-primary"
                            >
                              {post.formato_postagem === 'post' && '📱'}
                              {post.formato_postagem === 'story' && '📸'}
                              {post.formato_postagem === 'reel' && '🎬'}
                              {post.formato_postagem === 'carrossel' && '🎠'}
                              {' '}
                              {post.formato_postagem.toUpperCase()}
                            </Badge>
                            <Badge 
                              variant="secondary" 
                              className="text-xs bg-muted/50"
                            >
                              {post.tipo_criativo === 'imagem' && '🖼️'}
                              {post.tipo_criativo === 'video' && '🎬'}
                              {' '}
                              {post.tipo_criativo}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground font-medium">
                            {new Date(post.data_postagem).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <h4 className="font-semibold text-sm line-clamp-2 leading-relaxed group-hover:text-primary transition-colors">
                          {post.titulo}
                        </h4>
                        <div className="flex items-center justify-between pt-2 border-t border-primary/5">
                          <Badge 
                            variant="secondary" 
                            className="text-xs bg-muted/50 hover:bg-primary/10 transition-colors"
                          >
                            🎯 {post.objetivo_postagem.replace('_', ' ')}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="hover:bg-primary/10 hover:text-primary transition-colors h-8 w-8 p-0"
                            onClick={() => {
                              setSelectedPost(post);
                              setShowInstagramPreview(true);
                            }}
                          >
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

        {/* Instagram Preview Modal */}
        <InstagramPreview
          isOpen={showInstagramPreview}
          onClose={() => setShowInstagramPreview(false)}
          post={selectedPost}
        />

        {/* Calendário Editorial Modal */}
        <CalendarioEditorial
          isOpen={showCalendarioEditorial}
          onClose={() => setShowCalendarioEditorial(false)}
          posts={posts}
          onPostClick={(post) => {
            setSelectedPost(post);
            setShowCalendarioEditorial(false);
            setShowInstagramPreview(true);
          }}
        />
      </div>
    </div>
  );
}