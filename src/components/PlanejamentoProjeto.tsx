import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, FileText, Target, Clock, Users, BarChart, Send, CheckCircle, AlertCircle, Edit, Eye, Sparkles, TrendingUp, Award, Zap } from 'lucide-react';
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
  const navigate = useNavigate();
  const [planejamento, setPlanejamento] = useState<PlanejamentoData | null>(null);
  const [objetivos, setObjetivos] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editandoObjetivos, setEditandoObjetivos] = useState(false);
  const [objetivosEditaveis, setObjetivosEditaveis] = useState<string[]>([]);
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
    fetchObjetivos();
    fetchPlanejamento();
  }, [projetoId]);

  const fetchObjetivos = async () => {
    try {
      const { data, error } = await supabase
        .from('cliente_onboarding')
        .select('*')
        .eq('cliente_id', clienteId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setObjetivos(data);
        setObjetivosEditaveis(data?.objetivos_digitais?.split(',') || []);
      }
    } catch (error) {
      console.error('Erro ao buscar objetivos:', error);
    }
  };

  const salvarObjetivos = async () => {
    try {
      const { error } = await supabase
        .from('cliente_onboarding')
        .update({
          objetivos_digitais: objetivosEditaveis.join(','),
          updated_at: new Date().toISOString()
        })
        .eq('cliente_id', clienteId);

      if (error) throw error;

      toast({
        title: "Objetivos atualizados",
        description: "Os objetivos do cliente foram salvos com sucesso",
      });

      await fetchObjetivos();
      setEditandoObjetivos(false);
    } catch (error) {
      console.error('Erro ao salvar objetivos:', error);
      toast({
        title: "Erro ao salvar objetivos",
        description: "Não foi possível salvar os objetivos",
        variant: "destructive",
      });
    }
  };

  const fetchPlanejamento = async () => {
    try {
      // Convert YYYY-MM to YYYY-MM-01 for proper date format
      const mesReferenciaDate = `${formData.mes_referencia}-01`;
      
      const { data, error } = await supabase
        .from('planejamentos')
        .select('*')
        .eq('cliente_id', clienteId)
        .eq('mes_referencia', mesReferenciaDate)
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

    if (!objetivos) {
      toast({
        title: "Erro", 
        description: "Cliente precisa ter objetivos definidos para criar planejamento",
        variant: "destructive",
      });
      return;
    }

    try {
      // Distribuir conteúdos baseado nos objetivos
      const distribuicaoConteudo = calcularDistribuicaoConteudo(planoConfig, objetivos);
      
      const planejamentoBase = {
        titulo: `Planejamento ${planoConfig.nome} - ${new Date(formData.mes_referencia).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
        descricao: gerarDescricaoPlanejamento(planoConfig, objetivos, distribuicaoConteudo),
        mes_referencia: `${formData.mes_referencia}-01`, // Convert YYYY-MM to YYYY-MM-01
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
      case 'rascunho': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'em_revisao': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'aprovado_cliente': return 'bg-green-100 text-green-800 border-green-200';
      case 'em_producao': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'em_aprovacao_final': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'finalizado': return 'bg-green-100 text-green-800 border-green-200';
      case 'reprovado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  // Função para calcular distribuição de conteúdo baseado nos objetivos
  const calcularDistribuicaoConteudo = (plano: any, objetivosData: any) => {
    const objetivosEscolhidos = objetivosData?.objetivos?.objetivos_selecionados || [];
    
    // Distribuição base por objetivo
    let distribuicao = {
      reconhecimento_marca: 0,
      crescimento_seguidores: 0,
      aquisicao_leads: 0
    };

    // Calcular percentual baseado nos objetivos selecionados
    if (objetivosEscolhidos.includes('reconhecimento_marca')) {
      distribuicao.reconhecimento_marca = 40;
    }
    if (objetivosEscolhidos.includes('crescimento_seguidores')) {
      distribuicao.crescimento_seguidores = 35;
    }
    if (objetivosEscolhidos.includes('aquisicao_leads')) {
      distribuicao.aquisicao_leads = 25;
    }

    // Normalizar para 100% se múltiplos objetivos
    const total = Object.values(distribuicao).reduce((a, b) => a + b, 0);
    if (total > 0) {
      Object.keys(distribuicao).forEach(key => {
        distribuicao[key] = Math.round((distribuicao[key] / total) * 100);
      });
    }

    // Aplicar aos números do plano
    return {
      posts_reconhecimento: Math.round((plano.posts_mes * distribuicao.reconhecimento_marca) / 100),
      posts_crescimento: Math.round((plano.posts_mes * distribuicao.crescimento_seguidores) / 100),
      posts_leads: Math.round((plano.posts_mes * distribuicao.aquisicao_leads) / 100),
      stories_reconhecimento: Math.round((plano.stories * distribuicao.reconhecimento_marca) / 100),
      stories_crescimento: Math.round((plano.stories * distribuicao.crescimento_seguidores) / 100),
      stories_leads: Math.round((plano.stories * distribuicao.aquisicao_leads) / 100),
      reels_reconhecimento: Math.round((plano.reels * distribuicao.reconhecimento_marca) / 100),
      reels_crescimento: Math.round((plano.reels * distribuicao.crescimento_seguidores) / 100),
      reels_leads: Math.round((plano.reels * distribuicao.aquisicao_leads) / 100),
      percentuais: distribuicao
    };
  };

  // Função para gerar descrição detalhada do planejamento
  const gerarDescricaoPlanejamento = (plano: any, objetivosData: any, distribuicao: any) => {
    const objetivosEscolhidos = objetivosData?.objetivos?.objetivos_selecionados || [];
    
    return `🎯 PLANEJAMENTO ESTRATÉGICO ${plano.nome.toUpperCase()}
Baseado nos objetivos definidos no onboarding do cliente

═══════════════════════════════════════════════════════════════

📊 DISTRIBUIÇÃO ESTRATÉGICA DE CONTEÚDO

${objetivosEscolhidos.includes('reconhecimento_marca') ? `🏆 RECONHECIMENTO DE MARCA (${distribuicao.percentuais.reconhecimento_marca}%)
• ${distribuicao.posts_reconhecimento} Posts no Feed - Storytelling e valores da marca
• ${distribuicao.stories_reconhecimento} Stories - Bastidores e cultura empresarial  
• ${distribuicao.reels_reconhecimento} Reels - Apresentação da empresa e diferenciação

` : ''}${objetivosEscolhidos.includes('crescimento_seguidores') ? `📈 CRESCIMENTO DE SEGUIDORES (${distribuicao.percentuais.crescimento_seguidores}%)
• ${distribuicao.posts_crescimento} Posts no Feed - Conteúdo viral e engajamento
• ${distribuicao.stories_crescimento} Stories - Interação e pesquisas  
• ${distribuicao.reels_crescimento} Reels - Tendências e conteúdo viral

` : ''}${objetivosEscolhidos.includes('aquisicao_leads') ? `🎯 AQUISIÇÃO DE LEADS (${distribuicao.percentuais.aquisicao_leads}%)
• ${distribuicao.posts_leads} Posts no Feed - Conteúdo educativo e CTA
• ${distribuicao.stories_leads} Stories - Direcionamento para WhatsApp/site
• ${distribuicao.reels_leads} Reels - Demonstrações e cases de sucesso

` : ''}═══════════════════════════════════════════════════════════════

📅 CRONOGRAMA SEMANAL
Semana 1: Estabelecer presença e reconhecimento
Semana 2: Foco em crescimento e engajamento  
Semana 3: Intensificar geração de leads
Semana 4: Consolidar resultados e análise

🎨 TIPOS DE CONTEÚDO POR OBJETIVO

${objetivosEscolhidos.includes('reconhecimento_marca') ? `🏆 RECONHECIMENTO DE MARCA:
• História da empresa e fundadores
• Valores e missão da marca
• Diferenciação competitiva
• Depoimentos de colaboradores
• Conquistas e certificações

` : ''}${objetivosEscolhidos.includes('crescimento_seguidores') ? `📈 CRESCIMENTO DE SEGUIDORES:
• Conteúdo viral do nicho
• Trends adaptadas ao segmento
• Enquetes e interações
• Sorteios e parcerias
• Conteúdo entertaining

` : ''}${objetivosEscolhidos.includes('aquisicao_leads') ? `🎯 AQUISIÇÃO DE LEADS:
• Dicas e tutoriais do segmento
• Cases de sucesso reais
• Demonstrações de produtos/serviços
• Conteúdo educativo premium
• CTAs estratégicos para conversão

` : ''}📋 ENTREGÁVEIS DO PLANEJAMENTO
• Calendário editorial detalhado com 30 dias
• Copy completa para cada postagem
• Artes e designs personalizados
• Cronograma de publicação otimizado
• Hashtags estratégicas por post
• Relatório de performance mensal
• Reunião de alinhamento e ajustes

⏰ CRONOGRAMA DE ENTREGA
• Planejamento: até dia 25 do mês anterior
• Aprovação do cliente: até dia 30
• Produção: primeiros 5 dias do mês
• Publicações: conforme cronograma aprovado

💡 MÉTRICAS DE SUCESSO
• Taxa de engajamento por tipo de conteúdo
• Crescimento de seguidores vs. meta mensal
• Leads gerados por campanha
• Alcance e impressões dos posts estratégicos`;
  };

  const PlanningSection = ({ title, content, icon, gradient }: { title: string; content: string; icon: React.ReactNode; gradient: string }) => (
    <div className={`p-6 rounded-xl border border-primary/10 ${gradient}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm">
          {icon}
        </div>
        <h4 className="font-bold text-lg text-white">{title}</h4>
      </div>
      <div className="space-y-2">
        {content.split('\n').map((line, index) => {
          if (line.trim().startsWith('•')) {
            return (
              <div key={index} className="flex items-start gap-3 ml-4">
                <div className="w-2 h-2 rounded-full bg-white/60 mt-2 flex-shrink-0"></div>
                <p className="text-sm text-white/90 leading-relaxed">{line.replace('•', '').trim()}</p>
              </div>
            );
          }
          return line.trim() ? (
            <p key={index} className="text-sm text-white/90 leading-relaxed ml-4">{line}</p>
          ) : null;
        })}
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card className="backdrop-blur-sm bg-card/95 border-primary/10 shadow-lg">
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
    <div className="space-y-6">
      <Card className="backdrop-blur-sm bg-card/95 border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-gradient-to-r from-primary to-primary/80 shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Planejamento Estratégico
                </CardTitle>
                <CardDescription className="mt-1 text-base">
                  Baseado na assinatura e objetivos de <span className="font-semibold text-primary">{clienteNome}</span>
                </CardDescription>
              </div>
              {planoConfig && (
                <Badge className="bg-gradient-to-r from-primary to-primary/80 text-white px-4 py-2 text-sm shadow-lg">
                  <Sparkles className="h-4 w-4 mr-2" />
                  {planoConfig.nome}
                </Badge>
              )}
            </div>
            {!planejamento && planoConfig && objetivos && (
              <Button 
                onClick={() => setDialogOpen(true)} 
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6 py-3"
              >
                <Zap className="h-5 w-5 mr-2" />
                ✨ Criar Planejamento
              </Button>
            )}
          </div>
        </CardHeader>
        
        {planejamento ? (
          <CardContent className="p-0">
            {/* Status e Ações */}
            <div className="p-6 border-b border-primary/10 bg-gradient-to-r from-muted/30 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-primary/10 to-primary/5">
                    {getStatusIcon(planejamento.status)}
                  </div>
                  <div>
                    <Badge className={`${getStatusColor(planejamento.status)} px-4 py-2 font-medium shadow-lg border`}>
                      {getStatusText(planejamento.status)}
                    </Badge>
                    {planejamento.data_envio_cliente && (
                      <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Enviado em {new Date(planejamento.data_envio_cliente).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  {planejamento.status === 'rascunho' && (
                    <Button 
                      onClick={enviarParaCliente} 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Enviar para Cliente
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/clientes/${clienteId}/projetos/${projetoId}/planejamento`)}
                    className="border-primary/20 hover:bg-primary/5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Entrar no Plano
                  </Button>
                </div>
              </div>
            </div>

            {/* Conteúdo do Planejamento */}
            <div className="p-8">
              <div className="space-y-8">
                {/* Título do Planejamento */}
                <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 rounded-2xl border border-primary/20 shadow-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-full bg-gradient-to-r from-primary to-primary/80 shadow-lg">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      {planejamento.titulo}
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Baseado nos objetivos definidos no onboarding do cliente
                  </p>
                </div>

                {/* Renderização Visual Aprimorada do Planejamento */}
                {planejamento.descricao && (
                  <div className="space-y-6">
                    {planejamento.descricao.split('═══════════════════════════════════════════════════════════════').map((section, index) => {
                      if (index === 0) {
                        // Seção de introdução
                        const lines = section.trim().split('\n');
                        return (
                          <div key={index} className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl text-white shadow-2xl">
                            <div className="flex items-center gap-4 mb-6">
                              <span className="text-4xl">🎯</span>
                              <h4 className="text-2xl font-bold">{lines[0]?.replace('🎯 ', '')}</h4>
                            </div>
                            <p className="text-slate-200 text-lg leading-relaxed">
                              {lines.slice(1).join(' ')}
                            </p>
                          </div>
                        );
                      }

                      // Processar outras seções
                      const content = section.trim();
                      if (!content) return null;

                      const lines = content.split('\n').filter(line => line.trim());
                      const sections = [];
                      let currentSectionContent = [];
                      let currentTitle = '';

                      lines.forEach(line => {
                        const trimmedLine = line.trim();
                        
                        if (trimmedLine.includes('📊 DISTRIBUIÇÃO ESTRATÉGICA')) {
                          if (currentTitle) sections.push({ title: currentTitle, content: currentSectionContent.join('\n') });
                          currentTitle = 'Distribuição Estratégica de Conteúdo';
                          currentSectionContent = [];
                        } else if (trimmedLine.includes('📅 CRONOGRAMA SEMANAL')) {
                          if (currentTitle) sections.push({ title: currentTitle, content: currentSectionContent.join('\n') });
                          currentTitle = 'Cronograma Semanal';
                          currentSectionContent = [];
                        } else if (trimmedLine.includes('🎨 TIPOS DE CONTEÚDO')) {
                          if (currentTitle) sections.push({ title: currentTitle, content: currentSectionContent.join('\n') });
                          currentTitle = 'Tipos de Conteúdo por Objetivo';
                          currentSectionContent = [];
                        } else if (trimmedLine.includes('📋 ENTREGÁVEIS')) {
                          if (currentTitle) sections.push({ title: currentTitle, content: currentSectionContent.join('\n') });
                          currentTitle = 'Entregáveis do Planejamento';
                          currentSectionContent = [];
                        } else if (trimmedLine.includes('⏰ CRONOGRAMA DE ENTREGA')) {
                          if (currentTitle) sections.push({ title: currentTitle, content: currentSectionContent.join('\n') });
                          currentTitle = 'Cronograma de Entrega';
                          currentSectionContent = [];
                        } else if (trimmedLine.includes('💡 MÉTRICAS DE SUCESSO')) {
                          if (currentTitle) sections.push({ title: currentTitle, content: currentSectionContent.join('\n') });
                          currentTitle = 'Métricas de Sucesso';
                          currentSectionContent = [];
                        } else {
                          currentSectionContent.push(line);
                        }
                      });

                      if (currentTitle) sections.push({ title: currentTitle, content: currentSectionContent.join('\n') });

                      return (
                        <div key={index} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {sections.map((sec, secIndex) => {
                            const gradients = [
                              'bg-gradient-to-br from-blue-600 to-blue-700',
                              'bg-gradient-to-br from-purple-600 to-purple-700',
                              'bg-gradient-to-br from-green-600 to-green-700',
                              'bg-gradient-to-br from-orange-600 to-orange-700',
                              'bg-gradient-to-br from-pink-600 to-pink-700',
                              'bg-gradient-to-br from-indigo-600 to-indigo-700'
                            ];
                            
                            const icons = [
                              <BarChart className="h-6 w-6" />,
                              <Calendar className="h-6 w-6" />,
                              <Target className="h-6 w-6" />,
                              <FileText className="h-6 w-6" />,
                              <Clock className="h-6 w-6" />,
                              <TrendingUp className="h-6 w-6" />
                            ];

                            return (
                              <PlanningSection
                                key={secIndex}
                                title={sec.title}
                                content={sec.content}
                                icon={icons[secIndex % icons.length]}
                                gradient={gradients[secIndex % gradients.length]}
                              />
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Observações do Cliente */}
                {planejamento.observacoes_cliente && (
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 p-8 rounded-2xl border border-orange-200/50 dark:border-orange-800/30 shadow-lg">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
                        <AlertCircle className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-orange-800 dark:text-orange-200">Observações do Cliente</h4>
                    </div>
                    <p className="text-orange-700 dark:text-orange-300 leading-relaxed">
                      {planejamento.observacoes_cliente}
                    </p>
                  </div>
                )}

                {/* Data de Aprovação */}
                {planejamento.data_aprovacao_cliente && (
                  <div className="bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 p-8 rounded-2xl border border-green-200/50 dark:border-green-800/30 shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 shadow-lg">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-green-800 dark:text-green-200">Planejamento Aprovado</h4>
                        <p className="text-green-700 dark:text-green-300">
                          Aprovado em {new Date(planejamento.data_aprovacao_cliente).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        ) : (
          <CardContent className="p-8">
            {/* Estado vazio com design melhorado */}
            <div className="text-center py-16">
              <div className="relative mb-8">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-8 shadow-lg">
                  <Target className="h-16 w-16 text-primary/60" />
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/5 to-transparent animate-pulse"></div>
              </div>
              
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Nenhum planejamento criado
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-8 text-lg leading-relaxed">
                {!planoConfig ? (
                  "Cliente precisa ter uma assinatura válida para criar planejamento estratégico."
                ) : !objetivos ? (
                  "Complete o onboarding do cliente definindo os objetivos antes de criar o planejamento."
                ) : (
                  "Crie um planejamento estratégico baseado na assinatura e objetivos do cliente."
                )}
              </p>
              
              {planoConfig && objetivos && (
                <Button 
                  onClick={() => setDialogOpen(true)}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-8 py-4 text-lg"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  ✨ Criar Planejamento Estratégico
                </Button>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Seção de Objetivos do Cliente */}
      {objetivos && (
        <Card className="backdrop-blur-sm bg-card/95 border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-500/5 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                    Objetivos do Cliente
                  </CardTitle>
                  <CardDescription className="mt-1 text-base">
                    Definidos durante o onboarding estratégico
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setEditandoObjetivos(!editandoObjetivos)}
                className="border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Edit className="h-4 w-4 mr-2" />
                {editandoObjetivos ? 'Cancelar' : 'Editar'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {editandoObjetivos ? (
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-semibold mb-3 block">Objetivos Digitais (separados por vírgula)</Label>
                  <Textarea
                    value={objetivosEditaveis.join(', ')}
                    onChange={(e) => setObjetivosEditaveis(e.target.value.split(',').map(obj => obj.trim()))}
                    placeholder="Ex: reconhecimento_marca, crescimento_seguidores, aquisicao_leads"
                    className="min-h-[120px] border-blue-200 focus:border-blue-500 dark:border-blue-800"
                  />
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={salvarObjetivos}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Salvar Objetivos
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setEditandoObjetivos(false)}
                    className="shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {objetivosEditaveis.map((objetivo, index) => (
                  <div 
                    key={index} 
                    className="group p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200/50 dark:border-blue-800/30 hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-gradient-to-r from-blue-500/10 to-blue-600/10 group-hover:from-blue-500/20 group-hover:to-blue-600/20 transition-all duration-300">
                        <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="font-semibold text-blue-800 dark:text-blue-200 capitalize">
                        {objetivo.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog para criar planejamento */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-background to-muted/30 border-primary/20">
          <DialogHeader className="text-center pb-6">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              ✨ Criar Planejamento Estratégico
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {planoConfig ? `Baseado no ${planoConfig.nome} e objetivos do cliente` : 'Configure os parâmetros do planejamento'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary/5 to-transparent p-6 rounded-lg border border-primary/10">
              <p className="text-sm text-muted-foreground">
                O planejamento será criado automaticamente baseado na assinatura <strong>{planoConfig?.nome}</strong> e 
                nos objetivos definidos durante o onboarding do cliente.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Mês de Referência</Label>
              <Input
                type="month"
                value={formData.mes_referencia}
                onChange={(e) => setFormData({...formData, mes_referencia: e.target.value})}
                className="border-primary/20 focus:border-primary transition-colors"
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-primary/10">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={criarPlanejamento}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Criar Planejamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}