import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface InstagramPreviewProps {
  post: any;
}

export function InstagramPreview({ post }: InstagramPreviewProps) {
  const getUsername = () => {
    // Extrair username do contexto ou usar placeholder
    return post.rede_social_username || 'seucliente';
  };

  const formatHashtags = (hashtags: string[]) => {
    if (!hashtags || hashtags.length === 0) return '';
    return hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ');
  };

  const getLegendaCompleta = () => {
    let texto = post.texto_estruturado || post.legenda || '';
    if (post.hashtags && post.hashtags.length > 0) {
      texto += '\n\n' + formatHashtags(post.hashtags);
    }
    if (post.call_to_action) {
      texto += '\n\n' + post.call_to_action;
    }
    return texto;
  };

  return (
    <div className="w-full h-full bg-background rounded-lg overflow-hidden shadow-xl border">
      {/* Header do Instagram */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 p-0.5">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
              <span className="text-xs font-bold">
                {getUsername().charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{getUsername()}</span>
            {post.data_postagem && (
              <span className="text-xs text-muted-foreground">
                {format(new Date(post.data_postagem), "dd 'de' MMM", { locale: ptBR })}
              </span>
            )}
          </div>
        </div>
        <MoreHorizontal className="h-5 w-5" />
      </div>

      {/* Imagem/Vídeo */}
      <div className="relative w-full aspect-square bg-muted/30">
        {post.arquivo_visual_url || post.anexo_url ? (
          post.tipo_criativo === 'video' ? (
            <div className="w-full h-full flex items-center justify-center bg-black">
              <video 
                src={post.arquivo_visual_url || post.anexo_url} 
                className="max-w-full max-h-full"
                controls
              />
            </div>
          ) : (
            <img
              src={post.arquivo_visual_url || post.anexo_url}
              alt={post.titulo}
              className="w-full h-full object-cover"
            />
          )
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
            <span className="text-4xl mb-2">📸</span>
            <span className="text-sm">Nenhuma imagem</span>
          </div>
        )}
        
        {/* Badge do tipo de criativo */}
        {post.formato_postagem && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/70 text-white text-xs font-medium">
            {post.formato_postagem === 'reels' && '🎥 Reels'}
            {post.formato_postagem === 'story' && '📱 Story'}
            {post.formato_postagem === 'carrossel' && '🎠 Carrossel'}
            {post.formato_postagem === 'post' && '📸 Post'}
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Heart className="h-6 w-6 cursor-pointer hover:text-red-500 transition-colors" />
            <MessageCircle className="h-6 w-6 cursor-pointer hover:text-primary transition-colors" />
            <Send className="h-6 w-6 cursor-pointer hover:text-primary transition-colors" />
          </div>
          <Bookmark className="h-6 w-6 cursor-pointer hover:text-primary transition-colors" />
        </div>

        {/* Likes simulados */}
        <div className="text-sm font-semibold">
          {Math.floor(Math.random() * 1000) + 100} curtidas
        </div>

        {/* Legenda */}
        <div className="text-sm">
          <span className="font-semibold mr-2">{getUsername()}</span>
          <span className="whitespace-pre-wrap">
            {getLegendaCompleta().substring(0, 150)}
            {getLegendaCompleta().length > 150 && (
              <span className="text-muted-foreground ml-1">... mais</span>
            )}
          </span>
        </div>

        {/* Objetivo visual */}
        {post.objetivo_postagem && (
          <div className="text-xs text-muted-foreground">
            🎯 {post.objetivo_postagem.replace('_', ' ')}
          </div>
        )}
      </div>
    </div>
  );
}
