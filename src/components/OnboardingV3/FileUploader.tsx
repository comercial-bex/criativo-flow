import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, File, X, Loader2 } from "lucide-react";
import { toast } from '@/lib/toast-compat';
import { supabase } from "@/integrations/supabase/client";

interface FileUploaderProps {
  onFileUploaded: (url: string, nome: string) => void;
  currentFile?: string;
}

const ALLOWED_TYPES = ['text/plain', 'text/markdown', 'application/pdf', 'application/json'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function FileUploader({ onFileUploaded, currentFile }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState(currentFile || "");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Tipo de arquivo não permitido. Use .txt, .md, .pdf ou .json");
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error("Arquivo muito grande. Máximo 10MB.");
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('notas-onboarding')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('notas-onboarding')
        .getPublicUrl(data.path);

      setFileName(file.name);
      onFileUploaded(publicUrl, file.name);
      toast.success("Arquivo enviado com sucesso!");
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Falha ao fazer upload do arquivo");
    } finally {
      setUploading(false);
    }
  }, [onFileUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/pdf': ['.pdf'],
      'application/json': ['.json']
    },
    maxFiles: 1,
    disabled: uploading
  });

  const removeFile = () => {
    setFileName("");
    onFileUploaded("", "");
  };

  return (
    <div className="space-y-2">
      <Label>Anexar Arquivo (opcional)</Label>
      
      {fileName ? (
        <div className="flex items-center gap-2 p-3 border rounded-lg bg-secondary/50">
          <File className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm flex-1 truncate">{fileName}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={removeFile}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Enviando...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {isDragActive ? "Solte o arquivo aqui" : "Arraste ou clique para fazer upload"}
                </p>
                <p className="text-xs text-muted-foreground">
                  .txt, .md, .pdf, .json • Máx 10MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}