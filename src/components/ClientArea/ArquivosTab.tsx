import { useState, useCallback } from "react";
import { useClientFiles } from "@/hooks/useClientFiles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { FileText, Image, Video, File, Download, Trash2, Upload } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { useDropzone } from "react-dropzone";

interface ArquivosTabProps {
  clienteId: string;
  projetoId?: string;
  readOnly?: boolean;
}

export function ArquivosTab({ clienteId, projetoId, readOnly = false }: ArquivosTabProps) {
  const { user } = useAuth();
  const { files, loading, uploadFile, deleteFile, getPublicUrl } = useClientFiles(clienteId, projetoId);
  const [searchTerm, setSearchTerm] = useState("");
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        if (file.size > 20 * 1024 * 1024) {
          // 20MB
          alert("Arquivo muito grande! Tamanho máximo: 20MB");
          return;
        }
        uploadFile({
          file,
          metadata: {
            cliente_id: clienteId,
            projeto_id: projetoId,
            uploaded_by: user?.id,
            size: file.size,
            mimetype: file.type,
          },
        });
      });
    },
    [uploadFile, clienteId, projetoId, user]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 5,
    maxSize: 20 * 1024 * 1024,
  });

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith("image/")) return Image;
    if (mimetype.startsWith("video/")) return Video;
    if (mimetype.includes("pdf")) return FileText;
    return File;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <SearchInput
          onSearch={setSearchTerm}
          placeholder="Buscar arquivos..."
          className="max-w-sm"
        />
      </div>

      {!readOnly && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-sm text-muted-foreground">Solte os arquivos aqui...</p>
          ) : (
            <div>
              <p className="text-sm font-medium mb-1">Arraste arquivos ou clique para fazer upload</p>
              <p className="text-xs text-muted-foreground">
                Máximo 5 arquivos, 20MB cada
              </p>
            </div>
          )}
        </div>
      )}

      {filteredFiles.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhum arquivo encontrado"
          description="Faça upload de arquivos usando a área acima"
        />
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {filteredFiles.map((file) => {
            const FileIcon = getFileIcon(file.metadata.mimetype || "");
            return (
              <Card key={file.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                        <FileIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" title={file.name}>
                        {file.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {formatBytes(file.metadata.size || 0)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(file.created_at), "dd MMM yyyy", { locale: ptBR })}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        const url = getPublicUrl(file.name);
                        window.open(url, "_blank");
                      }}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Baixar
                    </Button>
                    {!readOnly && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setFileToDelete(file.name)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmationDialog
        open={!!fileToDelete}
        onOpenChange={(open) => !open && setFileToDelete(null)}
        title="Deletar Arquivo"
        description="Tem certeza que deseja deletar este arquivo? Esta ação não pode ser desfeita."
        confirmText="Deletar"
        variant="destructive"
        onConfirm={() => {
          if (fileToDelete) {
            deleteFile(fileToDelete);
            setFileToDelete(null);
          }
        }}
      />
    </div>
  );
}
