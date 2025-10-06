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
  Activity,
  Image as ImageIcon,
  BookOpen,
  Video,
  FileText,
  Palette,
  Sparkles,
  MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TarefasKanban } from "@/components/TarefasKanban";
import { CardBriefingModal } from "@/components/briefings/CardBriefingModal";
import { CarrosselBriefingModal } from "@/components/briefings/CarrosselBriefingModal";
import { VTBriefingModal } from "@/components/briefings/VTBriefingModal";
import { RoteiroBriefingModal } from "@/components/briefings/RoteiroBriefingModal";
import { LogoBriefingModal } from "@/components/briefings/LogoBriefingModal";
import { IdentidadeBriefingModal } from "@/components/briefings/IdentidadeBriefingModal";
import { PostSocialBriefingModal } from "@/components/briefings/PostSocialBriefingModal";
import { AudiovisualScheduleModal } from "@/components/AudiovisualScheduleModal";

interface Cliente {
  id: string;
  nome: string;
}

interface Projeto {
  id: string;
  cliente_id: string | null;
  nome: string;
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

export default function ProjetoTarefas() {
  const { clienteId, projetoId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [carrosselModalOpen, setCarrosselModalOpen] = useState(false);
  const [vtModalOpen, setVtModalOpen] = useState(false);
  const [roteiroModalOpen, setRoteiroModalOpen] = useState(false);
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [identidadeModalOpen, setIdentidadeModalOpen] = useState(false);
  const [postSocialModalOpen, setPostSocialModalOpen] = useState(false);
  const [audiovisualModalOpen, setAudiovisualModalOpen] = useState(false);

  const handleTaskCreated = () => {
    fetchData();
  };

  const handleNeedsCaptacao = () => {
    setAudiovisualModalOpen(true);
  };

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
          profiles:responsavel_id (nome)
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

  const getStatusBadge = (status: string | null) => {
    const statusConfig = {
      ativo: { color: 'bg-green-100 text-green-800 border-green-200', icon: <Target className="h-3 w-3" /> },
      inativo: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: <Activity className="h-3 w-3" /> },
      pendente: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <BarChart3 className="h-3 w-3" /> },
      arquivado: { color: 'bg-red-100 text-red-800 border-red-200', icon: <Settings className="h-3 w-3" /> }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ativo;
    
    return (
      <Badge className={`${config.color} border font-medium`}>
        {config.icon}
        <span className="ml-1 capitalize">{status || 'Ativo'}</span>
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
          <span className="font-medium text-foreground">{projeto.nome}</span>
        </div>

        {/* Cabeçalho do Projeto */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{projeto.nome}</CardTitle>
                {projeto.descricao && (
                  <p className="text-muted-foreground">{projeto.descricao}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(projeto.status)}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <span className="text-sm text-muted-foreground">{projeto.status || 'Ativo'}</span>
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
                {projeto.data_fim && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Fim</p>
                      <p className="text-muted-foreground">
                        {format(new Date(projeto.data_fim), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Orçamento */}
              <div className="space-y-2">
                {projeto.orcamento && (
                  <div className="flex items-center gap-2 text-sm">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Orçamento</p>
                      <p className="text-muted-foreground">
                        R$ {projeto.orcamento.toLocaleString('pt-BR')}
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
                <span className="text-muted-foreground">Responsável:</span>
                <span className="font-medium">{projeto.profiles.nome}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Criar Demanda Rápida
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              onClick={() => setCardModalOpen(true)} 
              variant="outline"
              className="h-20 flex-col gap-2"
            >
              <ImageIcon className="h-5 w-5" />
              <span>Card</span>
            </Button>
            <Button 
              onClick={() => setCarrosselModalOpen(true)} 
              variant="outline"
              className="h-20 flex-col gap-2"
            >
              <BookOpen className="h-5 w-5" />
              <span>Carrossel</span>
            </Button>
            <Button 
              onClick={() => setVtModalOpen(true)} 
              variant="outline"
              className="h-20 flex-col gap-2"
            >
              <Video className="h-5 w-5" />
              <span>VT</span>
            </Button>
            <Button 
              onClick={() => setRoteiroModalOpen(true)} 
              variant="outline"
              className="h-20 flex-col gap-2"
            >
              <FileText className="h-5 w-5" />
              <span>Roteiro</span>
            </Button>
            <Button 
              onClick={() => setLogoModalOpen(true)} 
              variant="outline"
              className="h-20 flex-col gap-2"
            >
              <Palette className="h-5 w-5" />
              <span>Logo</span>
            </Button>
            <Button 
              onClick={() => setIdentidadeModalOpen(true)} 
              variant="outline"
              className="h-20 flex-col gap-2"
            >
              <Sparkles className="h-5 w-5" />
              <span>Identidade</span>
            </Button>
            <Button 
              onClick={() => setPostSocialModalOpen(true)} 
              variant="outline"
              className="h-20 flex-col gap-2"
            >
              <MessageSquare className="h-5 w-5" />
              <span>Post Social</span>
            </Button>
          </div>
        </CardContent>
      </Card>

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

      {/* Modals */}
      <CardBriefingModal
        open={cardModalOpen}
        onOpenChange={setCardModalOpen}
        projetoId={projetoId!}
        onTaskCreated={handleTaskCreated}
        onNeedsCaptacao={handleNeedsCaptacao}
      />
      <CarrosselBriefingModal
        open={carrosselModalOpen}
        onOpenChange={setCarrosselModalOpen}
        projetoId={projetoId!}
        onTaskCreated={handleTaskCreated}
        onNeedsCaptacao={handleNeedsCaptacao}
      />
      <VTBriefingModal
        open={vtModalOpen}
        onOpenChange={setVtModalOpen}
        projetoId={projetoId!}
        onTaskCreated={handleTaskCreated}
        onNeedsCaptacao={handleNeedsCaptacao}
      />
      <RoteiroBriefingModal
        open={roteiroModalOpen}
        onOpenChange={setRoteiroModalOpen}
        projetoId={projetoId!}
        onTaskCreated={handleTaskCreated}
      />
      <LogoBriefingModal
        open={logoModalOpen}
        onOpenChange={setLogoModalOpen}
        projetoId={projetoId!}
        onTaskCreated={handleTaskCreated}
      />
      <IdentidadeBriefingModal
        open={identidadeModalOpen}
        onOpenChange={setIdentidadeModalOpen}
        projetoId={projetoId!}
        onTaskCreated={handleTaskCreated}
      />
      <PostSocialBriefingModal
        open={postSocialModalOpen}
        onOpenChange={setPostSocialModalOpen}
        projetoId={projetoId!}
        onTaskCreated={handleTaskCreated}
      />
      <AudiovisualScheduleModal
        open={audiovisualModalOpen}
        onOpenChange={setAudiovisualModalOpen}
        clienteId={clienteId}
        onScheduleCreated={handleTaskCreated}
      />
    </div>
  );
}