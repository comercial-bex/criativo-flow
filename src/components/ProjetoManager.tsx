import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CalendarIcon, Plus, Users, Clock, DollarSign } from 'lucide-react';
import { useProjetos, Projeto } from '@/hooks/useProjetos';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProjetoManagerProps {
  clienteId?: string;
}

export function ProjetoManager({ clienteId }: ProjetoManagerProps) {
  const { projetos, loading, createProjeto, updateProjeto } = useProjetos();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Projeto | null>(null);
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    status: 'planejamento',
    prioridade: 'media',
    data_inicio: '',
    data_prazo: '',
    orcamento_estimado: '',
    cliente_id: clienteId || '',
  });

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      status: 'planejamento',
      prioridade: 'media',
      data_inicio: '',
      data_prazo: '',
      orcamento_estimado: '',
      cliente_id: clienteId || '',
    });
    setEditingProject(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const projetoData = {
      ...formData,
      orcamento_estimado: formData.orcamento_estimado ? parseFloat(formData.orcamento_estimado) : null,
    };

    if (editingProject) {
      await updateProjeto(editingProject.id, projetoData);
    } else {
      await createProjeto(projetoData);
    }

    resetForm();
    setDialogOpen(false);
  };

  const handleEdit = (projeto: Projeto) => {
    setEditingProject(projeto);
    setFormData({
      titulo: projeto.titulo,
      descricao: projeto.descricao || '',
      status: projeto.status,
      prioridade: projeto.prioridade,
      data_inicio: projeto.data_inicio || '',
      data_prazo: projeto.data_prazo || '',
      orcamento_estimado: projeto.orcamento_estimado?.toString() || '',
      cliente_id: projeto.cliente_id || '',
    });
    setDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      planejamento: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      execucao: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      revisao: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      concluido: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (prioridade: string) => {
    const colors = {
      baixa: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      media: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      alta: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };
    return colors[prioridade as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestão de Projetos</h2>
          <p className="text-muted-foreground">Gerencie todos os projetos e acompanhe o progresso</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Projeto
            </Button>
          </DialogTrigger>
          
          <DialogContent size="lg" height="auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
                </DialogTitle>
                <DialogDescription>
                  Preencha as informações do projeto abaixo.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planejamento">Planejamento</SelectItem>
                        <SelectItem value="execucao">Execução</SelectItem>
                        <SelectItem value="revisao">Revisão</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="prioridade">Prioridade</Label>
                    <Select value={formData.prioridade} onValueChange={(value) => setFormData({ ...formData, prioridade: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="data_inicio">Data de Início</Label>
                    <Input
                      id="data_inicio"
                      type="date"
                      value={formData.data_inicio}
                      onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="data_prazo">Prazo</Label>
                    <Input
                      id="data_prazo"
                      type="date"
                      value={formData.data_prazo}
                      onChange={(e) => setFormData({ ...formData, data_prazo: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="orcamento_estimado">Orçamento Estimado (R$)</Label>
                  <Input
                    id="orcamento_estimado"
                    type="number"
                    step="0.01"
                    value={formData.orcamento_estimado}
                    onChange={(e) => setFormData({ ...formData, orcamento_estimado: e.target.value })}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingProject ? 'Atualizar' : 'Criar'} Projeto
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projetos.map((projeto) => (
          <Card key={projeto.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{projeto.titulo}</CardTitle>
                  {projeto.clientes && (
                    <CardDescription className="text-sm text-muted-foreground">
                      {projeto.clientes.nome}
                    </CardDescription>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Badge className={getStatusColor(projeto.status)}>
                    {projeto.status}
                  </Badge>
                  <Badge className={getPriorityColor(projeto.prioridade)}>
                    {projeto.prioridade}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {projeto.descricao && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {projeto.descricao}
                </p>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progresso</span>
                  <span>{projeto.progresso}%</span>
                </div>
                <Progress value={projeto.progresso} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                {projeto.data_prazo && (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {format(new Date(projeto.data_prazo), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
                )}
                
                {projeto.orcamento_estimado && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      R$ {projeto.orcamento_estimado.toLocaleString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(projeto)}>
                  Editar
                </Button>
                <Button size="sm" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Tarefas
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {projetos.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Users className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Nenhum projeto encontrado</h3>
          <p className="text-muted-foreground mb-4">Comece criando seu primeiro projeto.</p>
        </div>
      )}
    </div>
  );
}