import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, Filter, Calendar as CalendarIcon, Grid3X3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { InstagramPreview } from "@/components/InstagramPreview";
import { ClientSelector } from "@/components/ClientSelector";
import { useTutorial } from "@/hooks/useTutorial";
import { TutorialButton } from "@/components/TutorialButton";

interface Cliente {
  id: string;
  nome: string;
}

interface Post {
  id: string;
  titulo: string;
  data_postagem: string;
  tipo_criativo: string;
  formato_postagem: string;
  objetivo_postagem: string;
  anexo_url: string | null;
  legenda: string | null;
  planejamento_id: string;
  planejamentos: {
    clientes: Cliente;
  };
}

export default function GRSCalendarioEditorial() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCliente, setSelectedCliente] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"calendario" | "lista">("calendario");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const { startTutorial, hasSeenTutorial, isActive } = useTutorial('grs-calendario');

  useEffect(() => {
    fetchData();
  }, [selectedCliente, selectedMonth]);

  const fetchData = async () => {
    try {
      // Buscar posts do mês selecionado
      const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
      const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

      let postsQuery = supabase
        .from('posts_planejamento')
        .select(`
          id,
          titulo,
          data_postagem,
          tipo_criativo,
          formato_postagem,
          objetivo_postagem,
          anexo_url,
          legenda,
          planejamento_id,
          planejamentos (
            clientes (
              id,
              nome
            )
          )
        `)
        .gte('data_postagem', startOfMonth.toISOString().split('T')[0])
        .lte('data_postagem', endOfMonth.toISOString().split('T')[0])
        .order('data_postagem', { ascending: true });

      if (selectedCliente) {
        postsQuery = postsQuery.eq('planejamentos.cliente_id', selectedCliente);
      }

      const { data: postsData, error: postsError } = await postsQuery;
      if (postsError) throw postsError;

      setPosts(postsData || []);

      // Buscar clientes
      const { data: clientesData, error: clientesError } = await supabase
        .from('clientes')
        .select('id, nome')
        .order('nome');

      if (clientesError) throw clientesError;
      setClientes(clientesData || []);

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReschedulePost = async (postId: string, newDate: string) => {
    try {
      const { error } = await supabase
        .from('posts_planejamento')
        .update({ data_postagem: newDate })
        .eq('id', postId);

      if (error) throw error;
      
      // Refetch data to update the calendar
      await fetchData();
    } catch (error) {
      console.error('Erro ao reagendar post:', error);
    }
  };

  const getPostsByDate = (date: Date): Post[] => {
    const dateStr = date.toISOString().split('T')[0];
    return posts.filter(post => post.data_postagem === dateStr);
  };

  const getTipoCreativoColor = (tipo: string) => {
    switch (tipo) {
      case 'foto': return 'bg-blue-500';
      case 'video': return 'bg-red-500';
      case 'carrossel': return 'bg-purple-500';
      case 'stories': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Calendário Editorial</h1>
        </div>
        <div className="text-center py-8">Carregando calendário...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <CalendarIcon className="h-8 w-8 text-primary" />
            Calendário Editorial
          </h1>
          <p className="text-muted-foreground">Visualize todos os posts planejados</p>
        </div>
        
        <div className="flex items-center gap-2">
          <TutorialButton onStart={startTutorial} hasSeenTutorial={hasSeenTutorial} />
          <Button
            data-tour="view-calendario"
            variant={viewMode === "calendario" ? "default" : "outline"}
            onClick={() => setViewMode("calendario")}
            size="sm"
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendário
          </Button>
          <Button
            data-tour="view-lista"
            variant={viewMode === "lista" ? "default" : "outline"}
            onClick={() => setViewMode("lista")}
            size="sm"
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            Lista
          </Button>
        </div>
      </div>

      {/* Client Selector */}
      <ClientSelector 
        onClientSelect={setSelectedCliente}
        selectedClientId={selectedCliente}
      />

      {/* Filters */}
      <div className="flex gap-4 items-center">

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {posts.length} posts em {selectedMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Posts</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{posts.length}</div>
            <p className="text-xs text-muted-foreground">neste mês</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fotos</CardTitle>
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {posts.filter(p => p.tipo_criativo === 'foto').length}
            </div>
            <p className="text-xs text-muted-foreground">posts de foto</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vídeos</CardTitle>
            <div className="w-3 h-3 bg-red-500 rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {posts.filter(p => p.tipo_criativo === 'video').length}
            </div>
            <p className="text-xs text-muted-foreground">posts de vídeo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carrosséis</CardTitle>
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {posts.filter(p => p.tipo_criativo === 'carrossel').length}
            </div>
            <p className="text-xs text-muted-foreground">carrosséis</p>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      {viewMode === "calendario" ? (
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendário do Mês</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Implementação simplificada do calendário */}
              <div className="grid grid-cols-7 gap-2 text-center mb-4">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="font-medium text-sm p-2">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }, (_, i) => {
                  const day = i - new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay() + 1;
                  const isValidDay = day > 0 && day <= new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate();
                  const dayPosts = isValidDay ? getPostsByDate(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day)) : [];
                  
                  return (
                    <div key={i} className={`aspect-square p-1 border rounded ${isValidDay ? 'bg-background' : 'bg-muted'}`}>
                      {isValidDay && (
                        <div className="h-full flex flex-col">
                          <span className="text-xs font-medium">{day}</span>
                          <div className="flex-1 space-y-1">
                            {dayPosts.slice(0, 2).map(post => (
                              <div 
                                key={post.id} 
                                className={`text-xs p-1 rounded cursor-pointer ${getTipoCreativoColor(post.tipo_criativo)} text-white`}
                                onClick={() => setSelectedPost(post)}
                              >
                                {post.titulo.slice(0, 10)}...
                              </div>
                            ))}
                            {dayPosts.length > 2 && (
                              <div className="text-xs text-muted-foreground">+{dayPosts.length - 2}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <Badge className={`${getTipoCreativoColor(post.tipo_criativo)} text-white`}>
                      {post.tipo_criativo}
                    </Badge>
                    <div>
                      <h4 className="font-medium">{post.titulo}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{post.planejamentos.clientes.nome}</span>
                        <span>•</span>
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(post.data_postagem).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPost(post)}
                  >
                    Visualizar
                  </Button>
                </div>
              ))}
            </div>
            
            {posts.length === 0 && (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum post encontrado</h3>
                <p className="text-muted-foreground">
                  Não há posts programados para este período ou cliente.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instagram Preview Modal */}
      {selectedPost && (
        <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
          <DialogContent className="max-w-md">
            <InstagramPreview post={selectedPost} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}