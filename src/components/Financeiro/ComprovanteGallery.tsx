import { FileText, Download, Trash2, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ComprovanteGalleryProps {
  files: { url: string; nome?: string; tipo?: string; tamanho?: number }[];
  onRemove?: (url: string) => void;
  onView?: (url: string) => void;
}

export function ComprovanteGallery({ files, onRemove, onView }: ComprovanteGalleryProps) {
  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    return bytes < 1024 ? `${bytes}B` : `${(bytes/1024).toFixed(1)}KB`;
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {files.map((file, idx) => (
        <Card key={idx} className="p-2 group relative">
          <div className="aspect-square bg-muted rounded overflow-hidden mb-2">
            {file.tipo === 'application/pdf' ? (
              <div className="w-full h-full flex items-center justify-center bg-destructive/10">
                <FileText className="w-12 h-12 text-destructive" />
              </div>
            ) : (
              <img src={file.url} alt={file.nome} className="w-full h-full object-cover" />
            )}
          </div>
          
          {file.nome && <p className="text-xs truncate">{file.nome}</p>}
          {file.tamanho && <Badge variant="outline" className="text-xs">{formatSize(file.tamanho)}</Badge>}
          
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            {onView && <Button size="sm" variant="secondary" onClick={() => onView(file.url)}><Eye className="w-4 h-4" /></Button>}
            <Button size="sm" variant="secondary" asChild><a href={file.url} download><Download className="w-4 h-4" /></a></Button>
            {onRemove && <Button size="sm" variant="destructive" onClick={() => onRemove(file.url)}><Trash2 className="w-4 h-4" /></Button>}
          </div>
        </Card>
      ))}
    </div>
  );
}
