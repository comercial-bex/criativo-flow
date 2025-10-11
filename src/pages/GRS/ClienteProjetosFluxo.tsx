import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SectionHeader } from '@/components/SectionHeader';
import { ProjectStatusIndicator } from '@/components/ProjectStatusIndicator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProjetos } from '@/hooks/useProjetos';
import { useEspecialistas } from '@/hooks/useEspecialistas';
import { useStrategicPlans } from '@/hooks/useStrategicPlans';
import { 
  Plus, 
  ArrowLeft, 
  Calendar, 
  User, 
  Package,
  Briefcase,
  Clock,
  Target,
  Filter,
  RefreshCw,
  FileText,
  Zap,
  FileEdit,
  FolderOpen,
  Lock,
  ChevronDown,
  Megaphone,
  TrendingUp,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CriarProjetoAvulsoModal } from '@/components/CriarProjetoAvulsoModal';
import { ProjectWithTasks } from '@/utils/statusUtils';
import { useClientAccessPermissions } from '@/hooks/useClientAccessPermissions';
import { OnboardingForm } from '@/components/OnboardingForm';
import { ArquivosTab } from '@/components/ClientArea/ArquivosTab';
import { CofreCredenciais } from '@/components/ClientArea/CofreCredenciais';

interface Cliente {
  id: string;
  nome: string;
  email?: string;
  assinatura_id?: string;
  status: string;
}

interface Planejamento {
  id: string;
  titulo: string;
  status: string;
  mes_referencia: string;
  data_envio_cliente: string | null;
  data_aprovacao_cliente: string | null;
  observacoes_cliente: string | null;
  cliente_id: string;
  created_at: string;
  updated_at: string;
}

// Interface unificada para projetos e planejamentos
interface ProjetoUnificado {
  id: string;
  titulo: string;
  descricao?: string;
  status: string;
  cliente_id: string;
  created_at: string;
  updated_at: string;
  tipo_fonte: 'projeto' | 'planejamento';
  tipo_projeto: 'mensal' | 'avulso';
  
  // Campos específicos de projetos
  data_inicio?: string;
  data_fim?: string;
  data_prazo?: string;
  orcamento?: number;
  produto_contratado?: string;
  responsavel_id?: string;
  progresso?: number;
  tarefas?: any[];
  
  // Campos específicos de planejamentos
  mes_referencia?: string;
  data_envio_cliente?: string | null;
  data_aprovacao_cliente?: string | null;
  observacoes_cliente?: string | null;
}

