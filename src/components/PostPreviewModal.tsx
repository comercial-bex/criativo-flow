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
}

export function PostPreviewModal({ isOpen, onClose, posts, onSave, onCancel }: PostPreviewModalProps) {
  const [editedPosts, setEditedPosts] = useState<PostPreview[]>(posts);
  const [selectedPost, setSelectedPost] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Preview do Conteúdo Editorial
            <Badge variant="outline" className="ml-2">
              {editedPosts.length} posts gerados
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Lista de Posts */}
          <div className="w-1/3 border-r bg-muted/30">
            <div className="p-4 border-b">
              <h3 className="font-medium text-sm text-muted-foreground">Posts do Calendário</h3>
            </div>
            <ScrollArea className="h-[60vh]">
              <div className="p-2 space-y-2">
                {editedPosts.map((post, index) => (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedPost === index ? 'ring-2 ring-primary border-primary' : ''
                    }`}
                    onClick={() => setSelectedPost(index)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{getTipoIcon(post.tipo_criativo, post.formato_postagem)}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{post.titulo}</h4>
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {new Date(post.data_postagem).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
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
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">
                  Post {safeSelectedPost + 1}: {safeCurrentPost.titulo}
                </h3>
                <Badge className={getObjetivoColor(safeCurrentPost.objetivo_postagem)}>
                  {safeCurrentPost.objetivo_postagem}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                {isEditing ? 'Cancelar' : 'Editar'}
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                {isEditing ? (
                  // Modo de Edição
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="titulo">Título</Label>
                      <Input
                        id="titulo"
                        value={safeCurrentPost.titulo}
                        onChange={(e) => updatePost(safeSelectedPost, 'titulo', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="legenda">Legenda Completa</Label>
                      <Textarea
                        id="legenda"
                        value={safeCurrentPost.legenda}
                        onChange={(e) => updatePost(safeSelectedPost, 'legenda', e.target.value)}
                        rows={8}
                        className="resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="persona">Persona Alvo</Label>
                        <Input
                          id="persona"
                          value={safeCurrentPost.persona_alvo}
                          onChange={(e) => updatePost(safeSelectedPost, 'persona_alvo', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="componente">Componente H.E.S.E.C</Label>
                        <Input
                          id="componente"
                          value={safeCurrentPost.componente_hesec}
                          onChange={(e) => updatePost(safeSelectedPost, 'componente_hesec', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="cta">Call to Action</Label>
                      <Input
                        id="cta"
                        value={safeCurrentPost.call_to_action}
                        onChange={(e) => updatePost(safeSelectedPost, 'call_to_action', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="hashtags">Hashtags (separadas por vírgula)</Label>
                      <Input
                        id="hashtags"
                        value={safeCurrentPost.hashtags?.join(', ') || ''}
                        onChange={(e) => updatePost(safeSelectedPost, 'hashtags', e.target.value.split(', ').filter(tag => tag.trim()))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="contexto">Contexto Estratégico</Label>
                      <Textarea
                        id="contexto"
                        value={safeCurrentPost.contexto_estrategico}
                        onChange={(e) => updatePost(safeSelectedPost, 'contexto_estrategico', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                ) : (
                  // Modo de Preview
                  <div className="space-y-6">
                    {/* Informações Estratégicas */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Informações Estratégicas
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Persona:</span>
                            <p className="font-medium">{safeCurrentPost.persona_alvo}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Framework:</span>
                            <p className="font-medium">{safeCurrentPost.componente_hesec}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Tipo:</span>
                            <p className="font-medium capitalize">{safeCurrentPost.tipo_criativo}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Formato:</span>
                            <p className="font-medium capitalize">{safeCurrentPost.formato_postagem}</p>
                          </div>
                        </div>
                        <Separator />
                        <div>
                          <span className="text-muted-foreground text-sm">Contexto Estratégico:</span>
                          <p className="text-sm mt-1">{safeCurrentPost.contexto_estrategico}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Preview do Post */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          Preview da Postagem
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gradient-to-b from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg p-4">
                          <h3 className="font-bold text-lg mb-3">{safeCurrentPost.titulo}</h3>
                          <div className="whitespace-pre-wrap text-sm leading-relaxed mb-4">
                            {safeCurrentPost.legenda}
                          </div>
                          
                          {safeCurrentPost.call_to_action && (
                            <div className="bg-primary/10 rounded-lg p-3 mb-3">
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
        <div className="p-6 border-t flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {safeSelectedPost + 1} de {editedPosts.length} posts
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button onClick={() => onSave(editedPosts)} className="gap-2">
              <Save className="h-4 w-4" />
              Salvar Calendário
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}