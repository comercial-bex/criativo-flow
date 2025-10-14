import { useEffect, useRef, useState } from 'react';
import { imageOptimizer } from '@/lib/image-optimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  onLoad?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  sizes,
  width,
  height,
  priority = false,
  onLoad
}: OptimizedImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = imgRef.current;
    if (!img || priority) return;

    imageOptimizer.observe(img);

    return () => {
      if (img) imageOptimizer.unobserve(img);
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Gerar srcset para diferentes resoluções
  const srcSet = sizes
    ? [320, 640, 960, 1280, 1920]
        .map(w => `${src}?w=${w} ${w}w`)
        .join(', ')
    : undefined;

  if (priority) {
    return (
      <img
        ref={imgRef}
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onLoad={handleLoad}
        loading="eager"
        decoding="sync"
      />
    );
  }

  return (
    <div className="relative overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        ref={imgRef}
        data-src={src}
        data-srcset={srcSet}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        className={`lazy transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        onLoad={handleLoad}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
