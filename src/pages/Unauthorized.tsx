import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/useAuth";

export default function Unauthorized() {
  const navigate = useNavigate();
  const { getDefaultRoute, role, loading } = usePermissions();
  const { signOut, user } = useAuth();

  const handleGoHome = () => {
    const defaultRoute = getDefaultRoute();
    console.log('🔄 Unauthorized: Going to default route:', defaultRoute);
    navigate(defaultRoute);
  };

  const handleLogout = async () => {
    console.log('🚪 Unauthorized: Logging out');
    await signOut();
    navigate('/auth');
  };

  const handleGoToLogin = () => {
    console.log('🔑 Unauthorized: Going to login');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Acesso Negado
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Você não tem permissão para acessar esta área do sistema.
          </p>
          <p className="text-sm text-muted-foreground">
            Entre em contato com o administrador se acredita que isso é um erro.
          </p>
          
          {/* Debug info for admin */}
          {role === 'admin' && (
            <div className="bg-muted/50 p-3 rounded-lg text-xs space-y-1">
              <p><strong>Debug Info:</strong></p>
              <p>User: {user?.email}</p>
              <p>Role: {role}</p>
              <p>Loading: {loading.toString()}</p>
            </div>
          )}
          
          <div className="flex flex-col gap-2 pt-4">
            {user ? (
              <>
                <Button onClick={handleGoHome} className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao Início
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate(-1)}
                  className="w-full"
                >
                  Página Anterior
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleLogout}
                  className="w-full"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Fazer Logout
                </Button>
              </>
            ) : (
              <Button onClick={handleGoToLogin} className="w-full">
                <User className="w-4 h-4 mr-2" />
                Fazer Login
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}