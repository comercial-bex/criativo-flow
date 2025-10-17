import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { smartToast } from '@/lib/smart-toast';
import { Loader2, CheckCircle, XCircle, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';

interface IntelligenceSource {
  id: string;
  name: string;
  type: string;
  endpoint_url: string;
  is_active: boolean;
  requires_auth: boolean;
  auth_key_env: string | null;
  ttl_minutes: number;
  last_success_at?: string;
  last_error_message?: string;
  error_count?: number;
}

interface IntelligenceSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IntelligenceSettingsDialog({ open, onOpenChange }: IntelligenceSettingsDialogProps) {
  const [sources, setSources] = useState<IntelligenceSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchSources();
    }
  }, [open]);

  const fetchSources = async () => {
    try {
      const { data, error } = await supabase
        .from('intelligence_sources')
        .select(`
          *,
          connector_status!connector_status_connector_name_fkey(
            last_success_at,
            last_error_message,
            error_count
          )
        `)
        .order('name');

      if (error) throw error;

      const sourcesWithStatus = (data || []).map((source: any) => ({
        ...source,
        last_success_at: source.connector_status?.[0]?.last_success_at,
        last_error_message: source.connector_status?.[0]?.last_error_message,
        error_count: source.connector_status?.[0]?.error_count || 0,
      }));
      
      setSources(sourcesWithStatus);
    } catch (error) {
      console.error('Error fetching sources:', error);
      smartToast.error("Erro ao carregar fontes", "Não foi possível carregar as fontes de inteligência");
    } finally {
      setLoading(false);
    }
  };

  const toggleSource = async (sourceId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('intelligence_sources')
        .update({ is_active: !currentState })
        .eq('id', sourceId);

      if (error) throw error;

      setSources(prev => prev.map(s => 
        s.id === sourceId ? { ...s, is_active: !currentState } : s
      ));

      smartToast.success("Fonte atualizada", `Fonte ${!currentState ? 'ativada' : 'desativada'} com sucesso`);
    } catch (error) {
      console.error('Error toggling source:', error);
      smartToast.error("Erro ao atualizar fonte");
    }
  };

  const testConnection = async (sourceId: string) => {
    setTesting(sourceId);
    try {
      const { data, error } = await supabase.functions.invoke('intelligence-collector', {
        body: { source_id: sourceId, test_mode: true }
      });

      if (error) throw error;

      const result = data.results?.[0];
      if (result?.success) {
        smartToast.success("Conexão bem-sucedida", `${result.collected || 0} itens encontrados`);
      } else {
        throw new Error(result?.error || 'Teste falhou');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      smartToast.error("Teste falhou", error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setTesting(null);
    }
  };

  const getStatusIcon = (source: IntelligenceSource) => {
    if (!source.is_active) {
      return <XCircle className="h-4 w-4 text-gray-400" />;
    }
    if (source.error_count && source.error_count > 0) {
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
    if (source.last_success_at) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  const getSetupInstructions = (source: IntelligenceSource) => {
    if (!source.requires_auth || !source.auth_key_env) return null;

    const instructions: Record<string, { url: string; steps: string[] }> = {
      'OPENWEATHER_API_KEY': {
        url: 'https://openweathermap.org/api',
        steps: [
          '1. Criar conta gratuita no OpenWeather',
          '2. Acessar "API Keys" no painel',
          '3. Copiar a API Key padrão ou criar nova',
          '4. Adicionar no Supabase Secrets com nome: OPENWEATHER_API_KEY'
        ]
      },
      'YOUTUBE_API_KEY': {
        url: 'https://console.cloud.google.com/',
        steps: [
          '1. Criar projeto no Google Cloud Console',
          '2. Habilitar "YouTube Data API v3"',
          '3. Criar credencial tipo "API Key"',
          '4. Adicionar no Supabase Secrets com nome: YOUTUBE_API_KEY'
        ]
      }
    };

    return instructions[source.auth_key_env];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Configurações de Inteligência</DialogTitle>
          <DialogDescription>
            Gerencie fontes de dados e conectores de inteligência
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {sources.map((source) => {
                const setupInfo = getSetupInstructions(source);
                
                return (
                  <div key={source.id} className="border rounded-lg p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(source)}
                        <div>
                          <h3 className="font-medium">{source.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            Tipo: {source.type} | TTL: {source.ttl_minutes}min
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={source.is_active}
                          onCheckedChange={() => toggleSource(source.id, source.is_active)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {source.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>

                    {/* Status Info */}
                    {source.is_active && (
                      <div className="flex items-center gap-4 text-xs">
                        {source.last_success_at && (
                          <Badge variant="outline" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Último sucesso: {new Date(source.last_success_at).toLocaleString('pt-BR')}
                          </Badge>
                        )}
                        {source.error_count && source.error_count > 0 && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {source.error_count} erro(s)
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Error Message */}
                    {source.last_error_message && source.is_active && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded p-2 text-xs">
                        <p className="font-medium text-destructive">Último erro:</p>
                        <p className="text-muted-foreground mt-1">{source.last_error_message}</p>
                      </div>
                    )}

                    {/* Auth Required Warning */}
                    {source.requires_auth && setupInfo && (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <p className="font-medium text-sm">Autenticação Necessária</p>
                        </div>
                        <div className="text-xs space-y-1 ml-6">
                          {setupInfo.steps.map((step, idx) => (
                            <p key={idx} className="text-muted-foreground">{step}</p>
                          ))}
                          <Button
                            size="sm"
                            variant="link"
                            className="h-auto p-0 text-xs"
                            asChild
                          >
                            <a href={setupInfo.url} target="_blank" rel="noopener noreferrer">
                              Abrir documentação <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Endpoint */}
                    <div className="space-y-1">
                      <Label className="text-xs">Endpoint</Label>
                      <Input
                        value={source.endpoint_url}
                        readOnly
                        className="text-xs font-mono"
                      />
                    </div>

                    {/* Test Connection */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testConnection(source.id)}
                      disabled={!source.is_active || testing === source.id}
                      className="w-full"
                    >
                      {testing === source.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Testando...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Testar Conexão
                        </>
                      )}
                    </Button>

                    {sources.indexOf(source) < sources.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={fetchSources}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Recarregar
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
