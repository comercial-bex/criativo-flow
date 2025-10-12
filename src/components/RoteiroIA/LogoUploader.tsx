import { useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { smartToast } from "@/lib/smart-toast";

interface LogoUploaderProps {
  currentLogoUrl?: string;
  onLogoChange: (url: string) => void;
  roteiroId?: string;
}

export default function LogoUploader({ currentLogoUrl, onLogoChange, roteiroId }: LogoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentLogoUrl || "");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação de tipo
    if (!file.type.startsWith('image/')) {
      smartToast.error("Apenas imagens são permitidas");
      return;
    }

    // Validação de tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      smartToast.error("Imagem muito grande (máx 5MB)");
      return;
    }

    setIsUploading(true);

    try {
      // Preview local
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      // Upload para Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${roteiroId || 'temp'}_logo_${Date.now()}.${fileExt}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('roteiros-logos')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('roteiros-logos')
        .getPublicUrl(fileName);

      setPreviewUrl(publicUrl);
      onLogoChange(publicUrl);
      smartToast.success("Logo anexada com sucesso!");
    } catch (error: any) {
      smartToast.error("Erro ao fazer upload", error.message);
      setPreviewUrl(currentLogoUrl || "");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setPreviewUrl("");
    onLogoChange("");
    smartToast.success("Logo removida");
  };

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg bg-card">
      {previewUrl ? (
        <div className="relative">
          <img 
            src={previewUrl} 
            alt="Logo" 
            className="h-16 w-auto max-w-[200px] object-contain rounded border"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={handleRemoveLogo}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="h-16 w-16 rounded border-2 border-dashed border-muted-foreground/50 flex items-center justify-center">
          <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
        </div>
      )}

      <div className="flex-1">
        <label htmlFor="logo-upload">
          <Button
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => document.getElementById('logo-upload')?.click()}
            type="button"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? "Enviando..." : previewUrl ? "Trocar Logo" : "Anexar Logo"}
          </Button>
        </label>
        <input
          id="logo-upload"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <p className="text-xs text-muted-foreground mt-1">
          PNG, JPG ou SVG (máx 5MB)
        </p>
      </div>
    </div>
  );
}
