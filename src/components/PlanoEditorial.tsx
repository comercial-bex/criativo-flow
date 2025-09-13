import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, Loader2, Users, Target, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PlanoEditorialProps {
  planejamento: {
    id: string;
    titulo: string;
    cliente_id: string;
  };
  clienteId: string;
  posts: any[];
  setPosts: (posts: any[]) => void;
  onPreviewPost: (post: any) => void;
}

interface ConteudoEditorial {
  id?: string;
  planejamento_id: string;
  missao?: string;
  posicionamento?: string;
  persona?: string;
  frameworks_selecionados?: string[];
  especialistas_selecionados?: string[];
  conteudo_gerado?: string;
}

const PlanoEditorial: React.FC<PlanoEditorialProps> = ({
  planejamento,
  clienteId,
  posts,
  setPosts,
  onPreviewPost
}) => {
  const [conteudo, setConteudo] = useState<ConteudoEditorial>({
    planejamento_id: planejamento.id,
    frameworks_selecionados: [],
    especialistas_selecionados: []
  });
  
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [clienteAssinatura, setClienteAssinatura] = useState<any>(null);
  const [postsGerados, setPostsGerados] = useState<any[]>([]);
  const [componentesSelecionados, setComponentesSelecionados] = useState<string[]>([]);

  const especialistas = [
    { 
      nome: "Philip Kotler", 
      descricao: "Pai do marketing moderno, criador dos conceitos fundamentais do marketing mix e segmentação de mercado"
    },
    { 
      nome: "Al Ries", 
      descricao: "Especialista em posicionamento de marca e estratégia competitiva, co-autor de 'Posicionamento'"
    },
    { 
      nome: "Jack Trout", 
      descricao: "Criador do conceito de posicionamento, focado em diferenciação e guerra competitiva"
    },
    { 
      nome: "Seth Godin", 
      descricao: "Especialista em marketing digital, storytelling e marketing de permissão"
    },
    { 
      nome: "Robert Cialdini", 
      descricao: "Especialista em psicologia da persuasão e influência, autor de 'As Armas da Persuasão'"
    },
    { 
      nome: "Chip Heath", 
      descricao: "Especialista em comunicação eficaz e ideias que 'grudam', co-autor de 'Made to Stick'"
    }
  ];

  const frameworks = [
    { 
      nome: "HESEC", 
      descricao: "Framework focado em conexão emocional e educação",
      componentes: [
        { nome: "Histórias", descricao: "Narrativas que conectam com o público" },
        { nome: "Emoções", descricao: "Apelos emocionais que geram identificação" },
        { nome: "Soluções", descricao: "Apresentação de soluções práticas" },
        { nome: "Educação", descricao: "Conteúdo educativo e informativo" },
        { nome: "Conexão", descricao: "Construção de relacionamento com a audiência" }
      ]
    },
    { 
      nome: "HERO", 
      descricao: "Framework focado em empoderamento e resultados",
      componentes: [
        { nome: "Herói", descricao: "Posicionamento do cliente como protagonista" },
        { nome: "Empoderamento", descricao: "Fortalecimento e capacitação do público" },
        { nome: "Razão", descricao: "Argumentos lógicos e racionais" },
        { nome: "Outcome", descricao: "Resultados e benefícios tangíveis" }
      ]
    },
    { 
      nome: "PEACE", 
      descricao: "Framework focado em credibilidade e autoridade",
      componentes: [
        { nome: "Problema", descricao: "Identificação de dores e desafios" },
        { nome: "Empatia", descricao: "Demonstração de compreensão" },
        { nome: "Autoridade", descricao: "Estabelecimento de expertise" },
        { nome: "Credibilidade", descricao: "Construção de confiança" },
        { nome: "Evidência", descricao: "Provas e testemunhos" }
      ]
    }
  ];

  useEffect(() => {
    fetchConteudoEditorial();
    fetchClienteAssinatura();
  }, [planejamento.id]);

  const fetchConteudoEditorial = async () => {
    try {
      const { data, error } = await supabase
        .from('conteudo_editorial')
        .select('*')
        .eq('planejamento_id', planejamento.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar conteúdo editorial:', error);
        return;
      }

      if (data) {
        setConteudo({
          ...data,
          frameworks_selecionados: data.frameworks_selecionados || [],
          especialistas_selecionados: data.especialistas_selecionados || []
        });
        
        // Carregar componentes selecionados se existirem (novo formato)
        if (data.frameworks_selecionados && Array.isArray(data.frameworks_selecionados)) {
          // Verificar se é o novo formato (componentes individuais) ou antigo (frameworks completos)
          const primeiroItem = data.frameworks_selecionados[0];
          if (primeiroItem && primeiroItem.includes(':')) {
            // Novo formato: "HESEC: Histórias"
            setComponentesSelecionados(data.frameworks_selecionados);
          } else {
            // Formato antigo: ["HESEC", "HERO"] - limpar
            setComponentesSelecionados([]);
          }
        } else {
          setComponentesSelecionados([]);
        }
      } else {
        setComponentesSelecionados([]);
      }
    } catch (error) {
      console.error('Erro ao buscar conteúdo editorial:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClienteAssinatura = async () => {
    try {
      const { data: cliente, error } = await supabase
        .from('clientes')
        .select('assinatura_id')
        .eq('id', clienteId)
        .single();

      if (error) {
        console.error('Erro ao buscar assinatura do cliente:', error);
        return;
      }

      // Mock data para diferentes tipos de assinatura
      const mockPlanos = {
        'starter': { nome: 'Starter', posts_mes: 12, formatos: ['post', 'stories'] },
        'professional': { nome: 'Professional', posts_mes: 20, formatos: ['post', 'stories', 'reels'] },
        'enterprise': { nome: 'Enterprise', posts_mes: 30, formatos: ['post', 'stories', 'reels', 'carousel'] }
      };

      const assinaturaType = cliente.assinatura_id?.includes('starter') ? 'starter' :
                           cliente.assinatura_id?.includes('professional') ? 'professional' : 'enterprise';
      
      setClienteAssinatura(mockPlanos[assinaturaType]);
    } catch (error) {
      console.error('Erro ao buscar dados do cliente:', error);
    }
  };

  const saveField = async (field: keyof ConteudoEditorial, value: any) => {
    setSalvando(true);
    try {
      const updateData = { [field]: value };
      
      if (conteudo.id) {
        const { error } = await supabase
          .from('conteudo_editorial')
          .update(updateData)
          .eq('id', conteudo.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('conteudo_editorial')
          .insert({
            planejamento_id: planejamento.id,
            ...updateData
          })
          .select()
          .single();

        if (error) throw error;
        setConteudo(prev => ({ ...prev, id: data.id }));
      }

      setConteudo(prev => ({ ...prev, [field]: value }));
      toast.success('Salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const saveAllSelections = async () => {
    setSalvando(true);
    try {
      const updateData = {
        frameworks_selecionados: componentesSelecionados,
        especialistas_selecionados: conteudo.especialistas_selecionados,
        missao: conteudo.missao,
        posicionamento: conteudo.posicionamento,
        persona: conteudo.persona
      };

      if (conteudo.id) {
        const { error } = await supabase
          .from('conteudo_editorial')
          .update(updateData)
          .eq('id', conteudo.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('conteudo_editorial')
          .insert({
            planejamento_id: planejamento.id,
            ...updateData
          })
          .select()
          .single();

        if (error) throw error;
        setConteudo(prev => ({ ...prev, id: data.id }));
      }

      toast.success('Análise salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar análise:', error);
      toast.error('Erro ao salvar análise. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const resetAllSelections = async () => {
    try {
      if (conteudo.id) {
        const { error } = await supabase
          .from('conteudo_editorial')
          .delete()
          .eq('id', conteudo.id);

        if (error) throw error;
      }

      setConteudo({
        planejamento_id: planejamento.id,
        frameworks_selecionados: [],
        especialistas_selecionados: [],
        missao: '',
        posicionamento: '',
        persona: ''
      });
      
      setComponentesSelecionados([]);
      
      toast.success('Análise resetada com sucesso!');
    } catch (error) {
      console.error('Erro ao resetar análise:', error);
      toast.error('Erro ao resetar análise. Tente novamente.');
    }
  };

  const gerarCronogramaPostagens = (mes: number, ano: number) => {
    const cronograma: Date[] = [];
    const diasSemana = [1, 3, 5]; // Segunda, Quarta, Sexta
    
    const ultimoDiaDoMes = new Date(ano, mes + 1, 0).getDate();
    
    for (let dia = 1; dia <= ultimoDiaDoMes; dia++) {
      const data = new Date(ano, mes, dia);
      if (diasSemana.includes(data.getDay())) {
        cronograma.push(data);
      }
    }
    
    return cronograma;
  };

  const gerarConteudoEditorial = async () => {
    if (!clienteAssinatura) {
      toast.error('Dados da assinatura não encontrados');
      return;
    }

    if (!conteudo.missao || !conteudo.posicionamento) {
      toast.error('Missão e posicionamento são obrigatórios para gerar conteúdo');
      return;
    }

    setGerando(true);
    try {
      const cronograma = gerarCronogramaPostagens(currentDate.getMonth(), currentDate.getFullYear());
      const quantidadePosts = Math.min(cronograma.length, clienteAssinatura.posts_mes);

      const prompt = `
        Baseado na missão "${conteudo.missao}" e posicionamento "${conteudo.posicionamento}" da empresa,
        gere ${quantidadePosts} posts para redes sociais seguindo estas diretrizes:
        
        - Componentes selecionados: ${componentesSelecionados?.join(', ')}
        - Especialistas de referência: ${conteudo.especialistas_selecionados?.join(', ')}
        - Formatos disponíveis: ${clienteAssinatura.formatos.join(', ')}
        - Persona: ${conteudo.persona || 'Não definida'}
        
        Para cada post, retorne um JSON com:
        - titulo: título atrativo (máximo 50 caracteres)
        - objetivo_postagem: objetivo específico do post
        - tipo_criativo: tipo de conteúdo visual necessário
        - formato_postagem: formato escolhido dentre os disponíveis
        
        Retorne apenas o array JSON sem explicações adicionais.
      `;

      const { data, error } = await supabase.functions.invoke('generate-content-with-ai', {
        body: { prompt }
      });

      if (error) throw error;

      let postsData;
      try {
        postsData = JSON.parse(data.content);
      } catch (e) {
        console.error('Erro ao fazer parse do JSON:', e);
        toast.error('Erro no formato da resposta da IA');
        return;
      }

      const postsComData = postsData.slice(0, quantidadePosts).map((post: any, index: number) => ({
        ...post,
        data_postagem: cronograma[index].toISOString().split('T')[0]
      }));

      setPostsGerados(postsComData);
      await salvarPostsCalendario(postsComData);

    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      toast.error('Erro ao gerar conteúdo. Tente novamente.');
    } finally {
      setGerando(false);
    }
  };

  const salvarPostsCalendario = async (novosPost: any[]) => {
    try {
      // Deletar posts existentes do mês atual
      const { error: deleteError } = await supabase
        .from('posts_planejamento')
        .delete()
        .eq('planejamento_id', planejamento.id)
        .gte('data_postagem', `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`)
        .lt('data_postagem', `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 2).padStart(2, '0')}-01`);

      if (deleteError) throw deleteError;

      // Inserir novos posts
      const postsParaInserir = novosPost.map(post => ({
        planejamento_id: planejamento.id,
        titulo: post.titulo,
        objetivo_postagem: post.objetivo_postagem,
        tipo_criativo: post.tipo_criativo,
        formato_postagem: post.formato_postagem,
        data_postagem: post.data_postagem
      }));

      const { data, error } = await supabase
        .from('posts_planejamento')
        .insert(postsParaInserir)
        .select();

      if (error) throw error;

      setPosts([...posts.filter(p => !novosPost.find(np => np.data_postagem === p.data_postagem)), ...data]);
      toast.success('Posts salvos no calendário!');
    } catch (error) {
      console.error('Erro ao salvar posts:', error);
      toast.error('Erro ao salvar posts no calendário');
    }
  };

  const toggleEspecialista = (especialista: { nome: string; descricao: string }) => {
    const atual = conteudo.especialistas_selecionados || [];
    const novaSelecao = atual.includes(especialista.nome)
      ? atual.filter(e => e !== especialista.nome)
      : [...atual, especialista.nome];
    
    setConteudo(prev => ({ ...prev, especialistas_selecionados: novaSelecao }));
  };

  const toggleComponenteFramework = (componente: string) => {
    const atual = componentesSelecionados || [];
    const novaSelecao = atual.includes(componente)
      ? atual.filter(c => c !== componente)
      : [...atual, componente];
    
    setComponentesSelecionados(novaSelecao);
  };

  const toggleFramework = (framework: string) => {
    const atual = conteudo.frameworks_selecionados || [];
    const novaSelecao = atual.includes(framework)
      ? atual.filter(f => f !== framework)
      : [...atual, framework];
    
    setConteudo(prev => ({ ...prev, frameworks_selecionados: novaSelecao }));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Adicionar dias vazios do início
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Adicionar dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getPostsForDay = (day: number) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return posts.filter(post => post.data_postagem === dateStr);
  };

  const getFormatIcon = (formato: string) => {
    switch (formato) {
      case 'post': return '📝';
      case 'stories': return '📱';
      case 'reels': return '🎬';
      case 'carousel': return '📸';
      default: return '📝';
    }
  };

  const hasCompleteAnalysis = () => {
    return conteudo.missao && 
           conteudo.posicionamento && 
           componentesSelecionados.length > 0 && 
           (conteudo.especialistas_selecionados?.length || 0) > 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="missao" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="missao" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Missão
          </TabsTrigger>
          <TabsTrigger value="posicionamento" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Posicionamento
          </TabsTrigger>
          <TabsTrigger value="conteudo" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Conteúdo Editorial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="missao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Missão da Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Descreva a missão da empresa..."
                value={conteudo.missao || ''}
                onChange={(e) => setConteudo(prev => ({ ...prev, missao: e.target.value }))}
                rows={4}
              />
              <Button 
                onClick={() => saveField('missao', conteudo.missao)}
                disabled={salvando}
              >
                {salvando ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Salvar Missão
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posicionamento" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Posicionamento da Marca</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Descreva o posicionamento da marca..."
                value={conteudo.posicionamento || ''}
                onChange={(e) => setConteudo(prev => ({ ...prev, posicionamento: e.target.value }))}
                rows={4}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Especialistas de Referência</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {especialistas.map((especialista) => (
                  <Tooltip key={especialista.nome}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={conteudo.especialistas_selecionados?.includes(especialista.nome) ? "default" : "outline"}
                        onClick={() => toggleEspecialista(especialista)}
                        className="h-auto py-2"
                      >
                        {especialista.nome}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p>{especialista.descricao}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Frameworks de Conteúdo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {frameworks.map((framework) => (
                  <div key={framework.nome} className="space-y-3">
                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold text-lg text-primary">{framework.nome}</h4>
                      <p className="text-sm text-muted-foreground">{framework.descricao}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-4">
                      {framework.componentes.map((componente) => (
                        <TooltipProvider key={`${framework.nome}-${componente.nome}`}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant={componentesSelecionados.includes(`${framework.nome}: ${componente.nome}`) ? "default" : "outline"}
                                onClick={() => toggleComponenteFramework(`${framework.nome}: ${componente.nome}`)}
                                className="h-auto py-3 px-4 text-left justify-start transition-all hover:scale-105"
                                size="sm"
                              >
                                <div className="flex flex-col items-start">
                                  <span className="font-medium">{componente.nome}</span>
                                  <span className="text-xs opacity-70 text-left">{componente.descricao}</span>
                                </div>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p><strong>{componente.nome}:</strong> {componente.descricao}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                    
                    {framework.nome !== frameworks[frameworks.length - 1].nome && (
                      <div className="border-b border-border/50 mt-4"></div>
                    )}
                  </div>
                ))}
                
                {componentesSelecionados && componentesSelecionados.length > 0 && (
                  <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <h5 className="font-medium text-sm mb-2 text-primary">
                      Componentes Selecionados ({componentesSelecionados.length}):
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {componentesSelecionados.map((componente) => (
                        <Badge key={componente} variant="secondary" className="text-xs">
                          {componente}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Persona</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Descreva a persona do público-alvo..."
                value={conteudo.persona || ''}
                onChange={(e) => setConteudo(prev => ({ ...prev, persona: e.target.value }))}
                rows={4}
              />
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button 
              onClick={saveAllSelections}
              disabled={salvando}
            >
              {salvando ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Salvar Análise
            </Button>
            
            {hasCompleteAnalysis() && (
              <Button 
                variant="outline"
                onClick={resetAllSelections}
              >
                Fazer Nova Análise
              </Button>
            )}
          </div>
        </TabsContent>

        <TabsContent value="conteudo" className="space-y-4">
          {clienteAssinatura && (
            <Card>
              <CardHeader>
                <CardTitle>Plano de Assinatura</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary">{clienteAssinatura.nome}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {clienteAssinatura.posts_mes} posts/mês
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Formatos: {clienteAssinatura.formatos.join(', ')}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Geração de Conteúdo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={gerarConteudoEditorial}
                disabled={gerando || !hasCompleteAnalysis()}
                className="w-full"
              >
                {gerando ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Gerar Conteúdo Editorial
              </Button>
              
              {!hasCompleteAnalysis() && (
                <p className="text-sm text-muted-foreground">
                  Complete a missão, posicionamento e seleções para gerar conteúdo.
                </p>
              )}
            </CardContent>
          </Card>

          {postsGerados.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Posts Gerados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {postsGerados.map((post, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{post.titulo}</h4>
                        <Badge variant="outline">{post.formato_postagem}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{post.objetivo_postagem}</p>
                      <p className="text-sm">{post.tipo_criativo}</p>
                      <p className="text-xs text-muted-foreground">Data: {post.data_postagem}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Calendário Editorial</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth().map((day, index) => {
                  const dayPosts = day ? getPostsForDay(day) : [];
                  return (
                    <div
                      key={index}
                      className={`min-h-[60px] p-1 border rounded ${day ? 'bg-background' : 'bg-muted'}`}
                    >
                      {day && (
                        <>
                          <div className="text-sm font-medium mb-1">{day}</div>
                          {dayPosts.map((post, postIndex) => (
                            <div
                              key={postIndex}
                              className="text-xs p-1 bg-primary/10 rounded cursor-pointer hover:bg-primary/20"
                              onClick={() => onPreviewPost(post)}
                            >
                              <span className="mr-1">{getFormatIcon(post.formato_postagem)}</span>
                              {post.titulo.length > 10 ? `${post.titulo.substring(0, 10)}...` : post.titulo}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlanoEditorial;