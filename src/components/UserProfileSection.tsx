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
import bexLogo from "@/assets/logo_bex_verde.png";

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
    <div className="p-6 border-b border-sidebar-border animate-fade-in">
      {/* Logo BEX */}
      <div className="flex justify-center mb-6">
        <img 
          src={bexLogo} 
          alt="BEX Logo" 
          className="h-12 w-auto hover-lift"
        />
      </div>

      {/* Avatar Centralizado e Maior */}
      <div className="flex flex-col items-center mb-6">
        <Avatar className="w-20 h-20 border-2 border-bex-green hover-lift mb-3">
          <AvatarImage src={profile.avatar_url} alt={displayName} />
          <AvatarFallback className="bg-bex-green text-white font-bold text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-bex-green mb-1">
            Olá, {displayName.split(' ')[0]}
          </h3>
          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
            {user.email}
          </p>
        </div>
      </div>

      {/* Menu de Ações Compacto */}
      <div className="space-y-2">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/perfil')}
          className="w-full justify-start text-sidebar-foreground hover:bg-bex-green/10 hover:text-bex-green transition-all duration-200 hover-lift"
        >
          <User className="h-4 w-4 mr-2" />
          <span className="text-sm">Meu Perfil</span>
        </Button>
        
        <Button 
          variant="ghost" 
          onClick={() => navigate('/configuracoes')}
          className="w-full justify-start text-sidebar-foreground hover:bg-bex-green/10 hover:text-bex-green transition-all duration-200 hover-lift"
        >
          <Settings className="h-4 w-4 mr-2" />
          <span className="text-sm">Configurações</span>
        </Button>
        
        <Button 
          variant="ghost" 
          onClick={handleSignOut} 
          disabled={isSigningOut}
          className="w-full justify-start text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 hover-lift"
        >
          {isSigningOut ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4 mr-2" />
          )}
          <span className="text-sm">{isSigningOut ? 'Saindo...' : 'Sair'}</span>
        </Button>
      </div>
    </div>
  );
}