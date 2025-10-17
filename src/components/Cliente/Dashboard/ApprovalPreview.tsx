import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, FileText, Instagram, Facebook } from "lucide-react";
import { ClientApproval } from "@/hooks/useClientApprovals";

interface ApprovalPreviewProps {
  approval: ClientApproval & {
    legenda?: string;
    objetivo_postagem?: string;
    formato_postagem?: string;
    hashtags?: string[];
    call_to_action?: string;
    rede_social?: string;
  };
  onApprove: () => void;
  onReject: (motivo: string) => void;
}

export function ApprovalPreview({ approval, onApprove, onReject }: ApprovalPreviewProps) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [motivo, setMotivo] = useState('');

  const handleReject = () => {
    if (motivo.trim()) {
      onReject(motivo);
      setShowRejectModal(false);
      setMotivo('');
    }
  };

  const getSocialIcon = () => {
    switch (approval.rede_social) {
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'facebook': return <Facebook className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Lado Esquerdo: Informações do Planejamento */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📋 Detalhes do Planejamento
          </CardTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{approval.formato_postagem || approval.tipo}</Badge>
            {approval.rede_social && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {getSocialIcon()}
                {approval.rede_social}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">📌 Título</label>
            <p className="text-base mt-1">{approval.titulo}</p>
          </div>

          {approval.objetivo_postagem && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">🎯 Objetivo</label>
              <p className="text-sm mt-1">{approval.objetivo_postagem}</p>
            </div>
          )}

          {approval.legenda && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">📝 Legenda Completa</label>
              <div className="bg-muted/50 p-3 rounded-lg text-sm whitespace-pre-wrap mt-1 max-h-60 overflow-y-auto">
                {approval.legenda}
              </div>
            </div>
          )}

          {approval.hashtags && approval.hashtags.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">🏷️ Hashtags</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {approval.hashtags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {approval.call_to_action && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">📢 Call to Action</label>
              <p className="text-sm mt-1">{approval.call_to_action}</p>
            </div>
          )}

          {approval.descricao && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">💡 Descrição</label>
              <p className="text-sm text-muted-foreground mt-1">{approval.descricao}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lado Direito: Prévia do Criativo */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>🎨 Prévia do Criativo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preview estilo rede social */}
          <div className="border-2 border-primary rounded-lg overflow-hidden shadow-lg bg-background">
            {approval.anexo_url ? (
              <>
                {approval.anexo_url.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video
                    src={approval.anexo_url}
                    controls
                    className="w-full h-auto max-h-96 object-cover"
                  />
                ) : (
                  <img
                    src={approval.anexo_url}
                    alt="Criativo"
                    className="w-full h-auto max-h-96 object-cover"
                  />
                )}
                {/* Overlay com legenda preview */}
                {approval.legenda && (
                  <div className="p-3 bg-background border-t">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {approval.legenda.substring(0, 100)}...
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-64 bg-muted/20">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-16 w-16 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma prévia disponível</p>
                </div>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3">
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              size="lg"
              onClick={() => setShowRejectModal(true)}
            >
              <XCircle className="mr-2 h-5 w-5" />
              Reprovar
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              size="lg"
              onClick={onApprove}
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              Aprovar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Reprovação */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Motivo da Reprovação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Por favor, descreva o que precisa ser ajustado neste criativo:
            </p>
            <Textarea
              placeholder="Ex: Ajustar cores, mudar texto, adicionar elementos..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="min-h-[120px]"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowRejectModal(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!motivo.trim()}
              >
                Confirmar Reprovação
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
