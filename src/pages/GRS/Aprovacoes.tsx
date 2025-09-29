import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, XCircle, Clock, Eye, Filter, Users, Calendar, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ClientSelector } from "@/components/ClientSelector";
import { SimpleHelpModal } from "@/components/SimpleHelpModal";
import { InteractiveGuideButton } from "@/components/InteractiveGuideButton";
import { WhatsAppNotifier } from "@/components/WhatsAppNotifier";
import { useToast } from "@/hooks/use-toast";

interface Cliente {
  id: string;
  nome: string;
}

interface Planejamento {
  id: string;
  titulo: string;
  status: string;
  mes_referencia: string;
  data_envio_cliente: string | null;
  data_aprovacao_cliente: string | null;
  observacoes_cliente: string | null;
  clientes: Cliente & {
    telefone?: string;
  };
}

export default function GRSAprovacoes() {
  const [planejamentos, setPlanejamentos] = useState<Planejamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pendentes");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchAprovacoes();
  }, [statusFilter, selectedClientId]);

  const fetchAprovacoes = async () => {
    try {
      let query = supabase
        .from('planejamentos')
        .select(`
          id,
          titulo,
          status,
          mes_referencia,
          data_envio_cliente,
          data_aprovacao_cliente,
          observacoes_cliente,
          clientes (
            id,
            nome,
            telefone
          )
        `)
        .order('mes_referencia', { ascending: false });

      // Filtrar por status
      if (statusFilter === "pendentes") {
        query = query.in('status', ['em_aprovacao_final', 'em_revisao']);
      } else if (statusFilter === "aprovados") {
        query = query.eq('status', 'finalizado');
      } else if (statusFilter === "reprovados") {
        query = query.eq('status', 'reprovado');
      }

      // Filtrar por cliente se selecionado
      if (selectedClientId) {
        query = query.eq('cliente_id', selectedClientId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPlanejamentos(data || []);
    } catch (error) {
      console.error('Erro ao buscar aprovações:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finalizado': return 'bg-green-500';
      case 'reprovado': return 'bg-red-500';
      case 'em_aprovacao_final': return 'bg-orange-500';
      case 'em_revisao': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'aprovado': return 'Aprovado';
      case 'reprovado': return 'Reprovado';
      case 'em_aprovacao_final': return 'Em Aprovação Final';
      case 'em_revisao': return 'Em Revisão';
      case 'enviado': return 'Enviado para Cliente';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprovado': return CheckCircle;
      case 'reprovado': return XCircle;
      case 'em_aprovacao_final':
      case 'em_revisao':
      case 'enviado': return Clock;
      default: return Clock;
    }
  };

  const getPrioridade = (dataEnvio: string | null) => {
    if (!dataEnvio) return { nivel: 'baixa', texto: 'Sem prazo' };
    
    const envio = new Date(dataEnvio);
    const hoje = new Date();
    const diffDias = Math.ceil((hoje.getTime() - envio.getTime()) / (1000 * 3600 * 24));
    
    if (diffDias > 7) return { nivel: 'alta', texto: 'Prazo vencido' };
    if (diffDias > 3) return { nivel: 'media', texto: 'Prazo próximo' };
    return { nivel: 'baixa', texto: 'No prazo' };
  };

  const getWhatsAppMessage = (planejamento: Planejamento) => {
    const mesFormatado = new Date(planejamento.mes_referencia).toLocaleDateString('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    });
    
    if (planejamento.status === 'reprovado') {
      return `Olá ${planejamento.clientes.nome}! 👋

Seu planejamento de ${mesFormatado} foi analisado e precisa de alguns ajustes.

📝 Feedback: ${planejamento.observacoes_cliente || 'Vamos alinhar os detalhes juntos'}

Podemos conversar para alinhar as mudanças? Estamos aqui para entregar exatamente o que você precisa! 🚀`;
    }
    
    return `Olá ${planejamento.clientes.nome}! 👋

Seu planejamento de ${mesFormatado} está pronto para aprovação! 📋✨

🔗 Acesse seu painel para revisar: [LINK_DO_SISTEMA]

Qualquer dúvida, estamos aqui para ajudar! 💚`;
  };

  const filteredPlanejamentos = planejamentos.filter(planejamento => {
    const matchesSearch = planejamento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         planejamento.clientes.nome.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const helpContent = {
    title: "Como usar as Aprovações",
    sections: [
      {
        title: "📋 Visão Geral",
        content: "Centralize todas as aprovações pendentes dos seus clientes. Acompanhe o status de cada planejamento em tempo real."
      },
      {
        title: "🚦 Status dos Planejamentos",
        content: "• Pendentes: Aguardando aprovação do cliente\n• Aprovados: Confirmados pelo cliente\n• Reprovados: Precisam de ajustes\n• Em Revisão: Sendo analisados internamente"
      },
      {
        title: "⏰ Prioridades",
        content: "• Prazo Vencido: Mais de 7 dias sem resposta\n• Prazo Próximo: 3-7 dias aguardando\n• No Prazo: Enviado recentemente"
      }
    ]
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-8">Carregando aprovações...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <CheckCircle className="h-8 w-8 text-primary" />
            Aprovações GRS
          </h1>
          <p className="text-muted-foreground">Gerencie todas as aprovações de clientes</p>
        </div>
        <div className="flex items-center gap-2">
          <SimpleHelpModal content={helpContent}>
            <Button variant="outline" size="sm">
              <Info className="h-4 w-4 mr-2" />
              Como usar
            </Button>
          </SimpleHelpModal>
          <InteractiveGuideButton />
        </div>
      </div>

      {/* Client Selector */}
      <ClientSelector 
        onClientSelect={setSelectedClientId}
        selectedClientId={selectedClientId}
        showContext={true}
      />

      {/* Filtros */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por cliente ou título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pendentes">Aprovações Pendentes</SelectItem>
            <SelectItem value="aprovados">Aprovados</SelectItem>
            <SelectItem value="reprovados">Reprovados</SelectItem>
            <SelectItem value="todos">Todos os Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aguardando Aprovação</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {planejamentos.filter(p => ['em_aprovacao_final', 'em_revisao', 'enviado'].includes(p.status)).length}
            </div>
            <p className="text-xs text-muted-foreground">pendentes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {planejamentos.filter(p => p.status === 'aprovado').length}
            </div>
            <p className="text-xs text-muted-foreground">este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reprovados</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {planejamentos.filter(p => p.status === 'reprovado').length}
            </div>
            <p className="text-xs text-muted-foreground">precisam revisão</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prazo Vencido</CardTitle>
            <div className="h-4 w-4 bg-red-500 rounded-full animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {planejamentos.filter(p => getPrioridade(p.data_envio_cliente).nivel === 'alta').length}
            </div>
            <p className="text-xs text-muted-foreground">requerem atenção</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Aprovações */}
      <div className="grid gap-4">
        {filteredPlanejamentos.map((planejamento) => {
          const StatusIcon = getStatusIcon(planejamento.status);
          const prioridade = getPrioridade(planejamento.data_envio_cliente);
          
          return (
            <Card key={planejamento.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {planejamento.clientes.nome.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold">{planejamento.titulo}</h3>
                        {prioridade.nivel === 'alta' && (
                          <Badge variant="destructive" className="text-xs">
                            URGENTE
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{planejamento.clientes.nome}</span>
                        <span>•</span>
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(planejamento.mes_referencia).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                        {planejamento.data_envio_cliente && (
                          <>
                            <span>•</span>
                            <span className={`font-medium ${prioridade.nivel === 'alta' ? 'text-red-500' : prioridade.nivel === 'media' ? 'text-orange-500' : 'text-green-500'}`}>
                              {prioridade.texto}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className={`${getStatusColor(planejamento.status)} text-white`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {getStatusText(planejamento.status)}
                    </Badge>
                    
                    {/* PHASE 2: WHATSAPP SEMI-AUTOMATIC */}
                    <WhatsAppNotifier
                      clienteNome={planejamento.clientes.nome}
                      clienteTelefone={planejamento.clientes.telefone}
                      mensagem={getWhatsAppMessage(planejamento)}
                    />
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/grs/planejamento/${planejamento.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Revisar
                    </Button>
                  </div>
                </div>
                
                {planejamento.observacoes_cliente && (
                  <div className="mt-4 p-3 bg-muted rounded-lg border-l-4 border-orange-500">
                    <p className="text-sm">
                      <strong className="text-orange-700">Feedback do Cliente:</strong>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {planejamento.observacoes_cliente}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredPlanejamentos.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {statusFilter === "pendentes" ? "Nenhuma aprovação pendente" : "Nenhuma aprovação encontrada"}
            </h3>
            <p className="text-muted-foreground">
              {statusFilter === "pendentes" 
                ? "Parabéns! Não há aprovações pendentes no momento."
                : "Tente ajustar os filtros de busca ou verifique se há planejamentos cadastrados."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}