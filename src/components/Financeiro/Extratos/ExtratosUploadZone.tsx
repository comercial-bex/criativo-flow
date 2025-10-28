import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ExtratosUploadZoneProps {
  onFileSelect: (file: File) => void;
}

export function ExtratosUploadZone({ onFileSelect }: ExtratosUploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'application/x-ofx': ['.ofx'],
      'text/csv': ['.csv'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive 
            ? "border-primary bg-primary/5 scale-105" 
            : "border-border hover:border-primary/50 hover:bg-accent/50"
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">
              {isDragActive ? "Solte o arquivo aqui" : "Arraste seu extrato bancário"}
            </h3>
            <p className="text-sm text-muted-foreground">
              ou clique para selecionar
            </p>
          </div>

          <div className="flex gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>OFX ou CSV</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>Máx. 5MB</span>
            </div>
          </div>
        </div>
      </div>

      {fileRejections.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {fileRejections[0].errors[0].code === 'file-too-large'
              ? "Arquivo muito grande. Tamanho máximo: 5MB"
              : "Formato não suportado. Use arquivos OFX ou CSV"}
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-muted/50 p-4 rounded-lg space-y-2">
        <h4 className="font-medium text-sm">Formatos Suportados:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <strong>OFX</strong>: Formato padrão dos bancos (processamento automático)</li>
          <li>• <strong>CSV</strong>: Requer configuração das colunas</li>
        </ul>
      </div>
    </div>
  );
}
