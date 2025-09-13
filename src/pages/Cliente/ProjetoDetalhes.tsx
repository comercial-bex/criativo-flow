import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, DollarSign, User } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { PlanejamentoProjeto } from "@/components/PlanejamentoProjeto";
import { supabase } from "@/integrations/supabase/client";


interface ProjetoDetalhes {
  id: string;
  nome: string;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate(`/clientes/${clienteId}/detalhes`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <SectionHeader
          title={projeto.nome}
          description={`Projeto de ${cliente.nome}`}
        />
      </div>

      {/* Informações do Projeto */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>Detalhes do Projeto</CardTitle>
            <Badge className={getStatusColor(projeto.status)}>
              {getStatusText(projeto.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cliente</p>
              <div className="flex items-center mt-1">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <p className="font-medium">{cliente.nome}</p>
              </div>
            </div>
            
            {projeto.orcamento && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Orçamento</p>
                <div className="flex items-center mt-1">
                  <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="font-medium">R$ {Number(projeto.orcamento).toLocaleString('pt-BR')}</p>
                </div>
              </div>
            )}
            
            {projeto.data_inicio && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data de Início</p>
                <div className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="font-medium">{new Date(projeto.data_inicio).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            )}
            
            {projeto.data_fim && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data de Término</p>
                <div className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="font-medium">{new Date(projeto.data_fim).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            )}
          </div>
          
          {projeto.descricao && (
            <div className="mt-6">
              <p className="text-sm font-medium text-muted-foreground mb-2">Descrição</p>
              <p className="text-sm">{projeto.descricao}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Planejamento do Projeto */}
      <PlanejamentoProjeto
        projetoId={projeto.id}
        clienteId={cliente.id}
        clienteNome={cliente.nome}
        assinaturaId={cliente.assinatura_id}
      />
    </div>
  );
}