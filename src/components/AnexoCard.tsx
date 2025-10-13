import { Download, Trash2, FileText, Image, Video, File } from 'lucide-react';
import { Button } from './ui/button';
import { BexCard, BexCardContent } from './ui/bex-card';
import { BexBadge } from './ui/bex-badge';
import { motion } from 'framer-motion';
import type { Anexo } from '@/types/tarefa';
import { useState } from 'react';
import { ConfirmationDialog } from './ui/confirmation-dialog';

interface AnexoCardProps {
  anexo: Anexo;
  onDownload: (anexo: Anexo) => void;
  onDelete: (anexoId: string, arquivoUrl: string) => void;
  canDelete?: boolean;
}

const tipoLabels: Record<string, string> = {
  referencia: 'Referência',
  briefing: 'Briefing',
  logo: 'Logo',
  paleta: 'Paleta',
  roteiro: 'Roteiro',
  psd_ai: 'PSD/AI',
  raw_video: 'Vídeo Raw',
  planilha: 'Planilha',
  contrato: 'Contrato',
  outro: 'Outro'
};

export function AnexoCard({ anexo, onDownload, onDelete, canDelete = false }: AnexoCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const getFileIcon = () => {
    const url = anexo.arquivo_url.toLowerCase();
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return Image;
    if (url.match(/\.(mp4|webm|mov)$/)) return Video;
    if (url.match(/\.(pdf)$/)) return FileText;
    return File;
  };

  const isImage = anexo.arquivo_url.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);
  const isVideo = anexo.arquivo_url.toLowerCase().match(/\.(mp4|webm|mov)$/);
  const Icon = getFileIcon();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <BexCard variant="glass" className="overflow-hidden group hover:shadow-lg hover:shadow-bex/20 transition-all">
          <BexCardContent className="p-0">
            {/* Preview Area */}
            <div className="relative aspect-video bg-muted/50 flex items-center justify-center overflow-hidden">
              {isImage ? (
                <img
                  src={anexo.arquivo_url}
                  alt={anexo.legenda || 'Anexo'}
                  className="w-full h-full object-cover"
                />
              ) : isVideo ? (
                <video
                  src={anexo.arquivo_url}
                  className="w-full h-full object-cover"
                  controls
                />
              ) : (
                <Icon className="h-16 w-16 text-muted-foreground opacity-50" />
              )}
              
              {/* Tipo Badge */}
              <div className="absolute top-2 left-2">
                <BexBadge variant="bexGlow">
                  {tipoLabels[anexo.tipo] || anexo.tipo}
                </BexBadge>
              </div>

              {/* Action Buttons Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownload(anexo)}
                  className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar
                </Button>
                {canDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    className="bg-red-500/80 hover:bg-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Deletar
                  </Button>
                )}
              </div>
            </div>

            {/* Info Area */}
            <div className="p-3 space-y-2">
              <p className="text-sm font-medium truncate">{anexo.legenda}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>v{anexo.versao}</span>
                {anexo.created_at && (
                  <span>
                    {new Date(anexo.created_at).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
            </div>
          </BexCardContent>
        </BexCard>
      </motion.div>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Deletar Anexo"
        description={`Tem certeza que deseja deletar "${anexo.legenda}"? Esta ação não pode ser desfeita.`}
        confirmText="Deletar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={() => {
          onDelete(anexo.id, anexo.arquivo_url);
          setShowDeleteDialog(false);
        }}
      />
    </>
  );
}
