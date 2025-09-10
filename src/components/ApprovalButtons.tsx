import { Check, X, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ApprovalButtonsProps {
  onApprove?: () => void;
  onReject?: (reason: string) => void;
  onRequestAdjustment?: (reason: string) => void;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
}

const motivosReprovacao = [
  "Texto desalinhado com o brief",
  "Cores fora da paleta da marca",
  "CTA incorreto ou ausente",
  "Qualidade da imagem inadequada",
  "Erro de português/revisão",
  "Layout não aprovado",
  "Desalinhamento com estratégia",
  "Outro motivo"
];

export function ApprovalButtons({ 
  onApprove, 
  onReject, 
  onRequestAdjustment, 
  disabled = false,
  size = "sm"
}: ApprovalButtonsProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRejectReason, setSelectedRejectReason] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [selectedAdjustmentReason, setSelectedAdjustmentReason] = useState("");

  const handleReject = () => {
    const finalReason = selectedRejectReason === "Outro motivo" 
      ? rejectReason 
      : selectedRejectReason;
    
    if (finalReason.trim() && onReject) {
      onReject(finalReason);
      setRejectReason("");
      setSelectedRejectReason("");
    }
  };

  const handleRequestAdjustment = () => {
    const finalReason = selectedAdjustmentReason === "Outro motivo" 
      ? adjustmentReason 
      : selectedAdjustmentReason;
    
    if (finalReason.trim() && onRequestAdjustment) {
      onRequestAdjustment(finalReason);
      setAdjustmentReason("");
      setSelectedAdjustmentReason("");
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Botão Aprovar */}
      {onApprove && (
        <Button
          onClick={onApprove}
          disabled={disabled}
          size={size}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Check className="h-4 w-4 mr-1" />
          Aprovar
        </Button>
      )}

      {/* Botão Reprovar */}
      {onReject && (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              disabled={disabled}
              size={size}
              variant="destructive"
            >
              <X className="h-4 w-4 mr-1" />
              Reprovar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reprovar Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reject-reason">Motivo da reprovação *</Label>
                <Select 
                  value={selectedRejectReason} 
                  onValueChange={setSelectedRejectReason}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {motivosReprovacao.map((motivo) => (
                      <SelectItem key={motivo} value={motivo}>
                        {motivo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedRejectReason === "Outro motivo" && (
                <div>
                  <Label htmlFor="custom-reject-reason">Descreva o motivo</Label>
                  <Textarea
                    id="custom-reject-reason"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Descreva o motivo da reprovação..."
                    rows={3}
                  />
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <DialogTrigger asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogTrigger>
                <Button 
                  onClick={handleReject}
                  disabled={!selectedRejectReason}
                  variant="destructive"
                >
                  Reprovar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Botão Solicitar Ajuste */}
      {onRequestAdjustment && (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              disabled={disabled}
              size={size}
              variant="outline"
            >
              <Edit3 className="h-4 w-4 mr-1" />
              Solicitar Ajuste
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Solicitar Ajuste</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="adjustment-reason">Tipo de ajuste necessário *</Label>
                <Select 
                  value={selectedAdjustmentReason} 
                  onValueChange={setSelectedAdjustmentReason}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de ajuste" />
                  </SelectTrigger>
                  <SelectContent>
                    {motivosReprovacao.map((motivo) => (
                      <SelectItem key={motivo} value={motivo}>
                        {motivo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedAdjustmentReason === "Outro motivo" && (
                <div>
                  <Label htmlFor="custom-adjustment-reason">Descreva o ajuste necessário</Label>
                  <Textarea
                    id="custom-adjustment-reason"
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    placeholder="Descreva que tipo de ajuste é necessário..."
                    rows={3}
                  />
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <DialogTrigger asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogTrigger>
                <Button 
                  onClick={handleRequestAdjustment}
                  disabled={!selectedAdjustmentReason}
                >
                  Solicitar Ajuste
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}