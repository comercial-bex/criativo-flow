import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Eye } from "lucide-react";

interface PostsContentViewProps {
  posts: any[];
  onViewPost: (post: any) => void;
}

const PostsContentView: React.FC<PostsContentViewProps> = ({ posts, onViewPost }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {posts.map((post, index) => (
          <Card key={post.id} className="p-4">
            <div className="grid grid-cols-4 gap-4 items-start">
              {/* Coluna 1: Info do Post */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {post.tipo_criativo.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">
                    {post.formato_postagem}
                  </Badge>
                </div>
                <h4 className="font-medium text-sm">{post.titulo}</h4>
                <p className="text-xs text-muted-foreground">
                  📅 {new Date(post.data_postagem).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-xs text-muted-foreground">
                  👤 {post.persona_alvo}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onViewPost(post)}
                  className="w-full"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Ver Post
                </Button>
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

              {/* Coluna 4: Hashtags e CTA */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">ESTRATÉGIA</Label>
                <div className="space-y-2">
                  <div className="p-2 bg-blue-50 rounded text-xs">
                    <strong>CTA:</strong> {post.call_to_action}
                  </div>
                  <div className="p-2 bg-green-50 rounded">
                    <strong className="text-xs">Hashtags:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {post.hashtags?.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-xs bg-primary/10 text-primary px-1 py-0.5 rounded">
                          #{tag.replace('#', '')}
                        </span>
                      ))}
                      {post.hashtags?.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{post.hashtags.length - 3}</span>
                      )}
                    </div>
                  </div>
                  <div className="p-2 bg-purple-50 rounded text-xs">
                    <strong>HESEC:</strong> {post.componente_hesec}
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