import { useState, useCallback } from 'react';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { ImageUploadWithCrop } from '@/components/ImageUploadWithCrop';

interface ClientLogoUploadProps {
  currentLogo?: string;
  clientName: string;
  onLogoChange: (logoUrl: string | null) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function ClientLogoUpload({ 
  currentLogo, 
  clientName, 
  onLogoChange,
  size = 'md'
}: ClientLogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentLogo || null);

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-20 w-20',
    lg: 'h-32 w-32'
  };

  const handleImageCropped = useCallback(async (blob: Blob) => {
    setUploading(true);

    try {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;
      const filePath = `${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('client-logos')
        .upload(filePath, blob);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('client-logos')
        .getPublicUrl(filePath);

      setPreview(publicUrl);
      onLogoChange(publicUrl);

      toast({
        title: "Sucesso",
        description: "Logo carregado com sucesso!",
      });
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar logo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }, [onLogoChange]);

  const handleRemoveLogo = () => {
    setPreview(null);
    onLogoChange(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar className={sizeClasses[size]}>
          {preview ? (
            <AvatarImage src={preview} alt={`Logo ${clientName}`} />
          ) : (
            <AvatarFallback className="bg-muted text-muted-foreground">
              <ImageIcon className="h-6 w-6" />
            </AvatarFallback>
          )}
        </Avatar>
        
        {uploading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando logo...
          </div>
        )}
      </div>

      <ImageUploadWithCrop
        currentImageUrl={preview || undefined}
        onImageCropped={handleImageCropped}
        aspect={1}
        maxSize={2}
        recommendedSize="600x600px"
        uploadType="logo"
      />

      {preview && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleRemoveLogo}
          className="w-full"
          disabled={uploading}
        >
          <X className="h-4 w-4 mr-2" />
          Remover Logo
        </Button>
      )}
    </div>
  );
}