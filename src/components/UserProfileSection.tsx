import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useProfileData } from "@/hooks/useProfileData";
import { useEffect, useState } from "react";
import bexLogo from "@/assets/logo_bex_verde.png";

export function UserProfileSection() {
  const { user } = useAuth();
  const { getProfileById } = useProfileData();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user?.id) {
      getProfileById(user.id).then(setProfile);
    }
  }, [user?.id, getProfileById]);


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

    </div>
  );
}