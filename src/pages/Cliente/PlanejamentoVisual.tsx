import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Plus, Settings } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Planejamento {
  id: string;
  titulo: string;
  status: string;
  descricao?: string;
}

export default function PlanejamentoVisual() {
  const { clienteId, projetoId } = useParams<{ clienteId: string; projetoId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [planejamento, setPlanejamento] = useState<Planejamento | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlanejamento();
  }, [projetoId, clienteId]);

  const fetchPlanejamento = async () => {
    if (!projetoId || !clienteId) return;
    
    try {
      // Buscar planejamento do mês atual
      const mesReferenciaDate = `${new Date().toISOString().slice(0, 7)}-01`;
      const { data: planejamentoData, error: planejamentoError } = await supabase
        .from('planejamentos')
        .select('id, titulo, status, descricao')
        .eq('cliente_id', clienteId)
        .eq('mes_referencia', mesReferenciaDate)
        .maybeSingle();

      if (planejamentoError) throw planejamentoError;

      setPlanejamento(planejamentoData);
    } catch (error) {
      console.error('Erro ao carregar planejamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do planejamento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'rascunho': return 'bg-gray-100 text-gray-800';
      case 'em_revisao': return 'bg-blue-100 text-blue-800';
      case 'aprovado_cliente': return 'bg-green-100 text-green-800';
      case 'em_producao': return 'bg-yellow-100 text-yellow-800';
      case 'em_aprovacao_final': return 'bg-purple-100 text-purple-800';
      case 'finalizado': return 'bg-green-100 text-green-800';
      case 'reprovado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'rascunho': return 'Rascunho';
      case 'em_revisao': return 'Em Revisão';
      case 'aprovado_cliente': return 'Aprovado';
      case 'em_producao': return 'Em Produção';
      case 'em_aprovacao_final': return 'Aprovação Final';
      case 'finalizado': return 'Finalizado';
      case 'reprovado': return 'Reprovado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!planejamento) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Planejamento não encontrado</h2>
          <p className="text-muted-foreground mb-4">É necessário criar um planejamento antes de acessar a visualização detalhada.</p>
          <Button onClick={() => navigate(`/clientes/${clienteId}/projetos/${projetoId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para o Projeto
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/clientes/${clienteId}/projetos/${projetoId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <SectionHeader
            title="Planejamento Visual"
            description={`Visualização detalhada: ${planejamento.titulo}`}
          />
        </div>
        
        <div className="flex gap-2">
          <Badge className={getStatusColor(planejamento.status)}>
            {getStatusText(planejamento.status)}
          </Badge>
        </div>
      </div>

      {/* Planejamento Detalhado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {planejamento.titulo}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {planejamento.descricao && (
            <div className="whitespace-pre-wrap text-sm space-y-4">
              {planejamento.descricao}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Área de Posts - Em Desenvolvimento */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Gerenciamento de Posts
            </CardTitle>
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              Novo Post
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-medium mb-2">Funcionalidade em Desenvolvimento</h3>
              <p className="text-sm">
                O gerenciamento detalhado de posts será implementado em breve.<br />
                Por enquanto, use o planejamento textual acima para visualizar a estratégia.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}