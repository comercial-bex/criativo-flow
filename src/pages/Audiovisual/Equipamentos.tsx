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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Mic, Monitor, Zap, Plus, Edit, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface Equipamento {
  id: string;
  nome: string;
  tipo: string;
  status: string;
  responsavel_atual: string | null;
  data_reserva: string | null;
  observacoes: string | null;
  created_at: string;
}

interface Profile {
  id: string;
  nome: string;
}

export default function EquipamentosPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEquipamento, setEditingEquipamento] = useState<Equipamento | null>(null);
  const [activeTab, setActiveTab] = useState("todos");

  const [formData, setFormData] = useState({
    nome: "",
    tipo: "",
    status: "disponivel",
    responsavel_atual: "",
    data_reserva: "",
    observacoes: ""
  });

  useEffect(() => {
    if (user) {
      fetchEquipamentos();
      fetchProfiles();
    }
  }, [user]);

  const fetchEquipamentos = async () => {
    try {
      const { data, error } = await supabase
        .from('equipamentos')
        .select(`
          *,
          responsavel:responsavel_atual(nome)
        `)
        .order('nome');

      if (error) throw error;
      setEquipamentos(data || []);
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os equipamentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome')
        .order('nome');

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Erro ao carregar perfis:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const equipamentoData = {
        nome: formData.nome,
        tipo: formData.tipo,
        status: formData.status,
        responsavel_atual: formData.responsavel_atual || null,
        data_reserva: formData.data_reserva || null,
        observacoes: formData.observacoes || null
      };

      if (editingEquipamento) {
        const { error } = await supabase
          .from('equipamentos')
          .update(equipamentoData)
          .eq('id', editingEquipamento.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Equipamento atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('equipamentos')
          .insert([equipamentoData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Equipamento cadastrado com sucesso!",
        });
      }

      setFormData({
        nome: "",
        tipo: "",
        status: "disponivel",
        responsavel_atual: "",
        data_reserva: "",
        observacoes: ""
      });
      setEditingEquipamento(null);
      setIsDialogOpen(false);
      fetchEquipamentos();

    } catch (error) {
      console.error('Erro ao salvar equipamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o equipamento.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (equipamento: Equipamento) => {
    setEditingEquipamento(equipamento);
    setFormData({
      nome: equipamento.nome,
      tipo: equipamento.tipo,
      status: equipamento.status,
      responsavel_atual: equipamento.responsavel_atual || "",
      data_reserva: equipamento.data_reserva 
        ? format(new Date(equipamento.data_reserva), "yyyy-MM-dd'T'HH:mm") 
        : "",
      observacoes: equipamento.observacoes || ""
    });
    setIsDialogOpen(true);
  };

  const handleReservar = async (equipamentoId: string) => {
    try {
      const { error } = await supabase
        .from('equipamentos')
        .update({
          status: 'reservado',
          responsavel_atual: user?.id,
          data_reserva: new Date().toISOString()
        })
        .eq('id', equipamentoId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Equipamento reservado com sucesso!",
      });
      fetchEquipamentos();
    } catch (error) {
      console.error('Erro ao reservar equipamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível reservar o equipamento.",
        variant: "destructive",
      });
    }
  };

  const handleDevolver = async (equipamentoId: string) => {
    try {
      const { error } = await supabase
        .from('equipamentos')
        .update({
          status: 'disponivel',
          responsavel_atual: null,
          data_reserva: null
        })
        .eq('id', equipamentoId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Equipamento devolvido com sucesso!",
      });
      fetchEquipamentos();
    } catch (error) {
      console.error('Erro ao devolver equipamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível devolver o equipamento.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponivel': return 'bg-green-500';
      case 'reservado': return 'bg-yellow-500';
      case 'em_uso': return 'bg-blue-500';
      case 'manutencao': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'disponivel': return <CheckCircle className="h-4 w-4" />;
      case 'reservado': return <Clock className="h-4 w-4" />;
      case 'em_uso': return <AlertCircle className="h-4 w-4" />;
      case 'manutencao': return <AlertCircle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'camera': return <Camera className="h-5 w-5" />;
      case 'audio': return <Mic className="h-5 w-5" />;
      case 'iluminacao': return <Zap className="h-5 w-5" />;
      case 'monitor': return <Monitor className="h-5 w-5" />;
      default: return <Camera className="h-5 w-5" />;
    }
  };

  const filteredEquipamentos = equipamentos.filter(equipamento => {
    if (activeTab === "todos") return true;
    if (activeTab === "disponivel") return equipamento.status === 'disponivel';
    if (activeTab === "reservado") return ['reservado', 'em_uso'].includes(equipamento.status);
    if (activeTab === "manutencao") return equipamento.status === 'manutencao';
    return true;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(9)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-muted rounded"></div>
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
            Equipamentos
          </h1>
          <p className="text-muted-foreground">
            Gerencie o inventário de equipamentos audiovisuais
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Equipamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingEquipamento ? 'Editar Equipamento' : 'Novo Equipamento'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="nome">Nome do Equipamento</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Câmera Canon EOS R5"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="camera">Câmera</SelectItem>
                      <SelectItem value="audio">Áudio</SelectItem>
                      <SelectItem value="iluminacao">Iluminação</SelectItem>
                      <SelectItem value="monitor">Monitor</SelectItem>
                      <SelectItem value="drone">Drone</SelectItem>
                      <SelectItem value="tripod">Tripé</SelectItem>
                      <SelectItem value="lente">Lente</SelectItem>
                      <SelectItem value="bateria">Bateria</SelectItem>
                      <SelectItem value="memoria">Cartão de Memória</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
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
                      <SelectItem value="disponivel">Disponível</SelectItem>
                      <SelectItem value="reservado">Reservado</SelectItem>
                      <SelectItem value="em_uso">Em Uso</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.status !== 'disponivel' && (
                  <>
                    <div>
                      <Label htmlFor="responsavel_atual">Responsável</Label>
                      <Select value={formData.responsavel_atual} onValueChange={(value) => setFormData({ ...formData, responsavel_atual: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um responsável" />
                        </SelectTrigger>
                        <SelectContent>
                          {profiles.map((profile) => (
                            <SelectItem key={profile.id} value={profile.id}>
                              {profile.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="data_reserva">Data/Hora da Reserva</Label>
                      <Input
                        id="data_reserva"
                        type="datetime-local"
                        value={formData.data_reserva}
                        onChange={(e) => setFormData({ ...formData, data_reserva: e.target.value })}
                      />
                    </div>
                  </>
                )}

                <div className="col-span-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Estado do equipamento, defeitos, acessórios inclusos..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingEquipamento ? 'Atualizar' : 'Cadastrar'} Equipamento
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Disponíveis</p>
                <p className="text-2xl font-bold">
                  {equipamentos.filter(e => e.status === 'disponivel').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Reservados</p>
                <p className="text-2xl font-bold">
                  {equipamentos.filter(e => ['reservado', 'em_uso'].includes(e.status)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Manutenção</p>
                <p className="text-2xl font-bold">
                  {equipamentos.filter(e => e.status === 'manutencao').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{equipamentos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="disponivel">Disponíveis</TabsTrigger>
          <TabsTrigger value="reservado">Reservados</TabsTrigger>
          <TabsTrigger value="manutencao">Manutenção</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredEquipamentos.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum equipamento encontrado</h3>
                <p className="text-muted-foreground">
                  {activeTab === "todos" 
                    ? "Clique em 'Novo Equipamento' para começar" 
                    : `Nenhum equipamento ${activeTab} encontrado`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredEquipamentos.map((equipamento) => (
                <Card key={equipamento.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getTipoIcon(equipamento.tipo)}
                        <div>
                          <CardTitle className="text-lg">{equipamento.nome}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {equipamento.tipo}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(equipamento)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(equipamento.status)}
                        <Badge className={`${getStatusColor(equipamento.status)} text-white`}>
                          {equipamento.status}
                        </Badge>
                      </div>
                    </div>

                    {equipamento.responsavel_atual && (
                      <div className="text-sm">
                        <p className="text-muted-foreground">Responsável:</p>
                        <p className="font-medium">{(equipamento as any).responsavel?.nome}</p>
                      </div>
                    )}

                    {equipamento.data_reserva && (
                      <div className="text-sm">
                        <p className="text-muted-foreground">Reservado em:</p>
                        <p>{format(new Date(equipamento.data_reserva), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                      </div>
                    )}

                    {equipamento.observacoes && (
                      <div className="text-sm">
                        <p className="text-muted-foreground">Observações:</p>
                        <p className="text-sm bg-muted p-2 rounded">{equipamento.observacoes}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {equipamento.status === 'disponivel' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleReservar(equipamento.id)}
                          className="flex-1"
                        >
                          Reservar
                        </Button>
                      )}
                      
                      {equipamento.responsavel_atual === user?.id && ['reservado', 'em_uso'].includes(equipamento.status) && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDevolver(equipamento.id)}
                          className="flex-1"
                        >
                          Devolver
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}