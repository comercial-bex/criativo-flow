import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertTriangle, Shield, Database } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Tipos customizados para logs (tabelas podem não estar nos tipos gerados)
interface SensitiveAccessLog {
  id: string;
  table_name: string;
  action: string;
  user_agent?: string;
  ip_address?: string;
  success: boolean;
  timestamp: string;
}

export default function AdminLogs() {
  const { data: rlsErrors, isLoading: loadingRLS } = useQuery({
    queryKey: ['admin-rls-errors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rls_errors_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: sensitiveAccess, isLoading: loadingSensitive } = useQuery<SensitiveAccessLog[]>({
    queryKey: ['admin-sensitive-access'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_sensitive_access' as any)
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return (data || []) as any as SensitiveAccessLog[];
    }
  });

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Logs do Sistema</h1>
        </div>

        <Tabs defaultValue="rls" className="w-full">
          <TabsList>
            <TabsTrigger value="rls" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Erros RLS
            </TabsTrigger>
            <TabsTrigger value="sensitive" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Acessos Sensíveis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rls">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Erros de Row Level Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingRLS ? (
                  <p>Carregando logs...</p>
                ) : (
                  <div className="space-y-4">
                    {rlsErrors?.map((log) => (
                      <div key={log.id} className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-destructive">{log.table_name} - {log.operation}</p>
                            <p className="text-sm mt-1">{log.error_message}</p>
                            {log.error_code && (
                              <span className="text-xs text-muted-foreground">Código: {log.error_code}</span>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sensitive">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Auditoria de Acessos Sensíveis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSensitive ? (
                  <p>Carregando logs...</p>
                ) : (
                  <div className="space-y-4">
                    {sensitiveAccess?.map((log) => (
                      <div key={log.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{log.table_name} - {log.action}</p>
                            <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                              {log.user_agent && <span>Navegador: {String(log.user_agent)}</span>}
                              {log.ip_address && <span>IP: {String(log.ip_address)}</span>}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-2 py-1 text-xs rounded ${log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {log.success ? 'Sucesso' : 'Falha'}
                            </span>
                            <p className="text-sm text-muted-foreground mt-1">
                              {format(new Date(log.timestamp), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
