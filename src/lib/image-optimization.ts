// Lazy loading de imagens com IntersectionObserver
export class ImageOptimizer {
  private observer: IntersectionObserver | null = null;
  private loadedImages = new Set<HTMLImageElement>();

  constructor() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              this.loadImage(img);
            }
          });
        },
        {
          rootMargin: '50px',
          threshold: 0.01
        }
      );
    }
  }

  observe(img: HTMLImageElement) {
    if (!this.observer || this.loadedImages.has(img)) return;
    this.observer.observe(img);
  }

  unobserve(img: HTMLImageElement) {
    if (!this.observer) return;
    this.observer.unobserve(img);
  }

  private loadImage(img: HTMLImageElement) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;

    if (!src && !srcset) return;

    if (src) {
      img.src = src;
      delete img.dataset.src;
    }

    if (srcset) {
      img.srcset = srcset;
      delete img.dataset.srcset;
    }

    img.classList.remove('lazy');
    this.loadedImages.add(img);
    this.observer?.unobserve(img);
  }

  disconnect() {
    this.observer?.disconnect();
    this.loadedImages.clear();
  }
}

// Singleton instance
export const imageOptimizer = new ImageOptimizer();

// Converter imagem para WebP (client-side)
export async function convertToWebP(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Conversion failed'));
        },
        'image/webp',
        0.85
      );
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// Gerar srcset responsivo
export function generateSrcSet(baseUrl: string, sizes: number[]): string {
  return sizes
    .map(size => `${baseUrl}?w=${size} ${size}w`)
    .join(', ');
}

// Calcular blur placeholder
export async function generateBlurPlaceholder(url: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 10;
      canvas.height = 10;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, 10, 10);
      resolve(canvas.toDataURL('image/jpeg', 0.5));
    };

    img.onerror = () => resolve('');
    img.src = url;
  });
}
