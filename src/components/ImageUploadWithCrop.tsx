import { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { Upload, ZoomIn, ZoomOut, RotateCw, Check, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface ImageUploadWithCropProps {
  currentImageUrl?: string;
  onImageCropped: (blob: Blob) => void;
  aspect?: number;
  maxSize?: number; // em MB
  recommendedSize?: string;
  uploadType: 'avatar' | 'logo';
  className?: string;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

async function getCroppedImg(imageSrc: string, pixelCrop: CropArea): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      resolve(blob);
    }, 'image/jpeg', 0.95);
  });
}

export function ImageUploadWithCrop({
  currentImageUrl,
  onImageCropped,
  aspect = 1,
  maxSize = 2,
  recommendedSize = '400x400px',
  uploadType,
  className
}: ImageUploadWithCropProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((_: any, croppedAreaPixels: CropArea) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validar formato
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Formato inválido. Use apenas JPG, JPEG, PNG ou WEBP.');
      return;
    }

    // Validar tamanho
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Arquivo muito grande. Tamanho máximo: ${maxSize}MB`);
      return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImageSrc(reader.result as string);
      setIsOpen(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    });
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [maxSize]);

  const handleCropConfirm = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onImageCropped(croppedBlob);
      setIsOpen(false);
      setImageSrc(null);
      setError(null);
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      setError('Erro ao processar imagem. Tente novamente.');
    }
  }, [imageSrc, croppedAreaPixels, onImageCropped]);

  const handleCancel = () => {
    setIsOpen(false);
    setImageSrc(null);
    setError(null);
  };

  const guidelines = {
    avatar: {
      title: 'Foto de Perfil',
      description: 'Escolha uma foto nítida, centralizada e dentro dos limites recomendados.',
      recommendations: [
        'Tamanho recomendado: 400x400px',
        'Peso máximo: 2MB',
        'Formatos: JPG, JPEG, PNG, WEBP'
      ]
    },
    logo: {
      title: 'Logotipo da Empresa',
      description: 'Envie um logotipo em boa resolução, de fundo transparente ou branco, para melhor exibição nos cartões.',
      recommendations: [
        'Tamanho recomendado: 600x600px',
        'Peso máximo: 2MB',
        'Formatos: JPG, JPEG, PNG (transparente), WEBP'
      ]
    }
  };

  const guide = guidelines[uploadType];

  return (
    <>
      <div className={cn("space-y-2", className)}>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">{guide.description}</p>
              <ul className="text-sm space-y-0.5 mt-2">
                {guide.recommendations.map((rec, i) => (
                  <li key={i}>• {rec}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        <div 
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">Clique para selecionar uma imagem</p>
          <p className="text-xs text-muted-foreground mt-1">
            ou arraste e solte aqui
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent size="xl" height="lg">
          <DialogHeader>
            <DialogTitle>Ajustar {guide.title}</DialogTitle>
            <DialogDescription>
              Use os controles para ajustar o enquadramento, zoom e rotação da imagem
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Área de Crop */}
            <div className="relative h-[400px] bg-muted rounded-lg overflow-hidden">
              {imageSrc && (
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={aspect}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                  onCropComplete={onCropComplete}
                />
              )}
            </div>

            {/* Controles */}
            <div className="space-y-4">
              {/* Zoom */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <ZoomIn className="h-4 w-4" />
                    Zoom
                  </label>
                  <span className="text-sm text-muted-foreground">{Math.round(zoom * 100)}%</span>
                </div>
                <Slider
                  value={[zoom]}
                  onValueChange={([value]) => setZoom(value)}
                  min={1}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Rotação */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <RotateCw className="h-4 w-4" />
                    Rotação
                  </label>
                  <span className="text-sm text-muted-foreground">{rotation}°</span>
                </div>
                <Slider
                  value={[rotation]}
                  onValueChange={([value]) => setRotation(value)}
                  min={0}
                  max={360}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleCropConfirm}>
              <Check className="h-4 w-4 mr-2" />
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
