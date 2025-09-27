import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadgeEspecialista } from "./StatusBadgeEspecialista";
import { CheckCircle, XCircle, Pause, Clock, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EspecialistaApprovalCardProps {
  especialista: {
    id: string;
    nome: string;
    email?: string;
    telefone?: string;
    especialidade?: string;
    avatar_url?: string;
    status: 'pendente_aprovacao' | 'aprovado' | 'rejeitado' | 'suspenso';
    created_at?: string;
    observacoes_aprovacao?: string;
    data_aprovacao?: string;
  };
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onSuspend: (id: string) => void;
  isLoading?: boolean;
}

const especialidadeLabels = {
  'grs': 'Gestão de Redes Sociais',
  'design': 'Design',
  'audiovisual': 'Audiovisual',
  'atendimento': 'Atendimento',
  'financeiro': 'Financeiro',
  'gestor': 'Gestor'
};

export function EspecialistaApprovalCard({ 
  especialista, 
  onApprove, 
  onReject, 
  onSuspend,
  isLoading = false 
}: EspecialistaApprovalCardProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={especialista.avatar_url} alt={especialista.nome} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(especialista.nome)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{especialista.nome}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadgeEspecialista status={especialista.status} />
                {especialista.especialidade && (
                  <Badge variant="outline" className="text-xs">
                    {especialidadeLabels[especialista.especialidade as keyof typeof especialidadeLabels] || especialista.especialidade}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {especialista.status === 'pendente_aprovacao' && (
            <div className="flex items-center gap-1 text-yellow-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Aguardando</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Informações de contato */}
        <div className="space-y-2">
          {especialista.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>{especialista.email}</span>
            </div>
          )}
          {especialista.telefone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>{especialista.telefone}</span>
            </div>
          )}
        </div>

        {/* Data de cadastro */}
        {especialista.created_at && (
          <div className="text-sm text-muted-foreground">
            Cadastrado em: {formatDate(especialista.created_at)}
          </div>
        )}

        {/* Observações da aprovação */}
        {especialista.observacoes_aprovacao && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium text-muted-foreground mb-1">Observações:</p>
            <p className="text-sm">{especialista.observacoes_aprovacao}</p>
            {especialista.data_aprovacao && (
              <p className="text-xs text-muted-foreground mt-1">
                {formatDate(especialista.data_aprovacao)}
              </p>
            )}
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex gap-2 pt-2">
          {especialista.status === 'pendente_aprovacao' && (
            <>
              <Button
                size="sm"
                onClick={() => onApprove(especialista.id)}
                disabled={isLoading}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Aprovar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onReject(especialista.id)}
                disabled={isLoading}
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Rejeitar
              </Button>
            </>
          )}
          
          {especialista.status === 'aprovado' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSuspend(especialista.id)}
              disabled={isLoading}
              className="flex-1"
            >
              <Pause className="w-4 h-4 mr-1" />
              Suspender
            </Button>
          )}

          {especialista.status === 'rejeitado' && (
            <Button
              size="sm"
              onClick={() => onApprove(especialista.id)}
              disabled={isLoading}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Aprovar
            </Button>
          )}

          {especialista.status === 'suspenso' && (
            <Button
              size="sm"
              onClick={() => onApprove(especialista.id)}
              disabled={isLoading}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Reativar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}