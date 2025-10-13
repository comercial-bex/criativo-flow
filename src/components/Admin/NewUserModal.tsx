import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface NewUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type EspecialidadeType = 'grs' | 'design' | 'audiovisual' | 'atendimento' | 'financeiro' | 'gestor' | 'gerente_redes_sociais';

export function NewUserModal({ open, onOpenChange, onSuccess }: NewUserModalProps) {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    especialidade: '' as EspecialidadeType | '',
    senha: Math.random().toString(36).slice(-8), // Gerar senha aleatória
  });

  const handleSubmit = async () => {
    if (!formData.nome || !formData.email || !formData.especialidade) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha nome, email e especialidade',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    try {
      // Criar usuário via edge function
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: formData.email,
          password: formData.senha,
          user_metadata: {
            nome: formData.nome,
            telefone: formData.telefone,
            especialidade: formData.especialidade,
          },
        },
      });

      if (error) throw error;

      // Atualizar perfil para status aprovado e especialidade
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          nome: formData.nome,
          telefone: formData.telefone,
          especialidade: formData.especialidade,
          status: 'aprovado',
        })
        .eq('email', formData.email);

      if (profileError) throw profileError;

      // Atribuir role automaticamente baseado na especialidade
      let role: string;
      switch (formData.especialidade) {
        case 'grs':
          role = 'grs';
          break;
        case 'design':
          role = 'designer';
          break;
        case 'audiovisual':
          role = 'filmmaker';
          break;
        case 'atendimento':
          role = 'atendimento';
          break;
        case 'financeiro':
          role = 'financeiro';
          break;
        case 'gestor':
          role = 'gestor';
          break;
        case 'gerente_redes_sociais':
          role = 'trafego';
          break;
        default:
          role = 'admin';
      }

      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{ user_id: data.user.id, role: role as any }]);

      if (roleError && !roleError.message.includes('duplicate')) {
        throw roleError;
      }

      toast({
        title: 'Usuário criado com sucesso!',
        description: `Email: ${formData.email} | Senha temporária: ${formData.senha}`,
      });

      onOpenChange(false);
      setFormData({ nome: '', email: '', telefone: '', especialidade: '', senha: '' });
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Erro ao criar usuário',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm" height="auto">
        <DialogHeader className="modal-header-gaming">
          <DialogTitle className="modal-title-gaming">Novo Usuário Interno</DialogTitle>
          <DialogDescription>Criar especialista ou colaborador do time</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div>
            <Label htmlFor="especialidade">Especialidade *</Label>
            <Select value={formData.especialidade} onValueChange={(value: any) => setFormData({ ...formData, especialidade: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grs">GRS</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="audiovisual">Audiovisual</SelectItem>
                <SelectItem value="atendimento">Atendimento</SelectItem>
                <SelectItem value="financeiro">Financeiro</SelectItem>
                <SelectItem value="gestor">Gestor</SelectItem>
                <SelectItem value="gerente_redes_sociais">Tráfego</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted p-3 rounded text-sm">
            <p className="font-medium">Senha temporária gerada:</p>
            <code className="text-primary">{formData.senha}</code>
            <p className="text-xs text-muted-foreground mt-1">Copie antes de salvar!</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isCreating}>
            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar Usuário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
