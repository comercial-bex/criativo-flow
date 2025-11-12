import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { InstagramPreview } from './InstagramPreview';
import { PostPreviewModal } from './PostPreviewModal';
import { PostViewModal } from './PostViewModal';
import { toast } from '@/lib/toast-compat';
import { 
  Calendar, 
  Hash, 
  Target, 
  User, 
  Eye, 
  Edit, 
  Trash2,
  Clock,
  MessageSquare,
  MousePointer,
  UserCheck
} from 'lucide-react';

interface PostsContentViewProps {
  planejamentoId: string;
  isTemp?: boolean;
}

export function PostsContentView({ planejamentoId, isTemp = false }: PostsContentViewProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [responsaveis, setResponsaveis] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchPosts();
  }, [planejamentoId, isTemp]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from(isTemp ? 'posts_gerados_temp' : 'posts_planejamento')
        .select('*')
        .eq('planejamento_id', planejamentoId)
        .order('data_postagem', { ascending: true });

      if (error) {
        console.error('Erro ao buscar posts:', error);
        toast.error('Erro ao carregar posts');
        return;
      }

      setPosts(data || []);
      
      // Buscar dados dos responsáveis
      const responsaveisIds = [...new Set(data?.map(post => post.responsavel_id).filter(Boolean))];
      if (responsaveisIds.length > 0) {
        const { data: profiles } = await supabase
          .from('pessoas')
          .select('id, nome, avatar_url')
          .in('id', responsaveisIds);
        
        const responsaveisMap = profiles?.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, any>) || {};
        
        setResponsaveis(responsaveisMap);
      }
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      toast.error('Erro ao carregar posts');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPost = (post: any) => {
    setSelectedPost(post);
    setIsViewModalOpen(true);
  };

  const handleEditPost = (post: any) => {
    setSelectedPost(post);
    setIsEditModalOpen(true);
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;

    try {
      const { error } = await supabase
        .from(isTemp ? 'posts_gerados_temp' : 'posts_planejamento')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast.success('Post excluído com sucesso!');
      fetchPosts();
    } catch (error) {
      console.error('Erro ao excluir post:', error);
      toast.error('Erro ao excluir post');
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'video':
      case 'stories':
        return <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/20">
          <MessageSquare className="h-4 w-4 text-red-600 dark:text-red-400" />
        </div>;
      case 'carrossel':
        return <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
          <div className="h-4 w-4 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-[1px] w-3 h-3">
              <div className="bg-current rounded-[1px]"></div>
              <div className="bg-current rounded-[1px]"></div>
              <div className="bg-current rounded-[1px]"></div>
              <div className="bg-current rounded-[1px]"></div>
            </div>
          </div>
        </div>;
      case 'post':
        return <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
          <div className="h-4 w-4 border-2 border-green-600 dark:border-green-400 rounded"></div>
        </div>;
      default:
        return <div className="p-2 rounded-full bg-muted">
          <div className="h-4 w-4 border-2 border-muted-foreground rounded"></div>
        </div>;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'video':
      case 'stories':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/10 dark:text-red-300 dark:border-red-800';
      case 'carrossel':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/10 dark:text-blue-300 dark:border-blue-800';
      case 'post':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/10 dark:text-green-300 dark:border-green-800';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Nenhum post encontrado</h3>
          <p className="text-sm text-muted-foreground">
            {isTemp 
              ? 'Não há posts temporários para este planejamento.'
              : 'Não há posts salvos para este planejamento.'
            }
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {posts.map((post, index) => (
          <Card key={post.id} className="overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-0">
              <div className="flex">
                {/* Preview/Instagram Mock */}
                <div className="w-80 bg-gradient-to-br from-muted/30 to-muted/10 p-6 flex items-center justify-center border-r">
                  <InstagramPreview 
                    post={post}
                  />
                </div>

                {/* Conteúdo Principal */}
                <div className="flex-1 p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg leading-tight">{post.titulo}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {formatDate(post.data_postagem)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getTipoIcon(post.tipo_criativo)}
                      <Badge className={`${getTipoColor(post.tipo_criativo)} font-medium`}>
                        {post.tipo_criativo.charAt(0).toUpperCase() + post.tipo_criativo.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="space-y-4">
                    {/* Headline */}
                    {post.headline && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Headline</Label>
                        <p className="text-sm mt-1 leading-relaxed font-medium">{post.headline}</p>
                      </div>
                    )}

                     {/* Conteúdo Completo Diferenciado */}
                    {(post.conteudo_completo || post.legenda) && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          {(post.formato_postagem === 'Reels' || post.tipo_criativo === 'Vídeo' || post.tipo_criativo === 'video') ? 'Roteiro Técnico' : 'Conteúdo'}
                        </Label>
                        <div className={`text-sm mt-1 leading-relaxed ${
                          (post.formato_postagem === 'Reels' || post.tipo_criativo === 'Vídeo' || post.tipo_criativo === 'video')
                            ? 'bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-200 dark:border-red-800' 
                            : 'bg-muted/30 p-3 rounded-lg border'
                        }`}>
                          {(post.formato_postagem === 'Reels' || post.tipo_criativo === 'Vídeo' || post.tipo_criativo === 'video') ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="p-1 rounded-full bg-red-100 dark:bg-red-900/20">
                                  <MessageSquare className="h-3 w-3 text-red-600 dark:text-red-400" />
                                </div>
                                <span className="text-xs font-medium text-red-700 dark:text-red-300">
                                  ROTEIRO TÉCNICO
                                </span>
                              </div>
                              <pre className="whitespace-pre-wrap text-xs font-mono">{post.conteudo_completo || post.legenda}</pre>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap">{post.conteudo_completo || post.legenda}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Legenda */}
                    {post.legenda && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Legenda</Label>
                        <p className="text-sm mt-1 leading-relaxed line-clamp-3">{post.legenda}</p>
                      </div>
                    )}

                    {/* Objetivo */}
                    {post.objetivo_postagem && (
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="font-medium">Objetivo:</span> {post.objetivo_postagem}
                        </span>
                      </div>
                    )}

                    {/* Persona */}
                    {post.persona_alvo && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="font-medium">Persona:</span> {post.persona_alvo}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Strategy Cards Section */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t mt-4">
                    {/* Responsável Card */}
                    {post.responsavel_id && responsaveis[post.responsavel_id] && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <UserCheck className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Responsável:</span>
                        <span className="text-sm text-orange-600 dark:text-orange-400">
                          {responsaveis[post.responsavel_id].nome}
                        </span>
                      </div>
                    )}

                    {/* CTA Card */}
                    {post.call_to_action && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <MousePointer className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">CTA:</span>
                        <span className="text-sm text-blue-600 dark:text-blue-400">{post.call_to_action}</span>
                      </div>
                    )}

                    {/* Hashtags Card */}
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <Hash className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">Tags:</span>
                        <span className="text-sm text-green-600 dark:text-green-400">
                          {post.hashtags.slice(0, 2).join(' ')}
                          {post.hashtags.length > 2 && ` +${post.hashtags.length - 2}`}
                        </span>
                      </div>
                    )}

                    {/* HESEC Card */}
                    {post.componente_hesec && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm text-purple-600 dark:text-purple-400">{post.componente_hesec}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-4 border-t mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewPost(post)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPost(post)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePost(post.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modals */}
      {selectedPost && (
        <>
          <PostViewModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            post={selectedPost}
          />
          <PostPreviewModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onCancel={() => setIsEditModalOpen(false)}
            posts={selectedPost ? [selectedPost] : []}
            onSave={(updatedPosts) => {
              setIsEditModalOpen(false);
              fetchPosts();
            }}
          />
        </>
      )}
    </>
  );
}