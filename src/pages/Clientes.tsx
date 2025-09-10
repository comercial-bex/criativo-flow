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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Users, Phone, Mail, MapPin, Building, Edit, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cnpj_cpf: string;
  endereco: string;
  status: string;
  responsavel_id: string;
  created_at: string;
  updated_at: string;
}

const statusOptions = [
  { value: 'ativo', label: 'Ativo', color: 'bg-green-100 text-green-800' },
  { value: 'inativo', label: 'Inativo', color: 'bg-gray-100 text-gray-800' },
  { value: 'pendente', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'arquivado', label: 'Arquivado', color: 'bg-red-100 text-red-800' }
];

const Clientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [viewingCliente, setViewingCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cnpj_cpf: '',
    endereco: '',
    status: 'ativo'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchClientes();
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
      toast({
        title: "Erro ao carregar clientes",
        description: "Não foi possível carregar a lista de clientes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCliente) {
        // Atualizar cliente existente
        const { error } = await supabase
          .from('clientes')
          .update({
            ...formData,
            status: formData.status as 'ativo' | 'inativo' | 'pendente' | 'arquivado'
          })
          .eq('id', editingCliente.id);

        if (error) throw error;

        toast({
          title: "Cliente atualizado com sucesso!",
          description: "As informações do cliente foram atualizadas",
        });
      } else {
        // Criar novo cliente
        const { error } = await supabase
          .from('clientes')
          .insert({
            ...formData,
            status: formData.status as 'ativo' | 'inativo' | 'pendente' | 'arquivado'
          });

        if (error) throw error;

        toast({
          title: "Cliente criado com sucesso!",
          description: "O novo cliente foi adicionado à lista",
        });
      }

      setDialogOpen(false);
      setEditingCliente(null);
      resetForm();
      fetchClientes();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast({
        title: "Erro ao salvar cliente",
        description: "Não foi possível salvar as informações do cliente",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cnpj_cpf: '',
      endereco: '',
      status: 'ativo'
    });
  };

  const openEditDialog = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nome: cliente.nome,
      email: cliente.email || '',
      telefone: cliente.telefone || '',
      cnpj_cpf: cliente.cnpj_cpf || '',
      endereco: cliente.endereco || '',
      status: cliente.status
    });
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingCliente(null);
    resetForm();
    setDialogOpen(true);
  };

  const getStatusInfo = (status: string) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cnpj_cpf?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Gestão de Clientes</h2>
            <p className="text-muted-foreground">
              Gerencie informações dos seus clientes
            </p>
          </div>
          
          <Button onClick={openNewDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>

        {/* Barra de pesquisa */}
        <div className="max-w-md mb-6">
          <Input
            placeholder="Buscar clientes por nome, email ou documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Cards de estatísticas */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientes.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clientes.filter(c => c.status === 'ativo').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clientes.filter(c => c.status === 'pendente').length}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabela de clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            {filteredClientes.length} cliente(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando clientes...</div>
          ) : filteredClientes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'Nenhum cliente encontrado para esta pesquisa' : 'Nenhum cliente cadastrado'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes.map((cliente) => {
                  const statusInfo = getStatusInfo(cliente.status);
                  return (
                    <TableRow key={cliente.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{cliente.nome}</div>
                          {cliente.endereco && (
                            <div className="text-sm text-muted-foreground flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {cliente.endereco}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {cliente.email && (
                            <div className="text-sm flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {cliente.email}
                            </div>
                          )}
                          {cliente.telefone && (
                            <div className="text-sm flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {cliente.telefone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {cliente.cnpj_cpf && (
                          <span className="text-sm font-mono">{cliente.cnpj_cpf}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingCliente(cliente)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(cliente)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog para criar/editar cliente */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
            </DialogTitle>
            <DialogDescription>
              {editingCliente 
                ? 'Atualize as informações do cliente'
                : 'Adicione um novo cliente ao sistema'
              }
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
              <Label htmlFor="cnpj_cpf">CPF/CNPJ</Label>
              <Input
                id="cnpj_cpf"
                value={formData.cnpj_cpf}
                onChange={(e) => setFormData({...formData, cnpj_cpf: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({...formData, status: value})}
              >
                <SelectTrigger>
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
            
            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Textarea
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                rows={3}
              />
            </div>
            
            <Button type="submit" className="w-full">
              {editingCliente ? 'Atualizar Cliente' : 'Criar Cliente'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para visualizar cliente */}
      <Dialog open={!!viewingCliente} onOpenChange={() => setViewingCliente(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
            <DialogDescription>
              Informações completas do cliente
            </DialogDescription>
          </DialogHeader>
          
          {viewingCliente && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Nome</Label>
                <p className="text-sm">{viewingCliente.nome}</p>
              </div>
              
              {viewingCliente.email && (
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm">{viewingCliente.email}</p>
                </div>
              )}
              
              {viewingCliente.telefone && (
                <div>
                  <Label className="text-sm font-medium">Telefone</Label>
                  <p className="text-sm">{viewingCliente.telefone}</p>
                </div>
              )}
              
              {viewingCliente.cnpj_cpf && (
                <div>
                  <Label className="text-sm font-medium">CPF/CNPJ</Label>
                  <p className="text-sm font-mono">{viewingCliente.cnpj_cpf}</p>
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="mt-1">
                  <Badge className={getStatusInfo(viewingCliente.status).color}>
                    {getStatusInfo(viewingCliente.status).label}
                  </Badge>
                </div>
              </div>
              
              {viewingCliente.endereco && (
                <div>
                  <Label className="text-sm font-medium">Endereço</Label>
                  <p className="text-sm">{viewingCliente.endereco}</p>
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium">Data de Cadastro</Label>
                <p className="text-sm">
                  {new Date(viewingCliente.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clientes;