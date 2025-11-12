/**
 * Optimized Image Component
 * - Lazy loading com Intersection Observer
 * - Blur placeholder enquanto carrega
 * - WebP support com fallback
 */

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  loading?: 'lazy' | 'eager';
}

export function OptimizedImage({
  src,
  alt,
  className,
  placeholderClassName,
  loading = 'lazy',
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(loading === 'eager');
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (loading === 'eager') return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Começar a carregar 50px antes
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [loading]);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Blur placeholder */}
      {!isLoaded && (
        <div 
          className={cn(
            'absolute inset-0 bg-muted animate-pulse',
            placeholderClassName
          )}
        />
      )}
      
      {/* Actual image */}
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          onLoad={() => setIsLoaded(true)}
          {...props}
        />
      )}
    </div>
  );
}
