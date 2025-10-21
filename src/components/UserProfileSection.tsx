import { BexAvatar, BexAvatarFallback, BexAvatarImage } from "@/components/ui/bex-avatar";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import bexLogo from "@/assets/logo-bex-apk.svg";
import { supabase } from "@/integrations/supabase/client";

/**
 * ✅ MIGRADO PARA NOVA ESTRUTURA UNIFICADA
 * Utiliza tabela pessoas diretamente
 */
export function UserProfileSection() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      
      const { data: pessoa } = await supabase
        .from('pessoas')
        .select('nome, email, avatar_url')
        .eq('profile_id', user.id)
        .maybeSingle();
      
      setProfile(pessoa);
    };
    
    fetchProfile();
  }, [user?.id]);


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
        <BexAvatar className="w-20 h-20 mb-3" gaming>
          <BexAvatarImage src={profile.avatar_url} alt={displayName} />
          <BexAvatarFallback className="bg-bex text-white font-bold text-lg">
            {initials}
          </BexAvatarFallback>
        </BexAvatar>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-bex mb-1">
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