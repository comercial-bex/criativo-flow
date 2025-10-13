import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PasswordResetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PasswordResetModal({ open, onOpenChange }: PasswordResetModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mountedRef.current) return;
    
    if (!email) {
      toast.error('Por favor, insira seu email');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });

      // Check if component is still mounted before updating state
      if (!mountedRef.current) return;

      if (error) {
        toast.error('Erro ao enviar email de recuperação: ' + error.message);
      } else {
        toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.');
        onOpenChange(false);
        setEmail('');
      }
    } catch (error) {
      if (mountedRef.current) {
        toast.error('Erro inesperado ao solicitar recuperação de senha');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm" height="auto">
        <DialogHeader className="modal-header-gaming">
          <DialogTitle className="modal-title-gaming">Recuperar Senha</DialogTitle>
          <DialogDescription>
            Digite seu email para receber as instruções de recuperação de senha.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              disabled={loading}
            />
          </div>
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}