export default function ClienteProjetosFluxo() {
  const { clienteId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [projetosUnificados, setProjetosUnificados] = useState<ProjetoUnificado[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'recorrentes' | 'avulsos'>('todos');
  
  // Modais de acesso rápido
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [filesOpen, setFilesOpen] = useState(false);
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  
  // Modal de criação de projeto
  const [tipoModal, setTipoModal] = useState<'avulso' | 'campanha' | null>(null);
  
  const permissions = useClientAccessPermissions();
  const { createProjeto } = useProjetos();
  const { data: especialistasGRS } = useEspecialistas();
  const { plans, objectives, loading: plansLoading } = useStrategicPlans(clienteId);

  useEffect(() => {
    if (clienteId) {
      fetchClienteData();
      fetchProjetosUnificados();
    }
  }, [clienteId]);

  const fetchClienteData = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', clienteId)
        .single();

      if (error) throw error;
      setCliente(data);
    } catch (error) {
      console.error('Erro ao buscar dados do cliente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do cliente",
        variant: "destructive",
      });
    }
  };

  const fetchProjetosUnificados = async () => {
    try {
      // Buscar projetos
      const { data: projetosData, error: projetosError } = await supabase
        .from('projetos')
        .select(`
          *,
          tarefas:tarefas_projeto(*)
        `)
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false });

      if (projetosError) throw projetosError;

      // Buscar planejamentos
      const { data: planejamentosData, error: planejamentosError } = await supabase
        .from('planejamentos')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false });

      if (planejamentosError) throw planejamentosError;

      // Unificar projetos
      const projetosUnificados: ProjetoUnificado[] = [
        ...(projetosData || []).map(projeto => ({
          id: projeto.id,
          titulo: projeto.titulo || 'Projeto sem título',
          descricao: projeto.descricao,
          status: projeto.status,
          cliente_id: projeto.cliente_id,
          created_at: projeto.created_at,
          updated_at: projeto.updated_at,
          tipo_fonte: 'projeto' as const,
          tipo_projeto: (projeto.tipo_projeto || 'plano_editorial') as any,
          data_inicio: projeto.data_inicio,
          data_fim: projeto.data_fim,
          data_prazo: projeto.data_prazo,
          orcamento: projeto.orcamento,
          responsavel_id: projeto.responsavel_id,
          tarefas: projeto.tarefas
        })),
        ...(planejamentosData || []).map(planejamento => ({
          id: planejamento.id,
          titulo: planejamento.titulo,
          descricao: planejamento.descricao,
          status: planejamento.status,
          cliente_id: planejamento.cliente_id,
          created_at: planejamento.created_at,
          updated_at: planejamento.updated_at,
          tipo_fonte: 'planejamento' as const,
          tipo_projeto: 'mensal' as const,
          mes_referencia: planejamento.mes_referencia,
          data_envio_cliente: planejamento.data_envio_cliente,
          data_aprovacao_cliente: planejamento.data_aprovacao_cliente,
          observacoes_cliente: planejamento.observacoes_cliente
        }))
      ];

      // Ordenar por data de criação mais recente
      projetosUnificados.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setProjetosUnificados(projetosUnificados);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirProjeto = (projeto: ProjetoUnificado) => {
    if (projeto.tipo_fonte === 'projeto') {
      navigate(`/grs/cliente/${clienteId}/projeto/${projeto.id}/tarefas`);
    } else {
      navigate(`/grs/planejamento/${projeto.id}`);
    }
  };


  // Filtrar projetos unificados
  const projetosFiltrados = projetosUnificados.filter(projeto => {
    if (filtroTipo === 'recorrentes') return projeto.tipo_projeto === 'mensal';
    if (filtroTipo === 'avulsos') return projeto.tipo_projeto === 'avulso';
    return true;
  });

  // Estatísticas
  const totalProjetos = projetosUnificados.length;
  const projetosRecorrentes = projetosUnificados.filter(p => p.tipo_projeto === 'mensal').length;
  const projetosAvulsos = projetosUnificados.filter(p => p.tipo_projeto === 'avulso').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bex-green"></div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/grs/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p>Cliente não encontrado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header com breadcrumb melhorado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/grs/projetos')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard GRS
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium">{cliente.nome}</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm text-muted-foreground">Projetos</span>
        </div>
      </div>

      {/* Informações do Cliente */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-bex-green" />
                {cliente.nome}
              </CardTitle>
              <CardDescription>
                Gestão de projetos e tarefas do cliente
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Projeto
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTipoModal('avulso')}>
                  <Zap className="w-4 h-4 mr-2 text-green-500" />
                  Projeto Avulso
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTipoModal('campanha')}>
                  <Megaphone className="w-4 h-4 mr-2 text-purple-500" />
                  Campanha Publicitária
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>{totalProjetos} projeto{totalProjetos !== 1 ? 's' : ''} total</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <span>{projetosRecorrentes} recorrente{projetosRecorrentes !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>{projetosAvulsos} avulso{projetosAvulsos !== 1 ? 's' : ''}</span>
            </div>
            {cliente.email && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{cliente.email}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Projeto Avulso/Campanha */}
      {tipoModal && (
        <CriarProjetoAvulsoModal
          open={!!tipoModal}
          onOpenChange={(open) => !open && setTipoModal(null)}
          clienteId={clienteId}
          tipo={tipoModal}
          onSuccess={() => fetchProjetosUnificados()}
        />
      )}

      {/* Card de Acesso Rápido */}
      {(permissions.canViewOnboarding || permissions.canViewFiles || permissions.canViewCredentials) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Acesso Rápido
            </CardTitle>
            <CardDescription>
              Ferramentas essenciais para gerenciar o cliente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {permissions.canManageOnboarding && (
                <Button 
                  variant="outline" 
                  onClick={() => setOnboardingOpen(true)} 
                  className="gap-2 justify-start"
                >
                  <FileEdit className="h-4 w-4" />
                  Onboarding
                </Button>
              )}
              {permissions.canViewFiles && (
                <Button 
                  variant="outline" 
                  onClick={() => setFilesOpen(true)} 
                  className="gap-2 justify-start"
                >
                  <FolderOpen className="h-4 w-4" />
                  Arquivos
                </Button>
              )}
              {permissions.canViewCredentials && (
                <Button 
                  variant="outline" 
                  onClick={() => setCredentialsOpen(true)} 
                  className="gap-2 justify-start"
                >
                  <Lock className="h-4 w-4" />
                  Cofre de Credenciais
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card de Planejamento Estratégico */}
      {plans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Planejamento Estratégico
            </CardTitle>
            <CardDescription>
              Objetivos e metas alinhados aos projetos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {plans.map((plan) => {
              const planObjectives = objectives.filter(obj => obj.plano_id === plan.id);
              const objetivosEmAndamento = planObjectives.filter(obj => obj.status === 'em_andamento').length;
              const objetivosConcluidos = planObjectives.filter(obj => obj.status === 'concluido').length;
              const totalObjetivos = planObjectives.length;
              const progressoPorcentagem = totalObjetivos > 0 
                ? Math.round((objetivosConcluidos / totalObjetivos) * 100) 
                : 0;

              return (
                <div key={plan.id} className="space-y-4">
                  {/* Header do Plano */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{plan.titulo}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(plan.periodo_inicio).toLocaleDateString('pt-BR')} até{' '}
                        {new Date(plan.periodo_fim).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Badge variant={progressoPorcentagem === 100 ? 'default' : 'secondary'}>
                      {progressoPorcentagem}% Concluído
                    </Badge>
                  </div>

                  {/* Missão e Visão */}
                  {(plan.missao || plan.visao) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg">
                      {plan.missao && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">MISSÃO</p>
                          <p className="text-sm">{plan.missao}</p>
                        </div>
                      )}
                      {plan.visao && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">VISÃO</p>
                          <p className="text-sm">{plan.visao}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Estatísticas de Objetivos */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalObjetivos}</span>
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Total de Objetivos</p>
                    </div>
                    
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{objetivosEmAndamento}</span>
                      </div>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Em Andamento</p>
                    </div>
                    
                    <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">{objetivosConcluidos}</span>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">Concluídos</p>
                    </div>
                  </div>

                  {/* Lista de Objetivos Ativos */}
                  {planObjectives.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground">Objetivos Ativos</h4>
                      {planObjectives
                        .filter(obj => obj.status === 'em_andamento' || obj.status === 'planejado')
                        .slice(0, 3)
                        .map((obj) => (
                          <div key={obj.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border">
                            <div className={`mt-1 h-2 w-2 rounded-full ${
                              obj.status === 'em_andamento' ? 'bg-yellow-500' : 'bg-gray-400'
                            }`} />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{obj.objetivo}</p>
                              {obj.descricao && (
                                <p className="text-xs text-muted-foreground mt-1">{obj.descricao}</p>
                              )}
                              {obj.prazo_conclusao && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Prazo: {new Date(obj.prazo_conclusao).toLocaleDateString('pt-BR')}
                                </p>
                              )}
                            </div>
                            <Badge variant={obj.status === 'em_andamento' ? 'default' : 'outline'}>
                              {obj.status === 'em_andamento' ? 'Em Andamento' : 'Planejado'}
                            </Badge>
                          </div>
                        ))}
                      
                      {planObjectives.filter(obj => obj.status === 'em_andamento' || obj.status === 'planejado').length > 3 && (
                        <p className="text-xs text-muted-foreground text-center">
                          + {planObjectives.filter(obj => obj.status === 'em_andamento' || obj.status === 'planejado').length - 3} objetivos adicionais
                        </p>
                      )}
                    </div>
                  )}

                  {/* Botão Ver Detalhes */}
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(`/grs/planejamento-estrategico?cliente=${clienteId}`)}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Ver Planejamento Completo
                  </Button>
                </div>
              );
            })}

            {/* Estado Vazio: Sem Planejamento */}
            {plans.length === 0 && !plansLoading && (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Nenhum Planejamento Estratégico</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Este cliente ainda não possui um planejamento estratégico definido.
                </p>
                <Button 
                  onClick={() => navigate(`/grs/planejamento-estrategico?cliente=${clienteId}`)}
                >
                  Criar Planejamento
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lista de Projetos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeader 
            title="Projetos do Cliente"
            description="Visualize e gerencie todos os projetos e planejamentos"
          />
          <Select value={filtroTipo} onValueChange={(value: any) => setFiltroTipo(value)}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Tipos</SelectItem>
              <SelectItem value="recorrentes">Recorrentes</SelectItem>
              <SelectItem value="avulsos">Avulsos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {projetosFiltrados.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="space-y-4">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <p className="text-lg font-medium">
                    {filtroTipo === 'todos' ? 'Nenhum projeto encontrado' : `Nenhum projeto ${filtroTipo === 'recorrentes' ? 'recorrente' : 'avulso'} encontrado`}
                  </p>
                  <p className="text-muted-foreground">
                    {filtroTipo === 'todos' 
                      ? 'Este cliente ainda não possui projetos ou planejamentos cadastrados.' 
                      : `Este cliente não possui projetos do tipo ${filtroTipo === 'recorrentes' ? 'recorrente' : 'avulso'}.`
                    }
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Projeto
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTipoModal('avulso')}>
                      <Zap className="w-4 h-4 mr-2 text-green-500" />
                      Projeto Avulso
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTipoModal('campanha')}>
                      <Megaphone className="w-4 h-4 mr-2 text-purple-500" />
                      Campanha Publicitária
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projetosFiltrados.map((projeto) => (
              <Card key={`${projeto.tipo_fonte}-${projeto.id}`} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{projeto.titulo}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={projeto.tipo_projeto === 'mensal' ? 'default' : 'secondary'}>
                          {projeto.tipo_projeto === 'mensal' ? 'Recorrente' : 'Avulso'}
                        </Badge>
                        <Badge variant="outline" className={projeto.tipo_fonte === 'planejamento' ? 'border-blue-500 text-blue-600' : 'border-green-500 text-green-600'}>
                          {projeto.tipo_fonte === 'planejamento' ? 'Planejamento' : 'Projeto'}
                        </Badge>
                        <Badge variant={projeto.status === 'aprovado' ? 'default' : projeto.status === 'em_aprovacao' ? 'secondary' : 'outline'}>
                          {projeto.status === 'aprovado' ? 'Aprovado' : 
                           projeto.status === 'em_aprovacao' ? 'Em Aprovação' :
                           projeto.status === 'rascunho' ? 'Rascunho' :
                           projeto.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {projeto.descricao && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {projeto.descricao}
                    </p>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    {/* Dados de projeto */}
                    {projeto.produto_contratado && (
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span>{projeto.produto_contratado}</span>
                      </div>
                    )}
                    
                    {projeto.data_inicio && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Início: {new Date(projeto.data_inicio).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                    
                    {(projeto.data_prazo || projeto.data_fim) && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Prazo: {new Date(projeto.data_prazo || projeto.data_fim!).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}

                    {/* Dados de planejamento */}
                    {projeto.mes_referencia && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Referência: {new Date(projeto.mes_referencia).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                      </div>
                    )}

                    {projeto.data_envio_cliente && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Enviado: {new Date(projeto.data_envio_cliente).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>

                  {/* Contadores específicos por tipo */}
                  {projeto.tarefas && projeto.tarefas.length > 0 && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {projeto.tarefas.length} tarefa{projeto.tarefas.length !== 1 ? 's' : ''}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {projeto.tarefas.filter(t => t.status === 'concluido').length} concluída{projeto.tarefas.filter(t => t.status === 'concluido').length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  )}

                  {projeto.observacoes_cliente && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        <strong>Obs. Cliente:</strong> {projeto.observacoes_cliente.substring(0, 50)}...
                      </p>
                    </div>
                  )}

                  <Button 
                    className="w-full" 
                    onClick={() => handleAbrirProjeto(projeto)}
                  >
                    {projeto.tipo_fonte === 'planejamento' ? 'Ver Planejamento' : 'Gerenciar Tarefas'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modais de Acesso Rápido */}
      {cliente && (
        <>
          <OnboardingForm
            isOpen={onboardingOpen}
            onClose={() => setOnboardingOpen(false)}
            clienteId={cliente.id}
            cliente={{
              nome: cliente.nome,
              email: cliente.email || '',
              telefone: '',
              endereco: ''
            }}
            readOnly={!permissions.canManageOnboarding}
          />

          <Dialog open={filesOpen} onOpenChange={setFilesOpen}>
            <DialogContent className="max-w-5xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Arquivos - {cliente.nome}</DialogTitle>
              </DialogHeader>
              <div className="overflow-auto max-h-[calc(90vh-100px)]">
                <ArquivosTab 
                  clienteId={cliente.id} 
                  readOnly={!permissions.canManageFiles}
                />
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={credentialsOpen} onOpenChange={setCredentialsOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Cofre de Credenciais - {cliente.nome}</DialogTitle>
              </DialogHeader>
              <div className="overflow-auto max-h-[calc(90vh-100px)]">
                <CofreCredenciais 
                  clienteId={cliente.id} 
                  readOnly={!permissions.canEditCredentials}
                />
              </div>
            </DialogContent>
          </Dialog>

        </>
      )}
    </div>
  );
}