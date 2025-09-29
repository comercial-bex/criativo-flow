import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Target,
  BarChart3,
  Settings,
  Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TarefasKanban } from "@/components/TarefasKanban";

interface Cliente {
  id: string;
  nome: string;
}

interface Projeto {
  id: string;
  cliente_id: string | null;
  titulo: string;
  descricao: string | null;
  status: string;
  prioridade: string;
  data_inicio: string | null;
  data_prazo: string | null;
  created_by: string | null;
  responsavel_grs_id: string | null;
  responsavel_atendimento_id: string | null;
  orcamento_estimado: number | null;
  progresso: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    nome: string;
  };
}

export default function ProjetoTarefas() {
  const { clienteId, projetoId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clienteId && projetoId) {
      fetchData();
    }
  }, [clienteId, projetoId]);

  const fetchData = async () => {
    try {
      // Buscar cliente
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes')
        .select('id, nome')
        .eq('id', clienteId)
        .single();

      if (clienteError) throw clienteError;
      setCliente(clienteData);

      // Buscar projeto
      const { data: projetoData, error: projetoError } = await supabase
        .from('projetos')
        .select(`
          *,
          profiles:created_by (nome)
        `)
        .eq('id', projetoId)
        .single();

      if (projetoError) throw projetoError;
      setProjeto(projetoData);

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      planejamento: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <Target className="h-3 w-3" /> },
      em_andamento: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <Activity className="h-3 w-3" /> },
      concluido: { color: 'bg-green-100 text-green-800 border-green-200', icon: <BarChart3 className="h-3 w-3" /> },
      pausado: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: <Settings className="h-3 w-3" /> }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.planejamento;
    
    return (
      <Badge className={`${config.color} border font-medium`}>
        {config.icon}
        <span className="ml-1 capitalize">{status.replace('_', ' ')}</span>
      </Badge>
    );
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const prioridadeConfig = {
      alta: { color: 'bg-red-100 text-red-800 border-red-200', icon: '🔴' },
      media: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '🟡' },
      baixa: { color: 'bg-green-100 text-green-800 border-green-200', icon: '🟢' }
    };

    const config = prioridadeConfig[prioridade as keyof typeof prioridadeConfig] || prioridadeConfig.media;
    
    return (
      <Badge className={`${config.color} border font-medium text-xs`}>
        {config.icon} {prioridade}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-2 text-muted-foreground">Carregando projeto...</p>
      </div>
    );
  }

  if (!projeto || !cliente) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Projeto ou cliente não encontrado.</p>
        <Button 
          onClick={() => navigate('/grs/dashboard')}
          className="mt-4"
          variant="outline"
        >
          Voltar ao Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com breadcrumbs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/grs/dashboard')}
            className="px-0 hover:bg-transparent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard GRS
          </Button>
          <span>/</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(`/grs/cliente/${clienteId}/projetos`)}
            className="px-0 hover:bg-transparent"
          >
            {cliente.nome}
          </Button>
          <span>/</span>
          <span className="font-medium text-foreground">{projeto.titulo}</span>
        </div>

        {/* Cabeçalho do Projeto */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{projeto.titulo}</CardTitle>
                {projeto.descricao && (
                  <p className="text-muted-foreground">{projeto.descricao}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(projeto.status)}
                {getPrioridadeBadge(projeto.prioridade)}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Progresso */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progresso</span>
                  <span className="text-sm text-muted-foreground">{projeto.progresso}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${projeto.progresso}%` }}
                  />
                </div>
              </div>

              {/* Datas */}
              <div className="space-y-2">
                {projeto.data_inicio && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Início</p>
                      <p className="text-muted-foreground">
                        {format(new Date(projeto.data_inicio), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {projeto.data_prazo && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Prazo</p>
                      <p className="text-muted-foreground">
                        {format(new Date(projeto.data_prazo), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Orçamento */}
              <div className="space-y-2">
                {projeto.orcamento_estimado && (
                  <div className="flex items-center gap-2 text-sm">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Orçamento</p>
                      <p className="text-muted-foreground">
                        R$ {projeto.orcamento_estimado.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Responsável */}
            {projeto.profiles && (
              <div className="flex items-center gap-2 text-sm mt-4 pt-4 border-t">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Criado por:</span>
                <span className="font-medium">{projeto.profiles.nome}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board de Tarefas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Gestão de Tarefas</h2>
          <Badge variant="outline" className="text-sm">
            Arraste e solte para alterar status
          </Badge>
        </div>
        
        <TarefasKanban 
          planejamento={{ id: projeto.id }}
          clienteId={clienteId!}
          projetoId={projetoId!}
        />
      </div>
    </div>
  );
}