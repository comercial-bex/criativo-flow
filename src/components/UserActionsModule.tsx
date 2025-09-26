import { User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

  return (
    <TooltipProvider>
      <div className="flex flex-col items-center gap-3">
        {/* Meu Perfil Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/perfil")}
              className="h-12 w-12 p-0 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 text-black hover:text-black/80 flex items-center justify-center"
              title="Meu Perfil"
            >
              <User className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-popover text-popover-foreground">
            Meu Perfil
          </TooltipContent>
        </Tooltip>

        {/* Sair Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              disabled={signingOut}
              className="h-12 w-12 p-0 rounded-xl bg-white/5 hover:bg-red-500/20 transition-all duration-200 text-black hover:text-red-600 flex items-center justify-center"
              title={signingOut ? "Saindo..." : "Sair"}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-popover text-popover-foreground">
            {signingOut ? "Saindo..." : "Sair"}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}