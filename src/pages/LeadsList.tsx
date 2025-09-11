import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SectionHeader } from '@/components/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Target, 
  Plus, 
  Search, 
  Filter,
  Phone,
  Mail,
  Building,
  DollarSign,
  Calendar,
  User
} from 'lucide-react';
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

const LeadsList = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
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

  // Status com cores baseadas no Figma
  const statusCards = [
    {
      title: 'Novo Lead',
      value: 'R$2.000 / Mês',
      color: 'bg-red-500',
      count: leads.filter(l => l.status === 'pre_qualificacao').length
    },
    {
      title: 'Reunião Marcada',
      value: 'R$2.000 / Mês',
      color: 'bg-orange-500',
      count: leads.filter(l => l.status === 'proposta').length
    },
    {
      title: 'Proposta Enviada',
      value: 'R$1.500 / Mês',
      color: 'bg-primary',
      count: leads.filter(l => l.status === 'negociacao').length
    },
    {
      title: 'Qualificado',
      value: 'R$2.000 / Mês',
      color: 'bg-blue-500',
      count: leads.filter(l => l.status === 'fechado').length
    }
  ];

  // Dados simulados para demonstração
  const leadsDemo = [
    {
      id: '1',
      nome: 'Hemerson Harison',
      empresa: 'Agência Bex',
      avatar: 'HH',
      valor: 'R$2.000',
      periodo: 'Mês',
      data: 'Jan 30, 2022'
    },
    {
      id: '2',
      nome: 'Thaís Lopes',
      empresa: 'Agência Thaís',
      avatar: 'TL',
      valor: 'R$4k',
      periodo: 'Jan 30, 2022',
      data: 'Jan 30, 2022'
    },
    {
      id: '3',
      nome: 'Gabriel Brito',
      empresa: "Gabriel's Motions",
      avatar: 'GB',
      valor: 'R$23k',
      periodo: 'Jan 5, 2022',
      data: 'Jan 5, 2022'
    },
    {
      id: '4',
      nome: 'Vitória Cardoso',
      empresa: 'Victorya Media',
      avatar: 'VC',
      valor: 'R$7k',
      periodo: 'Dec 26, 2022',
      data: 'Dec 26, 2022'
    }
  ];

  const agendaItems = [
    { tipo: 'Reunião com Thiago', horario: 'Ontem às 05:30' },
    { tipo: 'Reunião com time bex', horario: 'Segunda às 08:30' },
    { tipo: 'Protótipo inicial', horario: 'Segunda às 10:30' }
  ];

  const empresaInfo = {
    nome: 'Empresa Tal',
    descricao: 'As a company lorem ipsum dolor sit amet accross the sea.',
    telefone: '+55 (11) 99999-9999',
    valor: 'R$2.000 / Mês'
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <SectionHeader
        title="Lista de Leads"
        description="Gerencie seus leads e oportunidades de negócio"
        icon={Target}
        action={{
          label: "Adicionar",
          onClick: () => toast({ title: "Em desenvolvimento" }),
          icon: Plus
        }}
      />

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Ordem: Mais Novo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Mais Novo</SelectItem>
            <SelectItem value="nome">Nome A-Z</SelectItem>
            <SelectItem value="valor">Maior Valor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards de Status - baseado no Figma */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusCards.map((card, index) => (
          <Card key={index} className={`${card.color} text-white`}>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium">{card.title}</CardTitle>
              <p className="text-sm opacity-90">{card.value}</p>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de Leads */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-4">
            {leadsDemo.map((lead) => (
              <Card key={lead.id} className="hover:shadow-md transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {lead.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{lead.nome}</h3>
                        <p className="text-sm text-muted-foreground">{lead.empresa}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">{lead.valor}</div>
                      <div className="text-sm text-muted-foreground">{lead.periodo}</div>
                    </div>
                  </div>
                  
                  {/* Seções adicionais baseadas no Figma */}
                  <div className="mt-4 space-y-3">
                    <div className="text-sm">
                      <strong>Lead 02</strong>
                      <p className="text-muted-foreground">{lead.valor} / Mês</p>
                    </div>
                    
                    <div className="text-sm">
                      <strong>Lead 03</strong>
                      <p className="text-muted-foreground">$4k - {lead.data}</p>
                    </div>
                    
                    <div className="text-sm">
                      <strong>Lead 04</strong>
                      <p className="text-muted-foreground">$23k - {lead.data}</p>
                    </div>
                    
                    <div className="text-sm">
                      <strong>Lead 05</strong>
                      <p className="text-muted-foreground">$19k - {lead.data}</p>
                    </div>
                    
                    <div className="text-sm">
                      <strong>Lead 06</strong>
                      <p className="text-muted-foreground">$23k - {lead.data}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4 mr-2" />
                        Ligar
                      </Button>
                      <Button size="sm" className="bg-primary text-primary-foreground">
                        <Mail className="h-4 w-4 mr-2" />
                        Mensagem
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar Direita */}
        <div className="space-y-6">
          {/* Empresa Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fulano de Tal</CardTitle>
              <p className="text-sm text-muted-foreground">{empresaInfo.valor}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">{empresaInfo.descricao}</p>
              
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>• Reunião com Thiago</strong>
                  <p className="text-muted-foreground">Ontem às 05:30</p>
                </div>
                <div className="text-sm">
                  <strong>• Reunião com time bex</strong>
                  <p className="text-muted-foreground">Segunda às 08:30</p>
                </div>
                <div className="text-sm">
                  <strong>• Protótipo inicial</strong>
                  <p className="text-muted-foreground">Segunda às 10:30</p>
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button size="sm" variant="outline" className="flex-1">
                  <Phone className="h-4 w-4 mr-2" />
                  Ligar
                </Button>
                <Button size="sm" className="flex-1 bg-primary text-primary-foreground">
                  <Mail className="h-4 w-4 mr-2" />
                  Mensagem
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LeadsList;