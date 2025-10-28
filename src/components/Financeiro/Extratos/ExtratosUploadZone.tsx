import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ExtratosUploadZoneProps {
  onFileSelect: (file: File) => void;
  onComprovantesSelect?: (files: File[]) => void;
  comprovantes?: File[];
}

export function ExtratosUploadZone({ onFileSelect, onComprovantesSelect, comprovantes = [] }: ExtratosUploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const onDropComprovantes = useCallback(
    (acceptedFiles: File[]) => {
      if (onComprovantesSelect) {
        onComprovantesSelect([...comprovantes, ...acceptedFiles]);
      }
    },
    [onComprovantesSelect, comprovantes]
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

  const { 
    getRootProps: getComprovantesRootProps, 
    getInputProps: getComprovantesInputProps, 
    isDragActive: isComprovanteDragActive,
    fileRejections: comprovanteRejections 
  } = useDropzone({
    onDrop: onDropComprovantes,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
  });

  const removeComprovante = (index: number) => {
    if (onComprovantesSelect) {
      onComprovantesSelect(comprovantes.filter((_, i) => i !== index));
    }
  };

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

      {onComprovantesSelect && (
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-medium">Comprovantes (Opcional)</h4>
          <div
            {...getComprovantesRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-all duration-200
              ${isComprovanteDragActive 
                ? "border-primary bg-primary/5 scale-105" 
                : "border-border hover:border-primary/50 hover:bg-accent/50"
              }
            `}
          >
            <input {...getComprovantesInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <Upload className="w-6 h-6 text-primary" />
              <div>
                <p className="text-sm font-medium mb-1">
                  {isComprovanteDragActive ? "Solte os comprovantes aqui" : "Adicionar comprovantes"}
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, PNG ou JPG • Máx. 10MB por arquivo
                </p>
              </div>
            </div>
          </div>

          {comprovanteRejections.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {comprovanteRejections[0].errors[0].code === 'file-too-large'
                  ? "Arquivo muito grande. Tamanho máximo: 10MB"
                  : "Formato não suportado. Use PDF, PNG ou JPG"}
              </AlertDescription>
            </Alert>
          )}

          {comprovantes.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">{comprovantes.length} comprovante(s) selecionado(s):</p>
              <div className="space-y-2">
                {comprovantes.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeComprovante(index)}
                    >
                      <AlertCircle className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
