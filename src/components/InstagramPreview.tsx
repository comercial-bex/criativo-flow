import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
}

interface InstagramPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
}

export const InstagramPreview = ({ isOpen, onClose, post }: InstagramPreviewProps) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  if (!post) return null;

  const isVertical = post.formato_postagem === 'story' || post.formato_postagem === 'reel';
  const isCarousel = post.formato_postagem === 'carrossel';
  const isReel = post.formato_postagem === 'reel';
  const isStory = post.formato_postagem === 'story';

  // Simular múltiplas imagens para carrossel
  const carouselImages = isCarousel ? [post.anexo_url, post.anexo_url, post.anexo_url] : [post.anexo_url];

  const nextSlide = () => {
    if (isCarousel) {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }
  };

  const prevSlide = () => {
    if (isCarousel) {
      setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`p-0 ${isVertical ? 'max-w-md' : 'max-w-2xl'} bg-background border-none`}>
        <div className={`bg-background rounded-lg overflow-hidden ${isStory ? 'bg-black' : ''}`}>
          {/* Header - apenas para posts normais e carrosséis */}
          {!isStory && (
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">seu_perfil</p>
                  <p className="text-xs text-muted-foreground">Brasil</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Story Header */}
          {isStory && (
            <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8 ring-2 ring-white">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span className="text-white font-semibold text-sm">seu_perfil</span>
                <span className="text-white/70 text-xs">agora</span>
              </div>
              <Button variant="ghost" size="sm" className="text-white">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Conteúdo Principal */}
          <div className={`relative ${isVertical ? 'aspect-[9/16]' : 'aspect-square'} bg-black`}>
            {/* Barra de progresso para stories */}
            {isStory && (
              <div className="absolute top-2 left-4 right-4 z-10">
                <div className="w-full h-0.5 bg-white/30 rounded-full">
                  <div className="h-full bg-white rounded-full w-1/3"></div>
                </div>
              </div>
            )}

            {/* Carrossel */}
            {isCarousel && (
              <>
                <div className="absolute top-2 right-2 z-10">
                  <div className="bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                    {currentSlide + 1}/{carouselImages.length}
                  </div>
                </div>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10 flex gap-1">
                  {carouselImages.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentSlide ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center"
                >
                  ‹
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center"
                >
                  ›
                </button>
              </>
            )}

            {/* Controles de Reel */}
            {isReel && (
              <>
                <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white bg-black/20 rounded-full w-12 h-12"
                    onClick={() => setLiked(!liked)}
                  >
                    <Heart className={`w-6 h-6 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white bg-black/20 rounded-full w-12 h-12"
                  >
                    <MessageCircle className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white bg-black/20 rounded-full w-12 h-12"
                  >
                    <Send className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white bg-black/20 rounded-full w-12 h-12"
                    onClick={() => setSaved(!saved)}
                  >
                    <Bookmark className={`w-6 h-6 ${saved ? 'fill-white' : ''}`} />
                  </Button>
                </div>

                {/* Controles de Play/Pause e Som */}
                <div className="absolute bottom-4 left-4 z-10 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white bg-black/20 rounded-full w-10 h-10"
                    onClick={togglePlay}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white bg-black/20 rounded-full w-10 h-10"
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>
                </div>

                {/* Informações do Reel */}
                <div className="absolute bottom-16 left-4 right-20 z-10 text-white">
                  <p className="font-semibold text-sm mb-1">@seu_perfil</p>
                  <p className="text-sm mb-2">{post.titulo}</p>
                  <p className="text-xs opacity-80">{post.descricao}</p>
                </div>
              </>
            )}

            {/* Imagem/Vídeo */}
            <img
              src={carouselImages[currentSlide]}
              alt={post.titulo}
              className="w-full h-full object-cover"
            />

            {/* Overlay de play para reels quando pausado */}
            {isReel && !isPlaying && (
              <div 
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                onClick={togglePlay}
              >
                <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
            )}
          </div>

          {/* Footer para posts normais e carrosséis */}
          {!isStory && !isReel && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0"
                    onClick={() => setLiked(!liked)}
                  >
                    <Heart className={`w-6 h-6 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-0">
                    <MessageCircle className="w-6 h-6" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-0">
                    <Send className="w-6 h-6" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0"
                  onClick={() => setSaved(!saved)}
                >
                  <Bookmark className={`w-6 h-6 ${saved ? 'fill-current' : ''}`} />
                </Button>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold">128 curtidas</p>
                <div className="text-sm">
                  <span className="font-semibold">seu_perfil </span>
                  <span>{post.titulo}</span>
                </div>
                <p className="text-sm text-muted-foreground">{post.descricao}</p>
                <p className="text-xs text-muted-foreground uppercase">
                  {new Date(post.data_postagem).toLocaleDateString('pt-BR')}
                </p>
              </div>

              {/* Informações Estratégicas */}
              <div className="mt-4 p-3 bg-muted/50 rounded-lg space-y-3">
                <h4 className="text-sm font-semibold text-primary">Estratégia do Post</h4>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-medium text-secondary">Objetivo:</span>
                    <p className="text-muted-foreground mt-1">{post.objetivo_postagem}</p>
                  </div>
                  
                  {post.persona_utilizada && (
                    <div>
                      <span className="font-medium text-accent">Persona:</span>
                      <p className="text-muted-foreground mt-1">{post.persona_utilizada}</p>
                    </div>
                  )}
                  
                  {post.componente_hesec && (
                    <div>
                      <span className="font-medium text-primary">H.E.S.E.C:</span>
                      <p className="text-muted-foreground mt-1">{post.componente_hesec}</p>
                    </div>
                  )}
                  
                  {post.framework_selecionado && (
                    <div>
                      <span className="font-medium text-secondary">Framework:</span>
                      <p className="text-muted-foreground mt-1">{post.framework_selecionado}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <Badge variant="secondary" className="text-xs">
                  {post.formato_postagem}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {post.tipo_criativo}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};