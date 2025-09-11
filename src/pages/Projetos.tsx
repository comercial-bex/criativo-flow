import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SectionHeader } from '@/components/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  FolderOpen, 
  Plus, 
  Search, 
  Calendar,
  Users,
  BarChart3,
  Eye,
  User,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Projeto {
  id: string;
  nome: string;
  descricao: string;
  status: string;
  data_inicio: string;
  data_fim: string;
  cliente_id: string;
  created_at: string;
}

const Projetos = () => {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProjetos();
  }, []);

  const fetchProjetos = async () => {
    try {
      const { data, error } = await supabase
        .from('projetos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjetos(data || []);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      toast({
        title: "Erro ao carregar projetos",
        description: "Não foi possível carregar a lista de projetos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Estatísticas simuladas baseadas no Figma
  const stats = {
    producao: { total: 3, pausados: 0, atrasados: 0, medios: 1, rapidos: 1 },
    atendimentos: { total: 0, triagem: 0, analise: 0, aprovacao: 0, entrega: 1 },
    sites: { total: 3, comErro: 0, atrasados: 0, hoje: 0, semData: 0 }
  };

  const tarefasRecentes = [
    {
      responsavel: 'Wyller F.',
      data: '23 de Maio, 2025',
      tarefa: 'Painel do Sistema da Bex',
      status: 'Em Progresso',
      projeto: 'Agência Bex'
    },
    {
      responsavel: 'Vitória C.',
      data: '14 de Março, 2023',
      tarefa: 'Planejamento da Reintegrar',
      status: 'Revisão',
      projeto: 'Reintegrar'
    },
    {
      responsavel: 'By Harison',
      data: '29 de Abril, 2023',
      tarefa: 'IV Semana Amapá África....',
      status: 'Concluído',
      projeto: 'Rede Amazônica'
    }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <SectionHeader
        title="Gerencie seus projetos"
        description="Track your projects, tasks & team activity here"
        icon={FolderOpen}
        action={{
          label: "Adicionar Post",
          onClick: () => toast({ title: "Em desenvolvimento" }),
          icon: Plus
        }}
      />

      {/* Cards de Estatísticas - baseado no Figma */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Produção */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium">Produção</CardTitle>
            <div className="text-4xl font-bold text-primary">{stats.producao.total}</div>
            <p className="text-sm text-gray-300">Total</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2 text-center">
              <div>
                <div className="text-lg font-semibold">{stats.producao.atrasados}</div>
                <div className="text-xs text-gray-400">Atrasados</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{stats.producao.atrasados}</div>
                <div className="text-xs text-gray-400">Alto</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{stats.producao.medios}</div>
                <div className="text-xs text-gray-400">Médio</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{stats.producao.rapidos}</div>
                <div className="text-xs text-gray-400">Rápido</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{stats.producao.rapidos}</div>
                <div className="text-xs text-gray-400">Progressivo</div>
              </div>
            </div>
            <div className="flex justify-between mt-4 text-xs">
              <span>Pausados</span>
              <span className="font-medium">{stats.producao.pausados}</span>
            </div>
            <div className="flex space-x-1 mt-2">
              <div className="flex-1 h-1 bg-red-500 rounded"></div>
              <div className="flex-1 h-1 bg-orange-500 rounded"></div>
              <div className="flex-1 h-1 bg-yellow-500 rounded"></div>
              <div className="flex-1 h-1 bg-green-500 rounded"></div>
            </div>
          </CardContent>
        </Card>

        {/* Atendimentos */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium">Atendimentos</CardTitle>
            <div className="text-4xl font-bold text-primary">{stats.atendimentos.total}</div>
            <p className="text-sm text-gray-300">Em Atendimento</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2 text-center">
              <div>
                <div className="text-lg font-semibold">{stats.atendimentos.triagem}</div>
                <div className="text-xs text-gray-400">Triagem</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{stats.atendimentos.analise}</div>
                <div className="text-xs text-gray-400">Análise</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{stats.atendimentos.aprovacao}</div>
                <div className="text-xs text-gray-400">Aprovação</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{stats.atendimentos.entrega}</div>
                <div className="text-xs text-gray-400">Entrega</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{stats.atendimentos.entrega}</div>
                <div className="text-xs text-gray-400">Aguardando</div>
              </div>
            </div>
            <div className="flex justify-between mt-4 text-xs">
              <span>Aguardando</span>
              <span className="font-medium">{stats.atendimentos.triagem}</span>
            </div>
          </CardContent>
        </Card>

        {/* Sites */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium">Sites</CardTitle>
            <div className="text-4xl font-bold text-primary">{stats.sites.total}</div>
            <p className="text-sm text-gray-300">Total</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2 text-center">
              <div>
                <div className="text-lg font-semibold">{stats.sites.comErro}</div>
                <div className="text-xs text-gray-400">Com Erro</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{stats.sites.atrasados}</div>
                <div className="text-xs text-gray-400">Atrasados</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{stats.sites.hoje}</div>
                <div className="text-xs text-gray-400">Hoje</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{stats.sites.hoje}</div>
                <div className="text-xs text-gray-400">Amanhã</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{stats.sites.semData}</div>
                <div className="text-xs text-gray-400">Sem Data</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Atualização de Tarefas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Atualização de Tarefas</CardTitle>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
              <BarChart3 className="h-4 w-4 mr-2" />
              Lista
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Responsável</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Data</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Tarefa</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Projeto</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {tarefasRecentes.map((tarefa, index) => (
                  <tr key={index} className="border-b last:border-b-0">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {tarefa.responsavel.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{tarefa.responsavel}</span>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-muted-foreground">{tarefa.data}</td>
                    <td className="py-4">{tarefa.tarefa}</td>
                    <td className="py-4">
                      <Badge 
                        className={`${
                          tarefa.status === 'Concluído' ? 'bg-green-100 text-green-800' :
                          tarefa.status === 'Em Progresso' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {tarefa.status}
                      </Badge>
                    </td>
                    <td className="py-4 text-sm">{tarefa.projeto}</td>
                    <td className="py-4">
                      <Button size="sm" className="bg-black text-white hover:bg-gray-800">
                        Detalhes
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Projetos;