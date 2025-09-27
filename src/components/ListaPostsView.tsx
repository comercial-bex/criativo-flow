import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Eye, CheckCircle } from 'lucide-react';

interface Post {
  id: string;
  titulo: string;
  data_postagem: string;
  formato_postagem: string;
  objetivo_postagem: string;
  tipo_criativo: string;
  status?: string;
  responsavel_id?: string;
}

interface ListaPostsViewProps {
  posts: Post[];
  onPreviewPost?: (post: Post) => void;
  onApprovePost?: (post: Post) => void;
}

export function ListaPostsView({ posts, onPreviewPost, onApprovePost }: ListaPostsViewProps) {
  const getFormatIcon = (formato: string) => {
    switch (formato) {
      case 'post': return '📝';
      case 'stories': return '📱';
      case 'reels': return '🎬';
      case 'carousel': return '📸';
      default: return '📝';
    }
  };

  const getFormatColor = (formato: string) => {
    switch (formato) {
      case 'post': return 'bg-blue-100 text-blue-800';
      case 'stories': return 'bg-purple-100 text-purple-800';
      case 'reels': return 'bg-green-100 text-green-800';
      case 'carousel': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {posts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum post encontrado
        </div>
      ) : (
        posts.map((post) => (
          <Card key={post.id} className="transition-all hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getFormatIcon(post.formato_postagem)}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-1" title={post.titulo}>
                        {post.titulo}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={`text-xs ${getFormatColor(post.formato_postagem)}`}>
                          {post.formato_postagem}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(post.data_postagem)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Objetivo:</span> {post.objetivo_postagem}
                  </div>
                  
                  {post.tipo_criativo && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Criativo:</span> {post.tipo_criativo}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {onPreviewPost && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPreviewPost(post)}
                      className="h-8 px-3"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                  )}
                  
                  {onApprovePost && post.status === 'temporario' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onApprovePost(post)}
                      className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Aprovar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}