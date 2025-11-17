import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VideoPlayer } from '@/components/ui/video-player';
import { ChevronLeft, ChevronRight, Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreativePreviewMockupProps {
  anexoUrl: string | null;
  anexosArray?: string[];
  clienteNome: string;
  clienteLogoUrl?: string;
  legenda?: string;
  redeSocial?: string;
}

export function CreativePreviewMockup({
  anexoUrl,
  anexosArray = [],
  clienteNome,
  clienteLogoUrl,
  legenda,
  redeSocial = 'instagram'
}: CreativePreviewMockupProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Combinar anexo_url com anexos_array
  const allImages = anexoUrl 
    ? [anexoUrl, ...anexosArray.filter(url => url !== anexoUrl)]
    : anexosArray;

  const isVideo = anexoUrl?.match(/\.(mp4|mov|avi|webm)$/i);
  const hasMultipleImages = allImages.length > 1 && !isVideo;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="flex items-center justify-center min-h-[600px]">
      {/* Phone Mockup */}
      <div className="relative w-[375px] h-[667px] bg-black rounded-[3rem] p-3 shadow-2xl border-8 border-gray-800">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-10" />
        
        {/* Screen Content */}
        <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
          {/* Instagram Header */}
          {redeSocial === 'instagram' && (
            <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 p-3 flex items-center gap-3 z-20">
              <Avatar className="h-8 w-8">
                <AvatarImage src={clienteLogoUrl} />
                <AvatarFallback>{clienteNome[0]}</AvatarFallback>
              </Avatar>
              <span className="font-semibold text-sm">{clienteNome}</span>
            </div>
          )}

          {/* Media Content */}
          <div className="w-full h-full pt-14 pb-20">
            {isVideo ? (
              <VideoPlayer src={anexoUrl!} className="w-full h-full" />
            ) : (
              <div className="relative w-full h-full">
                <img
                  src={allImages[currentImageIndex]}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                
                {/* Image Navigation */}
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={previousImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    
                    {/* Image Indicators */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {allImages.map((_, index) => (
                        <div
                          key={index}
                          className={cn(
                            "h-1 w-8 rounded-full transition-colors",
                            index === currentImageIndex ? "bg-white" : "bg-white/50"
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Instagram Actions */}
          {redeSocial === 'instagram' && (
            <div className="absolute bottom-0 left-0 right-0 bg-white p-3 space-y-2">
              <div className="flex items-center gap-4">
                <Heart className="h-6 w-6" />
                <MessageCircle className="h-6 w-6" />
                <Send className="h-6 w-6" />
                <Bookmark className="h-6 w-6 ml-auto" />
              </div>
              
              {legenda && (
                <div className="text-xs">
                  <span className="font-semibold">{clienteNome}</span>{' '}
                  <span className="line-clamp-2">{legenda}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
