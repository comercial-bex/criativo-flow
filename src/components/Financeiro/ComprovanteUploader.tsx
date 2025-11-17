import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileImage, FileText, X, Check, Loader2, Crop } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useComprovanteUpload } from "@/hooks/useComprovanteUpload";
import { ComprovanteCropModal } from "./ComprovanteCropModal";

interface ComprovanteUploaderProps {
  onUploadComplete?: (urls: string[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  disabled?: boolean;
}

export function ComprovanteUploader({
  onUploadComplete,
  maxFiles = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
  disabled = false,
}: ComprovanteUploaderProps) {
  const { arquivos, uploading, adicionarArquivos, removerArquivo, uploadTodos, limpar } = useComprovanteUpload();
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedFileForCrop, setSelectedFileForCrop] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    adicionarArquivos(acceptedFiles);
  }, [adicionarArquivos]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles,
    disabled: disabled || arquivos.length >= maxFiles,
  });

  const handleUploadAll = async () => {
    try {
      const urls = await uploadTodos();
      if (onUploadComplete) {
        onUploadComplete(urls);
      }
    } catch (error) {
      console.error("Erro no upload:", error);
    }
  };

  const handleCropFile = (fileId: string) => {
    setSelectedFileForCrop(fileId);
    setCropModalOpen(true);
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    // Aqui você pode substituir o arquivo original pelo cropado
    // Por simplicidade, vamos apenas fechar o modal
    setCropModalOpen(false);
    setSelectedFileForCrop(null);
  };

  const formatFileSize = (bytes: number) => {
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const selectedFile = arquivos.find(a => a.id === selectedFileForCrop);

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      {arquivos.length < maxFiles && !disabled && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200
            ${isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-primary font-medium">Solte os arquivos aqui...</p>
          ) : (
            <div className="space-y-2">
              <p className="font-medium">
                Arraste arquivos ou clique para selecionar
              </p>
              <p className="text-sm text-muted-foreground">
                JPG, PNG ou PDF (máx. 5MB cada)
              </p>
              <p className="text-xs text-muted-foreground">
                Até {maxFiles} arquivos
              </p>
            </div>
          )}
        </div>
      )}

      {/* Lista de arquivos */}
      {arquivos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {arquivos.length} arquivo(s) selecionado(s)
            </p>
            <div className="flex gap-2">
              {!arquivos.every(a => a.uploaded) && (
                <Button
                  size="sm"
                  onClick={handleUploadAll}
                  disabled={uploading || arquivos.every(a => a.uploaded)}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Enviar Todos
                    </>
                  )}
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={limpar}
                disabled={uploading}
              >
                Limpar Todos
              </Button>
            </div>
          </div>

          {arquivos.map((arquivo) => (
            <Card key={arquivo.id} className="p-3">
              <div className="flex items-start gap-3">
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  {arquivo.file.type === 'application/pdf' ? (
                    <div className="w-16 h-16 bg-destructive/10 rounded flex items-center justify-center">
                      <FileText className="w-8 h-8 text-destructive" />
                    </div>
                  ) : (
                    <img
                      src={arquivo.preview}
                      alt={arquivo.file.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                </div>

                {/* Informações */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {arquivo.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(arquivo.file.size)}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      {arquivo.uploaded ? (
                        <Badge variant="default" className="gap-1">
                          <Check className="w-3 h-3" />
                          Enviado
                        </Badge>
                      ) : uploading && arquivo.progress !== undefined ? (
                        <Badge variant="secondary" className="gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          {arquivo.progress}%
                        </Badge>
                      ) : (
                        <Badge variant="outline">Pendente</Badge>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  {uploading && arquivo.progress !== undefined && (
                    <Progress value={arquivo.progress} className="h-1 mt-2" />
                  )}

                  {/* Ações */}
                  <div className="flex gap-2 mt-2">
                    {arquivo.file.type.startsWith('image/') && !arquivo.uploaded && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCropFile(arquivo.id)}
                        disabled={uploading}
                      >
                        <Crop className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removerArquivo(arquivo.id)}
                      disabled={uploading}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Remover
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de crop */}
      {selectedFile && (
        <ComprovanteCropModal
          open={cropModalOpen}
          onOpenChange={setCropModalOpen}
          imageUrl={selectedFile.preview}
          fileName={selectedFile.file.name}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
