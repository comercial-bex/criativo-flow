import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useProfileData } from "@/hooks/useProfileData";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Settings, LogOut, ChevronDown, Loader2 } from "lucide-react";

export function UserProfileSection() {
  const { user, signOut } = useAuth();
  const { getProfileById } = useProfileData();
  const [profile, setProfile] = useState<any>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      getProfileById(user.id).then(setProfile);
    }
  }, [user?.id, getProfileById]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  if (!user || !profile) return null;

  const displayName = profile.nome || user.email?.split('@')[0] || 'Usuário';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="p-4 border-b border-sidebar-border animate-fade-in">
      {/* Avatar e Info Principal */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="w-12 h-12 border-2 border-bex-green hover-lift">
          <AvatarImage src={profile.avatar_url} alt={displayName} />
          <AvatarFallback className="bg-bex-green text-bex-dark font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-bex-green truncate">
            Olá, {displayName.split(' ')[0]}
          </h3>
          <p className="text-xs text-sidebar-foreground/70 truncate">
            {user.email}
          </p>
        </div>
      </div>

      {/* Menu de Ações */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between text-sidebar-foreground hover:bg-sidebar-accent hover:text-bex-green transition-all duration-200 hover-lift"
          >
            <span className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="text-sm">Minha Conta</span>
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="start" 
          className="w-56 bg-sidebar-accent border-sidebar-border animate-scale-in"
        >
          <DropdownMenuItem 
            onClick={() => navigate('/perfil')}
            className="flex items-center gap-2 hover:bg-sidebar-primary/10 hover:text-bex-green cursor-pointer"
          >
            <User className="h-4 w-4" />
            <span>Meu Perfil</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => navigate('/configuracoes')}
            className="flex items-center gap-2 hover:bg-sidebar-primary/10 hover:text-bex-green cursor-pointer"
          >
            <Settings className="h-4 w-4" />
            <span>Configurações</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-sidebar-border" />
          
          <DropdownMenuItem 
            onClick={handleSignOut} 
            disabled={isSigningOut}
            className="flex items-center gap-2 hover:bg-destructive/10 hover:text-destructive cursor-pointer"
          >
            {isSigningOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            <span>{isSigningOut ? 'Saindo...' : 'Sair'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}