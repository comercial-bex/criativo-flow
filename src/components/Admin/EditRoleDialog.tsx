import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle } from 'lucide-react';

interface Profile {
  id: string;
  nome: string;
  email: string;
  role?: string;
}

interface EditRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile | null;
  onRoleUpdate: (profileId: string, newRole: string) => Promise<void>;
}

export function EditRoleDialog({ open, onOpenChange, profile, onRoleUpdate }: EditRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (profile?.role) {
      setSelectedRole(profile.role);
    } else {
      setSelectedRole('');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile || !selectedRole) return;

    setUpdating(true);
    try {
      await onRoleUpdate(profile.id, selectedRole);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar role:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-primary" />
            Editar Função/Role
          </DialogTitle>
          <DialogDescription>
            Altere a role de {profile.nome}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Role Atual</label>
            <div className="mt-1">
              <Badge variant="outline" className="text-sm">
                {profile.role || 'Nenhuma role atribuída'}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Nova Role</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma role..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="gestor">Gestor</SelectItem>
                <SelectItem value="grs">GRS</SelectItem>
                <SelectItem value="designer">Designer</SelectItem>
                <SelectItem value="filmmaker">Filmmaker</SelectItem>
                <SelectItem value="atendimento">Atendimento</SelectItem>
                <SelectItem value="financeiro">Financeiro</SelectItem>
                <SelectItem value="trafego">Tráfego</SelectItem>
                <SelectItem value="cliente">Cliente</SelectItem>
                <SelectItem value="fornecedor">Fornecedor</SelectItem>
                <SelectItem value="rh">RH</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="bg-warning/10 border border-warning/20 p-3 rounded-lg flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Esta ação afetará imediatamente as permissões do usuário no sistema.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={updating}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!selectedRole || updating || selectedRole === profile.role}
          >
            <Shield className="h-4 w-4 mr-2" />
            {updating ? 'Salvando...' : 'Salvar Role'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
