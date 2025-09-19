import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface Post {
  id: string;
  titulo: string;
  descricao?: string;
  anexo_url?: string;
  formato_postagem: string;
  tipo_criativo: string;
  data_postagem: string;
  objetivo_postagem: string;
  planejamento_id: string;
  persona_utilizada?: string;
  componente_hesec?: string;
  framework_selecionado?: string;
  legenda?: string;
}

interface InstagramPreviewProps {
  post: Post;
}

export const InstagramPreview = ({ post }: InstagramPreviewProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  if (!post) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Selecione um post para visualizar</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short'
    });
  };

  const renderPostContent = () => {
    switch (post.tipo_criativo?.toLowerCase()) {
      case 'video':
      case 'stories':
        return (
          <div className="relative aspect-[9/16] bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center p-4">
                <Play className="h-12 w-12 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-medium">{post.titulo}</p>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between text-white">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-white hover:bg-white/20 p-2"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white hover:bg-white/20 p-2"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        );
      
      case 'carrossel':
        return (
          <div className="aspect-square bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center p-4">
                <div className="grid grid-cols-2 gap-1 h-8 w-8 mx-auto mb-2">
                  <div className="bg-white/60 rounded-sm"></div>
                  <div className="bg-white/40 rounded-sm"></div>
                  <div className="bg-white/40 rounded-sm"></div>
                  <div className="bg-white/60 rounded-sm"></div>
                </div>
                <p className="text-sm font-medium">{post.titulo}</p>
              </div>
            </div>
            <div className="absolute top-4 right-4 flex gap-1">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <div className="w-2 h-2 bg-white/50 rounded-full"></div>
              <div className="w-2 h-2 bg-white/50 rounded-full"></div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="aspect-square bg-gradient-to-br from-indigo-400 to-cyan-400 rounded-lg overflow-hidden">
            <div className="h-full flex items-center justify-center">
              <div className="text-white text-center p-4">
                <div className="w-8 h-8 border-2 border-white rounded mx-auto mb-2"></div>
                <p className="text-sm font-medium">{post.titulo}</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden border">
      {/* Header do Instagram */}
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">cliente_marca</p>
              <p className="text-xs text-muted-foreground">{formatDate(post.data_postagem)}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Conteúdo do Post */}
      <div className="p-0">
        {renderPostContent()}
      </div>

      {/* Ações do Instagram */}
      <div className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="p-0 h-auto">
              <Heart className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="sm" className="p-0 h-auto">
              <MessageCircle className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="sm" className="p-0 h-auto">
              <Send className="h-6 w-6" />
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="p-0 h-auto">
            <Bookmark className="h-6 w-6" />
          </Button>
        </div>

        {/* Legenda */}
        {post.legenda && (
          <div className="text-sm">
            <span className="font-semibold">cliente_marca</span>{' '}
            <span className="line-clamp-3">{post.legenda}</span>
          </div>
        )}

        {/* Objetivo/CTA */}
        {post.objetivo_postagem && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {post.objetivo_postagem}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};