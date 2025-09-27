import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  Clock,
  Facebook,
  Instagram,
  Send,
  Image,
  Video,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { InstagramPreview } from "@/components/InstagramPreview";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SubMenuGRS } from "@/components/SubMenuGRS";

interface PostAgendado {
  id: string;
  titulo: string;
  conteudo: string;
  data_publicacao: string;
  hora_publicacao: string;
  plataformas: string[];
  tipo_conteudo: 'foto' | 'video' | 'carrossel' | 'texto';
  status: 'agendado' | 'publicado' | 'erro' | 'aprovacao';
  cliente_nome?: string;
  anexo_url?: string;
  hashtags?: string[];
}

interface Cliente {
  id: string;
  nome: string;
}

const plataformasDisponiveis = [
  { id: 'facebook', nome: 'Facebook', icon: Facebook, cor: 'bg-blue-600' },
  { id: 'instagram', nome: 'Instagram', icon: Instagram, cor: 'bg-pink-600' },
  { id: 'google_business', nome: 'Google Meu Negócio', icon: FileText, cor: 'bg-green-600' },
  { id: 'tiktok', nome: 'TikTok', icon: Video, cor: 'bg-black' },
];

export default function GRSAgendamentoSocial() {
  const [postsAgendados, setPostsAgendados] = useState<PostAgendado[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostAgendado | null>(null);
  const { toast } = useToast();

  const [novoPost, setNovoPost] = useState({
    titulo: '',
    conteudo: '',
    cliente_id: '',
    data_publicacao: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    hora_publicacao: '09:00',
    plataformas: [] as string[],
    tipo_conteudo: 'foto' as 'foto' | 'video' | 'carrossel' | 'texto',
    hashtags: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar clientes
      const { data: clientesData } = await supabase
        .from('clientes')
        .select('id, nome')
        .order('nome');

      setClientes(clientesData || []);

      // Simular posts agendados (em produção, viria de uma tabela dedicada)
      const mockPosts: PostAgendado[] = [
        {
          id: '1',
          titulo: 'Promoção Black Friday',
          conteudo: 'Aproveite os descontos incríveis da Black Friday! Até 50% OFF em todos os produtos.',
          data_publicacao: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
          hora_publicacao: '10:00',
          plataformas: ['facebook', 'instagram'],
          tipo_conteudo: 'foto',
          status: 'agendado',
          cliente_nome: 'Loja Virtual XYZ',
          hashtags: ['#blackfriday', '#desconto', '#promocao']
        },
        {
          id: '2',
          titulo: 'Novo produto lançado',
          conteudo: 'Acabamos de lançar nosso mais novo produto! Venha conhecer.',
          data_publicacao: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
          hora_publicacao: '14:30',
          plataformas: ['instagram', 'tiktok'],
          tipo_conteudo: 'video',
          status: 'aprovacao',
          cliente_nome: 'Empresa ABC',
          hashtags: ['#novidade', '#produto', '#lancamento']
        }
      ];

      setPostsAgendados(mockPosts);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!novoPost.titulo || !novoPost.conteudo || !novoPost.cliente_id || novoPost.plataformas.length === 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      // Simular criação de post
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newPost: PostAgendado = {
        id: Date.now().toString(),
        titulo: novoPost.titulo,
        conteudo: novoPost.conteudo,
        data_publicacao: novoPost.data_publicacao,
        hora_publicacao: novoPost.hora_publicacao,
        plataformas: novoPost.plataformas,
        tipo_conteudo: novoPost.tipo_conteudo,
        status: 'agendado',
        cliente_nome: clientes.find(c => c.id === novoPost.cliente_id)?.nome,
        hashtags: novoPost.hashtags.split(' ').filter(h => h.trim())
      };

      setPostsAgendados(prev => [...prev, newPost]);
      
      // Reset form
      setNovoPost({
        titulo: '',
        conteudo: '',
        cliente_id: '',
        data_publicacao: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        hora_publicacao: '09:00',
        plataformas: [],
        tipo_conteudo: 'foto',
        hashtags: ''
      });

      toast({
        title: "Sucesso",
        description: "Post agendado com sucesso!",
      });

    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao agendar post.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    setPostsAgendados(prev => prev.filter(p => p.id !== postId));
    toast({
      title: "Post removido",
      description: "O post foi removido da programação.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'agendado': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'publicado': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'erro': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'aprovacao': return <Loader2 className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return 'default';
      case 'publicado': return 'default';
      case 'erro': return 'destructive';
      case 'aprovacao': return 'secondary';
      default: return 'default';
    }
  };

  const togglePlataforma = (plataformaId: string) => {
    setNovoPost(prev => ({
      ...prev,
      plataformas: prev.plataformas.includes(plataformaId)
        ? prev.plataformas.filter(p => p !== plataformaId)
        : [...prev.plataformas, plataformaId]
    }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
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
            <Send className="h-8 w-8 text-primary" />
            Agendamento Social
          </h1>
          <p className="text-muted-foreground">
            Gerencie postagens em múltiplas redes sociais
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form de Criação */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Novo Agendamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cliente">Cliente</Label>
                <Select value={novoPost.cliente_id} onValueChange={(value) => setNovoPost(prev => ({ ...prev, cliente_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar cliente" />
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

              <div>
                <Label htmlFor="titulo">Título do Post</Label>
                <Input
                  id="titulo"
                  value={novoPost.titulo}
                  onChange={(e) => setNovoPost(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Ex: Promoção especial"
                />
              </div>

              <div>
                <Label htmlFor="conteudo">Conteúdo</Label>
                <Textarea
                  id="conteudo"
                  value={novoPost.conteudo}
                  onChange={(e) => setNovoPost(prev => ({ ...prev, conteudo: e.target.value }))}
                  placeholder="Escreva o conteúdo do post..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="hashtags">Hashtags</Label>
                <Input
                  id="hashtags"
                  value={novoPost.hashtags}
                  onChange={(e) => setNovoPost(prev => ({ ...prev, hashtags: e.target.value }))}
                  placeholder="#promo #desconto #novidade"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="data">Data</Label>
                  <Input
                    id="data"
                    type="date"
                    value={novoPost.data_publicacao}
                    onChange={(e) => setNovoPost(prev => ({ ...prev, data_publicacao: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="hora">Hora</Label>
                  <Input
                    id="hora"
                    type="time"
                    value={novoPost.hora_publicacao}
                    onChange={(e) => setNovoPost(prev => ({ ...prev, hora_publicacao: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>Tipo de Conteúdo</Label>
                <Select value={novoPost.tipo_conteudo} onValueChange={(value: any) => setNovoPost(prev => ({ ...prev, tipo_conteudo: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="foto">Foto</SelectItem>
                    <SelectItem value="video">Vídeo</SelectItem>
                    <SelectItem value="carrossel">Carrossel</SelectItem>
                    <SelectItem value="texto">Texto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Plataformas</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {plataformasDisponiveis.map((plataforma) => (
                    <Button
                      key={plataforma.id}
                      variant={novoPost.plataformas.includes(plataforma.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => togglePlataforma(plataforma.id)}
                      className="justify-start"
                    >
                      <plataforma.icon className="h-4 w-4 mr-2" />
                      {plataforma.nome}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleCreatePost} 
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Agendando...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar Post
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Posts Agendados */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Posts Agendados ({postsAgendados.length})</span>
                <Badge variant="outline">{postsAgendados.filter(p => p.status === 'agendado').length} pendentes</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {postsAgendados.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum post agendado</h3>
                    <p className="text-muted-foreground">
                      Crie seu primeiro agendamento usando o formulário ao lado.
                    </p>
                  </div>
                ) : (
                  postsAgendados.map((post) => (
                    <div key={post.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{post.titulo}</h4>
                            <Badge variant={getStatusColor(post.status) as any}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(post.status)}
                                {post.status}
                              </div>
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {post.conteudo}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(post.data_publicacao), 'dd/MM/yyyy', { locale: ptBR })}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {post.hora_publicacao}
                            </div>
                            {post.cliente_nome && (
                              <Badge variant="outline" className="text-xs">
                                {post.cliente_nome}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            {post.plataformas.map((plataformaId) => {
                              const plataforma = plataformasDisponiveis.find(p => p.id === plataformaId);
                              return plataforma ? (
                                <div key={plataformaId} className={`p-1 rounded ${plataforma.cor} text-white`}>
                                  <plataforma.icon className="h-3 w-3" />
                                </div>
                              ) : null;
                            })}
                          </div>

                          {post.hashtags && post.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {post.hashtags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => setSelectedPost(post)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Preview do Post</DialogTitle>
                              </DialogHeader>
                              <div className="p-4 border rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                                <h4 className="font-bold mb-2">{post.titulo}</h4>
                                <p className="text-sm mb-3">{post.conteudo}</p>
                                {post.hashtags && (
                                  <div className="text-xs opacity-80">
                                    {post.hashtags.join(' ')}
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status das Integrações */}
      <Card>
        <CardHeader>
          <CardTitle>Status das Integrações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {plataformasDisponiveis.map((plataforma) => (
              <div key={plataforma.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <plataforma.icon className="h-5 w-5" />
                  <span className="font-medium">{plataforma.nome}</span>
                </div>
                <Badge variant="default">Conectado</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}