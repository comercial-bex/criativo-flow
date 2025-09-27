import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, AlertCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function PendingApprovalPage() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <CardTitle className="text-xl">Aguardando Aprovação</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4 text-center">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-yellow-600 bg-yellow-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Seu perfil está sendo analisado
              </span>
            </div>
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              Seu cadastro foi realizado com sucesso e está sendo analisado pela nossa equipe.
            </p>
            <p>
              Você receberá uma notificação por email assim que sua conta for aprovada.
            </p>
          </div>

          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Mail className="w-3 h-3" />
              <span>Verifique sua caixa de entrada regularmente</span>
            </div>
            
            <div className="pt-2">
              <Button
                variant="outline"
                onClick={signOut}
                className="w-full"
              >
                Fazer Logout
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Dúvidas? Entre em contato com nossa equipe de suporte
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}