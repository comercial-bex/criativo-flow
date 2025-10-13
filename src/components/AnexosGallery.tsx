import { useEffect, useState, useCallback } from 'react';
import { Upload, Paperclip } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { AnexoCard } from './AnexoCard';
import { useAnexos } from '@/hooks/useAnexos';
import type { TipoAnexo } from '@/types/tarefa';
import { cn } from '@/lib/utils';
import { AnimatePresence } from 'framer-motion';

interface AnexosGalleryProps {
  tarefaId: string;
  canEdit?: boolean;
  capaAtualId?: string | null;
  onSetCapa?: (anexoId: string) => void;
}

const tipoOptions: { value: TipoAnexo; label: string }[] = [
  { value: 'referencia', label: 'Referência' },
  { value: 'briefing', label: 'Briefing' },
  { value: 'logo', label: 'Logo' },
  { value: 'paleta', label: 'Paleta de Cores' },
  { value: 'roteiro', label: 'Roteiro' },
  { value: 'psd_ai', label: 'PSD/AI' },
  { value: 'raw_video', label: 'Vídeo Raw' },
  { value: 'planilha', label: 'Planilha' },
  { value: 'contrato', label: 'Contrato' },
  { value: 'outro', label: 'Outro' }
];

export function AnexosGallery({ tarefaId, canEdit = false, capaAtualId, onSetCapa }: AnexosGalleryProps) {
  const { anexos, uploadProgress, fetchAnexos, uploadAnexo, deleteAnexo, downloadAnexo } = useAnexos();
  const [selectedTipo, setSelectedTipo] = useState<TipoAnexo>('referencia');
  const [legenda, setLegenda] = useState('');

  useEffect(() => {
    if (tarefaId) {
      fetchAnexos(tarefaId);
    }
  }, [tarefaId, fetchAnexos]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!canEdit) return;

      for (const file of acceptedFiles) {
        try {
          await uploadAnexo(file, tarefaId, selectedTipo, legenda || file.name);
          setLegenda('');
        } catch (error) {
          console.error('Upload error:', error);
        }
      }
    },
    [canEdit, tarefaId, selectedTipo, legenda, uploadAnexo]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: !canEdit,
    maxSize: 52428800, // 50MB
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
      'video/*': ['.mp4', '.webm', '.mov'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.adobe.photoshop': ['.psd'],
      'application/postscript': ['.ai']
    }
  });

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {canEdit && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Anexo</Label>
              <Select value={selectedTipo} onValueChange={(v) => setSelectedTipo(v as TipoAnexo)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tipoOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Legenda (opcional)</Label>
              <Input
                placeholder="Nome do arquivo..."
                value={legenda}
                onChange={(e) => setLegenda(e.target.value)}
              />
            </div>
          </div>

          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all',
              isDragActive
                ? 'border-bex bg-bex/10 scale-105'
                : 'border-border hover:border-bex/50 hover:bg-bex/5',
              !canEdit && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-bex font-medium">Solte os arquivos aqui...</p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-2">
                  Arraste arquivos aqui ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground">
                  Máximo 50MB por arquivo
                </p>
              </>
            )}
          </div>

          {/* Upload Progress */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="space-y-2">
              {Object.entries(uploadProgress).map(([fileName, progress]) => (
                <div key={fileName} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate flex-1">{fileName}</span>
                    <span className="text-bex font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Gallery Grid */}
      {anexos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {anexos.map((anexo) => (
              <AnexoCard
                key={anexo.id}
                anexo={anexo}
                onDownload={downloadAnexo}
                onDelete={deleteAnexo}
                canDelete={canEdit}
                onSetCapa={onSetCapa ? () => onSetCapa(anexo.id) : undefined}
                isCurrentCapa={anexo.id === capaAtualId}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Paperclip className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-sm">Nenhum anexo adicionado ainda.</p>
          {canEdit && <p className="text-xs mt-1">Arraste arquivos acima para começar.</p>}
        </div>
      )}
    </div>
  );
}
