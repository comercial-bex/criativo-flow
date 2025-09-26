import { User, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export function UserActionsModule() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      navigate("/auth");
      toast({
        title: "Sucesso",
        description: "Logout realizado com sucesso",
      });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast({
        title: "Erro",
        description: "Erro ao fazer logout",
        variant: "destructive",
      });
    } finally {
      setSigningOut(false);
    }
  };

  const userActions = [
    {
      icon: User,
      label: "Meu Perfil",
      onClick: () => navigate("/perfil"),
      variant: "ghost" as const,
    },
    {
      icon: Settings,
      label: "Configurações",
      onClick: () => navigate("/configuracoes"),
      variant: "ghost" as const,
    },
    {
      icon: LogOut,
      label: "Sair",
      onClick: handleSignOut,
      variant: "destructive" as const,
      loading: signingOut,
    },
  ];

  return (
    <div className="p-4 space-y-2 border-t border-bex-green/20">
      <div className="text-xs text-sidebar-foreground/70 mb-3 font-medium">
        Conta
      </div>
      {userActions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.label}
            variant={action.variant}
            size="sm"
            onClick={action.onClick}
            disabled={action.loading}
            className={`w-full justify-start gap-3 h-9 ${
              action.variant === "ghost"
                ? "text-sidebar-foreground hover:text-bex-green hover:bg-bex-green/10"
                : "hover:bg-destructive/10"
            }`}
          >
            <Icon className="h-4 w-4" />
            {action.loading ? "Saindo..." : action.label}
          </Button>
        );
      })}
    </div>
  );
}