import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  especialistaNome: string;
  isLoading?: boolean;
}

export function ConfirmDeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  especialistaNome, 
  isLoading = false 
}: ConfirmDeleteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="sm" height="auto">
        <DialogHeader className="modal-header-gaming">
          <DialogTitle className="modal-title-gaming flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Confirmar Exclusão
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir o especialista{' '}
            <span className="font-medium text-foreground">{especialistaNome}</span>?
          </p>
          
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
            <p className="text-sm text-destructive font-medium">
              ⚠️ Esta ação não pode ser desfeita!
            </p>
            <p className="text-xs text-destructive mt-1">
              O usuário será removido permanentemente do sistema.
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}