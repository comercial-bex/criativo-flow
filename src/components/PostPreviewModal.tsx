import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Calendar, Eye, Edit3, Save, X, Users, Target, Hash, MessageCircle } from "lucide-react";

interface PostPreview {
  titulo: string;
  legenda: string;
  objetivo_postagem: string;
  tipo_criativo: string;
  formato_postagem: string;
  componente_hesec: string;
  persona_alvo: string;
  call_to_action: string;
  hashtags: string[];
  contexto_estrategico: string;
  data_postagem: string;
}

interface PostPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: PostPreview[];
  onSave: (posts: PostPreview[]) => void;
  onCancel: () => void;
  onApprovePost?: (post: PostPreview, index: number) => void;
}

export function PostPreviewModal({ isOpen, onClose, posts, onSave, onCancel, onApprovePost }: PostPreviewModalProps) {
  const [editedPosts, setEditedPosts] = useState<PostPreview[]>(posts);
  const [selectedPost, setSelectedPost] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [approvedPosts, setApprovedPosts] = useState<Set<number>>(new Set());
  const [savingPost, setSavingPost] = useState<number | null>(null);

  // Update editedPosts when posts prop changes
  React.useEffect(() => {
    setEditedPosts(posts);
    setSelectedPost(0); // Reset to first post when new posts are loaded
  }, [posts]);

  // Early return if no posts
  if (!posts || posts.length === 0) {
    return null;
  }

  // Ensure selectedPost is within bounds
  const safeSelectedPost = Math.max(0, Math.min(selectedPost, editedPosts.length - 1));
  const safeCurrentPost = editedPosts[safeSelectedPost];

  // Don't render if no valid post
  if (!safeCurrentPost) {
    return null;
  }

  const getObjetivoColor = (objetivo: string) => {
    const colors = {
      'Engajamento': 'bg-blue-500/10 text-blue-700 border-blue-300',
      'Vendas': 'bg-green-500/10 text-green-700 border-green-300',
      'Educação': 'bg-purple-500/10 text-purple-700 border-purple-300',
      'Relacionamento': 'bg-pink-500/10 text-pink-700 border-pink-300',
      'Branding': 'bg-orange-500/10 text-orange-700 border-orange-300'
    };
    return colors[objetivo as keyof typeof colors] || 'bg-gray-500/10 text-gray-700 border-gray-300';
  };

  const getTipoIcon = (tipo: string, formato: string) => {
    if (formato === 'reel') return '🎬';
    if (formato === 'stories') return '📱';
    if (tipo === 'carrossel') return '🖼️';
    return '📝';
  };

  const updatePost = (index: number, field: keyof PostPreview, value: any) => {
    const updated = [...editedPosts];
    updated[index] = { ...updated[index], [field]: value };
    setEditedPosts(updated);
  };

  const handleApprovePost = async (postIndex: number) => {
    if (!onApprovePost) return;
    
    setSavingPost(postIndex);
    try {
      await onApprovePost(editedPosts[postIndex], postIndex);
      setApprovedPosts(prev => new Set([...prev, postIndex]));
    } catch (error) {
      console.error('Erro ao aprovar post:', error);
    } finally {
      setSavingPost(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-7xl h-[95vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 sm:p-6 pb-0 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
            Preview do Conteúdo Editorial
            <Badge variant="outline" className="ml-2 text-xs">
              {editedPosts.length} posts gerados
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-0">
          {/* Lista de Posts */}
          <div className="w-full lg:w-1/3 lg:border-r bg-muted/30 flex flex-col max-h-[40vh] lg:max-h-none">
            <div className="p-3 sm:p-4 border-b flex-shrink-0">
              <h3 className="font-medium text-sm text-muted-foreground">Posts do Calendário</h3>
            </div>
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-2 space-y-2">
                {editedPosts.map((post, index) => (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedPost === index ? 'ring-2 ring-primary border-primary' : ''
                    }`}
                    onClick={() => setSelectedPost(index)}
                  >
                    <CardContent className="p-2 sm:p-3">
                         <div className="flex items-start gap-2">
                         <div className="flex flex-col items-center gap-1">
                           <span className="text-base sm:text-lg flex-shrink-0">{getTipoIcon(post.tipo_criativo, post.formato_postagem)}</span>
                           {approvedPosts.has(index) && (
                             <div className="w-2 h-2 bg-green-500 rounded-full" title="Post aprovado" />
                           )}
                         </div>
                         <div className="flex-1 min-w-0">
                           <h4 className="font-medium text-xs sm:text-sm truncate pr-1">{post.titulo}</h4>
                           <div className="flex items-center gap-1 mt-1">
                             <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                             <span className="text-xs text-muted-foreground">
                               {new Date(post.data_postagem).toLocaleDateString('pt-BR')}
                             </span>
                           </div>
                           <div className="flex items-center gap-1 mt-1">
                             <Users className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                             <span className="text-xs text-muted-foreground truncate">
                               {post.persona_alvo}
                             </span>
                           </div>
                         </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Preview/Edição do Post Selecionado */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-3 sm:p-4 border-b flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <h3 className="font-medium text-sm sm:text-base truncate">
                  Post {safeSelectedPost + 1}: {safeCurrentPost.titulo}
                </h3>
                <Badge className={`${getObjetivoColor(safeCurrentPost.objetivo_postagem)} text-xs flex-shrink-0`}>
                  {safeCurrentPost.objetivo_postagem}
                </Badge>
                {approvedPosts.has(safeSelectedPost) && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                    ✓ Aprovado
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {onApprovePost && !approvedPosts.has(safeSelectedPost) && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleApprovePost(safeSelectedPost)}
                    disabled={savingPost === safeSelectedPost}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {savingPost === safeSelectedPost ? (
                      <>
                        <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full mr-1" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-1" />
                        Aprovar
                      </>
                    )}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex-shrink-0"
                >
                  {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                  <span className="hidden sm:inline ml-1">
                    {isEditing ? 'Cancelar' : 'Editar'}
                  </span>
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 min-h-0">
              <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
                {isEditing ? (
                  // Modo de Edição
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <Label htmlFor="titulo" className="text-sm">Título</Label>
                      <Input
                        id="titulo"
                        value={safeCurrentPost.titulo}
                        onChange={(e) => updatePost(safeSelectedPost, 'titulo', e.target.value)}
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="legenda" className="text-sm">Legenda Completa</Label>
                      <Textarea
                        id="legenda"
                        value={safeCurrentPost.legenda}
                        onChange={(e) => updatePost(safeSelectedPost, 'legenda', e.target.value)}
                        rows={6}
                        className="resize-none text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label htmlFor="persona" className="text-sm">Persona Alvo</Label>
                        <Input
                          id="persona"
                          value={safeCurrentPost.persona_alvo}
                          onChange={(e) => updatePost(safeSelectedPost, 'persona_alvo', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="componente" className="text-sm">Componente H.E.S.E.C</Label>
                        <Input
                          id="componente"
                          value={safeCurrentPost.componente_hesec}
                          onChange={(e) => updatePost(safeSelectedPost, 'componente_hesec', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="cta" className="text-sm">Call to Action</Label>
                      <Input
                        id="cta"
                        value={safeCurrentPost.call_to_action}
                        onChange={(e) => updatePost(safeSelectedPost, 'call_to_action', e.target.value)}
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="hashtags" className="text-sm">Hashtags (separadas por vírgula)</Label>
                      <Input
                        id="hashtags"
                        value={safeCurrentPost.hashtags?.join(', ') || ''}
                        onChange={(e) => updatePost(safeSelectedPost, 'hashtags', e.target.value.split(', ').filter(tag => tag.trim()))}
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="contexto" className="text-sm">Contexto Estratégico</Label>
                      <Textarea
                        id="contexto"
                        value={safeCurrentPost.contexto_estrategico}
                        onChange={(e) => updatePost(safeSelectedPost, 'contexto_estrategico', e.target.value)}
                        rows={3}
                        className="text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  // Modo de Preview
                  <div className="space-y-4 sm:space-y-6">
                    {/* Informações Estratégicas */}
                    <Card>
                      <CardHeader className="pb-2 sm:pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Informações Estratégicas
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Persona:</span>
                            <p className="font-medium text-sm">{safeCurrentPost.persona_alvo}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Framework:</span>
                            <p className="font-medium text-sm">{safeCurrentPost.componente_hesec}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Tipo:</span>
                            <p className="font-medium capitalize text-sm">{safeCurrentPost.tipo_criativo}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Formato:</span>
                            <p className="font-medium capitalize text-sm">{safeCurrentPost.formato_postagem}</p>
                          </div>
                        </div>
                        <Separator />
                        <div>
                          <span className="text-muted-foreground text-sm">Contexto Estratégico:</span>
                          <p className="text-sm mt-1 leading-relaxed">{safeCurrentPost.contexto_estrategico}</p>
                        </div>
                      </CardContent>
                    </Card>

                  {/* Imagem Gerada */}
                  {(safeCurrentPost as any).anexo_url && (
                    <Card>
                      <CardHeader className="pb-2 sm:pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          🖼️ Imagem Gerada pelo DALL-E
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className={`relative overflow-hidden rounded-lg ${
                          safeCurrentPost.formato_postagem === 'story' || safeCurrentPost.formato_postagem === 'reel' 
                            ? 'aspect-[9/16] max-w-xs mx-auto' 
                            : 'aspect-square max-w-md mx-auto'
                        }`}>
                          <img 
                            src={(safeCurrentPost as any).anexo_url} 
                            alt={safeCurrentPost.titulo}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Preview do Post */}
                  <Card>
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Preview da Postagem
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gradient-to-b from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg p-3 sm:p-4">
                        <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 leading-tight">{safeCurrentPost.titulo}</h3>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed mb-3 sm:mb-4">
                          {safeCurrentPost.legenda}
                        </div>
                        
                        {safeCurrentPost.call_to_action && (
                          <div className="bg-primary/10 rounded-lg p-2 sm:p-3 mb-2 sm:mb-3">
                            <p className="text-sm font-medium text-primary">
                              👆 {safeCurrentPost.call_to_action}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-1">
                          {(safeCurrentPost.hashtags || []).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              <Hash className="h-3 w-3 mr-1" />
                              {tag.replace('#', '')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="p-3 sm:p-6 border-t flex items-center justify-between flex-shrink-0 bg-background">
          <div className="text-xs sm:text-sm text-muted-foreground">
            {safeSelectedPost + 1} de {editedPosts.length} posts gerados
            {approvedPosts.size > 0 && (
              <span className="text-green-600 ml-2">
                ({approvedPosts.size} aprovados)
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} size="sm">
              <span className="hidden sm:inline">Cancelar</span>
              <span className="sm:hidden">✕</span>
            </Button>
            {!onApprovePost && (
              <Button onClick={() => onSave(editedPosts)} className="gap-2 bg-primary hover:bg-primary/90" size="sm">
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">Aprovar e Salvar Posts</span>
                <span className="sm:hidden">Aprovar</span>
              </Button>
            )}
            {onApprovePost && approvedPosts.size === editedPosts.length && (
              <Button 
                onClick={onClose} 
                className="gap-2 bg-green-600 hover:bg-green-700 text-white" 
                size="sm"
              >
                <span className="hidden sm:inline">Todos Aprovados - Fechar</span>
                <span className="sm:hidden">Fechar</span>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}