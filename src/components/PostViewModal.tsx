import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Calendar, Eye, Edit3, Save, X, Users, Target, Hash, MessageCircle, CheckCircle } from "lucide-react";
import { Label } from "@/components/ui/label";

interface PostViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
  onApprove?: (post: any) => void;
  isApproving?: boolean;
}

export function PostViewModal({ isOpen, onClose, post, onApprove, isApproving }: PostViewModalProps) {
  if (!post) return null;

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
    if (tipo === 'video') return '🎬';
    if (tipo === 'carrossel') return '📸';
    if (tipo === 'post') return '🖼️';
    if (formato === 'reel') return '🎞️';
    if (formato === 'story' || formato === 'stories') return '📱';
    return '📝';
  };

  const getTipoDescription = (tipo: string) => {
    switch (tipo) {
      case 'video': return 'Vídeo/Reel';
      case 'carrossel': return 'Carrossel';
      case 'post': return 'Post Simples';
      default: return tipo;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'aprovado') {
      return (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
          ✅ Aprovado
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
        📝 Temporário
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl h-[95vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 sm:p-6 pb-0 flex-shrink-0">
          <DialogTitle className="flex items-center justify-between gap-2 text-sm sm:text-base">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getTipoIcon(post.tipo_criativo, post.formato_postagem)}</span>
              <span>Visualização do Post</span>
              {getStatusBadge(post.status)}
            </div>
            {post.status === 'temporario' && onApprove && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onApprove(post)}
                disabled={isApproving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isApproving ? (
                  <>
                    <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full mr-1" />
                    Aprovando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Aprovar
                  </>
                )}
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Informações do Post */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5 text-primary" />
                    Informações do Post
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Título</Label>
                    <h3 className="text-lg font-semibold mt-1">{post.titulo}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Data de Postagem</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(post.data_postagem).toLocaleDateString('pt-BR', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Objetivo</Label>
                      <Badge className={`mt-1 ${getObjetivoColor(post.objetivo_postagem)}`}>
                        {post.objetivo_postagem}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Tipo de Criativo</Label>
                      <p className="mt-1 flex items-center gap-2">
                        {getTipoIcon(post.tipo_criativo, post.formato_postagem)} {getTipoDescription(post.tipo_criativo)}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Formato</Label>
                      <p className="mt-1 capitalize">{post.formato_postagem}</p>
                    </div>
                  </div>

                  {post.persona_alvo && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Persona Alvo
                      </Label>
                      <p className="mt-1">{post.persona_alvo}</p>
                    </div>
                  )}

                  {post.componente_hesec && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Framework H.E.S.E.C</Label>
                      <p className="mt-1">{post.componente_hesec}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Preview do Instagram */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    📱 Preview do Instagram
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-1 rounded-xl max-w-sm mx-auto">
                    <div className="bg-white rounded-lg overflow-hidden">
                      {/* Header do Instagram */}
                      <div className="flex items-center justify-between p-3 border-b">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
                          <span className="font-semibold text-sm">sua_marca</span>
                        </div>
                        <div className="text-xl">⋯</div>
                      </div>

                      {/* Imagem/Conteúdo */}
                      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-6xl opacity-30">{getTipoIcon(post.tipo_criativo, post.formato_postagem)}</span>
                      </div>

                      {/* Ações */}
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-4">
                            <span className="text-xl">♡</span>
                            <span className="text-xl">💬</span>
                            <span className="text-xl">📤</span>
                          </div>
                          <span className="text-xl">🔖</span>
                        </div>

                        <p className="text-sm font-semibold mb-1">123 curtidas</p>
                        
                        <div className="text-sm">
                          <span className="font-semibold">sua_marca</span>
                          <span className="ml-1">{post.legenda?.slice(0, 100)}{post.legenda?.length > 100 ? '...' : ''}</span>
                        </div>

                        {post.hashtags && post.hashtags.length > 0 && (
                          <div className="mt-2 text-sm text-blue-700">
                            {post.hashtags.slice(0, 5).join(' ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Legenda Completa */}
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Legenda Completa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="whitespace-pre-wrap leading-relaxed">{post.legenda}</p>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          {post.call_to_action && (
            <Card className="mt-6">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  🎯 Call to Action
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="bg-orange-50 border border-orange-200 p-3 rounded-lg font-medium text-orange-800">
                  {post.call_to_action}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <Card className="mt-6">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-primary" />
                  Hashtags ({post.hashtags.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {post.hashtags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contexto Estratégico */}
          {post.contexto_estrategico && (
            <Card className="mt-6">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  🧠 Contexto Estratégico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-blue-800">
                  {post.contexto_estrategico}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Especificações Técnicas por Tipo */}
          {post.especificacoes_tecnicas && (
            <Card className="mt-6">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  📋 Especificações Técnicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {post.tipo_criativo === 'carrossel' && post.especificacoes_tecnicas.carrossel && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      <strong>Slides:</strong> {post.especificacoes_tecnicas.carrossel.num_slides}
                    </p>
                    <div className="grid gap-2">
                      <div>
                        <span className="text-xs font-medium text-blue-600">Slide 1 (Hook):</span>
                        <p className="text-sm bg-blue-50 p-2 rounded mt-1">{post.especificacoes_tecnicas.carrossel.slide_1}</p>
                      </div>
                      {post.especificacoes_tecnicas.carrossel.slides_meio?.map((slide, index) => (
                        <div key={index}>
                          <span className="text-xs font-medium text-green-600">Slide {index + 2}:</span>
                          <p className="text-sm bg-green-50 p-2 rounded mt-1">{slide}</p>
                        </div>
                      ))}
                      <div>
                        <span className="text-xs font-medium text-purple-600">Slide Final:</span>
                        <p className="text-sm bg-purple-50 p-2 rounded mt-1">{post.especificacoes_tecnicas.carrossel.slide_final}</p>
                      </div>
                    </div>
                  </div>
                )}

                {post.tipo_criativo === 'video' && post.especificacoes_tecnicas.video && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-red-600">Duração:</span>
                        <p className="text-sm">{post.especificacoes_tecnicas.video.duracao}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-orange-600">Som Sugerido:</span>
                        <p className="text-sm">{post.especificacoes_tecnicas.video.som_sugerido}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-yellow-600">Hook (0-3s):</span>
                      <p className="text-sm bg-yellow-50 p-2 rounded mt-1">{post.especificacoes_tecnicas.video.hook_inicial}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-green-600">Roteiro Completo:</span>
                      <p className="text-sm bg-green-50 p-2 rounded mt-1 whitespace-pre-line">{post.especificacoes_tecnicas.video.roteiro}</p>
                    </div>
                    {post.especificacoes_tecnicas.video.elementos_visuais && (
                      <div>
                        <span className="text-sm font-medium text-blue-600">Elementos Visuais:</span>
                        <ul className="text-sm list-disc list-inside mt-1">
                          {post.especificacoes_tecnicas.video.elementos_visuais.map((elemento, index) => (
                            <li key={index}>{elemento}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {post.tipo_criativo === 'post' && post.especificacoes_tecnicas.post && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-purple-600">Estilo Visual:</span>
                        <p className="text-sm">{post.especificacoes_tecnicas.post.estilo_visual}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-pink-600">Cores Sugeridas:</span>
                        <div className="flex gap-1 mt-1">
                          {post.especificacoes_tecnicas.post.cores_sugeridas?.map((cor, index) => (
                            <div key={index} className="w-6 h-6 rounded border" style={{backgroundColor: cor}} title={cor}></div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {post.especificacoes_tecnicas.post.elementos && (
                      <div>
                        <span className="text-sm font-medium text-indigo-600">Elementos:</span>
                        <ul className="text-sm list-disc list-inside mt-1">
                          {post.especificacoes_tecnicas.post.elementos.map((elemento, index) => (
                            <li key={index}>{elemento}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </ScrollArea>

        <div className="border-t p-4 flex justify-end">
          <Button onClick={onClose} variant="outline">
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}