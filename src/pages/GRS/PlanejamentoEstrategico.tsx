import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Search, Target, TrendingUp, Users, Calendar } from "lucide-react";
import { toast } from "sonner";
import { PlanejamentoProjeto } from "@/components/PlanejamentoProjeto";
import { SwotAnalysisIA } from "@/components/SwotAnalysisIA";
import { ObjetivosAssinatura } from "@/components/ObjetivosAssinatura";

interface Cliente {
  id: string;
  nome: string;
  status: string;
  assinatura_id: string;
  assinatura?: {
    nome: string;
    posts_mensais: number;
  };
  onboarding?: {
    nome_empresa: string;
  };
  objetivos?: any[];
  planejamento?: any;
}

export default function PlanejamentoEstrategico() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("todos");
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchClientes = async () => {
    try {
      const { data: clientesData, error: clientesError } = await supabase
        .from('clientes')
        .select(`
          id,
          nome,
          status,
          assinatura_id,
          assinaturas:assinatura_id (
            nome,
            posts_mensais
          ),
          cliente_onboarding (
            nome_empresa
          )
        `)
        .order('nome');

      if (clientesError) throw clientesError;

      // Buscar objetivos e planejamentos para cada cliente
      const clientesComDados = await Promise.all(
        (clientesData || []).map(async (cliente) => {
          // Buscar objetivos
          const { data: objetivos } = await supabase
            .from('cliente_objetivos')
            .select('*')
            .eq('cliente_id', cliente.id);

          // Buscar planejamentos
          const { data: planejamentos } = await supabase
            .from('planejamentos')
            .select('*')
            .eq('cliente_id', cliente.id)
            .order('created_at', { ascending: false })
            .limit(1);

          return {
            ...cliente,
            objetivos: objetivos || [],
            planejamento: planejamentos?.[0] || null
          };
        })
      );

      setClientes(clientesComDados);
      setFilteredClientes(clientesComDados);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast.error('Erro ao carregar dados dos clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    let filtered = clientes;

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(cliente =>
        cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.onboarding?.[0]?.nome_empresa?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por tab
    if (activeTab !== "todos") {
      filtered = filtered.filter(cliente => {
        switch (activeTab) {
          case "com-planejamento":
            return cliente.planejamento;
          case "sem-planejamento":
            return !cliente.planejamento;
          case "com-objetivos":
            return cliente.objetivos && cliente.objetivos.length > 0;
          default:
            return true;
        }
      });
    }

    setFilteredClientes(filtered);
  }, [searchTerm, activeTab, clientes]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'ativo':
        return 'bg-green-100 text-green-800';
      case 'inativo':
        return 'bg-red-100 text-red-800';
      case 'pausado':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanejamentoStatus = (cliente: Cliente) => {
    if (!cliente.planejamento) return { text: 'Sem planejamento', color: 'bg-gray-100 text-gray-800' };
    
    switch (cliente.planejamento.status) {
      case 'aprovado':
        return { text: 'Aprovado', color: 'bg-green-100 text-green-800' };
      case 'pendente':
        return { text: 'Pendente', color: 'bg-yellow-100 text-yellow-800' };
      case 'rascunho':
        return { text: 'Rascunho', color: 'bg-blue-100 text-blue-800' };
      default:
        return { text: 'Em análise', color: 'bg-orange-100 text-orange-800' };
    }
  };

  const handleClientSelect = (cliente: Cliente) => {
    setSelectedClient(cliente);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-lg">Carregando planejamentos estratégicos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Planejamento Estratégico</h1>
        <p className="text-muted-foreground">
          Gerencie os planejamentos estratégicos de todos os clientes
        </p>
      </div>

      <div className="mb-6">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="todos">Todos ({clientes.length})</TabsTrigger>
          <TabsTrigger value="com-planejamento">
            Com Planejamento ({clientes.filter(c => c.planejamento).length})
          </TabsTrigger>
          <TabsTrigger value="sem-planejamento">
            Sem Planejamento ({clientes.filter(c => !c.planejamento).length})
          </TabsTrigger>
          <TabsTrigger value="com-objetivos">
            Com Objetivos ({clientes.filter(c => c.objetivos && c.objetivos.length > 0).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClientes.map((cliente) => {
              const planejamentoStatus = getPlanejamentoStatus(cliente);
              
              return (
                <Card key={cliente.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{cliente.nome}</CardTitle>
                      <Badge className={getStatusColor(cliente.status)}>
                        {cliente.status}
                      </Badge>
                    </div>
                    {cliente.onboarding?.[0]?.nome_empresa && (
                      <p className="text-sm text-muted-foreground">
                        {cliente.onboarding[0].nome_empresa}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">
                          {cliente.assinatura?.nome || 'Sem assinatura'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm">
                          {cliente.assinatura?.posts_mensais || 0} posts/mês
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">
                          {cliente.objetivos?.length || 0} objetivos
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-orange-500" />
                        <Badge className={planejamentoStatus.color}>
                          {planejamentoStatus.text}
                        </Badge>
                      </div>

                      <Button 
                        onClick={() => handleClientSelect(cliente)}
                        className="w-full mt-4"
                        variant="outline"
                      >
                        Ver Planejamento
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredClientes.length === 0 && (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum cliente encontrado
              </h3>
              <p className="text-gray-500">
                Tente ajustar os filtros ou termo de busca
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Planejamento Estratégico - {selectedClient?.nome}
            </DialogTitle>
          </DialogHeader>
          
          {selectedClient && (
            <div className="space-y-6">
              <Tabs defaultValue="planejamento" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="planejamento">Planejamento</TabsTrigger>
                  <TabsTrigger value="objetivos">Objetivos</TabsTrigger>
                  <TabsTrigger value="swot">Análise SWOT</TabsTrigger>
                </TabsList>
                
                <TabsContent value="planejamento" className="space-y-4">
                  <PlanejamentoProjeto
                    projetoId={selectedClient.id}
                    clienteId={selectedClient.id}
                    clienteNome={selectedClient.nome}
                    assinaturaId={selectedClient.assinatura_id}
                  />
                </TabsContent>
                
                <TabsContent value="objetivos" className="space-y-4">
                  {selectedClient.assinatura_id ? (
                    <ObjetivosAssinatura
                      clienteId={selectedClient.id}
                      assinaturaId={selectedClient.assinatura_id}
                      objetivos={selectedClient.objetivos}
                      onObjetivosUpdate={() => fetchClientes()}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Cliente sem assinatura ativa para configurar objetivos
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="swot" className="space-y-4">
                  <SwotAnalysisIA
                    clienteId={selectedClient.id}
                    clienteNome={selectedClient.nome}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}