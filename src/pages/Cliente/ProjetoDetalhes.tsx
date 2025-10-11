import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, DollarSign, User } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { PlanejamentoProjeto } from "@/components/PlanejamentoProjeto";
import { ProjetoEspecialistas } from "@/components/ProjetoEspecialistas";
import { supabase } from "@/integrations/supabase/client";


interface ProjetoDetalhes {
  id: string;
  titulo: string;
  descricao?: string;
  status: 'ativo' | 'pendente' | 'inativo' | 'arquivado';
  orcamento?: number;
  data_inicio?: string;
  data_fim?: string;
  cliente_id: string;
  responsavel_id?: string;
  created_at: string;
  updated_at: string;
}

interface ClienteInfo {
  id: string;
  nome: string;
  email?: string;
  assinatura_id?: string;
}

export default function ProjetoDetalhes() {
  const { clienteId, projetoId } = useParams<{ clienteId: string; projetoId: string }>();
  const navigate = useNavigate();
  const [projeto, setProjeto] = useState<ProjetoDetalhes | null>(null);
  const [cliente, setCliente] = useState<ClienteInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjetoDetalhes();
  }, [projetoId, clienteId]);

  const fetchProjetoDetalhes = async () => {
    if (!projetoId || !clienteId) return;
    
    try {
      // Buscar projeto
      const { data: projetoData, error: projetoError } = await supabase
        .from('projetos')
        .select('*')
        .eq('id', projetoId)
        .eq('cliente_id', clienteId)
        .maybeSingle();

      if (projetoError) throw projetoError;

      // Buscar cliente
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes')
        .select('id, nome, email, assinatura_id')
        .eq('id', clienteId)
        .maybeSingle();

      if (clienteError) throw clienteError;

      setProjeto(projetoData);
      setCliente(clienteData);
    } catch (error) {
      console.error('Erro ao carregar detalhes do projeto:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'inativo': return 'bg-red-100 text-red-800';
      case 'arquivado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo';
      case 'pendente': return 'Pendente';
      case 'inativo': return 'Inativo';
      case 'arquivado': return 'Arquivado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!projeto || !cliente) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Projeto não encontrado</h2>
          <p className="text-muted-foreground mb-4">O projeto solicitado não foi encontrado.</p>
          <Button onClick={() => navigate(`/clientes/${clienteId}/detalhes`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Projetos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/clientes/${clienteId}/detalhes`)}
              className="hover:scale-105 transition-transform"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {projeto.titulo}
              </h1>
              <p className="text-muted-foreground mt-1">
                Projeto de {cliente.nome}
              </p>
            </div>
          </div>
          
          <Badge className={`${getStatusColor(projeto.status)} px-4 py-2 font-medium shadow-lg`}>
            {getStatusText(projeto.status)}
          </Badge>
        </div>

        {/* Informações do Projeto */}
        <Card className="backdrop-blur-sm bg-card/95 border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              Detalhes do Projeto
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="group">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Cliente</p>
                <div className="flex items-center p-3 rounded-lg bg-gradient-to-r from-muted/30 to-transparent group-hover:from-primary/5 transition-all duration-300">
                  <div className="p-2 rounded-full bg-primary/10 mr-3">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <p className="font-medium">{cliente.nome}</p>
                </div>
              </div>
              
              {projeto.orcamento && (
                <div className="group">
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Orçamento</p>
                  <div className="flex items-center p-3 rounded-lg bg-gradient-to-r from-muted/30 to-transparent group-hover:from-primary/5 transition-all duration-300">
                    <div className="p-2 rounded-full bg-green-500/10 mr-3">
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="font-medium">R$ {Number(projeto.orcamento).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              )}
              
              {projeto.data_inicio && (
                <div className="group">
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Data de Início</p>
                  <div className="flex items-center p-3 rounded-lg bg-gradient-to-r from-muted/30 to-transparent group-hover:from-primary/5 transition-all duration-300">
                    <div className="p-2 rounded-full bg-blue-500/10 mr-3">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="font-medium">{new Date(projeto.data_inicio).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              )}
              
              {projeto.data_fim && (
                <div className="group">
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Data de Término</p>
                  <div className="flex items-center p-3 rounded-lg bg-gradient-to-r from-muted/30 to-transparent group-hover:from-primary/5 transition-all duration-300">
                    <div className="p-2 rounded-full bg-orange-500/10 mr-3">
                      <Calendar className="h-4 w-4 text-orange-600" />
                    </div>
                    <p className="font-medium">{new Date(projeto.data_fim).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              )}
            </div>
            
            {projeto.descricao && (
              <div className="mt-8 p-6 rounded-lg bg-gradient-to-r from-muted/20 to-transparent border border-primary/10">
                <p className="text-sm font-semibold text-muted-foreground mb-3">Descrição do Projeto</p>
                <p className="text-sm leading-relaxed">{projeto.descricao}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Especialistas do Projeto */}
        <ProjetoEspecialistas projetoId={projeto.id} />

        {/* Planejamento do Projeto */}
        <PlanejamentoProjeto
          projetoId={projeto.id}
          clienteId={cliente.id}
          clienteNome={cliente.nome}
          assinaturaId={cliente.assinatura_id}
        />
      </div>
    </div>
  );
}