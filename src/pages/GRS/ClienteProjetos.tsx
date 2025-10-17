import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  User, 
  Clock,
  Target,
  BarChart3,
  FolderOpen,
  AlertCircle,
  CheckCircle2,
  PlayCircle,
  ChevronDown,
  Zap,
  Megaphone,
  MoreVertical,
  Edit,
  Trash2
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CriarProjetoAvulsoModal } from '@/components/CriarProjetoAvulsoModal';
import { CreatePlanejamentoUnificadoModal } from '@/components/CreatePlanejamentoUnificadoModal';
import { EditProjetoModal } from '@/components/EditProjetoModal';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProjetos } from '@/hooks/useProjetos';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';

interface Cliente {
  id: string;
  nome: string;
  status: string;
}

interface Projeto {
  id: string;
  cliente_id: string | null;
  titulo: string;
  descricao: string | null;
  status: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  orcamento: number | null;
  responsavel_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  profiles?: {
    nome: string;
  };
}

export default function ClienteProjetos() {
  const { clienteId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { startTutorial, hasSeenTutorial } = useTutorial('grs-cliente-projetos');
  
  const { updateProjeto, deleteProjeto } = useProjetos();
  
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipoModal, setTipoModal] = useState<'avulso' | 'campanha' | 'plano_editorial' | null>(null);
  const [projetoEdit, setProjetoEdit] = useState<Projeto | null>(null);
  const [projetoDeleteId, setProjetoDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (clienteId) {
      fetchClienteData();
      fetchProjetos();
    }
  }, [clienteId]);

  const fetchClienteData = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome, status')
        .eq('id', clienteId)
        .single();

      if (error) throw error;
      setCliente(data);
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do cliente.",
        variant: "destructive",
      });
    }
  };

  const fetchProjetos = async () => {
    try {
      const { data, error } = await supabase
        .from('projetos')
        .select(`
          *,
          profiles!projetos_responsavel_id_fkey(nome)
        `)
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjetos(data || []);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar projetos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const getStatusBadge = (status: string | null) => {
    const statusConfig = {
      ativo: { color: 'bg-green-100 text-green-800 border-green-200', icon: <Target className="h-3 w-3" /> },
      inativo: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: <PlayCircle className="h-3 w-3" /> },
      pendente: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <Clock className="h-3 w-3" /> },
      arquivado: { color: 'bg-red-100 text-red-800 border-red-200', icon: <AlertCircle className="h-3 w-3" /> }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ativo;
    
    return (
      <Badge className={`${config.color} border font-medium`}>
        {config.icon}
        <span className="ml-1 capitalize">{status || 'Ativo'}</span>
      </Badge>
    );
  };

  const handleAbrirProjeto = (projetoId: string) => {
    navigate(`/grs/cliente/${clienteId}/projeto/${projetoId}/tarefas`);
  };

  const handleDeleteProjeto = async () => {
    if (!projetoDeleteId) return;
    
    const success = await deleteProjeto(projetoDeleteId);
    if (success) {
      setProjetoDeleteId(null);
      fetchProjetos();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com breadcrumbs */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
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
            <span className="font-medium text-foreground">{cliente?.nome}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <FolderOpen className="h-8 w-8 text-primary" />
              Projetos - {cliente?.nome}
            </h1>
          </div>
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
            <DropdownMenuItem onClick={() => setTipoModal('plano_editorial')}>
              <Calendar className="w-4 h-4 mr-2 text-blue-500" />
              Plano Editorial
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Modal de Projeto Avulso/Campanha */}
      {(tipoModal === 'avulso' || tipoModal === 'campanha') && (
        <CriarProjetoAvulsoModal
          open={true}
          onOpenChange={(open) => !open && setTipoModal(null)}
          clienteId={clienteId}
          tipo={tipoModal}
          onSuccess={() => fetchProjetos()}
        />
      )}

      {/* Modal de Plano Editorial */}
      {tipoModal === 'plano_editorial' && (
        <CreatePlanejamentoUnificadoModal
          open={true}
          onOpenChange={(open) => !open && setTipoModal(null)}
          clienteId={clienteId}
          tipoInicial="mensal"
          onSuccess={() => {
            fetchProjetos();
            setTipoModal(null);
          }}
        />
      )}

      {/* Lista de Projetos */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Carregando projetos...</p>
        </div>
      ) : projetos.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum projeto encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Este cliente ainda não possui projetos. Crie o primeiro projeto para começar.
            </p>
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
                <DropdownMenuItem onClick={() => setTipoModal('plano_editorial')}>
                  <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                  Plano Editorial
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projetos.map((projeto) => (
            <Card key={projeto.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold line-clamp-2">
                      {projeto.titulo}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(projeto.status)}
                    <TooltipProvider>
                      <Tooltip>
                        <DropdownMenu>
                          <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 hover:bg-accent hover:text-accent-foreground"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                          </TooltipTrigger>
                          <DropdownMenuContent 
                            align="end"
                            className="bg-background dark:bg-gray-800 border-2 border-border shadow-xl z-[100]"
                          >
                            <DropdownMenuItem onClick={() => setProjetoEdit(projeto)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar Projeto
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setProjetoDeleteId(projeto.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir Projeto
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <TooltipContent>
                          <p>Mais opções</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                {projeto.descricao && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                    {projeto.descricao}
                  </p>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  {projeto.orcamento && (
                    <Badge variant="outline" className="text-xs">
                      R$ {projeto.orcamento.toLocaleString('pt-BR')}
                    </Badge>
                  )}
                </div>

                {/* Status do projeto */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <span className="text-sm text-muted-foreground">{projeto.status || 'Ativo'}</span>
                  </div>
                </div>

                {/* Datas */}
                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                  {projeto.data_inicio && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Início: {format(new Date(projeto.data_inicio), 'dd/MM/yy')}</span>
                    </div>
                  )}
                  {projeto.data_fim && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Fim: {format(new Date(projeto.data_fim), 'dd/MM/yy')}</span>
                    </div>
                  )}
                </div>

                {/* Responsável */}
                {projeto.profiles && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">por</span>
                    <span className="font-medium">{projeto.profiles.nome}</span>
                  </div>
                )}

                <Button 
                  onClick={() => handleAbrirProjeto(projeto.id)}
                  className="w-full mt-4"
                  variant="outline"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Abrir Projeto
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Edição */}
      <EditProjetoModal
        open={!!projetoEdit}
        onOpenChange={(open) => !open && setProjetoEdit(null)}
        projeto={projetoEdit}
        onSave={async (id, updates) => {
          const success = await updateProjeto(id, updates);
          if (success) {
            fetchProjetos();
          }
          return success;
        }}
      />

      {/* Confirmação de Exclusão */}
      <ConfirmationDialog
        open={!!projetoDeleteId}
        onOpenChange={(open) => !open && setProjetoDeleteId(null)}
        title="Excluir Projeto"
        description="Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita e todas as tarefas vinculadas serão perdidas."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleDeleteProjeto}
        variant="destructive"
        gaming={false}
      />
    </div>
  );
}