import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Camera, Clock, Plus, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';

interface CaptacaoAgenda {
  id: string;
  titulo: string;
  cliente_id: string | null;
  especialista_id: string;
  data_captacao: string;
  local: string | null;
  equipamentos: string[] | null;
  status: string;
  observacoes: string | null;
}

interface Cliente {
  id: string;
  nome: string;
}

export default function CaptacoesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { startTutorial, hasSeenTutorial } = useTutorial('audiovisual-captacoes');
  const [captacoes, setCaptacoes] = useState<CaptacaoAgenda[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCaptacao, setEditingCaptacao] = useState<CaptacaoAgenda | null>(null);

  const [formData, setFormData] = useState({
    titulo: "",
    cliente_id: "",
    data_captacao: "",
    local: "",
    equipamentos: "",
    status: "agendado",
    observacoes: ""
  });

  useEffect(() => {
    if (user) {
      fetchCaptacoes();
      fetchClientes();
    }
  }, [user]);

  const fetchCaptacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('captacoes_agenda')
        .select(`
          *,
          clientes:cliente_id(nome)
        `)
        .eq('especialista_id', user?.id)
        .order('data_captacao', { ascending: true });

      if (error) throw error;
      setCaptacoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar captações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as captações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome')
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
      const equipamentosArray = formData.equipamentos
        .split(',')
        .map(eq => eq.trim())
        .filter(eq => eq.length > 0);

      const captacaoData = {
        titulo: formData.titulo,
        cliente_id: formData.cliente_id || null,
        especialista_id: user?.id,
        data_captacao: formData.data_captacao,
        local: formData.local || null,
        equipamentos: equipamentosArray.length > 0 ? equipamentosArray : null,
        status: formData.status,
        observacoes: formData.observacoes || null
      };

      if (editingCaptacao) {
        const { error } = await supabase
          .from('captacoes_agenda')
          .update(captacaoData)
          .eq('id', editingCaptacao.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Captação atualizada com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('captacoes_agenda')
          .insert([captacaoData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Captação agendada com sucesso!",
        });
      }

      setFormData({
        titulo: "",
        cliente_id: "",
        data_captacao: "",
        local: "",
        equipamentos: "",
        status: "agendado",
        observacoes: ""
      });
      setEditingCaptacao(null);
      setIsDialogOpen(false);
      fetchCaptacoes();

    } catch (error) {
      console.error('Erro ao salvar captação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a captação.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (captacao: CaptacaoAgenda) => {
    setEditingCaptacao(captacao);
    setFormData({
      titulo: captacao.titulo,
      cliente_id: captacao.cliente_id || "",
      data_captacao: format(new Date(captacao.data_captacao), "yyyy-MM-dd'T'HH:mm"),
      local: captacao.local || "",
      equipamentos: captacao.equipamentos?.join(', ') || "",
      status: captacao.status,
      observacoes: captacao.observacoes || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta captação?')) return;

    try {
      const { error } = await supabase
        .from('captacoes_agenda')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Captação excluída com sucesso!",
      });
      fetchCaptacoes();
    } catch (error) {
      console.error('Erro ao excluir captação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a captação.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return 'bg-blue-500';
      case 'em_andamento': return 'bg-yellow-500';
      case 'concluido': return 'bg-green-500';
      case 'cancelado': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Camera className="h-8 w-8" />
            Agenda de Captações
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas gravações e captações de conteúdo
          </p>
        </div>
        <div className="flex gap-2">
          <TutorialButton onStart={startTutorial} hasSeenTutorial={hasSeenTutorial} />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-tour="nova-captacao">
                <Plus className="h-4 w-4" />
                Nova Captação
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCaptacao ? 'Editar Captação' : 'Nova Captação'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="titulo">Título da Captação</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="cliente_id">Cliente</Label>
                  <Select value={formData.cliente_id} onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}>
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

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agendado">Agendado</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="data_captacao">Data e Hora</Label>
                  <Input
                    id="data_captacao"
                    type="datetime-local"
                    value={formData.data_captacao}
                    onChange={(e) => setFormData({ ...formData, data_captacao: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="local">Local da Captação</Label>
                  <Input
                    id="local"
                    value={formData.local}
                    onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                    placeholder="Endereço ou descrição do local"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="equipamentos">Equipamentos Necessários</Label>
                  <Input
                    id="equipamentos"
                    value={formData.equipamentos}
                    onChange={(e) => setFormData({ ...formData, equipamentos: e.target.value })}
                    placeholder="Câmera 4K, Drone, Iluminação... (separados por vírgula)"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Detalhes adicionais sobre a captação..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCaptacao ? 'Atualizar' : 'Agendar'} Captação
                </Button>
              </div>
            </form>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Captações List */}
      <div className="grid gap-4" data-tour="lista-captacoes">
        {captacoes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma captação agendada</h3>
              <p className="text-muted-foreground">
                Clique em "Nova Captação" para agendar sua primeira gravação
              </p>
            </CardContent>
          </Card>
        ) : (
          captacoes.map((captacao) => (
            <Card key={captacao.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{captacao.titulo}</h3>
                      <Badge variant="outline" className={`${getStatusColor(captacao.status)} text-white`}>
                        {captacao.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(captacao.data_captacao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </div>

                      {captacao.local && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {captacao.local}
                        </div>
                      )}

                      {(captacao as any).clientes && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{(captacao as any).clientes.nome}</span>
                        </div>
                      )}
                    </div>

                    {captacao.equipamentos && captacao.equipamentos.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {captacao.equipamentos.map((equipamento, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {equipamento}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {captacao.observacoes && (
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                        {captacao.observacoes}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(captacao)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(captacao.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}