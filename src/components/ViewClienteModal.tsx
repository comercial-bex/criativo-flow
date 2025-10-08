import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Building2, Mail, Phone, Calendar, Shield, Activity, FileText, Clock } from 'lucide-react';
import { useClienteMetrics } from '@/hooks/useClienteMetrics';
import { Skeleton } from '@/components/ui/skeleton';

interface ViewClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: any;
}

const roleLabels = {
  'proprietario': 'Proprietário',
  'colaborador': 'Colaborador',
  'visualizador': 'Visualizador'
};

export function ViewClienteModal({ isOpen, onClose, cliente }: ViewClienteModalProps) {
  const { data: metrics, isLoading } = useClienteMetrics(cliente?.cliente_id, cliente?.id);

  if (!cliente) return null;

  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (date: string | null) => {
    if (!date) return 'Sem interações recentes';
    return new Date(date).toLocaleString('pt-BR');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Building2 className="w-5 h-5" />
            Detalhes do Cliente
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header com Avatar e Info Básica */}
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                {getInitials(cliente.nome)}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{cliente.nome}</h3>
                {metrics?.empresa && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Building2 className="w-3 h-3" />
                    {metrics.empresa.nome}
                  </p>
                )}
              </div>
            </div>
            <Badge variant={cliente.status === 'aprovado' ? 'default' : 'secondary'}>
              {cliente.status === 'aprovado' ? 'Ativo' : cliente.status}
            </Badge>
          </div>

          {/* Informações de Contato */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase text-muted-foreground">Informações de Contato</h4>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">E-mail</p>
                  <p className="text-sm text-muted-foreground">{cliente.email || 'Não informado'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Telefone</p>
                  <p className="text-sm text-muted-foreground">{cliente.telefone || 'Não informado'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Data de Cadastro</p>
                  <p className="text-sm text-muted-foreground">
                    {cliente.created_at ? formatDate(cliente.created_at) : 'Não disponível'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Permissões no Sistema */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase text-muted-foreground flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Permissões no Sistema
            </h4>
            
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : metrics?.permissoes ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Função</p>
                  <Badge variant="outline" className="mt-1">
                    {roleLabels[metrics.permissoes.role_cliente as keyof typeof roleLabels] || metrics.permissoes.role_cliente}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {metrics.permissoes.permissoes && Object.entries(metrics.permissoes.permissoes).map(([key, value]: [string, any]) => (
                    <div key={key} className="text-xs">
                      <span className="font-medium capitalize">{key}:</span>
                      {typeof value === 'object' ? (
                        <div className="ml-2 text-muted-foreground">
                          {Object.entries(value).map(([action, enabled]: [string, any]) => (
                            enabled && <div key={action}>• {action}</div>
                          ))}
                        </div>
                      ) : (
                        <span className="ml-1 text-muted-foreground">{value ? 'Sim' : 'Não'}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Permissões não configuradas</p>
            )}
          </div>

          {/* Métricas de Relacionamento */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Métricas de Relacionamento
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
                  <FileText className="w-5 h-5 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold">{metrics?.projetosAtivos || 0}</p>
                  <p className="text-xs text-muted-foreground">Projetos Ativos</p>
                </div>
                
                <div className="p-4 bg-muted rounded-lg text-center">
                  <Shield className="w-5 h-5 mx-auto mb-2 text-orange-600" />
                  <p className="text-2xl font-bold">{metrics?.solicitacoesPendentes || 0}</p>
                  <p className="text-xs text-muted-foreground">Aprovações Pendentes</p>
                </div>
                
                <div className="p-4 bg-muted rounded-lg text-center">
                  <Clock className="w-5 h-5 mx-auto mb-2 text-green-600" />
                  <p className="text-xs font-medium">Última Interação</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDateTime(metrics?.ultimaInteracao || null)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Dados da Empresa */}
          {metrics?.empresa && (
            <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Empresa Vinculada
              </h4>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Nome:</span> {metrics.empresa.nome}</p>
                {metrics.empresa.cnpj_cpf && (
                  <p><span className="font-medium">CNPJ/CPF:</span> {metrics.empresa.cnpj_cpf}</p>
                )}
                <p>
                  <span className="font-medium">Status:</span>{' '}
                  <Badge variant={metrics.empresa.status === 'ativo' ? 'default' : 'secondary'} className="ml-2">
                    {metrics.empresa.status}
                  </Badge>
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
