import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Facebook, Instagram, Linkedin, AlertCircle, CheckCircle } from "lucide-react";
import { useSocialIntegrations } from "@/hooks/useSocialIntegrations";
import { useSocialAuth } from "@/hooks/useSocialAuth";

export function SocialDashboardWidget() {
  const { integrations, loading } = useSocialIntegrations();
  const { connectSocialAccount } = useSocialAuth();

  const providerIcons = {
    facebook: Facebook,
    instagram: Instagram,
    linkedin: Linkedin,
    google: Instagram
  };

  const connectedIntegrations = integrations?.filter(i => i.is_active) || [];
  const totalIntegrations = connectedIntegrations.length;

  return (
    <Card data-intro="social-integrations">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Redes Sociais</CardTitle>
        {totalIntegrations > 0 ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <AlertCircle className="h-4 w-4 text-yellow-600" />
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{totalIntegrations}</div>
              <p className="text-xs text-muted-foreground">
                {totalIntegrations === 1 ? 'Rede conectada' : 'Redes conectadas'}
              </p>
            </div>
            <div className="flex gap-1">
              {connectedIntegrations.slice(0, 3).map((integration) => {
                const Icon = providerIcons[integration.provider as keyof typeof providerIcons];
                return (
                  <div key={integration.id} className="relative">
                    <Icon className="h-6 w-6 text-primary" />
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                  </div>
                );
              })}
            </div>
          </div>
          
          {loading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          ) : totalIntegrations === 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Conecte suas redes sociais para automatizar publicações
              </p>
              <Button 
                size="sm" 
                onClick={() => connectSocialAccount('facebook')}
                data-intro="social-connect"
              >
                Conectar Agora
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {connectedIntegrations.map((integration) => (
                <div key={integration.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm capitalize">{integration.provider}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Ativo
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}