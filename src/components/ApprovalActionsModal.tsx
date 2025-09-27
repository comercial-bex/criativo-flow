import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Pause } from "lucide-react";

interface ApprovalActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (observacao?: string) => void;
  especialistaNome: string;
  action: 'approve' | 'reject' | 'suspend';
  isLoading?: boolean;
}

const actionConfig = {
  approve: {
    title: 'Aprovar Especialista',
    description: 'Tem certeza que deseja aprovar este especialista? Ele terá acesso completo ao sistema.',
    icon: CheckCircle,
    buttonText: 'Aprovar',
    buttonVariant: 'default' as const,
    observacaoLabel: 'Observações da aprovação (opcional)',
    observacaoPlaceholder: 'Ex: Especialista aprovado com todas as qualificações necessárias...'
  },
  reject: {
    title: 'Rejeitar Especialista',
    description: 'Tem certeza que deseja rejeitar este especialista? Ele não terá acesso ao sistema.',
    icon: XCircle,
    buttonText: 'Rejeitar',
    buttonVariant: 'destructive' as const,
    observacaoLabel: 'Motivo da rejeição (obrigatório)',
    observacaoPlaceholder: 'Ex: Documentação incompleta, qualificações insuficientes...'
  },
  suspend: {
    title: 'Suspender Especialista',
    description: 'Tem certeza que deseja suspender este especialista? Ele perderá o acesso ao sistema.',
    icon: Pause,
    buttonText: 'Suspender',
    buttonVariant: 'outline' as const,
    observacaoLabel: 'Motivo da suspensão (obrigatório)',
    observacaoPlaceholder: 'Ex: Violação de normas, comportamento inadequado...'
  }
};

export function ApprovalActionsModal({
  isOpen,
  onClose,
  onConfirm,
  especialistaNome,
  action,
  isLoading = false
}: ApprovalActionsModalProps) {
  const [observacao, setObservacao] = useState('');
  const config = actionConfig[action];
  const Icon = config.icon;

  const handleConfirm = () => {
    if ((action === 'reject' || action === 'suspend') && !observacao.trim()) {
      return; // Observação é obrigatória para rejeitar/suspender
    }
    onConfirm(observacao.trim() || undefined);
  };

  const handleClose = () => {
    setObservacao('');
    onClose();
  };

  const isObservacaoRequired = action === 'reject' || action === 'suspend';
  const canConfirm = !isObservacaoRequired || observacao.trim().length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              action === 'approve' ? 'bg-green-100 text-green-600' :
              action === 'reject' ? 'bg-red-100 text-red-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>{config.title}</DialogTitle>
              <DialogDescription className="mt-1">
                <strong>{especialistaNome}</strong>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {config.description}
          </p>

          <div className="space-y-2">
            <Label htmlFor="observacao">
              {config.observacaoLabel}
              {isObservacaoRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id="observacao"
              placeholder={config.observacaoPlaceholder}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={3}
              className="resize-none"
            />
            {isObservacaoRequired && (
              <p className="text-xs text-muted-foreground">
                Este campo é obrigatório
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant={config.buttonVariant}
            onClick={handleConfirm}
            disabled={isLoading || !canConfirm}
          >
            {isLoading ? "Processando..." : config.buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}