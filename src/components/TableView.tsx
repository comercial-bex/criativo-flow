import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { Eye, Calendar, Users, Target, Hash } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Post {
  id: string;
  titulo: string;
  legenda?: string;
  data_postagem: string;
  tipo_criativo: string;
  formato_postagem: string;
  objetivo_postagem: string;
  persona_alvo?: string;
  call_to_action?: string;
  hashtags?: string[];
  anexo_url?: string;
}

interface TableViewProps {
  posts: Post[];
  onPostClick: (post: Post) => void;
}

export function TableView({ posts, onPostClick }: TableViewProps) {
  const getFormatIcon = (formato: string) => {
    switch (formato) {
      case 'post': return '📱';
      case 'story': return '📸';
      case 'reel': return '🎬';
      case 'carrossel': return '🎠';
      default: return '📱';
    }
  };

  const getFormatColor = (formato: string) => {
    switch (formato) {
      case 'post': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'story': return 'bg-purple-500/10 text-purple-600 border-purple-200';
      case 'reel': return 'bg-pink-500/10 text-pink-600 border-pink-200';
      case 'carrossel': return 'bg-orange-500/10 text-orange-600 border-orange-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getObjetivoColor = (objetivo: string) => {
    const colors = {
      'engajamento': 'bg-blue-500/10 text-blue-700 border-blue-300',
      'vendas': 'bg-green-500/10 text-green-700 border-green-300',
      'educacao': 'bg-purple-500/10 text-purple-700 border-purple-300',
      'relacionamento': 'bg-pink-500/10 text-pink-700 border-pink-300',
      'branding': 'bg-orange-500/10 text-orange-700 border-orange-300'
    };
    return colors[objetivo?.toLowerCase() as keyof typeof colors] || 'bg-gray-500/10 text-gray-700 border-gray-300';
  };

  const columns = [
    {
      key: 'imagem',
      label: 'Imagem',
      render: (post: Post) => (
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
          {post.anexo_url ? (
            <img 
              src={post.anexo_url} 
              alt={post.titulo}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              {getFormatIcon(post.formato_postagem)}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'titulo',
      label: 'Título',
      render: (post: Post) => (
        <div className="space-y-1">
          <p className="font-medium text-sm leading-tight">{post.titulo}</p>
          {post.legenda && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {post.legenda.length > 80 ? post.legenda.substring(0, 80) + '...' : post.legenda}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'data_postagem',
      label: 'Data',
      render: (post: Post) => (
        <div className="flex items-center gap-1 text-sm">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          {format(new Date(post.data_postagem), "dd/MM/yyyy", { locale: ptBR })}
        </div>
      )
    },
    {
      key: 'formato_postagem',
      label: 'Formato',
      render: (post: Post) => (
        <Badge className={`${getFormatColor(post.formato_postagem)} text-xs`}>
          {getFormatIcon(post.formato_postagem)} {post.formato_postagem.toUpperCase()}
        </Badge>
      )
    },
    {
      key: 'objetivo_postagem',
      label: 'Objetivo',
      render: (post: Post) => (
        <Badge className={`${getObjetivoColor(post.objetivo_postagem)} text-xs`}>
          <Target className="h-3 w-3 mr-1" />
          {post.objetivo_postagem?.replace('_', ' ') || 'N/A'}
        </Badge>
      )
    },
    {
      key: 'persona_alvo',
      label: 'Persona',
      render: (post: Post) => (
        <div className="flex items-center gap-1 text-xs">
          <Users className="h-3 w-3 text-muted-foreground" />
          <span className="truncate max-w-24" title={post.persona_alvo}>
            {post.persona_alvo || 'N/A'}
          </span>
        </div>
      )
    },
    {
      key: 'call_to_action',
      label: 'CTA',
      render: (post: Post) => (
        <span className="text-xs text-muted-foreground truncate max-w-32" title={post.call_to_action}>
          {post.call_to_action || '-'}
        </span>
      )
    },
    {
      key: 'hashtags',
      label: 'Hashtags',
      render: (post: Post) => (
        <div className="flex items-center gap-1">
          {post.hashtags && post.hashtags.length > 0 ? (
            <>
              <Hash className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs">
                {post.hashtags.length > 2 ? `${post.hashtags.length} tags` : post.hashtags.slice(0, 2).join(', ')}
              </span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          )}
        </div>
      )
    },
    {
      key: 'acoes',
      label: 'Ações',
      render: (post: Post) => (
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-8 w-8 p-0"
          onClick={() => onPostClick(post)}
          title="Visualizar post completo"
        >
          <Eye className="h-3 w-3" />
        </Button>
      )
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 Visualização em Tabela
          <Badge variant="outline" className="ml-2">
            {posts.length} posts
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          title=""
          columns={columns}
          data={posts}
          searchable={false}
          emptyMessage="Nenhum post encontrado"
        />
      </CardContent>
    </Card>
  );
}