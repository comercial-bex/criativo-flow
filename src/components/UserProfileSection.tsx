import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useProfileData } from "@/hooks/useProfileData";
import { useEffect, useState } from "react";

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
    <div className="flex flex-col items-center p-6 text-white">
      <Avatar className="w-16 h-16 mb-3 border-2 border-lime-400">
        <AvatarImage src={profile.avatar_url} alt={displayName} />
        <AvatarFallback className="bg-lime-400 text-gray-900 font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <h3 className="text-lg font-medium text-lime-400 mb-1">
        Olá, {displayName.split(' ')[0]}
      </h3>
      
      <p className="text-sm text-gray-300 text-center">
        {user.email}
      </p>
    </div>
  );
}