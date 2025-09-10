import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Phone, Mail, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

const CRM = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
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

  const getStatusInfo = (status: string) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  const groupedLeads = statusOptions.reduce((acc, status) => {
    acc[status.value] = leads.filter(lead => lead.status === status.value);
    return acc;
  }, {} as Record<string, Lead[]>);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">CRM / Comercial</h1>
            <p className="text-muted-foreground">
              Gerencie seu funil de vendas e oportunidades
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Lead
              </Button>
            </DialogTrigger>
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
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statusOptions.map((status) => (
          <div key={status.value} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{status.label}</h3>
              <Badge variant="secondary" className={status.color}>
                {groupedLeads[status.value]?.length || 0}
              </Badge>
            </div>
            
            <div className="space-y-3 min-h-96">
              {groupedLeads[status.value]?.map((lead) => (
                <Card key={lead.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{lead.nome}</CardTitle>
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
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CRM;