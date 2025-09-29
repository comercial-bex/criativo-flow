import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  User, 
  Filter,
  Activity
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LogAtividade {
  id: string;
  acao: string;
  entidade_tipo: string;
  entidade_id: string;
  descricao: string;
  data_hora: string;
  metadata: any;
  profiles: {
    nome: string;
    avatar_url?: string;
  };
}

interface TimelineInteligenteProps {
  clienteId: string;
  limitarItens?: number;
}

export function TimelineInteligente({ clienteId, limitarItens = 20 }: TimelineInteligenteProps) {
  const [logs, setLogs] = useState<LogAtividade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroAcao, setFiltroAcao] = useState<string>('todas');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');

  useEffect(() => {
    fetchLogs();
  }, [clienteId, filtroAcao, filtroTipo]);

  const fetchLogs = async () => {
    try {
      let query = supabase
        .from('logs_atividade')
        .select(`
          *,
          profiles (
            nome,
            avatar_url
          )
        `)
        .eq('cliente_id', clienteId)
        .order('data_hora', { ascending: false })
        .limit(limitarItens);

      if (filtroAcao !== 'todas') {
        query = query.eq('acao', filtroAcao);
      }

      if (filtroTipo !== 'todos') {
        query = query.eq('entidade_tipo', filtroTipo);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Erro ao buscar timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAcaoIcon = (acao: string) => {
    switch (acao) {
      case 'criou':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'aprovou':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'reprovou':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'atualizou':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'concluiu':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'atribuiu':
        return <User className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAcaoColor = (acao: string) => {
    switch (acao) {
      case 'criou':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'aprovou':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'reprovou':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'atualizou':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'concluiu':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
      case 'atribuiu':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'projeto':
        return '📋';
      case 'tarefa':
        return '✅';
      case 'post':
        return '📱';
      case 'briefing':
        return '📝';
      case 'planejamento':
        return '📊';
      default:
        return '📄';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando timeline...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Timeline de Atividades
        </h2>
        <div className="flex gap-2">
          <Select value={filtroAcao} onValueChange={setFiltroAcao}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as ações</SelectItem>
              <SelectItem value="criou">Criadas</SelectItem>
              <SelectItem value="aprovou">Aprovadas</SelectItem>
              <SelectItem value="reprovou">Reprovadas</SelectItem>
              <SelectItem value="atualizou">Atualizadas</SelectItem>
              <SelectItem value="concluiu">Concluídas</SelectItem>
              <SelectItem value="atribuiu">Atribuídas</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="projeto">Projetos</SelectItem>
              <SelectItem value="tarefa">Tarefas</SelectItem>
              <SelectItem value="post">Posts</SelectItem>
              <SelectItem value="briefing">Briefings</SelectItem>
              <SelectItem value="planejamento">Planejamentos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma atividade encontrada</p>
            </div>
          ) : (
            <div className="divide-y">
              {logs.map((log, index) => (
                <div key={log.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Avatar/Icon */}
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                      {log.profiles?.avatar_url ? (
                        <img 
                          src={log.profiles.avatar_url} 
                          alt={log.profiles.nome}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getAcaoIcon(log.acao)}
                        <span className="font-medium text-sm">
                          {log.profiles?.nome || 'Sistema'}
                        </span>
                        <Badge variant="secondary" className={getAcaoColor(log.acao)}>
                          {log.acao}
                        </Badge>
                        <span className="text-sm">
                          {getTipoIcon(log.entidade_tipo)} {log.entidade_tipo}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        {log.descricao}
                      </p>

                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                          {log.metadata.observacoes && (
                            <p><strong>Observações:</strong> {log.metadata.observacoes}</p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {format(new Date(log.data_hora), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(log.data_hora), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {logs.length >= limitarItens && (
        <div className="text-center">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <Filter className="h-4 w-4 mr-2" />
            Carregar mais atividades
          </Button>
        </div>
      )}
    </div>
  );
}