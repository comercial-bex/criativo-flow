import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Shield } from 'lucide-react';
import type { Profile } from '@/hooks/useProfileData';

interface ProfileCardProps {
  profile: Profile & { _hasFullAccess?: boolean };
  showSensitiveData?: boolean;
}

export function ProfileCard({ profile, showSensitiveData = false }: ProfileCardProps) {
  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const hasFullAccess = profile._hasFullAccess ?? false;
  const shouldShowSensitive = showSensitiveData && hasFullAccess;

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.nome} />
            <AvatarFallback className="text-lg font-semibold">
              {getInitials(profile.nome)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-xl">{profile.nome}</CardTitle>
          </div>
          {!hasFullAccess && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Shield className="h-4 w-4 mr-1" />
              Acesso limitado
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {shouldShowSensitive && profile.email ? (
            <div className="flex items-center text-sm">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{profile.email}</span>
            </div>
          ) : !hasFullAccess && (
            <div className="flex items-center text-sm text-muted-foreground italic">
              <Mail className="h-4 w-4 mr-2" />
              <span>Email protegido - acesso restrito</span>
            </div>
          )}
          
          {shouldShowSensitive && profile.telefone ? (
            <div className="flex items-center text-sm">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{profile.telefone}</span>
            </div>
          ) : !hasFullAccess && (
            <div className="flex items-center text-sm text-muted-foreground italic">
              <Phone className="h-4 w-4 mr-2" />
              <span>Telefone protegido - acesso restrito</span>
            </div>
          )}

          {!shouldShowSensitive && !hasFullAccess && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center text-sm text-muted-foreground">
                <Shield className="h-4 w-4 mr-2" />
                <span>
                  Dados pessoais protegidos. Apenas o próprio usuário e administradores podem ver informações completas.
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}