import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { StatusBadgeEspecialista } from '@/components/StatusBadgeEspecialista';
import { UserCog, Mail, Phone, Calendar, CheckCircle, UserCheck, Briefcase, CheckSquare, TrendingUp, Award } from 'lucide-react';
import { useEspecialistaMetrics } from '@/hooks/useEspecialistaMetrics';
import { Skeleton } from '@/components/ui/skeleton';

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
  const { data: metrics, isLoading } = useEspecialistaMetrics(especialista?.id);
  
  if (!especialista) return null;

  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="lg" height="xl" overflow="auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <UserCog className="w-5 h-5" />
            Detalhes do Especialista
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header com Avatar e Info Básica */}
          <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                {getInitials(especialista.nome)}
              </div>
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {especialista.nome}
                  {metrics?.isGerente && (
                    <Badge variant="secondary" className="text-xs">
                      <Award className="w-3 h-3 mr-1" />
                      Gerente
                    </Badge>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {especialista.especialidade ? 
                    especialidadeLabels[especialista.especialidade as keyof typeof especialidadeLabels] || especialista.especialidade 
                    : 'Especialidade não definida'
                  }
                </p>
              </div>
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

          {/* Métricas de Desempenho */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Desempenho Profissional
            </h4>
            
            {isLoading ? (
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <Briefcase className="w-5 h-5 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold">{metrics?.projetosAtribuidos || 0}</p>
                  <p className="text-xs text-muted-foreground">Projetos Atribuídos</p>
                </div>
                
                <div className="p-4 bg-muted rounded-lg text-center">
                  <CheckSquare className="w-5 h-5 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold">{metrics?.tarefasConcluidas || 0}</p>
                  <p className="text-xs text-muted-foreground">Tarefas Concluídas</p>
                </div>
                
                <div className="p-4 bg-muted rounded-lg text-center">
                  <TrendingUp className="w-5 h-5 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold">{metrics?.taxaConclusao || 0}%</p>
                  <p className="text-xs text-muted-foreground">Taxa de Conclusão</p>
                </div>
              </div>
            )}
            
            {metrics && metrics.totalTarefas > 0 && (
              <div className="text-xs text-muted-foreground text-center">
                {metrics.tarefasConcluidas} de {metrics.totalTarefas} tarefas concluídas
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}