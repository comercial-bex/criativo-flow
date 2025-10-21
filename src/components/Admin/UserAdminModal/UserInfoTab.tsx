import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Mail, Phone, CreditCard, Building2, Shield, Clock } from 'lucide-react';
import { AdminUser } from './index';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserInfoTabProps {
  user: AdminUser;
}

export function UserInfoTab({ user }: UserInfoTabProps) {
  const formatDate = (date?: string) => {
    if (!date) return 'Não disponível';
    try {
      return format(new Date(date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </div>
              <p className="font-medium">{user.email}</p>
            </div>

            {user.telefone && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>Telefone</span>
                </div>
                <p className="font-medium">{user.telefone}</p>
              </div>
            )}

            {user.cpf && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  <span>CPF</span>
                </div>
                <p className="font-medium">{user.cpf}</p>
              </div>
            )}

            {(user.empresa || user.clientes?.nome) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>Empresa/Cliente</span>
                </div>
                <p className="font-medium">{user.empresa || user.clientes?.nome}</p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Data de Cadastro</span>
              </div>
              <p className="font-medium text-sm">{formatDate(user.created_at)}</p>
            </div>

            {user.last_sign_in_at && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Último Acesso</span>
                </div>
                <p className="font-medium text-sm">{formatDate(user.last_sign_in_at)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {user.papeis && user.papeis.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Papéis Atribuídos</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {user.papeis.map((papel) => (
                  <Badge key={papel} variant="outline">
                    {papel}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
