import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Image as ImageIcon, Video, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast-compat";

interface UploadArquivoVisualProps {
  postId: string;
  arquivoAtual?: string;
  arquivoTipo?: string;
  onUploadComplete: (url: string, tipo: string, nome: string) => void;
  disabled?: boolean;
}

export const UploadArquivoVisual: React.FC<UploadArquivoVisualProps> = ({
  postId,
  arquivoAtual,
  arquivoTipo,
  onUploadComplete,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(arquivoAtual || null);
  const [currentTipo, setCurrentTipo] = useState<string | null>(arquivoTipo || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não suportado. Use JPG, PNG, WEBP, MP4, MOV ou PDF.');
      return;
    }

    // Validar tamanho (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Tamanho máximo: 20MB');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Gerar nome único do arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${postId}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Determinar tipo
      let tipo = 'documento';
      if (file.type.startsWith('image/')) tipo = 'imagem';
      else if (file.type.startsWith('video/')) tipo = 'video';

      // Preview local
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);
      setCurrentTipo(tipo);

      // Simular progress para melhor UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from('post-visuals')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);

      if (error) {
        console.error('Erro no upload:', error);
        throw error;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('post-visuals')
        .getPublicUrl(filePath);

      setProgress(100);

      // Callback com os dados do arquivo
      onUploadComplete(publicUrl, tipo, file.name);

      toast.success('Arquivo enviado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload do arquivo');
      setPreviewUrl(arquivoAtual || null);
      setCurrentTipo(arquivoTipo || null);
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (!arquivoAtual) return;

    try {
      // Extrair o caminho do arquivo da URL
      const urlParts = arquivoAtual.split('/');
      const fileName = urlParts[urlParts.length - 1];

      // Deletar do storage
      const { error } = await supabase.storage
        .from('post-visuals')
        .remove([fileName]);

      if (error) {
        console.error('Erro ao remover arquivo:', error);
        throw error;
      }

      setPreviewUrl(null);
      setCurrentTipo(null);
      onUploadComplete('', '', '');
      toast.success('Arquivo removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover arquivo:', error);
      toast.error('Erro ao remover arquivo');
    }
  };

  const getIcon = () => {
    if (!currentTipo) return <Upload className="h-4 w-4" />;
    switch (currentTipo) {
      case 'imagem': return <ImageIcon className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/quicktime,application/pdf"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Preview */}
      {previewUrl && !uploading && (
        <div className="relative group">
          {currentTipo === 'imagem' && (
            <img
              src={previewUrl}
              alt="Preview"
              className="h-12 w-12 object-cover rounded border border-border"
            />
          )}
          {currentTipo === 'video' && (
            <div className="h-12 w-12 flex items-center justify-center bg-muted rounded border border-border">
              <Video className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          {currentTipo === 'documento' && (
            <div className="h-12 w-12 flex items-center justify-center bg-muted rounded border border-border">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          
          {/* Botão remover */}
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Upload Button */}
      {!previewUrl && !uploading && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="gap-2"
        >
          {getIcon()}
          Anexar
        </Button>
      )}

      {/* Progress Bar */}
      {uploading && (
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Enviando...</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      )}

      {/* Visualizar arquivo atual (se não estiver editando) */}
      {previewUrl && !uploading && (
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline"
        >
          Ver arquivo
        </a>
      )}
    </div>
  );
};
