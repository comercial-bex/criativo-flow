import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Facebook, Mail, Instagram, AlertCircle } from "lucide-react";
import { useSocialIntegrations } from "@/hooks/useSocialIntegrations";
import { useSocialAuth } from "@/hooks/useSocialAuth";
import { OAuthStatusIndicator } from "@/components/OAuthStatusIndicator";

const providerIcons = {
  facebook: Facebook,
  google: Mail,
  instagram: Instagram,
};

const providerLabels = {
  facebook: 'Facebook',
  google: 'Google Meu Negócio',
  instagram: 'Instagram',
  tiktok: 'TikTok'
};

export function SocialIntegrationsCard() {
  const { integrations, loading, disconnectIntegration, hasIntegration } = useSocialIntegrations();
  const { connectSocialAccount, loading: connectLoading } = useSocialAuth();

  const availableProviders = ['facebook', 'google', 'instagram'] as const;

  const handleConfigureProvider = (provider: string) => {
    const supabaseUrl = `https://supabase.com/dashboard/project/${import.meta.env.VITE_SUPABASE_PROJECT_ID || 'xvpqgwbktpfodbuhwqhh'}/auth/providers`;
    window.open(supabaseUrl, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Integrações de Redes Sociais
        </CardTitle>
        <CardDescription>
          Conecte suas contas sociais para automatizar coleta de dados e agendamento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status de Configuração OAuth */}
        <div className="space-y-2">
          <OAuthStatusIndicator 
            provider="Facebook"
            isConfigured={false} // TODO: Implementar verificação real
            onConfigureClick={() => handleConfigureProvider('facebook')}
          />
          <OAuthStatusIndicator 
            provider="Instagram"
            isConfigured={false} // TODO: Implementar verificação real 
            onConfigureClick={() => handleConfigureProvider('instagram')}
          />
          <OAuthStatusIndicator 
            provider="Google"
            isConfigured={false} // TODO: Implementar verificação real
            onConfigureClick={() => handleConfigureProvider('google')}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Integrações Conectadas */}
            {integrations.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">
                  Contas Conectadas
                </h4>
                {integrations.map((integration) => {
                  const Icon = providerIcons[integration.provider as keyof typeof providerIcons];
                  return (
                    <div
                      key={integration.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {Icon && <Icon className="h-5 w-5" />}
                        <div>
                          <p className="font-medium">
                            {providerLabels[integration.provider as keyof typeof providerLabels]}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {integration.account_name || integration.provider_user_id}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Conectado
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => disconnectIntegration(integration.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Desconectar
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Botões para Conectar */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                Conectar Novas Contas
              </h4>
              {availableProviders.map((provider) => {
                const isConnected = hasIntegration(provider);
                const Icon = providerIcons[provider];
                
                if (isConnected) return null;

                return (
                  <Button
                    key={provider}
                    variant="outline"
                    className="w-full flex items-center gap-3 justify-start"
                    onClick={() => connectSocialAccount(provider)}
                    disabled={connectLoading}
                  >
                    <Icon className="h-5 w-5" />
                    {connectLoading ? 'Conectando...' : `Conectar ${providerLabels[provider]}`}
                  </Button>
                );
              })}
            </div>

            {integrations.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma conta social conectada</p>
                <p className="text-sm">
                  Conecte suas redes sociais para começar a coletar dados automaticamente
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}