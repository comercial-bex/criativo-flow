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
      icon: LogOut,
      label: "Sair",
      onClick: handleSignOut,
      variant: "destructive" as const,
      loading: signingOut,
    },
  ];

  return (
    <div className="p-2 border-t border-white/10">
      <div className="text-xs text-white/60 mb-2 px-2 font-medium uppercase tracking-wide">
        Conta
      </div>
      <div className="space-y-1">
        {userActions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              variant="ghost"
              size="sm"
              onClick={action.onClick}
              disabled={action.loading}
              className={`w-full justify-start gap-2 h-8 px-2 text-sm transition-colors ${
                action.variant === "ghost"
                  ? "text-white/80 hover:text-white hover:bg-white/10"
                  : "text-white/80 hover:bg-red-500/10 hover:text-red-200"
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {action.loading ? "Saindo..." : action.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}