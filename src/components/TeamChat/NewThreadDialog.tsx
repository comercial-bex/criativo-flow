import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { useTeamChat } from '@/hooks/useTeamChat';
import { smartToast } from '@/lib/smart-toast';

interface NewThreadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onThreadCreated: (threadId: string) => void;
}

export function NewThreadDialog({ open, onOpenChange, onThreadCreated }: NewThreadDialogProps) {
  const [title, setTitle] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { createThread } = useTeamChat();

  const { data: specialists } = useQuery({
    queryKey: ['specialists-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, avatar_url')
        .order('nome');

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const handleCreate = async () => {
    if (!title.trim() || selectedUsers.length === 0) {
      smartToast.error('Preencha todos os campos', 'Digite um título e selecione ao menos 1 participante');
      return;
    }

    createThread({
      title,
      participants: selectedUsers,
      isGroup: selectedUsers.length > 1
    });

    setTitle('');
    setSelectedUsers([]);
    onOpenChange(false);
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Conversa</DialogTitle>
          <DialogDescription>
            Crie uma nova conversa 1:1 ou em grupo com sua equipe
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Título da Conversa</Label>
            <Input
              id="title"
              placeholder="Ex: Projeto Cliente X"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <Label>Participantes</Label>
            <div className="border rounded-lg p-3 max-h-[300px] overflow-y-auto space-y-2">
              {specialists?.map((user) => (
                <div key={user.id} className="flex items-center gap-2">
                  <Checkbox
                    id={user.id}
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={() => toggleUser(user.id)}
                  />
                  <Label
                    htmlFor={user.id}
                    className="flex-1 cursor-pointer flex items-center gap-2"
                  >
                    <span>{user.nome}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>
              Criar Conversa
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
