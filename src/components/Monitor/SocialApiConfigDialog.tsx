import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Key, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { smartToast } from '@/lib/smart-toast';
import { supabase } from '@/integrations/supabase/client';

interface SocialApiConfigDialogProps {
  connection: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveConfig?: (connectionId: string, config: Record<string, any>) => Promise<void>;
  isSaving?: boolean;
}

export function SocialApiConfigDialog({
  connection,
  open,
  onOpenChange,
  onSaveConfig,
  isSaving
}: SocialApiConfigDialogProps) {
  const [activeTab, setActiveTab] = useState('oauth');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const provider = connection?.config?.provider || '';
  const scopes = connection?.config?.scopes || [];
  const docsUrl = connection?.config?.docs_url || '';

  const handleAddSecret = async (secretName: string) => {
    // Trigger Supabase secrets UI (this would need backend implementation)
    smartToast.info('Configure no Supabase Dashboard', 'Secrets > Add Secret: ' + secretName);
  };

  const handleTestCredentials = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('test-social-api', {
        body: { connection_id: connection.id, provider }
      });

      if (error) throw error;

      setTestResult({
        success: data.success,
        message: data.message || 'Teste concluído'
      });

      if (data.success) {
        smartToast.success('Credenciais válidas', data.message);
      } else {
        smartToast.error('Teste falhou', data.message);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Erro ao testar credenciais'
      });
      smartToast.error('Erro no teste', err.message);
    } finally {
      setIsTesting(false);
    }
  };

  const getSecretNames = () => {
    switch (provider) {
      case 'facebook':
        return ['META_APP_ID', 'META_APP_SECRET'];
      case 'instagram':
        return ['INSTAGRAM_APP_ID', 'INSTAGRAM_APP_SECRET'];
      case 'google_analytics':
        return ['GA4_MEASUREMENT_ID', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];
      default:
        return [];
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Configurar {connection?.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="oauth">OAuth Setup</TabsTrigger>
            <TabsTrigger value="secrets">API Keys</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
          </TabsList>

          {/* Aba OAuth Setup */}
          <TabsContent value="oauth" className="space-y-4">
            <div className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-3">
              <h3 className="font-semibold text-sm">Configuração OAuth</h3>
              <p className="text-sm text-muted-foreground">
                Configure as credenciais OAuth no Supabase Dashboard para permitir autenticação de usuários.
              </p>

              <div className="space-y-2">
                <Label>Scopes Necessários</Label>
                <div className="flex flex-wrap gap-2">
                  {scopes.map((scope: string) => (
                    <Badge key={scope} variant="secondary" className="text-xs">
                      {scope}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => window.open('https://supabase.com/dashboard/project/' + connection.id + '/auth/providers', '_blank')}
                >
                  <span>Abrir Painel Supabase Auth</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>

                {docsUrl && (
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-xs"
                    onClick={() => window.open(docsUrl, '_blank')}
                  >
                    <span>Documentação da API</span>
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Aba API Keys */}
          <TabsContent value="secrets" className="space-y-4">
            <div className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-4">
              <h3 className="font-semibold text-sm">Secrets Necessários</h3>
              <p className="text-sm text-muted-foreground">
                Configure os secrets no Supabase para armazenar credenciais de forma segura.
              </p>

              <div className="space-y-2">
                {getSecretNames().map((secretName) => (
                  <div key={secretName} className="flex items-center justify-between p-3 rounded-lg border border-border/30">
                    <div>
                      <p className="font-mono text-sm font-medium">{secretName}</p>
                      <p className="text-xs text-muted-foreground">Armazenado no Supabase Vault</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddSecret(secretName)}
                    >
                      <Key className="w-3 h-3 mr-2" />
                      Configurar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Aba Status */}
          <TabsContent value="status" className="space-y-4">
            <div className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-4">
              <h3 className="font-semibold text-sm">Teste de Conexão</h3>
              
              <Button
                className="w-full"
                onClick={handleTestCredentials}
                disabled={isTesting}
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testando...
                  </>
                ) : (
                  'Testar Credenciais'
                )}
              </Button>

              {testResult && (
                <div className={`p-4 rounded-lg flex items-start gap-3 ${
                  testResult.success 
                    ? 'bg-success/10 border border-success/20' 
                    : 'bg-destructive/10 border border-destructive/20'
                }`}>
                  {testResult.success ? (
                    <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {testResult.success ? 'Sucesso' : 'Erro'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {testResult.message}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-4 border-t border-border/50">
                <Label>Status Atual</Label>
                <Badge variant={connection?.status === 'connected' ? 'default' : 'secondary'}>
                  {connection?.status || 'Desconhecido'}
                </Badge>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
