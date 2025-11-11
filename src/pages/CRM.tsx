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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Phone, 
  Mail, 
  Building, 
  Users, 
  User,
  UserPlus, 
  Target, 
  TrendingUp, 
  Calendar,
  Download,
  BarChart3,
  Activity,
  DollarSign,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit3,
  Trash2,
  CheckCircle2,
  Pencil,
  Inbox
  } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';
import { EmptyState } from "@/components/ui/empty-state";

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
  responsavel_id: string;
  created_at: string;
}

const statusOptions = [
  { 
    value: 'pre_qualificacao', 
    label: 'Pré-qualificação', 
    color: 'hsl(var(--muted))',
    bgColor: 'bg-muted/50',
    textColor: 'text-muted-foreground',
    count: 0 
  },
  { 
    value: 'proposta', 
    label: 'Proposta', 
    color: 'hsl(var(--primary))',
    bgColor: 'bg-primary/10',
    textColor: 'text-primary',
    count: 0 
  },
  { 
    value: 'negociacao', 
    label: 'Negociação', 
    color: 'hsl(var(--warning))',
    bgColor: 'bg-warning/10',
    textColor: 'text-warning',
    count: 0 
  },
  { 
    value: 'fechado', 
    label: 'Fechado', 
    color: 'hsl(var(--success))',
    bgColor: 'bg-success/10',
    textColor: 'text-success',
    count: 0 
  },
  { 
    value: 'perdido', 
    label: 'Perdido', 
    color: 'hsl(var(--destructive))',
    bgColor: 'bg-destructive/10',
    textColor: 'text-destructive',
    count: 0 
  }
];

