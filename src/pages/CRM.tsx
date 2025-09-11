import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SectionHeader } from '@/components/SectionHeader';
import { StatsGrid } from '@/components/StatsGrid';
import { QuickActions } from '@/components/QuickActions';
import { FeatureCard } from '@/components/FeatureCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Phone, 
  Mail, 
  Building, 
  Users, 
  UserPlus, 
  Target, 
  TrendingUp, 
  Calendar,
  Download,
  BarChart3,
  Activity
 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Componente de formulário para novo projeto
function ProjetoForm() {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    cliente_id: '',
    valor: '',
    data_inicio: '',
    data_fim: '',
    tipo: 'desenvolvimento'
  });
  const [clientes, setClientes] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome, status')
        .eq('status', 'ativo')
        .order('nome');

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('projetos')
        .insert({
          nome: formData.nome,
          descricao: formData.descricao,
          cliente_id: formData.cliente_id,
          orcamento: formData.valor ? parseFloat(formData.valor) : null,
          data_inicio: formData.data_inicio || null,
          data_fim: formData.data_fim || null,
          status: 'ativo'
        });

      if (error) throw error;

      toast({
        title: "Projeto criado com sucesso!",
        description: "O novo projeto foi adicionado ao sistema",
      });

      setFormData({
        nome: '',
        descricao: '',
        cliente_id: '',
        valor: '',
        data_inicio: '',
        data_fim: '',
        tipo: 'desenvolvimento'
      });
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      toast({
        title: "Erro ao criar projeto",
        description: "Não foi possível criar o projeto",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome do Projeto</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Ex: Website Institucional"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cliente">Cliente</Label>
          <Select 
            value={formData.cliente_id} 
            onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent>
              {clientes.map((cliente) => (
                <SelectItem key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="valor">Valor do Projeto (R$)</Label>
          <Input
            id="valor"
            type="number"
            step="0.01"
            value={formData.valor}
            onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
            placeholder="0,00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo de Projeto</Label>
          <Select 
            value={formData.tipo} 
            onValueChange={(value) => setFormData({ ...formData, tipo: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desenvolvimento">Desenvolvimento</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="branding">Branding</SelectItem>
              <SelectItem value="consultoria">Consultoria</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="data_inicio">Data de Início</Label>
          <Input
            id="data_inicio"
            type="date"
            value={formData.data_inicio}
            onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="data_fim">Data de Término</Label>
          <Input
            id="data_fim"
            type="date"
            value={formData.data_fim}
            onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição do Projeto</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          placeholder="Descreva o escopo e objetivos do projeto..."
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          Criar Projeto
        </Button>
      </div>
    </form>
  );
}

interface Lead {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  cargo: string;
  origem: string;
  status: string;
  valor_estimado: number;
  observacoes: string;
  created_at: string;
}

const statusOptions = [
  { value: 'pre_qualificacao', label: 'Pré-qualificação', color: 'bg-gray-100 text-gray-800' },
  { value: 'proposta', label: 'Proposta', color: 'bg-blue-100 text-blue-800' },
  { value: 'negociacao', label: 'Negociação', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'fechado', label: 'Fechado', color: 'bg-green-100 text-green-800' },
  { value: 'perdido', label: 'Perdido', color: 'bg-red-100 text-red-800' }
];

// Componente para card arrastável
interface DraggableCardProps {
  lead: Lead;
  updateLeadStatus: (leadId: string, newStatus: string) => void;
}

function DraggableCard({ lead, updateLeadStatus }: DraggableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`cursor-grab hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20 ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{lead.nome}</CardTitle>
        {lead.empresa && (
          <CardDescription className="flex items-center text-xs">
            <Building className="h-3 w-3 mr-1" />
            {lead.empresa}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 text-xs">
          {lead.email && (
            <div className="flex items-center text-muted-foreground">
              <Mail className="h-3 w-3 mr-1" />
              {lead.email}
            </div>
          )}
          {lead.telefone && (
            <div className="flex items-center text-muted-foreground">
              <Phone className="h-3 w-3 mr-1" />
              {lead.telefone}
            </div>
          )}
          {lead.valor_estimado && (
            <div className="font-semibold text-green-600">
              R$ {lead.valor_estimado.toLocaleString('pt-BR', {
                minimumFractionDigits: 2
              })}
            </div>
          )}
        </div>
        
        <div className="mt-3">
          <Select
            value={lead.status}
            onValueChange={(value) => updateLeadStatus(lead.id, value)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

const CRM = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    conversions: 0,
    conversionRate: 0
  });
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    empresa: '',
    cargo: '',
    origem: '',
    valor_estimado: '',
    observacoes: ''
  });
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
      
      // Calcular estatísticas
      const total = data?.length || 0;
      const newThisMonth = data?.filter(lead => 
        new Date(lead.created_at) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      ).length || 0;
      
      setStats({
        totalLeads: total,
        newLeads: newThisMonth,
        conversions: Math.floor(total * 0.3), // Simulado
        conversionRate: total > 0 ? 30 : 0 // Simulado
      });
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
      toast({
        title: "Erro ao carregar leads",
        description: "Não foi possível carregar a lista de leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('leads')
        .insert({
          ...formData,
          valor_estimado: formData.valor_estimado ? parseFloat(formData.valor_estimado) : null
        });

      if (error) throw error;

      toast({
        title: "Lead criado com sucesso!",
        description: "O novo lead foi adicionado ao funil de vendas",
      });

      setDialogOpen(false);
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        empresa: '',
        cargo: '',
        origem: '',
        valor_estimado: '',
        observacoes: ''
      });
      fetchLeads();
    } catch (error) {
      console.error('Erro ao criar lead:', error);
      toast({
        title: "Erro ao criar lead",
        description: "Não foi possível criar o lead",
        variant: "destructive",
      });
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;

      toast({
        title: "Status atualizado!",
        description: "O status do lead foi atualizado com sucesso",
      });

      fetchLeads();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status do lead",
        variant: "destructive",
      });
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Se foi solto em uma coluna (container)
    if (statusOptions.some(status => status.value === overId)) {
      const lead = leads.find(l => l.id === activeId);
      if (lead && lead.status !== overId) {
        await updateLeadStatus(activeId, overId);
      }
    }
  };

  const getStatusInfo = (status: string) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  const groupedLeads = statusOptions.reduce((acc, status) => {
    acc[status.value] = leads.filter(lead => lead.status === status.value);
    return acc;
  }, {} as Record<string, Lead[]>);

  const statsData = [
    {
      title: "Total de Leads",
      value: stats.totalLeads,
      icon: Users,
      description: "Leads cadastrados",
      trend: { value: "12%", isPositive: true },
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Novos Leads",
      value: stats.newLeads,
      icon: UserPlus,
      description: "Este mês",
      trend: { value: "8%", isPositive: true },
      color: "bg-green-100 text-green-600"
    },
    {
      title: "Conversões",
      value: stats.conversions,
      icon: Target,
      description: "Leads convertidos",
      trend: { value: "5%", isPositive: true },
      color: "bg-purple-100 text-purple-600"
    },
    {
      title: "Taxa de Conversão",
      value: `${stats.conversionRate}%`,
      icon: TrendingUp,
      description: "Média mensal",
      trend: { value: "2%", isPositive: true },
      color: "bg-orange-100 text-orange-600"
    }
  ];

  const quickActions = [
    {
      title: "Pipeline de Vendas",
      description: "Visualizar funil completo de vendas",
      icon: BarChart3,
      onClick: () => toast({ title: "Em desenvolvimento" }),
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Relatórios",
      description: "Análise de performance e métricas",
      icon: Download,
      onClick: () => toast({ title: "Em desenvolvimento" }),
      color: "bg-green-100 text-green-600"
    },
    {
      title: "Automações",
      description: "Configurar fluxos automáticos",
      icon: Activity,
      onClick: () => toast({ title: "Em desenvolvimento" }),
      color: "bg-purple-100 text-purple-600"
    }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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
        title="CRM & Leads"
        description="Gerencie leads, contatos e oportunidades de negócio"
        icon={Users}
        badge="Pro"
        action={{
          label: "Novo Lead",
          onClick: () => setDialogOpen(true),
          icon: Plus
        }}
      />

      <StatsGrid stats={statsData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Funil de Vendas</h3>
          </div>
          
          {/* Kanban Board */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {statusOptions.map((status) => (
                <div 
                  key={status.value} 
                  className="space-y-4"
                  data-status={status.value}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{status.label}</h4>
                    <Badge variant="secondary" className={status.color}>
                      {groupedLeads[status.value]?.length || 0}
                    </Badge>
                  </div>
                  
                  <SortableContext
                    items={groupedLeads[status.value]?.map(lead => lead.id) || []}
                    strategy={verticalListSortingStrategy}
                    id={status.value}
                  >
                    <div 
                      className="space-y-3 min-h-80 p-2 rounded-lg border-2 border-dashed border-muted transition-colors"
                      data-droppable={status.value}
                      style={{
                        backgroundColor: activeId && 
                          leads.find(l => l.id === activeId)?.status !== status.value 
                            ? 'rgba(59, 130, 246, 0.05)' 
                            : 'transparent'
                      }}
                    >
                      {groupedLeads[status.value]?.map((lead) => (
                        <DraggableCard 
                          key={lead.id} 
                          lead={lead} 
                          updateLeadStatus={updateLeadStatus}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </div>
              ))}
            </div>
            
            <DragOverlay>
              {activeId ? (
                <DraggableCard 
                  lead={leads.find(l => l.id === activeId)!} 
                  updateLeadStatus={updateLeadStatus}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        <div className="space-y-6">
          <FeatureCard
            title="Performance do Mês"
            description="Resumo das principais métricas"
            icon={BarChart3}
            badge="Atualizado"
          >
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Meta de Conversão</span>
                <span className="font-medium">30%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{width: `${stats.conversionRate}%`}}></div>
              </div>
              <div className="text-xs text-muted-foreground">
                {stats.conversions} de {stats.totalLeads} leads convertidos
              </div>
            </div>
          </FeatureCard>

          <FeatureCard
            title="Próximos Follow-ups"
            description="Agenda de contatos importantes"
            icon={Calendar}
            actionLabel="Ver Agenda"
            onAction={() => toast({ title: "Em desenvolvimento" })}
          >
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Hoje</span>
                <Badge variant="outline">3</Badge>
              </div>
              <div className="flex justify-between">
                <span>Esta semana</span>
                <Badge variant="outline">12</Badge>
              </div>
              <div className="flex justify-between">
                <span>Próxima semana</span>
                <Badge variant="outline">8</Badge>
              </div>
            </div>
          </FeatureCard>

          <QuickActions 
            actions={quickActions}
            title="Ações Rápidas"
            columns={3}
          />
        </div>
      </div>

      {/* Dialog para criar lead */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Novo Lead</DialogTitle>
            <DialogDescription>
              Adicione um novo lead ao funil de vendas
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({...formData, telefone: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa</Label>
              <Input
                id="empresa"
                value={formData.empresa}
                onChange={(e) => setFormData({...formData, empresa: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="valor_estimado">Valor Estimado (R$)</Label>
              <Input
                id="valor_estimado"
                type="number"
                step="0.01"
                value={formData.valor_estimado}
                onChange={(e) => setFormData({...formData, valor_estimado: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
              />
            </div>
            
            <Button type="submit" className="w-full">
              Criar Lead
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CRM;