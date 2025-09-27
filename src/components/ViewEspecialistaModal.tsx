import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { StatusBadgeEspecialista } from '@/components/StatusBadgeEspecialista';
import { User, Mail, Phone, Calendar, CheckCircle, UserCheck } from 'lucide-react';

interface ViewEspecialistaModalProps {
  isOpen: boolean;
  onClose: () => void;
  especialista: any;
}

const especialidadeLabels = {
  'grs': 'Gestão de Redes Sociais',
  'designer': 'Design',
  'filmmaker': 'Audiovisual',
  'atendimento': 'Atendimento',
  'financeiro': 'Financeiro',
  'gestor': 'Gestor'
};

const roleLabels = {
  'admin': 'Administrador',
  'grs': 'GRS',
  'designer': 'Designer',
  'filmmaker': 'Audiovisual',
  'atendimento': 'Atendimento',
  'financeiro': 'Financeiro',
  'gestor': 'Gestor',
  'cliente': 'Cliente'
};

export function ViewEspecialistaModal({ isOpen, onClose, especialista }: ViewEspecialistaModalProps) {
  if (!especialista) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Detalhes do Especialista
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{especialista.nome}</h3>
              <p className="text-sm text-muted-foreground">
                {especialista.especialidade ? 
                  especialidadeLabels[especialista.especialidade as keyof typeof especialidadeLabels] || especialista.especialidade 
                  : 'Especialidade não definida'
                }
              </p>
            </div>
            <StatusBadgeEspecialista status={especialista.status || 'aprovado'} />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">E-mail</p>
                <p className="text-sm text-muted-foreground">{especialista.email || 'Não informado'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Telefone</p>
                <p className="text-sm text-muted-foreground">{especialista.telefone || 'Não informado'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <UserCheck className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Função no Sistema</p>
                <Badge variant="outline">
                  {especialista.role ? 
                    roleLabels[especialista.role as keyof typeof roleLabels] || especialista.role 
                    : 'Não definida'
                  }
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Data de Cadastro</p>
                <p className="text-sm text-muted-foreground">
                  {especialista.created_at ? 
                    new Date(especialista.created_at).toLocaleDateString('pt-BR') 
                    : 'Não disponível'
                  }
                </p>
              </div>
            </div>

            {especialista.data_aprovacao && (
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Data de Aprovação</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(especialista.data_aprovacao).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            )}

            {especialista.observacoes_aprovacao && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Observações</p>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm">{especialista.observacoes_aprovacao}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}