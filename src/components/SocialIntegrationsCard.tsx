import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Facebook, Mail, Instagram, AlertCircle } from "lucide-react";
import { useSocialIntegrations } from "@/hooks/useSocialIntegrations";
import { useSocialAuth } from "@/hooks/useSocialAuth";
import { useClientContext } from "@/hooks/useClientContext";
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

interface SocialIntegrationsCardProps {
  clienteId?: string;
}

export function SocialIntegrationsCard({ clienteId }: SocialIntegrationsCardProps) {
  const { clienteId: contextClienteId, clienteName } = useClientContext();
  const targetClienteId = clienteId || contextClienteId;
  
  const { 
    integrations, 
    loading, 
    disconnectIntegration, 
    hasIntegration,
    getIntegrationsByProvider 
  } = useSocialIntegrations(targetClienteId);
  
  const { connectSocialAccount, loading: connectLoading } = useSocialAuth();

  const availableProviders = ['facebook', 'google', 'instagram'] as const;

  const handleConfigureProvider = (provider: string) => {
    const supabaseUrl = `https://supabase.com/dashboard/project/xvpqgwbktpfodbuhwqhh/auth/providers`;
    window.open(supabaseUrl, '_blank');
  };

  if (!targetClienteId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Integrações de Redes Sociais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Selecione um cliente para gerenciar as integrações sociais.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Integrações de Redes Sociais
          {clienteName && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              - {clienteName}
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Conecte as contas sociais do cliente para automatizar coleta de dados e agendamento
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
                  Contas Conectadas ({integrations.length})
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
                          <p className="text-xs text-muted-foreground">
                            ID: {integration.account_id}
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
                const connectedAccounts = getIntegrationsByProvider(provider);
                const Icon = providerIcons[provider];
                
                return (
                  <div 
                    key={provider}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <div>
                        <span className="font-medium">{providerLabels[provider]}</span>
                        {connectedAccounts.length > 0 && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 ml-2">
                            {connectedAccounts.length} conta(s)
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => connectSocialAccount(provider)}
                      disabled={connectLoading}
                    >
                      {connectLoading ? 'Conectando...' : (connectedAccounts.length > 0 ? 'Adicionar Conta' : 'Conectar')}
                    </Button>
                  </div>
                );
              })}
            </div>

            {integrations.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma conta social conectada para este cliente</p>
                <p className="text-sm">
                  Conecte as redes sociais do cliente para começar a coletar dados automaticamente
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}