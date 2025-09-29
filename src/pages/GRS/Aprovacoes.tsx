import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, XCircle, Clock, Send, MessageSquare, Calendar, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";


interface Cliente {
  id: string;
  nome: string;
}

interface PlanejamentoPendente {
  id: string;
  titulo: string;
  status: string;
  mes_referencia: string;
  data_envio_cliente: string | null;
  observacoes_cliente: string | null;
  clientes: Cliente;
  _count?: {
    posts_planejamento: number;
  };
}

export default function GRSAprovacoes() {
  const [planejamentos, setPlanejamentos] = useState<PlanejamentoPendente[]>([]);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState<string | null>(null);
  const [observacoes, setObservacoes] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchPlanejamentosPendentes();
  }, []);

  const fetchPlanejamentosPendentes = async () => {
    try {
      const { data, error } = await supabase
        .from('planejamentos')
        .select(`
          id,
          titulo,
          status,
          mes_referencia,
          data_envio_cliente,
          observacoes_cliente,
          clientes (
            id,
            nome
          )
        `)
        .in('status', ['em_aprovacao_final', 'em_revisao'])
        .order('data_envio_cliente', { ascending: true });

      if (error) throw error;
      setPlanejamentos(data || []);
    } catch (error) {
      console.error('Erro ao buscar planejamentos pendentes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os planejamentos pendentes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAprovacao = async (planejamentoId: string, novoStatus: 'aprovado_cliente' | 'reprovado') => {
    setProcessando(planejamentoId);
    
    try {
      const updates: any = {
        status: novoStatus,
        data_aprovacao_cliente: new Date().toISOString()
      };

      // Se for reprovação e houver observações, incluir no update
      if (novoStatus === 'reprovado' && observacoes[planejamentoId]) {
        updates.observacoes_cliente = observacoes[planejamentoId];
      }

      const { error } = await supabase
        .from('planejamentos')
        .update(updates)
        .eq('id', planejamentoId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Planejamento ${novoStatus === 'aprovado_cliente' ? 'aprovado' : 'reprovado'} com sucesso!`,
      });

      // Remover da lista
      setPlanejamentos(prev => prev.filter(p => p.id !== planejamentoId));
      
      // Limpar observações
      if (observacoes[planejamentoId]) {
        setObservacoes(prev => {
          const { [planejamentoId]: _, ...rest } = prev;
          return rest;
        });
      }

    } catch (error) {
      console.error('Erro ao processar aprovação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar a aprovação.",
        variant: "destructive"
      });
    } finally {
      setProcessando(null);
    }
  };

  const handleObservacaoChange = (planejamentoId: string, valor: string) => {
    setObservacoes(prev => ({
      ...prev,
      [planejamentoId]: valor
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'em_aprovacao_final': return 'bg-yellow-500';
      case 'em_revisao': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'em_aprovacao_final': return 'Em Aprovação';
      case 'em_revisao': return 'Em Revisão';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Central de Aprovações</h1>
        </div>
        <div className="text-center py-8">Carregando aprovações pendentes...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Clock className="h-8 w-8 text-primary" />
            Central de Aprovações
          </h1>
          <p className="text-muted-foreground">Gerencie as aprovações de planejamentos pendentes</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{planejamentos.length}</div>
            <p className="text-xs text-muted-foreground">aguardando aprovação</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mais Antigo</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {planejamentos.length > 0 && planejamentos[0].data_envio_cliente
                ? `${Math.ceil((Date.now() - new Date(planejamentos[0].data_envio_cliente).getTime()) / (1000 * 60 * 60 * 24))} dias`
                : 'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">desde o envio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(planejamentos.map(p => p.clientes.id)).size}
            </div>
            <p className="text-xs text-muted-foreground">com pendências</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Aprovações */}
      <div className="space-y-4">
        {planejamentos.map((planejamento) => (
          <Card key={planejamento.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Header do Planejamento */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {planejamento.clientes.nome.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{planejamento.titulo}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{planejamento.clientes.nome}</span>
                        <span>•</span>
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(planejamento.mes_referencia).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                        {planejamento.data_envio_cliente && (
                          <>
                            <span>•</span>
                            <span>Enviado há {Math.ceil((Date.now() - new Date(planejamento.data_envio_cliente).getTime()) / (1000 * 60 * 60 * 24))} dias</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className={`${getStatusColor(planejamento.status)} text-white`}>
                      <Clock className="h-3 w-3 mr-1" />
                      {getStatusText(planejamento.status)}
                    </Badge>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/grs/planejamento/${planejamento.id}`)}
                    >
                      Visualizar Completo
                    </Button>
                  </div>
                </div>

                {/* Observações do Cliente (se houver) */}
                {planejamento.observacoes_cliente && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Observações do Cliente:</p>
                        <p className="text-sm text-muted-foreground">{planejamento.observacoes_cliente}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Área de Observações para Reprovação */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Observações (para reprovação):</label>
                  <Textarea
                    placeholder="Digite observações caso vá reprovar este planejamento..."
                    value={observacoes[planejamento.id] || ''}
                    onChange={(e) => handleObservacaoChange(planejamento.id, e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Botões de Ação */}
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => handleAprovacao(planejamento.id, 'reprovado')}
                    disabled={processando === planejamento.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {processando === planejamento.id ? 'Processando...' : 'Reprovar'}
                  </Button>
                  
                  <Button
                    onClick={() => handleAprovacao(planejamento.id, 'aprovado_cliente')}
                    disabled={processando === planejamento.id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {processando === planejamento.id ? 'Processando...' : 'Aprovar'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estado Vazio */}
      {planejamentos.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma aprovação pendente</h3>
            <p className="text-muted-foreground">
              Parabéns! Não há planejamentos aguardando aprovação no momento.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate('/grs/planejamentos')}
            >
              Ver Todos os Planejamentos
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}