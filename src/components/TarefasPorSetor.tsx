import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, User, Briefcase, Search } from 'lucide-react';
import { useProjetos, TarefaProjeto } from '@/hooks/useProjetos';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const SETORES = [
  { value: 'design', label: 'Design', icon: '🎨' },
  { value: 'audiovisual', label: 'Audiovisual', icon: '🎬' },
  { value: 'grs', label: 'GRS', icon: '📱' },
  { value: 'atendimento', label: 'Atendimento', icon: '💬' },
];

const STATUS_OPTIONS = [
  { value: 'backlog', label: 'Backlog', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' },
  { value: 'to_do', label: 'A Fazer', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
  { value: 'em_andamento', label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
  { value: 'revisao', label: 'Em Revisão', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' },
  { value: 'concluida', label: 'Concluída', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
];

interface TarefasPorSetorProps {
  showAllSectors?: boolean;
}

export function TarefasPorSetor({ showAllSectors = true }: TarefasPorSetorProps) {
  const { tarefas, loading, fetchTarefasPorSetor } = useProjetos();
  const [setorAtivo, setSetorAtivo] = useState('design');
  const [filtroStatus, setFiltroStatus] = useState<string>('all'); // Mudado de '' para 'all'
  const [pesquisa, setPesquisa] = useState('');
  const [tarefasFiltradas, setTarefasFiltradas] = useState<TarefaProjeto[]>([]);

  // Filtrar tarefas baseado no setor ativo e filtros
  useEffect(() => {
    let filtered = tarefas;

    // Filtrar por setor se não estiver mostrando todos
    if (showAllSectors) {
      filtered = filtered.filter(tarefa => tarefa.setor_responsavel === setorAtivo);
    }

    // Filtrar por status (ignorar se for 'all')
    if (filtroStatus && filtroStatus !== 'all') {
      filtered = filtered.filter(tarefa => tarefa.status === filtroStatus);
    }

    // Filtrar por pesquisa
    if (pesquisa) {
      filtered = filtered.filter(tarefa => 
        tarefa.titulo.toLowerCase().includes(pesquisa.toLowerCase()) ||
        tarefa.descricao?.toLowerCase().includes(pesquisa.toLowerCase()) ||
        tarefa.projetos?.titulo.toLowerCase().includes(pesquisa.toLowerCase())
      );
    }

    setTarefasFiltradas(filtered);
  }, [tarefas, setorAtivo, filtroStatus, pesquisa, showAllSectors]);

  useEffect(() => {
    fetchTarefasPorSetor(showAllSectors ? undefined : setorAtivo);
  }, [setorAtivo, showAllSectors]);

  const getStatusColor = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(opt => opt.value === status);
    return statusOption?.color || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (prioridade: string) => {
    const colors = {
      baixa: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      media: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      alta: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };
    return colors[prioridade as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };


  const getStatusStats = () => {
    const stats = STATUS_OPTIONS.map(status => ({
      ...status,
      count: tarefasFiltradas.filter(tarefa => tarefa.status === status.value).length
    }));
    return stats;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="flex gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded w-24"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tarefas por Setor</h2>
          <p className="text-muted-foreground">Acompanhe o andamento das tarefas em cada setor</p>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar tarefas..."
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="all">Todos os status</SelectItem>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {getStatusStats().map((stat) => (
          <Card key={stat.value}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showAllSectors ? (
        <Tabs value={setorAtivo} onValueChange={setSetorAtivo}>
          <TabsList className="grid w-full grid-cols-4">
            {SETORES.map((setor) => (
              <TabsTrigger key={setor.value} value={setor.value} className="flex items-center gap-2">
                <span>{setor.icon}</span>
                <span className="hidden sm:inline">{setor.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {SETORES.map((setor) => (
            <TabsContent key={setor.value} value={setor.value} className="space-y-4">
              <TarefasGrid tarefas={tarefasFiltradas} />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <TarefasGrid tarefas={tarefasFiltradas} />
      )}
    </div>
  );
}

function TarefasGrid({ tarefas }: { tarefas: TarefaProjeto[] }) {
  const getStatusColor = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(opt => opt.value === status);
    return statusOption?.color || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (prioridade: string) => {
    const colors = {
      baixa: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      media: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      alta: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };
    return colors[prioridade as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (tarefas.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <Briefcase className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Nenhuma tarefa encontrada</h3>
        <p className="text-muted-foreground">Não há tarefas para os filtros selecionados.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tarefas.map((tarefa) => (
        <Card key={tarefa.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg">{tarefa.titulo}</CardTitle>
                {tarefa.projetos && (
                  <CardDescription className="text-sm text-muted-foreground">
                    {tarefa.projetos.titulo}
                    {tarefa.projetos.clientes && ` - ${tarefa.projetos.clientes.nome}`}
                  </CardDescription>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <Badge className={getStatusColor(tarefa.status)}>
                  {STATUS_OPTIONS.find(s => s.value === tarefa.status)?.label}
                </Badge>
                <Badge className={getPriorityColor(tarefa.prioridade)}>
                  {tarefa.prioridade}
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {tarefa.descricao && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {tarefa.descricao}
              </p>
            )}
            
            <div className="flex items-center justify-between text-sm">
              {tarefa.responsavel && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{tarefa.responsavel.nome}</span>
                </div>
              )}
              
              {tarefa.data_prazo && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {format(new Date(tarefa.data_prazo), 'dd/MM', { locale: ptBR })}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}