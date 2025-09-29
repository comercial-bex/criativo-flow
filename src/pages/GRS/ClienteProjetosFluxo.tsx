import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/SectionHeader';
import { ProjectStatusIndicator } from '@/components/ProjectStatusIndicator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  ArrowLeft, 
  Calendar, 
  User, 
  Package,
  Briefcase,
  Clock,
  Target
} from 'lucide-react';
import { ProjectWithTasks } from '@/utils/statusUtils';

interface Cliente {
  id: string;
  nome: string;
  email?: string;
  assinatura_id?: string;
  status: string;
}

interface Projeto extends ProjectWithTasks {
  cliente_id: string;
  responsavel_id?: string;
  data_inicio?: string;
  data_fim?: string;
  orcamento?: number;
  tipo_projeto?: 'mensal' | 'avulso';
  produto_contratado?: string;
  descricao?: string;
  created_at: string;
  updated_at: string;
  nome?: string; // Add nome field for compatibility
}

export default function ClienteProjetosFluxo() {
  const { clienteId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);

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

  const fetchProjetos = async () => {
    try {
      // Buscar projetos com suas tarefas
      const { data: projetosData, error: projetosError } = await supabase
        .from('projetos')
        .select(`
          *,
          tarefas:tarefas_projeto(*)
        `)
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false });

      if (projetosError) throw projetosError;
      
      // Transform data to match Projeto interface
      const transformedProjetos = (projetosData || []).map(projeto => ({
        ...projeto,
        titulo: projeto.nome || 'Projeto sem título',
        tipo_projeto: (projeto.nome && projeto.nome.toLowerCase().includes('mensal')) ? 'mensal' as const : 'avulso' as const
      }));
      
      setProjetos(transformedProjetos);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os projetos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirTarefas = (projetoId: string) => {
    navigate(`/grs/cliente/${clienteId}/projeto/${projetoId}/tarefas`);
  };

  const handleCriarProjeto = () => {
    // TODO: Implementar modal de criação de projeto
    toast({
      title: "Em desenvolvimento",
      description: "Funcionalidade de criação de projeto em desenvolvimento",
    });
  };

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
    <div className="space-y-6">
      {/* Header com breadcrumb */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/grs/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Dashboard GRS
        </Button>
        <span className="text-muted-foreground">/</span>
        <span>{cliente.nome}</span>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium">Projetos</span>
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
            <Button onClick={handleCriarProjeto}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Projeto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>{projetos.length} projeto{projetos.length !== 1 ? 's' : ''}</span>
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

      {/* Lista de Projetos */}
      <div className="space-y-4">
        <SectionHeader 
          title="Projetos do Cliente"
          description="Visualize e gerencie todos os projetos ativos"
        />
        
        {projetos.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="space-y-4">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <p className="text-lg font-medium">Nenhum projeto encontrado</p>
                  <p className="text-muted-foreground">Este cliente ainda não possui projetos cadastrados.</p>
                </div>
                <Button onClick={handleCriarProjeto}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Projeto
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projetos.map((projeto) => (
              <Card key={projeto.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{projeto.titulo}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={projeto.tipo_projeto === 'mensal' ? 'default' : 'secondary'}>
                          {projeto.tipo_projeto === 'mensal' ? 'Recorrente' : 'Avulso'}
                        </Badge>
                        <ProjectStatusIndicator project={projeto} />
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
                    
                    {projeto.data_fim && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Prazo: {new Date(projeto.data_fim).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>

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

                  <Button 
                    className="w-full" 
                    onClick={() => handleAbrirTarefas(projeto.id)}
                  >
                    Gerenciar Tarefas
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}