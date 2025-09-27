import { ReactNode } from 'react';
import { useAccessControl } from '@/hooks/useAccessControl';
import { PendingApprovalPage } from './PendingApprovalPage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { XCircle, Ban } from 'lucide-react';

interface AccessControlWrapperProps {
  children: ReactNode;
}

export function AccessControlWrapper({ children }: AccessControlWrapperProps) {
  const { canAccess, isBlocked, isPending, loading, userProfile } = useAccessControl();
  const { signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-48"></div>
          <div className="h-4 bg-muted rounded w-32"></div>
        </div>
      </div>
    );
  }

  // Se está pendente de aprovação
  if (isPending) {
    return <PendingApprovalPage />;
  }

  // Se foi rejeitado ou suspenso
  if (isBlocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              {userProfile?.status === 'rejeitado' ? (
                <XCircle className="w-8 h-8 text-red-600" />
              ) : (
                <Ban className="w-8 h-8 text-red-600" />
              )}
            </div>
            <CardTitle className="text-xl text-red-600">
              {userProfile?.status === 'rejeitado' ? 'Acesso Negado' : 'Conta Suspensa'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4 text-center">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {userProfile?.status === 'rejeitado' 
                  ? 'Seu cadastro foi rejeitado pela nossa equipe.'
                  : 'Sua conta foi suspensa temporariamente.'
                }
              </p>
              
              {userProfile?.observacoes_aprovacao && (
                <div className="p-3 bg-red-50 rounded-lg text-left">
                  <p className="text-sm font-medium text-red-600 mb-1">Motivo:</p>
                  <p className="text-sm text-red-700">{userProfile.observacoes_aprovacao}</p>
                </div>
              )}
            </div>

            <div className="pt-4 space-y-3">
              <p className="text-xs text-muted-foreground">
                Entre em contato com nossa equipe de suporte para mais informações
              </p>
              
              <Button
                variant="outline"
                onClick={signOut}
                className="w-full"
              >
                Fazer Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se tem acesso, renderiza o conteúdo
  if (canAccess) {
    return <>{children}</>;
  }

  // Fallback para casos não cobertos
  return <PendingApprovalPage />;
}