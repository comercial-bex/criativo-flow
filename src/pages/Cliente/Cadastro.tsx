import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SectionHeader } from "@/components/SectionHeader";
import { Plus, Search, Edit, Trash2 } from "lucide-react";

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cnpj_cpf: string;
  endereco: string;
  status: 'ativo' | 'inativo' | 'prospecto';
  tipo: 'pessoa_fisica' | 'pessoa_juridica';
  assinatura_id?: string;
  observacoes?: string;
}

interface Assinatura {
  id: string;
  nome: string;
  preco: number;
}

// Mock de assinaturas disponíveis
const mockAssinaturas: Assinatura[] = [
  {
    id: '1',
    nome: 'Plano 90º',
    preco: 997
  },
  {
    id: '2',
    nome: 'Plano 180º',
    preco: 1497
  },
  {
    id: '3',
    nome: 'Plano 360º',
    preco: 2197
  }
];

const mockClientes: Cliente[] = [
  {
    id: "1",
    nome: "Tech Solutions Ltda",
    email: "contato@techsolutions.com",
    telefone: "(11) 99999-9999",
    cnpj_cpf: "12.345.678/0001-90",
    endereco: "São Paulo, SP",
    status: "ativo",
    tipo: "pessoa_juridica",
    assinatura_id: "2"
  },
  {
    id: "2",
    nome: "João Silva",
    email: "joao.silva@email.com",
    telefone: "(11) 88888-8888",
    cnpj_cpf: "123.456.789-00",
    endereco: "Rio de Janeiro, RJ",
    status: "prospecto",
    tipo: "pessoa_fisica"
  }
];

export default function ClienteCadastro() {
  const [clientes, setClientes] = useState<Cliente[]>(mockClientes);
  const [assinaturas] = useState<Assinatura[]>(mockAssinaturas);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState<Partial<Cliente>>({
    nome: "",
    email: "",
    telefone: "",
    cnpj_cpf: "",
    endereco: "",
    status: "prospecto",
    tipo: "pessoa_juridica",
    assinatura_id: "none",
    observacoes: ""
  });

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cnpj_cpf.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingClient) {
      setClientes(clientes.map(cliente => 
        cliente.id === editingClient.id 
          ? { ...cliente, ...formData }
          : cliente
      ));
      toast.success("Cliente atualizado com sucesso!");
    } else {
      const newCliente: Cliente = {
        ...formData as Cliente,
        id: Date.now().toString()
      };
      setClientes([...clientes, newCliente]);
      toast.success("Cliente cadastrado com sucesso!");
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      cnpj_cpf: "",
      endereco: "",
      status: "prospecto",
      tipo: "pessoa_juridica",
      assinatura_id: "none",
      observacoes: ""
    });
    setEditingClient(null);
    setShowForm(false);
  };

  const handleEdit = (cliente: Cliente) => {
    setFormData(cliente);
    setEditingClient(cliente);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setClientes(clientes.filter(cliente => cliente.id !== id));
    toast.success("Cliente removido com sucesso!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'inativo': return 'bg-red-100 text-red-800';
      case 'prospecto': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo';
      case 'inativo': return 'Inativo';
      case 'prospecto': return 'Prospecto';
      default: return status;
    }
  };

  const getAssinaturaNome = (assinaturaId?: string) => {
    if (!assinaturaId || assinaturaId === 'none') return 'Sem assinatura';
    const assinatura = assinaturas.find(a => a.id === assinaturaId);
    return assinatura ? `${assinatura.nome} (R$ ${assinatura.preco})` : 'Assinatura não encontrada';
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
            <CardTitle>
              {editingClient ? "Editar Cliente" : "Cadastrar Novo Cliente"}
            </CardTitle>
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
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select 
                    value={formData.tipo} 
                    onValueChange={(value) => setFormData({ ...formData, tipo: value as 'pessoa_fisica' | 'pessoa_juridica' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pessoa_fisica">Pessoa Física</SelectItem>
                      <SelectItem value="pessoa_juridica">Pessoa Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Label htmlFor="cnpj_cpf">
                    {formData.tipo === 'pessoa_juridica' ? 'CNPJ' : 'CPF'}
                  </Label>
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
                    onValueChange={(value) => setFormData({ ...formData, status: value as 'ativo' | 'inativo' | 'prospecto' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="prospecto">Prospecto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assinatura">Plano de Assinatura</Label>
                  <Select 
                    value={formData.assinatura_id || "none"} 
                    onValueChange={(value) => setFormData({ ...formData, assinatura_id: value === "none" ? undefined : value })}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Selecione um plano" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border shadow-lg z-50">
                      <SelectItem value="none">Sem assinatura</SelectItem>
                      {assinaturas.map((assinatura) => (
                        <SelectItem key={assinatura.id} value={assinatura.id}>
                          {assinatura.nome}
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

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">
                  {editingClient ? "Atualizar" : "Cadastrar"}
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
                  {cliente.assinatura_id && cliente.assinatura_id !== 'none' && (
                    <p className="text-sm font-medium text-primary">
                      {getAssinaturaNome(cliente.assinatura_id)}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
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
    </div>
  );
}