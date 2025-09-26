import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";

export default function Unauthorized() {
  const navigate = useNavigate();
  const { getDefaultRoute } = usePermissions();

  const handleGoHome = () => {
    const defaultRoute = getDefaultRoute();
    navigate(defaultRoute);
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
          <div className="flex flex-col gap-2 pt-4">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}