import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingForm } from "@/components/OnboardingForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SectionHeader } from "@/components/SectionHeader";
import { Plus, Search, Edit, Trash2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  created_at?: string;
  updated_at?: string;
}

interface Assinatura {
  id: string;
  nome: string;
  preco: number;
}

// Mock de assinaturas disponíveis - usando UUIDs válidos
const mockAssinaturas: Assinatura[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    nome: 'Plano 90º',
    preco: 997
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    nome: 'Plano 180º',
    preco: 1497
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    nome: 'Plano 360º',
    preco: 2197
  }
];

// Dados mockados removidos - agora carregamos do Supabase

export default function ClienteCadastro() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [assinaturas] = useState<Assinatura[]>(mockAssinaturas);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Cliente>>({
    nome: "",
    email: "",
    telefone: "",
    cnpj_cpf: "",
    endereco: "",
    status: "ativo",
    assinatura_id: ""
  });

  // Carregar clientes do Supabase
  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar clientes:', error);
        toast.error('Erro ao carregar clientes');
        return;
      }

      setClientes(data || []);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cnpj_cpf.includes(searchTerm)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Preparar dados para o banco
      const clienteData = {
        nome: formData.nome!,
        email: formData.email!,
        telefone: formData.telefone || null,
        cnpj_cpf: formData.cnpj_cpf || null,
        endereco: formData.endereco || null,
        status: formData.status!,
        assinatura_id: (formData.assinatura_id && formData.assinatura_id !== 'none') ? formData.assinatura_id : null
      };

      // Criar novo cliente
      const { error } = await supabase
        .from('clientes')
        .insert([clienteData]);

      if (error) {
        console.error('Erro ao criar cliente:', error);
        toast.error('Erro ao criar cliente');
        return;
      }

      toast.success("Cliente cadastrado com sucesso!");

      // Recarregar lista de clientes
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

  const handleEdit = (cliente: Cliente) => {
    navigate(`/clientes/${cliente.id}/editar`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) {
      return;
    }

    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleOnboarding = (cliente: Cliente) => {
    if (!clienteTemAssinatura(cliente)) {
      toast.error('Cliente precisa ter uma assinatura (90º, 180º ou 360º) para acessar o onboarding');
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
    const validAssinaturaIds = ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003'];
    return cliente.assinatura_id && validAssinaturaIds.includes(cliente.assinatura_id);
  };


  return (
    <div className="space-y-6">
      <SectionHeader
        title="Cadastro de Clientes"
        description="Gerencie o cadastro e informações dos seus clientes"
      />

      {/* Header com busca e botão de adicionar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Formulário de Cadastro */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Cadastrar Novo Cliente</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}

      {/* Lista de Clientes */}
      <div className="grid grid-cols-1 gap-4">
        {filteredClientes.map((cliente) => (
          <Card key={cliente.id}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{cliente.nome}</h3>
                    <Badge className={getStatusColor(cliente.status)}>
                      {getStatusText(cliente.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{cliente.email}</p>
                  <p className="text-sm text-muted-foreground">
                    {cliente.telefone} • {cliente.cnpj_cpf}
                  </p>
                  <p className="text-sm text-muted-foreground">{cliente.endereco}</p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Plano:</strong> {getAssinaturaNome(cliente.assinatura_id)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={clienteTemAssinatura(cliente) ? "default" : "secondary"}
                    size="sm"
                    onClick={() => handleOnboarding(cliente)}
                    disabled={!clienteTemAssinatura(cliente)}
                    title={!clienteTemAssinatura(cliente) ? 'Cliente precisa ter uma assinatura (90º, 180º ou 360º) para acessar o onboarding' : ''}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Onboarding
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(cliente)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(cliente.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClientes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
        </div>
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
}