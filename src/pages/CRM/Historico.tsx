import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, FileText, Calendar, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function CRMHistorico() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['crm-historico'],
    queryFn: async () => {
      const { data: logsData, error } = await supabase
        .from('logs_atividade')
        .select('*, clientes(nome)')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;

      // Buscar nomes de usuários de pessoas
      const logsComNomes = await Promise.all((logsData || []).map(async (log) => {
        const { data: pessoa } = await supabase
          .from('pessoas')
          .select('nome')
          .eq('profile_id', log.usuario_id)
          .maybeSingle();
        
        return {
          ...log,
          profiles: { nome: pessoa?.nome || 'Sistema' }
        };
      }));
      
      return logsComNomes;
    }
  });

  const getActionIcon = (acao: string) => {
    if (acao.includes('aprovacao') || acao.includes('contrato')) return FileText;
    if (acao.includes('reuniao') || acao.includes('agenda')) return Calendar;
    return User;
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <History className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Histórico CRM</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Timeline de Atividades</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Carregando histórico...</p>
            ) : (
              <div className="space-y-4">
                {logs?.map((log) => {
                  const Icon = getActionIcon(log.acao);
                  return (
                    <div key={log.id} className="flex gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{log.descricao}</p>
                            <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                              {log.clientes?.nome && (
                                <span>Cliente: {log.clientes.nome}</span>
                              )}
                              {log.profiles?.nome && (
                                <span>Por: {log.profiles.nome}</span>
                              )}
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(log.data_hora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
