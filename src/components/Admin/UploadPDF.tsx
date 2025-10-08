import { useState } from "react";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { smartToast } from "@/lib/smart-toast";

interface UploadPDFProps {
  onUpload: (file: File) => Promise<string>;
  currentUrl?: string | null;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
}

export function UploadPDF({
  onUpload,
  currentUrl,
  label = "Upload PDF",
  accept = ".pdf",
  maxSizeMB = 10,
}: UploadPDFProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(currentUrl || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação de tamanho
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      smartToast.error(`Arquivo muito grande. Máximo: ${maxSizeMB}MB`);
      return;
    }

    // Validação de tipo
    if (!file.type.includes("pdf") && !accept.includes(file.name.split(".").pop() || "")) {
      smartToast.error("Formato de arquivo não suportado");
      return;
    }

    setUploading(true);
    try {
      const url = await onUpload(file);
      setUploadedUrl(url);
      smartToast.success("Arquivo enviado com sucesso!");
    } catch (error: any) {
      smartToast.error("Erro ao fazer upload", error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setUploadedUrl(null);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">{label}</span>
          </div>
          {uploadedUrl && (
            <CheckCircle className="w-5 h-5 text-success" />
          )}
        </div>

        {uploadedUrl ? (
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <FileText className="w-8 h-8 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {uploadedUrl.split("/").pop()}
              </p>
              <a
                href={uploadedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                Ver arquivo
              </a>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <label
              htmlFor="file-upload"
              className="cursor-pointer"
            >
              <span className="text-sm font-medium text-primary hover:underline">
                Clique para selecionar
              </span>
              <input
                id="file-upload"
                type="file"
                accept={accept}
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <p className="text-xs text-muted-foreground mt-2">
              Máximo: {maxSizeMB}MB • {accept.replace(/\./g, "").toUpperCase()}
            </p>
          </div>
        )}

        {uploading && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground mt-2">Enviando arquivo...</p>
          </div>
        )}
      </div>
    </Card>
  );
}
