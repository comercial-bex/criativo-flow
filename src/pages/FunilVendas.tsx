import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, DollarSign, Calendar, User, Building } from 'lucide-react';
import { SectionHeader } from '@/components/SectionHeader';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Lead {
  id: string;
  nome: string;
  empresa: string;
  email: string;
  telefone: string;
  valor_estimado: number;
  status: string;
  observacoes: string;
  origem: string;
  responsavel_id: string;
  created_at: string;
  updated_at: string;
}

// Componente Card Arrastável
function LeadCard({ lead }: { lead: Lead }) {
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
      className="mb-3"
    >
      <Card className="cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 animate-fade-in">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-sm font-medium">{lead.nome}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">{lead.empresa}</p>
            </div>
            <Badge variant="outline" className="text-xs">
              {lead.origem}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <DollarSign className="h-3 w-3 mr-1" />
            R$ {(lead.valor_estimado || 0).toLocaleString('pt-BR')}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <User className="h-3 w-3 mr-1" />
            {lead.email}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date(lead.created_at).toLocaleDateString('pt-BR')}
          </div>
          {lead.observacoes && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
              {lead.observacoes}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Componente Coluna do Kanban
function KanbanColumn({ 
  title, 
  status, 
  leads, 
  count,
  bgColor = "bg-gray-50"
}: { 
  title: string; 
  status: string; 
  leads: Lead[]; 
  count: number;
  bgColor?: string;
}) {
  return (
    <div className={`${bgColor} rounded-lg p-4 min-h-[600px] flex flex-col`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-sm text-gray-700">{title}</h3>
        <Badge variant="secondary" className="text-xs">
          {count}
        </Badge>
      </div>
      
      <SortableContext items={leads.map(lead => lead.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

// Formulário para novo lead
function NovoLeadForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    nome: '',
    empresa: '',
    email: '',
    telefone: '',
    valor_estimado: '',
    origem: 'website',
    observacoes: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('leads')
        .insert({
          nome: formData.nome,
          empresa: formData.empresa,
          email: formData.email,
          telefone: formData.telefone,
          valor_estimado: formData.valor_estimado ? parseFloat(formData.valor_estimado) : null,
          origem: formData.origem,
          observacoes: formData.observacoes,
          status: 'pre_qualificacao'
        });

      if (error) throw error;

      toast({
        title: "Lead criado com sucesso!",
        description: "O novo lead foi adicionado ao funil",
      });

      setFormData({
        nome: '',
        empresa: '',
        email: '',
        telefone: '',
        valor_estimado: '',
        origem: 'website',
        observacoes: ''
      });
      
      onSuccess();
    } catch (error) {
      console.error('Erro ao criar lead:', error);
      toast({
        title: "Erro ao criar lead",
        description: "Não foi possível criar o lead",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome do Lead</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Ex: João Silva"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="empresa">Empresa</Label>
          <Input
            id="empresa"
            value={formData.empresa}
            onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
            placeholder="Ex: Tech Solutions Ltda"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="joao@empresa.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            value={formData.telefone}
            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            placeholder="(11) 99999-9999"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="valor_estimado">Valor Estimado (R$)</Label>
          <Input
            id="valor_estimado"
            type="number"
            step="0.01"
            value={formData.valor_estimado}
            onChange={(e) => setFormData({ ...formData, valor_estimado: e.target.value })}
            placeholder="0,00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="origem">Origem do Lead</Label>
          <Select 
            value={formData.origem} 
            onValueChange={(value) => setFormData({ ...formData, origem: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="indicacao">Indicação</SelectItem>
              <SelectItem value="redes_sociais">Redes Sociais</SelectItem>
              <SelectItem value="evento">Evento</SelectItem>
              <SelectItem value="telemarketing">Telemarketing</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes}
          onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
          placeholder="Informações adicionais sobre o lead..."
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? "Criando..." : "Criar Lead"}
        </Button>
      </div>
    </form>
  );
}

export default function FunilVendas() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
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
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
      toast({
        title: "Erro ao carregar leads",
        description: "Não foi possível carregar os leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

    // Atualizar status no banco
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', activeLeadId);

      if (error) throw error;

      // Atualizar estado local
      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === activeLeadId ? { ...lead, status: newStatus } : lead
        )
      );

      toast({
        title: "Lead movido",
        description: "Status do lead atualizado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
      toast({
        title: "Erro ao mover lead",
        description: "Não foi possível atualizar o status do lead",
        variant: "destructive",
      });
    }
  };

  // Organizar leads por status
  const leadsByStatus = {
    pre_qualificacao: leads.filter(lead => lead.status === 'pre_qualificacao'),
    proposta: leads.filter(lead => lead.status === 'proposta'),
    negociacao: leads.filter(lead => lead.status === 'negociacao'),
    fechado: leads.filter(lead => lead.status === 'fechado'),
    perdido: leads.filter(lead => lead.status === 'perdido'),
  };

  const activeLead = leads.find(lead => lead.id === activeId);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-96 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Funil de Vendas"
        description="Gerencie seus leads através do processo de vendas"
        action={{
          label: "Novo Projeto",
          onClick: () => setDialogOpen(true),
          icon: Plus
        }}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-[600px]">
          <SortableContext items={['pre_qualificacao']}>
            <div id="pre_qualificacao">
              <KanbanColumn
                title="Pré-qualificação"
                status="pre_qualificacao"
                leads={leadsByStatus.pre_qualificacao}
                count={leadsByStatus.pre_qualificacao.length}
                bgColor="bg-gray-50"
              />
            </div>
          </SortableContext>

          <SortableContext items={['proposta']}>
            <div id="proposta">
              <KanbanColumn
                title="Proposta"
                status="proposta"
                leads={leadsByStatus.proposta}
                count={leadsByStatus.proposta.length}
                bgColor="bg-blue-50"
              />
            </div>
          </SortableContext>

          <SortableContext items={['negociacao']}>
            <div id="negociacao">
              <KanbanColumn
                title="Negociação"
                status="negociacao"
                leads={leadsByStatus.negociacao}
                count={leadsByStatus.negociacao.length}
                bgColor="bg-yellow-50"
              />
            </div>
          </SortableContext>

          <SortableContext items={['fechado']}>
            <div id="fechado">
              <KanbanColumn
                title="Fechado"
                status="fechado"
                leads={leadsByStatus.fechado}
                count={leadsByStatus.fechado.length}
                bgColor="bg-green-50"
              />
            </div>
          </SortableContext>

          <SortableContext items={['perdido']}>
            <div id="perdido">
              <KanbanColumn
                title="Perdido"
                status="perdido"
                leads={leadsByStatus.perdido}
                count={leadsByStatus.perdido.length}
                bgColor="bg-red-50"
              />
            </div>
          </SortableContext>
        </div>

        <DragOverlay>
          {activeLead ? <LeadCard lead={activeLead} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Dialog para criar novo lead */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar Novo Lead</DialogTitle>
            <DialogDescription>
              Adicione um novo lead ao funil de vendas
            </DialogDescription>
          </DialogHeader>
          <NovoLeadForm onSuccess={() => {
            setDialogOpen(false);
            fetchLeads();
          }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}