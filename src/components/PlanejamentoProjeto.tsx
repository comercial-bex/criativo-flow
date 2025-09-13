import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, FileText, Target, Clock, Users, BarChart, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PlanejamentoProjetoProps {
  projetoId: string;
  clienteId: string;
  clienteNome: string;
  assinaturaId?: string;
}

interface PlanejamentoData {
  id?: string;
  titulo: string;
  descricao: string;
  mes_referencia: string;
  status: 'rascunho' | 'em_revisao' | 'aprovado_cliente' | 'em_producao' | 'em_aprovacao_final' | 'finalizado' | 'reprovado';
  data_envio_cliente?: string;
  data_aprovacao_cliente?: string;
  observacoes_cliente?: string;
  cliente_id: string;
  responsavel_grs_id?: string;
}

const PLANOS_CONFIG = {
  '550e8400-e29b-41d4-a716-446655440001': { // Plano 90º
    nome: 'Plano 90º',
    posts_mes: 12,
    stories: 8,
    reels: 4
  },
  '550e8400-e29b-41d4-a716-446655440002': { // Plano 180º
    nome: 'Plano 180º',
    posts_mes: 20,
    stories: 15,
    reels: 8
  },
  '550e8400-e29b-41d4-a716-446655440003': { // Plano 360º
    nome: 'Plano 360º',
    posts_mes: 30,
    stories: 25,
    reels: 15
  }
};

