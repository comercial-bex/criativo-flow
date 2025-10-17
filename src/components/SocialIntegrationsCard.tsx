import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Facebook, Mail, Instagram, AlertCircle, BarChart3, TrendingUp } from "lucide-react";
import { useSocialIntegrations } from "@/hooks/useSocialIntegrations";
import { useSocialAuth } from "@/hooks/useSocialAuth";
import { useClientContext } from "@/hooks/useClientContext";
import { OAuthStatusIndicator } from "@/components/OAuthStatusIndicator";
import { IntegrationMetricsDialog } from "@/components/SocialIntegrations/IntegrationMetricsDialog";
import { SocialConnectionWizard } from "@/components/SocialConnectionWizard";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  
  const { 
    integrations, 
    loading, 
    disconnectIntegration, 
    hasIntegration,
    getIntegrationsByProvider 
  } = useSocialIntegrations(targetClienteId);
  
  const { connectSocialAccount, loading: connectLoading } = useSocialAuth();
  const [metricsDialogOpen, setMetricsDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<{
    id: string;
    accountName: string;
    provider: string;
  } | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardProvider, setWizardProvider] = useState<'facebook' | 'instagram' | 'google' | null>(null);

  // Auto-reabrir wizard após OAuth callback
  useEffect(() => {
    const shouldReopen = localStorage.getItem('reopen_social_wizard');
    const savedProvider = localStorage.getItem('wizard_provider');
    
    if (shouldReopen === 'true' && savedProvider) {
      setWizardProvider(savedProvider as 'facebook' | 'instagram' | 'google');
      setWizardOpen(true);
      
      // Limpar flags
      localStorage.removeItem('reopen_social_wizard');
      localStorage.removeItem('wizard_provider');
    }
  }, []);

  const availableProviders = ['facebook', 'google', 'instagram'] as const;

  const handleViewMetrics = (integration: any) => {
    setSelectedIntegration({
      id: integration.id,
      accountName: integration.account_name || integration.provider_user_id,
      provider: integration.provider,
    });
    setMetricsDialogOpen(true);
  };

  const handleViewFullAnalytics = () => {
    if (targetClienteId) {
      navigate(`/clientes/${targetClienteId}/social-analytics`);
    }
  };

  const handleConfigureProvider = (provider: string) => {
    const supabaseUrl = `https://supabase.com/dashboard/project/xvpqgwbktpfodbuhwqhh/auth/providers`;
    window.open(supabaseUrl, '_blank');
  };

  const handleConnect = (provider: 'facebook' | 'google' | 'instagram') => {
    setWizardProvider(provider);
    setWizardOpen(true);
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
        <div className="flex items-center justify-between">
          <div>
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
          </div>
          {integrations.length > 0 && (
            <Button onClick={handleViewFullAnalytics} variant="outline" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Análise Completa
            </Button>
          )}
        </div>
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
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">
                              {providerLabels[integration.provider as keyof typeof providerLabels]}
                            </p>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Ativo
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-foreground">
                            {integration.account_name || 'Sem nome'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ID: {integration.account_id}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            User ID: {integration.provider_user_id}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewMetrics(integration)}
                          className="gap-2"
                        >
                          <BarChart3 className="h-4 w-4" />
                          Ver Métricas
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => disconnectIntegration(integration.id)}
                          className="text-destructive hover:text-destructive"
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
                      onClick={() => handleConnect(provider)}
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

      {/* Metrics Dialog */}
      {selectedIntegration && (
        <IntegrationMetricsDialog
          integrationId={selectedIntegration.id}
          accountName={selectedIntegration.accountName}
          provider={selectedIntegration.provider}
          open={metricsDialogOpen}
          onOpenChange={setMetricsDialogOpen}
        />
      )}

      {/* Social Connection Wizard */}
      <SocialConnectionWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        clienteId={targetClienteId}
      />
    </Card>
  );
}