import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { StatusInteligente } from "./StatusInteligente";
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  setor_responsavel: string;
  data_inicio: string;
  data_prazo: string;
  aprovacao_status: string;
  responsavel_id: string;
  projeto_id: string;
  observacoes_aprovacao?: string;
  profiles?: {
    nome: string;
  };
}

interface AprovacaoKanbanProps {
  clienteId: string;
}

export function AprovacaoKanban({ clienteId }: AprovacaoKanbanProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);
  const [observacoes, setObservacoes] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchTarefas();
  }, [clienteId]);

  const fetchTarefas = async () => {
    try {
      const { data, error } = await supabase
        .from('tarefas_projeto')
        .select(`
          *,
          profiles!tarefas_projeto_responsavel_id_fkey (nome)
        `)
        .in('projeto_id', (
          await supabase
            .from('projetos')
            .select('id')
            .eq('cliente_id', clienteId)
        ).data?.map(p => p.id) || [])
        .neq('aprovacao_status', 'nao_requer');

      if (error) throw error;
      setTarefas(data || []);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as tarefas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAprovacao = async (tarefaId: string, novoStatus: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tarefas_projeto')
        .update({
          aprovacao_status: novoStatus,
          aprovado_por: user.id,
          data_aprovacao: new Date().toISOString(),
          observacoes_aprovacao: observacoes[tarefaId] || null
        })
        .eq('id', tarefaId);

      if (error) throw error;

      // Criar log de atividade
      await supabase.rpc('criar_log_atividade', {
        p_cliente_id: clienteId,
        p_usuario_id: user.id,
        p_acao: novoStatus === 'aprovado' ? 'aprovou' : 'reprovou',
        p_entidade_tipo: 'tarefa',
        p_entidade_id: tarefaId,
        p_descricao: `Tarefa ${novoStatus === 'aprovado' ? 'aprovada' : 'reprovada'}${observacoes[tarefaId] ? ` com observações` : ''}`,
        p_metadata: { observacoes: observacoes[tarefaId] || null }
      });

      toast({
        title: "Sucesso",
        description: `Tarefa ${novoStatus === 'aprovado' ? 'aprovada' : 'reprovada'} com sucesso.`,
      });

      fetchTarefas();
      setObservacoes(prev => ({ ...prev, [tarefaId]: '' }));

    } catch (error) {
      console.error('Erro ao atualizar aprovação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a aprovação.",
        variant: "destructive",
      });
    }
  };

  const getStatusColumn = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'pendente';
      case 'em_analise':
        return 'em_analise';
      case 'aprovado':
        return 'aprovado';
      case 'reprovado':
        return 'reprovado';
      default:
        return 'pendente';
    }
  };

  const columns = [
    { id: 'pendente', title: 'Pendente', icon: Clock, color: 'border-yellow-200' },
    { id: 'em_analise', title: 'Em Análise', icon: Eye, color: 'border-blue-200' },
    { id: 'aprovado', title: 'Aprovado', icon: CheckCircle, color: 'border-green-200' },
    { id: 'reprovado', title: 'Reprovado', icon: XCircle, color: 'border-red-200' }
  ];

  if (loading) {
    return <div className="text-center py-8">Carregando aprovações...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Aprovações</h2>
        <Badge variant="outline">
          {tarefas.filter(t => t.aprovacao_status === 'pendente').length} pendentes
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => {
          const tarefasColuna = tarefas.filter(t => getStatusColumn(t.aprovacao_status) === column.id);
          const Icon = column.icon;

          return (
            <Card key={column.id} className={`${column.color}`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Icon className="h-4 w-4" />
                  {column.title}
                  <Badge variant="secondary" className="ml-auto">
                    {tarefasColuna.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tarefasColuna.map((tarefa) => (
                  <Card key={tarefa.id} className="p-3">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">{tarefa.titulo}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {tarefa.descricao}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <StatusInteligente
                          status={tarefa.aprovacao_status}
                          dataInicio={tarefa.data_inicio}
                          dataPrazo={tarefa.data_prazo}
                        />
                        <Badge variant="outline" className="text-xs">
                          {tarefa.setor_responsavel}
                        </Badge>
                      </div>

                      {tarefa.data_prazo && (
                        <p className="text-xs text-muted-foreground">
                          Prazo: {format(new Date(tarefa.data_prazo), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      )}

                      {tarefa.profiles?.nome && (
                        <p className="text-xs text-muted-foreground">
                          Responsável: {tarefa.profiles.nome}
                        </p>
                      )}


                      {column.id === 'pendente' && (
                        <div className="space-y-2 pt-2 border-t">
                          <Textarea
                            placeholder="Observações (opcional)"
                            value={observacoes[tarefa.id] || ''}
                            onChange={(e) => setObservacoes(prev => ({ 
                              ...prev, 
                              [tarefa.id]: e.target.value 
                            }))}
                            rows={2}
                            className="text-xs"
                          />
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => handleAprovacao(tarefa.id, 'aprovado')}
                              className="flex-1 text-xs"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleAprovacao(tarefa.id, 'reprovado')}
                              className="flex-1 text-xs"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reprovar
                            </Button>
                          </div>
                        </div>
                      )}

                      {tarefa.observacoes_aprovacao && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground">
                            <strong>Observações:</strong> {tarefa.observacoes_aprovacao}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}

                {tarefasColuna.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Nenhuma tarefa
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}