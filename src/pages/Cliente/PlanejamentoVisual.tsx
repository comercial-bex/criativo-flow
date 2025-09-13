import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Calendar, Eye, Edit, Trash2, Image, Video } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PostPlanejamento {
  id: string;
  planejamento_id: string;
  data_postagem: string;
  titulo: string;
  objetivo_postagem: string;
  anexo_url?: string;
  tipo_criativo: 'imagem' | 'video';
  created_at: string;
}

interface Planejamento {
  id: string;
  titulo: string;
  status: string;
}

export default function PlanejamentoVisual() {
  const { clienteId, projetoId } = useParams<{ clienteId: string; projetoId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<PostPlanejamento[]>([]);
  const [planejamento, setPlanejamento] = useState<Planejamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostPlanejamento | null>(null);
  const [formData, setFormData] = useState({
    data_postagem: '',
    titulo: '',
    objetivo_postagem: '',
    anexo_url: '',
    tipo_criativo: 'imagem' as 'imagem' | 'video'
  });

  useEffect(() => {
    fetchPlanejamentoAndPosts();
  }, [projetoId, clienteId]);

  const fetchPlanejamentoAndPosts = async () => {
    if (!projetoId || !clienteId) return;
    
    try {
      // Buscar planejamento
      const mesReferenciaDate = `${new Date().toISOString().slice(0, 7)}-01`;
      const { data: planejamentoData, error: planejamentoError } = await supabase
        .from('planejamentos')
        .select('id, titulo, status')
        .eq('cliente_id', clienteId)
        .eq('mes_referencia', mesReferenciaDate)
        .maybeSingle();

      if (planejamentoError) throw planejamentoError;

      setPlanejamento(planejamentoData);

      if (planejamentoData) {
        // Buscar posts do planejamento
        const { data: postsData, error: postsError } = await supabase
          .from('posts_planejamento')
          .select('*')
          .eq('planejamento_id', planejamentoData.id)
          .order('data_postagem', { ascending: true });

        if (postsError) throw postsError;
        setPosts(postsData || []);
      }
    } catch (error) {
      console.error('Erro ao carregar planejamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do planejamento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePost = async () => {
    if (!planejamento || !formData.data_postagem || !formData.titulo || !formData.objetivo_postagem) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const postData = {
        planejamento_id: planejamento.id,
        data_postagem: formData.data_postagem,
        titulo: formData.titulo,
        objetivo_postagem: formData.objetivo_postagem,
        anexo_url: formData.anexo_url || null,
        tipo_criativo: formData.tipo_criativo,
      };

      if (editingPost) {
        const { error } = await supabase
          .from('posts_planejamento')
          .update(postData)
          .eq('id', editingPost.id);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Post atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('posts_planejamento')
          .insert([postData]);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Post criado com sucesso!",
        });
      }

      setIsDialogOpen(false);
      setEditingPost(null);
      setFormData({
        data_postagem: '',
        titulo: '',
        objetivo_postagem: '',
        anexo_url: '',
        tipo_criativo: 'imagem'
      });
      fetchPlanejamentoAndPosts();
    } catch (error) {
      console.error('Erro ao salvar post:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar post.",
        variant: "destructive",
      });
    }
  };

  const handleEditPost = (post: PostPlanejamento) => {
    setEditingPost(post);
    setFormData({
      data_postagem: post.data_postagem,
      titulo: post.titulo,
      objetivo_postagem: post.objetivo_postagem,
      anexo_url: post.anexo_url || '',
      tipo_criativo: post.tipo_criativo
    });
    setIsDialogOpen(true);
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts_planejamento')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Post removido com sucesso!",
      });
      
      fetchPlanejamentoAndPosts();
    } catch (error) {
      console.error('Erro ao remover post:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover post.",
        variant: "destructive",
      });
    }
  };

  const openNewPostDialog = () => {
    setEditingPost(null);
    setFormData({
      data_postagem: '',
      titulo: '',
      objetivo_postagem: '',
      anexo_url: '',
      tipo_criativo: 'imagem'
    });
    setIsDialogOpen(true);
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
          <p className="text-muted-foreground mb-4">É necessário criar um planejamento antes de gerenciar os posts.</p>
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
            description={`Posts do planejamento: ${planejamento.titulo}`}
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewPostDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPost ? 'Editar Post' : 'Novo Post'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="data_postagem">Data da Postagem</Label>
                <Input
                  id="data_postagem"
                  type="date"
                  value={formData.data_postagem}
                  onChange={(e) => setFormData({ ...formData, data_postagem: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ex: Post promocional Black Friday"
                />
              </div>
              
              <div>
                <Label htmlFor="objetivo">Objetivo da Postagem</Label>
                <Textarea
                  id="objetivo"
                  value={formData.objetivo_postagem}
                  onChange={(e) => setFormData({ ...formData, objetivo_postagem: e.target.value })}
                  placeholder="Ex: Aumentar vendas durante a Black Friday"
                />
              </div>
              
              <div>
                <Label htmlFor="tipo_criativo">Tipo de Criativo</Label>
                <Select
                  value={formData.tipo_criativo}
                  onValueChange={(value: 'imagem' | 'video') => setFormData({ ...formData, tipo_criativo: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="imagem">Imagem</SelectItem>
                    <SelectItem value="video">Vídeo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="anexo">URL do Anexo (opcional)</Label>
                <Input
                  id="anexo"
                  value={formData.anexo_url}
                  onChange={(e) => setFormData({ ...formData, anexo_url: e.target.value })}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSavePost} className="flex-1">
                  {editingPost ? 'Atualizar' : 'Criar'} Post
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid de Posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <Card key={post.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {post.tipo_criativo === 'video' ? (
                    <Video className="h-4 w-4 text-purple-500" />
                  ) : (
                    <Image className="h-4 w-4 text-blue-500" />
                  )}
                  <Badge variant="outline" className="text-xs">
                    {post.tipo_criativo}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleEditPost(post)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    onClick={() => handleDeletePost(post.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(post.data_postagem).toLocaleDateString('pt-BR')}
                </div>
                <h3 className="font-medium text-sm line-clamp-2">{post.titulo}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{post.objetivo_postagem}</p>
                {post.anexo_url && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => window.open(post.anexo_url, '_blank')}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver anexo
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {posts.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-medium mb-2">Nenhum post cadastrado</h3>
              <p className="text-sm">Comece criando o primeiro post do seu planejamento.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}