export function PlanejamentoProjeto({ projetoId, clienteId, clienteNome, assinaturaId }: PlanejamentoProjetoProps) {
  const [planejamento, setPlanejamento] = useState<PlanejamentoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<PlanejamentoData>({
    titulo: '',
    descricao: '',
    mes_referencia: new Date().toISOString().slice(0, 7), // YYYY-MM
    status: 'rascunho',
    cliente_id: clienteId
  });
  const { toast } = useToast();

  const planoConfig = assinaturaId ? PLANOS_CONFIG[assinaturaId] : null;

  useEffect(() => {
    fetchPlanejamento();
  }, [projetoId]);

  const fetchPlanejamento = async () => {
    try {
      const { data, error } = await supabase
        .from('planejamentos')
        .select('*')
        .eq('cliente_id', clienteId)
        .eq('mes_referencia', formData.mes_referencia)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setPlanejamento(data);
      }
    } catch (error) {
      console.error('Erro ao buscar planejamento:', error);
    } finally {
      setLoading(false);
    }
  };

  const criarPlanejamento = async () => {
    if (!planoConfig) {
      toast({
        title: "Erro",
        description: "Cliente precisa ter uma assinatura válida para criar planejamento",
        variant: "destructive",
      });
      return;
    }

    try {
      const planejamentoBase = {
        titulo: `Planejamento ${planoConfig.nome} - ${new Date(formData.mes_referencia).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
        descricao: `Planejamento mensal baseado na assinatura ${planoConfig.nome}:

📅 CRONOGRAMA MENSAL
• ${planoConfig.posts_mes} Posts no Feed
• ${planoConfig.stories} Stories
• ${planoConfig.reels} Reels

🎯 DISTRIBUIÇÃO SEMANAL
• Feed: ${Math.ceil(planoConfig.posts_mes / 4)} posts por semana
• Stories: ${Math.ceil(planoConfig.stories / 4)} stories por semana  
• Reels: ${Math.ceil(planoConfig.reels / 4)} reels por semana

📋 ENTREGÁVEIS
• Calendário editorial detalhado
• Cronograma de publicações
• Relatório de performance mensal
• Reunião de alinhamento estratégico

💡 OBJETIVOS
• Aumentar engajamento orgânico
• Fortalecer presença digital
• Gerar leads qualificados
• Construir autoridade no segmento

⏰ PRAZO DE ENTREGA
Planejamento será entregue até o dia 25 do mês anterior para aprovação.`,
        mes_referencia: formData.mes_referencia,
        status: 'rascunho' as const,
        cliente_id: clienteId
      };

      const { data, error } = await supabase
        .from('planejamentos')
        .insert(planejamentoBase)
        .select()
        .single();

      if (error) throw error;

      setPlanejamento(data);
      setDialogOpen(false);
      
      toast({
        title: "Planejamento criado!",
        description: `Planejamento baseado no ${planoConfig.nome} foi criado com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao criar planejamento:', error);
      toast({
        title: "Erro ao criar planejamento",
        description: "Não foi possível criar o planejamento",
        variant: "destructive",
      });
    }
  };

  const enviarParaCliente = async () => {
    if (!planejamento) return;

    try {
      const { error } = await supabase
        .from('planejamentos')
        .update({
          status: 'em_revisao',
          data_envio_cliente: new Date().toISOString()
        })
        .eq('id', planejamento.id);

      if (error) throw error;

      setPlanejamento({
        ...planejamento,
        status: 'em_revisao',
        data_envio_cliente: new Date().toISOString()
      });

      toast({
        title: "Planejamento enviado!",
        description: "O planejamento foi enviado para aprovação do cliente",
      });
    } catch (error) {
      console.error('Erro ao enviar planejamento:', error);
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar o planejamento",
        variant: "destructive",
      });
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'rascunho': return <FileText className="h-4 w-4" />;
      case 'em_revisao': return <Send className="h-4 w-4" />;
      case 'aprovado_cliente': return <CheckCircle className="h-4 w-4" />;
      case 'em_producao': return <BarChart className="h-4 w-4" />;
      case 'em_aprovacao_final': return <Clock className="h-4 w-4" />;
      case 'finalizado': return <CheckCircle className="h-4 w-4" />;
      case 'reprovado': return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>Planejamento do Projeto</CardTitle>
              {planoConfig && (
                <Badge variant="outline">{planoConfig.nome}</Badge>
              )}
            </div>
            {!planejamento && planoConfig && (
              <Button onClick={() => setDialogOpen(true)} size="sm">
                Criar Planejamento
              </Button>
            )}
          </div>
          <CardDescription>
            Planejamento baseado na assinatura do cliente para {clienteNome}
          </CardDescription>
        </CardHeader>
        
        {planejamento ? (
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(planejamento.status)}
                <Badge className={getStatusColor(planejamento.status)}>
                  {getStatusText(planejamento.status)}
                </Badge>
              </div>
              {planejamento.status === 'rascunho' && (
                <Button onClick={enviarParaCliente} size="sm">
                  <Send className="h-4 w-4 mr-2" />
                  Enviar para Cliente
                </Button>
              )}
            </div>

            <div>
              <h4 className="font-semibold mb-2">{planejamento.titulo}</h4>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                {planejamento.descricao}
              </div>
            </div>

            {planejamento.data_envio_cliente && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Enviado em: {new Date(planejamento.data_envio_cliente).toLocaleDateString('pt-BR')}
              </div>
            )}

            {planejamento.data_aprovacao_cliente && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4" />
                Aprovado em: {new Date(planejamento.data_aprovacao_cliente).toLocaleDateString('pt-BR')}
              </div>
            )}

            {planejamento.observacoes_cliente && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Observações do Cliente:</p>
                <p className="text-sm text-muted-foreground">{planejamento.observacoes_cliente}</p>
              </div>
            )}
          </CardContent>
        ) : (
          <CardContent>
            {planoConfig ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum planejamento criado</h3>
                <p className="text-muted-foreground mb-4">
                  Crie um planejamento baseado na assinatura {planoConfig.nome} do cliente
                </p>
                <div className="text-sm text-muted-foreground">
                  <p>• {planoConfig.posts_mes} posts no feed por mês</p>
                  <p>• {planoConfig.stories} stories por mês</p>
                  <p>• {planoConfig.reels} reels por mês</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Assinatura necessária</h3>
                <p className="text-muted-foreground">
                  O cliente precisa ter uma assinatura válida (90º, 180º ou 360º) para criar planejamentos
                </p>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Dialog para confirmar criação */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Planejamento</DialogTitle>
            <DialogDescription>
              Criar planejamento baseado na assinatura {planoConfig?.nome} para {clienteNome}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mes_referencia">Mês de Referência</Label>
              <Input
                id="mes_referencia"
                type="month"
                value={formData.mes_referencia}
                onChange={(e) => setFormData({ ...formData, mes_referencia: e.target.value })}
              />
            </div>

            {planoConfig && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Configuração da Assinatura</h4>
                <div className="space-y-1 text-sm">
                  <p>• {planoConfig.posts_mes} posts no feed</p>
                  <p>• {planoConfig.stories} stories</p>
                  <p>• {planoConfig.reels} reels</p>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button onClick={criarPlanejamento} className="flex-1">
                Criar Planejamento
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}