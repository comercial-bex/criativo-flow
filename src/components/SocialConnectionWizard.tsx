import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, XCircle, AlertCircle, Loader2, 
  Facebook, Instagram, Mail, ExternalLink, ChevronRight 
} from 'lucide-react';
import { useSocialAuth } from '@/hooks/useSocialAuth';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type WizardStep = 'prerequisites' | 'provider' | 'oauth' | 'accounts' | 'success';
type SocialProvider = 'facebook' | 'instagram' | 'google';

interface Prerequisite {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  required: boolean;
  helpUrl?: string;
}

interface AvailableAccount {
  id: string;
  name: string;
  username?: string;
  accountType?: string;
  isValid: boolean;
  checks?: {
    isBusiness?: boolean;
    hasFacebookPage?: boolean;
    isInBusinessManager?: boolean;
    hasAdminAccess?: boolean;
  };
  missingRequirements: string[];
  accessToken?: string;
}

interface SocialConnectionWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clienteId?: string;
}

export function SocialConnectionWizard({
  open,
  onOpenChange,
  clienteId
}: SocialConnectionWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('provider');
  const [selectedProvider, setSelectedProvider] = useState<SocialProvider | null>(null);
  const [prerequisites, setPrerequisites] = useState<Prerequisite[]>([]);
  const [availableAccounts, setAvailableAccounts] = useState<AvailableAccount[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { loading, signInWithProvider, fetchAvailableAccounts, connectMultipleAccounts } = useSocialAuth();

  // Detectar retorno do OAuth e avançar para listagem de contas
  useEffect(() => {
    const checkOAuthReturn = async () => {
      const token = sessionStorage.getItem('social_access_token');
      const provider = sessionStorage.getItem('social_provider');
      
      if (token && provider && open && currentStep === 'oauth' && selectedProvider === provider) {
        console.log('✅ Token OAuth detectado, buscando contas...');
        
        setIsValidating(true);
        try {
          const { validAccounts } = await fetchAvailableAccounts(
            selectedProvider,
            token
          );
          
          setAvailableAccounts(validAccounts);
          setCurrentStep('accounts');
        } catch (err: any) {
          console.error('❌ Erro ao buscar contas:', err);
          setError(err.message || 'Erro ao buscar contas');
        } finally {
          setIsValidating(false);
        }
      }
    };
    
    checkOAuthReturn();
  }, [open, currentStep, selectedProvider, fetchAvailableAccounts]);

  // Pré-requisitos por provider
  const getPrerequisites = (provider: SocialProvider): Prerequisite[] => {
    if (provider === 'facebook' || provider === 'instagram') {
      return [
        {
          id: 'business_account',
          label: 'Conta Comercial no Instagram',
          description: 'Sua conta do Instagram precisa ser do tipo Comercial (não Pessoal ou Criador)',
          checked: false,
          required: true,
          helpUrl: 'https://help.instagram.com/502981923235522'
        },
        {
          id: 'facebook_page',
          label: 'Página do Facebook criada e vinculada',
          description: 'É necessário ter uma Página do Facebook para cada perfil do Instagram',
          checked: false,
          required: true,
          helpUrl: 'https://www.facebook.com/pages/create'
        },
        {
          id: 'business_manager',
          label: 'Conta no Gerenciador de Negócios',
          description: 'Suas páginas e contas devem estar no Business Manager',
          checked: false,
          required: true,
          helpUrl: 'https://business.facebook.com/overview'
        },
        {
          id: 'admin_access',
          label: 'Acesso como Administrador ou Editor',
          description: 'Você precisa ter permissões de admin/editor na Página',
          checked: false,
          required: true
        }
      ];
    }
    return [];
  };

  const handleProviderSelect = (provider: SocialProvider) => {
    setSelectedProvider(provider);
    const reqs = getPrerequisites(provider);
    if (reqs.length > 0) {
      setPrerequisites(reqs);
      setCurrentStep('prerequisites');
    } else {
      setCurrentStep('oauth');
    }
  };

  const togglePrerequisite = (id: string) => {
    setPrerequisites(prev =>
      prev.map(p => p.id === id ? { ...p, checked: !p.checked } : p)
    );
  };

  const canProceedFromPrerequisites = () => {
    return prerequisites.every(p => !p.required || p.checked);
  };

  const handleOAuthStart = async () => {
    if (!selectedProvider) return;
    
    setIsValidating(true);
    try {
      setError(null);
      
      // Iniciar OAuth (redirecionará para Facebook/Google)
      await signInWithProvider(selectedProvider);
      
      // Nota: após OAuth, usuário voltará via /auth callback
      // e o useEffect acima detectará o token automaticamente
      
    } catch (err: any) {
      setError(err.message || 'Erro ao iniciar autenticação');
      toast.error('Erro ao conectar com ' + selectedProvider);
    } finally {
      setIsValidating(false);
    }
  };

  const handleConnectSelected = async () => {
    if (!selectedProvider) return;
    
    setIsValidating(true);
    try {
      const token = sessionStorage.getItem('social_access_token') || '';
      const accountsToConnect = availableAccounts
        .filter(acc => selectedAccountIds.includes(acc.id))
        .map(acc => ({
          provider: selectedProvider,
          accountId: acc.id,
          accountName: acc.name,
          accessToken: token,
          accountType: acc.accountType
        }));

      const result = await connectMultipleAccounts(accountsToConnect);
      
      if (result.success) {
        sessionStorage.removeItem('social_access_token');
        sessionStorage.removeItem('social_provider');
        setCurrentStep('success');
      } else {
        toast.error('Erro ao conectar contas');
      }
    } catch (err: any) {
      setError(err.message);
      toast.error('Erro ao conectar contas');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {currentStep === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            Conectar Redes Sociais
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* ETAPA 1: Seleção de Provider */}
        {currentStep === 'provider' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Selecione qual rede social deseja conectar:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={() => handleProviderSelect('facebook')}
              >
                <Facebook className="h-8 w-8 text-blue-600" />
                <span>Facebook</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={() => handleProviderSelect('instagram')}
              >
                <Instagram className="h-8 w-8 text-purple-600" />
                <span>Instagram</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={() => handleProviderSelect('google')}
              >
                <Mail className="h-8 w-8 text-red-600" />
                <span>Google</span>
              </Button>
            </div>
          </div>
        )}

        {/* ETAPA 2: Checklist de Pré-requisitos */}
        {currentStep === 'prerequisites' && (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Antes de conectar, certifique-se de que todos os requisitos foram atendidos:
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {prerequisites.map(prereq => (
                <div
                  key={prereq.id}
                  className={cn(
                    "flex items-start gap-3 p-4 border rounded-lg",
                    prereq.checked ? "bg-green-50 border-green-200" : "bg-background"
                  )}
                >
                  <Checkbox
                    checked={prereq.checked}
                    onCheckedChange={() => togglePrerequisite(prereq.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{prereq.label}</span>
                      {prereq.required && (
                        <span className="text-xs text-destructive">*obrigatório</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {prereq.description}
                    </p>
                    {prereq.helpUrl && (
                      <a
                        href={prereq.helpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-2"
                      >
                        Como resolver <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('provider')}
              >
                Voltar
              </Button>
              <Button
                onClick={() => setCurrentStep('oauth')}
                disabled={!canProceedFromPrerequisites()}
                className="ml-auto"
              >
                Continuar <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ETAPA 3: OAuth Login */}
        {currentStep === 'oauth' && (
          <div className="space-y-4">
            <p className="text-sm">
              Clique no botão abaixo para fazer login e autorizar a conexão:
            </p>
            <Button
              onClick={handleOAuthStart}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Fazer login com {selectedProvider === 'facebook' ? 'Facebook' : 
                              selectedProvider === 'instagram' ? 'Instagram' : 'Google'}
            </Button>
          </div>
        )}

        {/* ETAPA 4: Seleção de Contas */}
        {currentStep === 'accounts' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Selecione quais contas deseja conectar:
            </p>

            {isValidating ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {availableAccounts.map(account => (
                  <div
                    key={account.id}
                    className={cn(
                      "p-4 border rounded-lg",
                      account.isValid ? "bg-background" : "bg-muted opacity-60"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedAccountIds.includes(account.id)}
                        disabled={!account.isValid}
                        onCheckedChange={(checked) => {
                          setSelectedAccountIds(prev =>
                            checked 
                              ? [...prev, account.id]
                              : prev.filter(id => id !== account.id)
                          );
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{account.name}</span>
                          {account.username && (
                            <span className="text-sm text-muted-foreground">
                              {account.username}
                            </span>
                          )}
                          {account.isValid ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive ml-auto" />
                          )}
                        </div>
                        {!account.isValid && account.missingRequirements.length > 0 && (
                          <ul className="text-xs text-destructive mt-2 space-y-1">
                            {account.missingRequirements.map((req, i) => (
                              <li key={i}>• {req}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep('oauth')}>
                Voltar
              </Button>
              <Button
                onClick={handleConnectSelected}
                disabled={selectedAccountIds.length === 0}
                className="ml-auto"
              >
                Conectar {selectedAccountIds.length} conta(s)
              </Button>
            </div>
          </div>
        )}

        {/* ETAPA 5: Sucesso */}
        {currentStep === 'success' && (
          <div className="space-y-4 text-center py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-lg font-semibold">Conexão realizada com sucesso!</h3>
            <p className="text-sm text-muted-foreground">
              {selectedAccountIds.length} conta(s) foram conectadas e já estão disponíveis.
            </p>
            <div className="flex gap-2 justify-center pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
              <Button onClick={() => onOpenChange(false)}>
                Ver Métricas
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}