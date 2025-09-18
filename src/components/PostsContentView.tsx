import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Eye, Film, Image, RotateCcw, Hash, Target, Lightbulb } from "lucide-react";

interface PostsContentViewProps {
  posts: any[];
  onViewPost: (post: any) => void;
}

const PostsContentView: React.FC<PostsContentViewProps> = ({ posts, onViewPost }) => {
  const getTipoIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'video':
        return <Film className="h-4 w-4 text-red-600" />;
      case 'carrossel':
        return <RotateCcw className="h-4 w-4 text-blue-600" />;
      case 'post':
        return <Image className="h-4 w-4 text-green-600" />;
      default:
        return <Image className="h-4 w-4" />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'video':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'carrossel':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'post':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {posts.map((post, index) => (
          <Card key={post.id} className="p-6 shadow-lg border-l-4 border-l-primary hover:shadow-xl transition-all duration-200">
            {/* Header do Post com Numeração e Tipo */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b">
              <div className="flex items-center gap-3">
                <div className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex items-center gap-2">
                  {getTipoIcon(post.tipo_criativo)}
                  <Badge className={`${getTipoColor(post.tipo_criativo)} font-medium px-3 py-1`}>
                    {post.tipo_criativo.toUpperCase()}
                  </Badge>
                </div>
                <Badge variant="outline" className="px-2 py-1">
                  {post.formato_postagem}
                </Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onViewPost(post)}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                Ver Detalhes
              </Button>
            </div>

            {/* Grid de Conteúdo */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-end">
              {/* Coluna 1: Info do Post */}
              <div className="space-y-3">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-base mb-2 text-foreground">{post.titulo}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>📅</span>
                      <span>{new Date(post.data_postagem).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>👤</span>
                      <span>{post.persona_alvo}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna 2: Headline */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">HEADLINE</Label>
                <div className="p-3 bg-muted/50 rounded border min-h-[80px]">
                  {post.headline ? (
                    <p className="text-sm">{post.headline}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      Clique em "Gerar Headlines e Conteúdo" para gerar
                    </p>
                  )}
                </div>
              </div>

              {/* Coluna 3: Conteúdo */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {post.tipo_criativo === 'video' ? 'ROTEIRO' : 'CONTEÚDO'}
                </Label>
                <div className="p-3 bg-muted/50 rounded border min-h-[80px] max-h-[200px] overflow-y-auto">
                  {post.conteudo_completo ? (
                    <div className="text-sm whitespace-pre-wrap">
                      {post.conteudo_completo}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      Clique em "Gerar Headlines e Conteúdo" para gerar
                    </p>
                  )}
                </div>
              </div>

              {/* Coluna 4: Estratégia Reorganizada */}
              <div className="space-y-3">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  ESTRATÉGIA
                </Label>
                <div className="space-y-3">
                  {/* CTA Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-3 w-3 text-blue-600" />
                      <strong className="text-xs text-blue-800">CALL TO ACTION</strong>
                    </div>
                    <p className="text-xs text-blue-700 font-medium">{post.call_to_action}</p>
                  </div>

                  {/* Hashtags Card */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Hash className="h-3 w-3 text-green-600" />
                      <strong className="text-xs text-green-800">HASHTAGS</strong>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {post.hashtags?.slice(0, 4).map((tag, i) => (
                        <span key={i} className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-medium">
                          #{tag.replace('#', '')}
                        </span>
                      ))}
                      {post.hashtags?.length > 4 && (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                          +{post.hashtags.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* HESEC Card */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-3 w-3 text-purple-600" />
                      <strong className="text-xs text-purple-800">HESEC</strong>
                    </div>
                    <p className="text-xs text-purple-700 font-medium">{post.componente_hesec}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PostsContentView;