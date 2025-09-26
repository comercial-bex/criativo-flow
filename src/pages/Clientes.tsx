import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SectionHeader } from '@/components/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { OnboardingForm } from '@/components/OnboardingForm';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Phone,
  Mail,
  Building,
  MapPin,
  Calendar,
  Edit,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cnpj_cpf: string;
  endereco: string;
  status: 'ativo' | 'inativo' | 'pendente' | 'arquivado';
  responsavel_id?: string;
  assinatura_id?: string;
  created_at: string;
  updated_at: string;
}

interface Assinatura {
  id: string;
  nome: string;
  preco: number;
}

const Clientes = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [showForm, setShowForm] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState<Partial<Cliente>>({
    nome: "",
    email: "",
    telefone: "",
    cnpj_cpf: "",
    endereco: "",
    status: "ativo",
    assinatura_id: ""
  });
  const { toast: toastHook } = useToast();

  useEffect(() => {
    fetchClientes();
    fetchAssinaturas();
  }, []);

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toastHook({
        title: "Erro ao carregar clientes",
        description: "Não foi possível carregar a lista de clientes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAssinaturas = async () => {
    try {
      const { data, error } = await supabase
        .from('assinaturas')
        .select('*')
        .order('nome');

      if (error) throw error;
      setAssinaturas(data || []);
    } catch (error) {
      console.error('Erro ao carregar assinaturas:', error);
    }
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cnpj_cpf?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const clienteData = {
        nome: formData.nome!,
        email: formData.email!,
        telefone: formData.telefone || null,
        cnpj_cpf: formData.cnpj_cpf || null,
        endereco: formData.endereco || null,
        status: formData.status!,
        assinatura_id: (formData.assinatura_id && formData.assinatura_id !== 'none') ? formData.assinatura_id : null
      };

      const { error } = await supabase
        .from('clientes')
        .insert([clienteData]);

      if (error) {
        console.error('Erro ao criar cliente:', error);
        toast.error('Erro ao criar cliente');
        return;
      }

      toast.success("Cliente cadastrado com sucesso!");
      await fetchClientes();
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast.error('Erro ao salvar cliente');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      cnpj_cpf: "",
      endereco: "",
      status: "ativo",
      assinatura_id: ""
    });
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir cliente:', error);
        toast.error('Erro ao excluir cliente');
        return;
      }

      toast.success("Cliente removido com sucesso!");
      await fetchClientes();
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      toast.error('Erro ao excluir cliente');
    }
  };

  const handleOnboarding = (cliente: Cliente) => {
    if (!clienteTemAssinatura(cliente)) {
      toast.error('Cliente precisa ter uma assinatura para acessar o onboarding');
      return;
    }
    setSelectedCliente(cliente);
    setShowOnboarding(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'inativo': return 'bg-red-100 text-red-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'arquivado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo';
      case 'inativo': return 'Inativo';
      case 'pendente': return 'Pendente';
      case 'arquivado': return 'Arquivado';
      default: return status;
    }
  };

  const getAssinaturaNome = (assinaturaId?: string) => {
    if (!assinaturaId) return 'Sem assinatura';
    const assinatura = assinaturas.find(a => a.id === assinaturaId);
    return assinatura ? assinatura.nome : 'Plano não encontrado';
  };

  const clienteTemAssinatura = (cliente: Cliente) => {
    return cliente.assinatura_id && assinaturas.some(a => a.id === cliente.assinatura_id);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <SectionHeader
        title="Clientes"
        description="Gerencie informações e relacionamentos com clientes"
        icon={Users}
        action={{
          label: "Novo Cliente",
          onClick: () => setShowForm(true),
          icon: Plus
        }}
      />

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nome, empresa ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Mais Recentes</SelectItem>
            <SelectItem value="nome">Nome A-Z</SelectItem>
            <SelectItem value="empresa">Empresa A-Z</SelectItem>
            <SelectItem value="projetos">Mais Projetos</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Formulário de Cadastro */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome / Razão Social</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj_cpf">CNPJ/CPF</Label>
                <Input
                  id="cnpj_cpf"
                  value={formData.cnpj_cpf}
                  onChange={(e) => setFormData({ ...formData, cnpj_cpf: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({ ...formData, status: value as 'ativo' | 'inativo' | 'pendente' | 'arquivado' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="arquivado">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assinatura">Plano de Assinatura</Label>
                <Select 
                  value={formData.assinatura_id || 'none'} 
                  onValueChange={(value) => setFormData({ ...formData, assinatura_id: value === 'none' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem assinatura</SelectItem>
                    {assinaturas.map((assinatura) => (
                      <SelectItem key={assinatura.id} value={assinatura.id}>
                        {assinatura.nome} - R$ {assinatura.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Cadastrar"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Grid de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClientes.map((cliente) => (
          <Card key={cliente.id} className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {cliente.nome.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{cliente.nome}</CardTitle>
                    <p className="text-sm text-muted-foreground">{getAssinaturaNome(cliente.assinatura_id)}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(cliente.status)}>
                  {getStatusText(cliente.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 mr-2" />
                  {cliente.email}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 mr-2" />
                  {cliente.telefone}
                </div>
                {cliente.endereco && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    {cliente.endereco}
                  </div>
                )}
              </div>

              <div className="flex space-x-2 pt-2">
                <Button
                  variant={clienteTemAssinatura(cliente) ? "default" : "secondary"}
                  size="sm"
                  onClick={() => handleOnboarding(cliente)}
                  disabled={!clienteTemAssinatura(cliente)}
                  title={!clienteTemAssinatura(cliente) ? 'Cliente precisa ter uma assinatura para acessar o onboarding' : ''}
                >
                  <Users className="h-4 w-4 mr-1" />
                  {clienteTemAssinatura(cliente) ? "Onboarding" : "Sem Plano"}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/clientes/${cliente.id}/editar`)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir o cliente {cliente.nome}? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(cliente.id)}>
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClientes.length === 0 && clientes.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum cliente encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece adicionando seus primeiros clientes
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Cliente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal de Onboarding */}
      {selectedCliente && (
        <OnboardingForm
          isOpen={showOnboarding}
          onClose={() => {
            setShowOnboarding(false);
            setSelectedCliente(null);
          }}
          clienteId={selectedCliente.id}
          cliente={{
            nome: selectedCliente.nome,
            email: selectedCliente.email,
            telefone: selectedCliente.telefone,
            endereco: selectedCliente.endereco
          }}
        />
      )}
    </div>
  );
};

export default Clientes;