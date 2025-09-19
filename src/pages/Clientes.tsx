import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SectionHeader } from '@/components/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Eye
} from 'lucide-react';
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

const Clientes = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
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

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cnpj_cpf?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Dados simulados para demonstração do layout
  const clientesDemo = [
    {
      id: '1',
      nome: 'João Silva',
      email: 'joao@empresa.com',
      telefone: '(11) 99999-9999',
      empresa: 'Tech Solutions',
      cidade: 'São Paulo',
      avatar: 'JS',
      projetos: 3,
      valor: 'R$ 45.000',
      status: 'Ativo'
    },
    {
      id: '2',
      nome: 'Maria Santos',
      email: 'maria@startup.com',
      telefone: '(21) 88888-8888',
      empresa: 'Startup Inovadora',
      cidade: 'Rio de Janeiro',
      avatar: 'MS',
      projetos: 1,
      valor: 'R$ 25.000',
      status: 'Ativo'
    },
    {
      id: '3',
      nome: 'Pedro Costa',
      email: 'pedro@consultoria.com',
      telefone: '(31) 77777-7777',
      empresa: 'Consultoria Estratégica',
      cidade: 'Belo Horizonte',
      avatar: 'PC',
      projetos: 5,
      valor: 'R$ 80.000',
      status: 'Ativo'
    }
  ];

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
          onClick: () => toast({ title: "Em desenvolvimento" }),
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

      {/* Grid de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(filteredClientes.length > 0 ? filteredClientes : clientesDemo).map((cliente) => (
          <Card key={cliente.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {'avatar' in cliente ? cliente.avatar : cliente.nome.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{cliente.nome}</CardTitle>
                    <p className="text-sm text-muted-foreground">{'empresa' in cliente ? cliente.empresa : cliente.cnpj_cpf}</p>
                  </div>
                </div>
                {'status' in cliente && (
                  <Badge className="bg-green-100 text-green-800">
                    {cliente.status}
                  </Badge>
                )}
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
                {'cidade' in cliente && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    {cliente.cidade}
                  </div>
                )}
              </div>

              {'projetos' in cliente && (
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-primary">{cliente.projetos}</div>
                      <div className="text-xs text-muted-foreground">Projetos</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-green-600">{cliente.valor}</div>
                      <div className="text-xs text-muted-foreground">Valor Total</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => navigate(`/clientes/${cliente.id}/perfil`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Perfil
                </Button>
                <Button size="sm" className="flex-1">
                  Contatar
                </Button>
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
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Cliente
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Clientes;