// Componente de card aprimorado com preview no hover
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group mb-3"
    >
      <Card className="cursor-grab active:cursor-grabbing hover:shadow-lg transition-all duration-300 animate-fade-in border-l-4 border-l-primary/30 hover:border-l-primary">
        <CardHeader className="pb-3 space-y-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-base font-semibold leading-tight">{lead.nome}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1 flex items-center">
                <Building className="h-3 w-3 mr-1" />
                {lead.empresa || 'Sem empresa'}
              </p>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <Badge variant="outline" className="text-xs">
                {lead.origem}
              </Badge>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm font-medium text-success">
              <DollarSign className="h-4 w-4 mr-1" />
              R$ {(lead.valor_estimado || 0).toLocaleString('pt-BR')}
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(lead.created_at).toLocaleDateString('pt-BR')}
            </div>
          </div>
          
          <div className="space-y-2">
            {lead.email && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Mail className="h-3 w-3 mr-2 flex-shrink-0" />
                <span className="truncate">{lead.email}</span>
              </div>
            )}
            {lead.telefone && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Phone className="h-3 w-3 mr-2 flex-shrink-0" />
                <span>{lead.telefone}</span>
              </div>
            )}
          </div>
          
          {lead.observacoes && (
            <div className="mt-3 p-2 bg-muted/30 rounded text-xs text-muted-foreground line-clamp-2">
              {lead.observacoes}
            </div>
          )}
          
          {/* Ações rápidas que aparecem no hover */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-2">
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
              <Eye className="h-3 w-3 mr-1" />
              Ver
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
              <Edit3 className="h-3 w-3 mr-1" />
              Editar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CRM() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrigin, setFilterOrigin] = useState('all');
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    conversions: 0,
    conversionRate: 0,
    totalValue: 0
  });
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    empresa: '',
    cargo: '',
    origem: 'website',
    valor_estimado: '',
    observacoes: ''
  });
  const { toast } = useToast();
  const { startTutorial, hasSeenTutorial, isActive } = useTutorial('crm-funil');

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
      const totalValue = data?.reduce((sum, lead) => sum + (lead.valor_estimado || 0), 0) || 0;
      const conversions = data?.filter(lead => lead.status === 'fechado').length || 0;
      
      setStats({
        totalLeads: total,
        newLeads: newThisMonth,
        conversions: conversions,
        conversionRate: total > 0 ? Math.round((conversions / total) * 100) : 0,
        totalValue: totalValue
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
          valor_estimado: formData.valor_estimado ? parseFloat(formData.valor_estimado) : null,
          status: 'pre_qualificacao'
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
        origem: 'website',
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

    if (!over || active.id === over.id) return;

    const activeLeadId = active.id as string;
    const newStatus = over.id as string;

    // Verificar se foi solto em uma coluna válida
    if (statusOptions.some(status => status.value === newStatus)) {
      await updateLeadStatus(activeLeadId, newStatus);
    }
  };

  // Filtrar leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchTerm || 
      lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOrigin = filterOrigin === 'all' || lead.origem === filterOrigin;
    
    return matchesSearch && matchesOrigin;
  });

  const groupedLeads = statusOptions.reduce((acc, status) => {
    acc[status.value] = filteredLeads.filter(lead => lead.status === status.value);
    return acc;
  }, {} as Record<string, Lead[]>);

  const statsData = [
    {
      title: "Total de Leads",
      value: stats.totalLeads,
      icon: Users,
      description: "Leads cadastrados",
      trend: { value: "12%", isPositive: true },
      color: "bg-primary/10 text-primary"
    },
    {
      title: "Novos este Mês",
      value: stats.newLeads,
      icon: UserPlus,
      description: "Este mês",
      trend: { value: "8%", isPositive: true },
      color: "bg-success/10 text-success"
    },
    {
      title: "Conversões",
      value: stats.conversions,
      icon: Target,
      description: "Leads convertidos",
      trend: { value: "5%", isPositive: true },
      color: "bg-warning/10 text-warning"
    },
    {
      title: "Taxa Conversão",
      value: `${stats.conversionRate}%`,
      icon: TrendingUp,
      description: "Média geral",
      trend: { value: "2%", isPositive: true },
      color: "bg-chart-1/10 text-chart-1"
    },
    {
      title: "Valor Pipeline",
      value: `R$ ${stats.totalValue.toLocaleString('pt-BR')}`,
      icon: DollarSign,
      description: "Valor total estimado",
      trend: { value: "15%", isPositive: true },
      color: "bg-chart-2/10 text-chart-2"
    }
  ];

  const quickActions = [
    {
      title: "Pipeline de Vendas",
      description: "Visualizar funil completo",
      icon: BarChart3,
      onClick: () => toast({ title: "Em desenvolvimento" }),
      color: "bg-primary/10 text-primary"
    },
    {
      title: "Relatórios",
      description: "Análise de performance",
      icon: Download,
      onClick: () => toast({ title: "Em desenvolvimento" }),
      color: "bg-success/10 text-success"
    },
    {
      title: "Automações",
      description: "Configurar fluxos",
      icon: Activity,
      onClick: () => toast({ title: "Em desenvolvimento" }),
      color: "bg-warning/10 text-warning"
    }
  ];

  if (loading) {
    return (
      <div className="p-6 animate-fade-in">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <SectionHeader
          title="CRM & Leads"
          description="Gerencie leads, contatos e oportunidades de negócio"
          icon={Users}
          badge="Pro"
        />
        <div className="flex gap-2">
          <TutorialButton onStart={startTutorial} hasSeenTutorial={hasSeenTutorial} />
          <Button data-tour="novo-lead" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Lead
          </Button>
        </div>
      </div>

      <div data-tour="kpis-funil">
        <StatsGrid stats={statsData} />
      </div>

      <Tabs defaultValue="kanban" className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList>
            <TabsTrigger value="kanban">Funil Kanban</TabsTrigger>
            <TabsTrigger value="list">Lista Completa</TabsTrigger>
          </TabsList>
          
          {/* Filtros e busca */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Select value={filterOrigin} onValueChange={setFilterOrigin}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as origens</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="indicacao">Indicação</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="evento">Evento</SelectItem>
                <SelectItem value="telefone">Telefone</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="kanban" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Kanban Board Melhorado */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-[700px]">
                  {statusOptions.map((status) => (
                    <div 
                      key={status.value}
                      className={`${status.bgColor} rounded-xl p-4 min-h-[700px] flex flex-col border-2 border-transparent hover:border-border/50 transition-all duration-200`}
                    >
                      <div className="flex justify-between items-center mb-4 pb-3 border-b border-border/20">
                        <div>
                          <h4 className={`font-semibold text-sm ${status.textColor}`}>
                            {status.label}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {groupedLeads[status.value]?.length || 0} leads
                          </p>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`${status.bgColor} ${status.textColor} border-0`}
                        >
                          {groupedLeads[status.value]?.length || 0}
                        </Badge>
                      </div>
                      
                      <SortableContext
                        items={groupedLeads[status.value]?.map(lead => lead.id) || []}
                        strategy={verticalListSortingStrategy}
                        id={status.value}
                      >
                        <div className="flex-1 space-y-3">
                          {groupedLeads[status.value]?.map((lead) => (
                            <DraggableCard 
                              key={lead.id} 
                              lead={lead} 
                              updateLeadStatus={updateLeadStatus}
                            />
                          ))}
                          {groupedLeads[status.value]?.length === 0 && (
                            <EmptyState
                              icon={Inbox}
                              title={`Nenhum lead em ${status.label}`}
                              description={`Arraste leads de outras etapas ou crie um novo para começar`}
                              className="py-8"
                            />
                          )}
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
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Meta de Conversão</span>
                    <span className="font-medium">30%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="bg-primary h-3 rounded-full transition-all duration-500" 
                      style={{width: `${Math.min(stats.conversionRate, 100)}%`}}
                    ></div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stats.conversions} de {stats.totalLeads} leads convertidos
                  </div>
                </div>
              </FeatureCard>

              <FeatureCard
                title="Valor do Pipeline"
                description="Oportunidades em andamento"
                icon={DollarSign}
                actionLabel="Ver Detalhes"
                onAction={() => toast({ title: "Em desenvolvimento" })}
              >
                <div className="space-y-3">
                  {statusOptions.slice(0, 4).map((status) => {
                    const statusLeads = groupedLeads[status.value] || [];
                    const statusValue = statusLeads.reduce((sum, lead) => sum + (lead.valor_estimado || 0), 0);
                    return (
                      <div key={status.value} className="flex justify-between text-sm">
                        <span className={status.textColor}>{status.label}</span>
                        <span className="font-medium">
                          R$ {statusValue.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </FeatureCard>

              <QuickActions 
                actions={quickActions}
                title="Ações Rápidas"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Leads</CardTitle>
              <CardDescription>
                Visualização em tabela de todos os leads cadastrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Visualização em lista em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para criar lead */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar Novo Lead</DialogTitle>
            <DialogDescription>
              Adicione um novo lead ao funil de vendas
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="João Silva"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa</Label>
                <Input
                  id="empresa"
                  value={formData.empresa}
                  onChange={(e) => setFormData({...formData, empresa: e.target.value})}
                  placeholder="Empresa LTDA"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="joao@empresa.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  value={formData.cargo}
                  onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                  placeholder="Diretor de Marketing"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="origem">Origem do Lead</Label>
                <Select value={formData.origem} onValueChange={(value) => setFormData({...formData, origem: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="indicacao">Indicação</SelectItem>
                    <SelectItem value="marketing">Marketing Digital</SelectItem>
                    <SelectItem value="evento">Evento</SelectItem>
                    <SelectItem value="telefone">Contato Telefônico</SelectItem>
                    <SelectItem value="rede_social">Redes Sociais</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="valor_estimado">Valor Estimado (R$)</Label>
              <Input
                id="valor_estimado"
                type="number"
                step="0.01"
                value={formData.valor_estimado}
                onChange={(e) => setFormData({...formData, valor_estimado: e.target.value})}
                placeholder="0,00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                placeholder="Informações adicionais sobre o lead..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Criar Lead
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CRM;