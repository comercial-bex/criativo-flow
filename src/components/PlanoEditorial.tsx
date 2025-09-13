import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Target, 
  Users, 
  FileText, 
  Wand2, 
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  UserCircle,
  User,
  Briefcase,
  MapPin,
  Heart,
  Zap
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PlanoEditorialProps {
  planejamento: {
    id: string;
    titulo: string;
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
  conteudo_gerado?: string;
  created_at?: string;
  updated_at?: string;
}

export function PlanoEditorial({ planejamento, clienteId, posts, setPosts, onPreviewPost }: PlanoEditorialProps) {
  const [conteudoEditorial, setConteudoEditorial] = useState<ConteudoEditorial>({
    planejamento_id: planejamento.id
  });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<'editorial' | 'tarefas'>('editorial');
  const [especialistasSelecionados, setEspecialistasSelecionados] = useState<string[]>([]);
  const [frameworksSelecionados, setFrameworksSelecionados] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchConteudoEditorial();
  }, [planejamento.id]);

  const fetchConteudoEditorial = async () => {
    try {
      // Por enquanto, apenas usar estado local
      // A integração com BD será feita após os tipos serem atualizados
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar conteúdo editorial:', error);
      setLoading(false);
    }
  };

  const saveField = async (field: keyof ConteudoEditorial, value: string) => {
    try {
      // Por enquanto, apenas salvar no estado local
      const updatedContent = { ...conteudoEditorial, [field]: value };
      setConteudoEditorial(updatedContent);
      
      toast({
        title: "Sucesso",
        description: "Informação salva com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar informação.",
        variant: "destructive",
      });
    }
  };

  const getPromptEspecialista = (especialistasSelecionados: string[]) => {
    const especialistasMap = {
      'copy': 'Atue como um copywriter especialista em redes sociais, renomado por criar textos persuasivos e envolventes que convertem audiência em clientes. Você é famoso por criar copy que gera alto engajamento e conversões.',
      'design': 'Atue como um designer gráfico especialista em redes sociais, reconhecido mundialmente por criar designs visuais impactantes e inovadores que capturam a atenção e transmitem mensagens de forma clara e criativa.',
      'gestor_redes': 'Atue como um gestor de redes sociais experiente, conhecido por desenvolver estratégias digitais eficazes que constroem comunidades engajadas e geram resultados mensuráveis para marcas.',
      'gerente_marketing': 'Atue como um gerente de marketing digital estratégico, especialista em campanhas integradas que maximizam ROI e posicionam marcas como líderes em seus mercados.',
      'analista_dados': 'Atue como um analista de dados especializado em social media, expert em transformar métricas em insights acionáveis que otimizam performance e crescimento orgânico.',
      'influencer': 'Atue como um influencer digital bem-sucedido, especialista em criar conteúdo autêntico que ressoa com audiências e constrói relacionamentos genuínos com seguidores.'
    };
    
    
    if (especialistasSelecionados.length === 0) {
      return 'Atue como um especialista em redes sociais renomado mundialmente por criar conteúdo altamente criativo e único para redes sociais, que despertam a curiosidade e geram um alto engajamento no público-alvo.';
    }
    
    const prompts = especialistasSelecionados.map(especialista => 
      especialistasMap[especialista as keyof typeof especialistasMap] || ''
    ).filter(Boolean);
    
    return prompts.length > 1 
      ? `Atue como uma equipe de especialistas que combina as seguintes expertises: ${prompts.join(' + ')}`
      : prompts[0] || 'Atue como um especialista em redes sociais renomado mundialmente por criar conteúdo altamente criativo e único para redes sociais, que despertam a curiosidade e geram um alto engajamento no público-alvo.';
  };

  const generateConteudoWithIA = async () => {
    try {
      setGenerating(true);

      // Buscar dados do cliente para contexto
      const { data: onboardingData } = await supabase
        .from('cliente_onboarding')
        .select('*')
        .eq('cliente_id', clienteId)
        .single();

      const { data: clienteData } = await supabase
        .from('clientes')
        .select('nome')
        .eq('id', clienteId)
        .single();

      // Buscar detalhes do planejamento
      const { data: planejamentoData } = await supabase
        .from('planejamentos')
        .select('descricao')
        .eq('id', planejamento.id)
        .single();

      // Buscar objetivos estratégicos do cliente
      const { data: objetivosData } = await supabase
        .from('cliente_objetivos')
        .select('*')
        .eq('cliente_id', clienteId);

      // Preparar o prompt para IA
      const promptEspecialista = getPromptEspecialista(especialistasSelecionados);
      const prompt = `
PASSO A PASSO DE MONTAR O PLANEJAMENTO DE ASSESSORIA

ESPECIALIZAÇÃO: ${promptEspecialista}

INFORMAÇÕES DA MARCA:
- Nome da empresa: ${clienteData?.nome || 'Empresa'}
- Segmento: ${onboardingData?.segmento_atuacao || 'Não informado'}
- Produtos/Serviços: ${onboardingData?.produtos_servicos || 'Não informado'}
- Tempo no mercado: ${onboardingData?.tempo_mercado || 'Não informado'}
- Localização: ${onboardingData?.localizacao || 'Não informado'}
- Público-alvo: ${onboardingData?.publico_alvo?.join(', ') || 'Não informado'}
- Objetivos Estratégicos: ${objetivosData?.map(obj => obj.objetivos).join(', ') || 'Não informado'}

DETALHES COMPLEMENTARES: ${planejamentoData?.descricao || ''}

FRAMEWORKS SELECIONADOS: ${frameworksSelecionados.join(', ')}

MISSÃO ATUAL: ${conteudoEditorial.missao || ''}

POSICIONAMENTO ATUAL: ${conteudoEditorial.posicionamento || ''}

PERSONA ATUAL: ${conteudoEditorial.persona || ''}

Com base nessas informações, crie um planejamento completo de conteúdo para redes sociais do Instagram, incluindo:

1. 4 posts estáticos
2. 4 scripts de vídeos/reels  
3. 4 conteúdos para carrossel

Para cada conteúdo, inclua:
- Título criativo
- Descrição/legenda (até 160 palavras)
- 12 hashtags relevantes
- Objetivo da postagem
- Formato sugerido

Formate a resposta em JSON com esta estrutura:
{
  "posts": [
    {
      "titulo": "...",
      "descricao": "...",
      "hashtags": ["...", "..."],
      "objetivo": "...",
      "formato": "post"
    }
  ],
  "reels": [...],
  "carrosseis": [...]
}
      `;

      const { data, error } = await supabase.functions.invoke('generate-content-with-ai', {
        body: { prompt }
      });

      if (error) throw error;

      // Salvar conteúdo gerado
      setConteudoEditorial(prev => ({...prev, conteudo_gerado: JSON.stringify(data)}));

      // Criar posts automaticamente no calendário
      if (data.posts || data.reels || data.carrosseis) {
        const novosPostsData = [];
        const hoje = new Date();

        // Adicionar posts
        if (data.posts) {
          data.posts.forEach((post: any, index: number) => {
            const dataPost = new Date(hoje);
            dataPost.setDate(hoje.getDate() + index * 2); // Espaçar de 2 em 2 dias
            
            novosPostsData.push({
              planejamento_id: planejamento.id,
              titulo: post.titulo,
              data_postagem: format(dataPost, 'yyyy-MM-dd'),
              tipo_criativo: 'imagem',
              formato_postagem: 'post',
              objetivo_postagem: post.objetivo || 'Engajamento',
              descricao: post.descricao
            });
          });
        }

        // Adicionar reels
        if (data.reels) {
          data.reels.forEach((reel: any, index: number) => {
            const dataPost = new Date(hoje);
            dataPost.setDate(hoje.getDate() + 10 + index * 3); // Começar depois dos posts
            
            novosPostsData.push({
              planejamento_id: planejamento.id,
              titulo: reel.titulo,
              data_postagem: format(dataPost, 'yyyy-MM-dd'),
              tipo_criativo: 'video',
              formato_postagem: 'reel',
              objetivo_postagem: reel.objetivo || 'Engajamento',
              descricao: reel.descricao
            });
          });
        }

        // Adicionar carrosseis
        if (data.carrosseis) {
          data.carrosseis.forEach((carrossel: any, index: number) => {
            const dataPost = new Date(hoje);
            dataPost.setDate(hoje.getDate() + 20 + index * 3); // Começar depois dos reels
            
            novosPostsData.push({
              planejamento_id: planejamento.id,
              titulo: carrossel.titulo,
              data_postagem: format(dataPost, 'yyyy-MM-dd'),
              tipo_criativo: 'imagem',
              formato_postagem: 'carrossel',
              objetivo_postagem: carrossel.objetivo || 'Engajamento',
              descricao: carrossel.descricao
            });
          });
        }

        // Inserir no banco
        if (novosPostsData.length > 0) {
          const { data: insertedPosts, error: insertError } = await supabase
            .from('posts_planejamento')
            .insert(novosPostsData)
            .select();

          if (insertError) throw insertError;

          setPosts([...posts, ...insertedPosts]);
        }
      }

      toast({
        title: "Sucesso",
        description: "Conteúdo gerado e tarefas criadas automaticamente!",
      });

    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar conteúdo com IA.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const getPostsForDay = (day: Date) => {
    return posts.filter(post => 
      isSameDay(new Date(post.data_postagem), day)
    );
  };

  const getFormatIcon = (formato: string) => {
    switch (formato) {
      case 'story': return '📸';
      case 'reel': return '🎬';
      case 'carrossel': return '🎠';
      default: return '📱';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
  };

  if (loading) {
    return <div className="animate-pulse space-y-6">
      <div className="h-32 bg-muted rounded-lg"></div>
    </div>;
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
      <Tabs defaultValue="missao" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger value="missao">
            <Target className="h-4 w-4 mr-2" />
            Missão
          </TabsTrigger>
          <TabsTrigger value="posicionamento">
            <Users className="h-4 w-4 mr-2" />
            Posicionamento
          </TabsTrigger>
          <TabsTrigger value="conteudo">
            <FileText className="h-4 w-4 mr-2" />
            Conteúdo Editorial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="missao" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Missão do Plano Editorial</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={conteudoEditorial.missao || ''}
                onChange={(e) => setConteudoEditorial({...conteudoEditorial, missao: e.target.value})}
                onBlur={() => conteudoEditorial.missao && saveField('missao', conteudoEditorial.missao)}
                placeholder="Descreva a missão e propósito do plano editorial..."
                className="min-h-[150px]"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posicionamento" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Especialistas para Geração de Conteúdo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { id: 'copy', label: 'Copywriter' },
                    { id: 'design', label: 'Designer' },
                    { id: 'gestor_redes', label: 'Gestor de Redes' },
                    { id: 'gerente_marketing', label: 'Gerente de Marketing' },
                    { id: 'analista_dados', label: 'Analista de Dados' },
                    { id: 'influencer', label: 'Influencer' }
                  ].map((especialista) => (
                    <Button
                      key={especialista.id}
                      variant={especialistasSelecionados.includes(especialista.id) ? 'default' : 'outline'}
                      className={`text-xs ${
                        especialistasSelecionados.includes(especialista.id) 
                          ? 'bg-primary hover:bg-primary/90 text-primary-foreground border-primary' 
                          : ''
                      }`}
                      onClick={() => {
                        const isSelected = especialistasSelecionados.includes(especialista.id);
                        if (isSelected) {
                          setEspecialistasSelecionados(prev => prev.filter(id => id !== especialista.id));
                        } else {
                          setEspecialistasSelecionados(prev => [...prev, especialista.id]);
                        }
                      }}
                    >
                      {especialista.label}
                    </Button>
                  ))}
                </div>
                {especialistasSelecionados.length > 0 && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Especialistas selecionados:</strong> {
                        especialistasSelecionados.map(especialista => {
                          const labels = {
                            'copy': 'Copywriter',
                            'design': 'Designer',
                            'gestor_redes': 'Gestor de Redes',
                            'gerente_marketing': 'Gerente de Marketing',
                            'analista_dados': 'Analista de Dados',
                            'influencer': 'Influencer'
                          };
                          return labels[especialista as keyof typeof labels];
                        }).join(', ')
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Frameworks de Posicionamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Framework HESEC */}
                <div>
                  <h4 className="font-medium mb-2">HESEC (Humanizar, Educar, Resolver, Entreter, Converter)</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { id: 'humanizar', label: 'Humanizar', tooltip: 'Criar conexão emocional com a audiência, mostrando o lado humano da marca' },
                      { id: 'educar', label: 'Educar', tooltip: 'Compartilhar conhecimento e informações valiosas para o público' },
                      { id: 'resolver', label: 'Resolver', tooltip: 'Oferecer soluções práticas para problemas do público-alvo' },
                      { id: 'entreter', label: 'Entreter', tooltip: 'Criar conteúdo divertido e envolvente que gera engajamento' },
                      { id: 'converter', label: 'Converter', tooltip: 'Transformar audiência em clientes através de calls-to-action efetivos' }
                    ].map((item) => (
                      <Tooltip key={item.id}>
                        <TooltipTrigger asChild>
                          <Button
                            variant={frameworksSelecionados.includes(item.id) ? 'default' : 'outline'}
                            className={`text-xs ${
                              frameworksSelecionados.includes(item.id) 
                                ? 'bg-primary hover:bg-primary/90 text-primary-foreground border-primary' 
                                : ''
                            }`}
                            onClick={() => {
                              const isSelected = frameworksSelecionados.includes(item.id);
                              if (isSelected) {
                                setFrameworksSelecionados(prev => prev.filter(id => id !== item.id));
                              } else {
                                setFrameworksSelecionados(prev => [...prev, item.id]);
                              }
                            }}
                          >
                            {item.label}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{item.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>

                {/* Framework HERO */}
                <div>
                  <h4 className="font-medium mb-2">HERO (Humano, Emoção, Notável, Oferta)</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'humano', label: 'Humano', tooltip: 'Mostrar o lado humano da marca, criando proximidade e autenticidade' },
                      { id: 'emocao', label: 'Emoção', tooltip: 'Despertar sentimentos e conexões emocionais que marcam o público' },
                      { id: 'notavel', label: 'Notável', tooltip: 'Criar conteúdo que se destaca, é memorável e gera impacto' },
                      { id: 'oferta', label: 'Oferta', tooltip: 'Apresentar produtos/serviços de forma atrativa e persuasiva' }
                    ].map((item) => (
                      <Tooltip key={item.id}>
                        <TooltipTrigger asChild>
                          <Button
                            variant={frameworksSelecionados.includes(item.id) ? 'default' : 'outline'}
                            className={`text-xs ${
                              frameworksSelecionados.includes(item.id) 
                                ? 'bg-primary hover:bg-primary/90 text-primary-foreground border-primary' 
                                : ''
                            }`}
                            onClick={() => {
                              const isSelected = frameworksSelecionados.includes(item.id);
                              if (isSelected) {
                                setFrameworksSelecionados(prev => prev.filter(id => id !== item.id));
                              } else {
                                setFrameworksSelecionados(prev => [...prev, item.id]);
                              }
                            }}
                          >
                            {item.label}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{item.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>

                {/* Framework PEACE */}
                <div>
                  <h4 className="font-medium mb-2">PEACE (Planejar, Engajar, Amplificar, Converter, Avaliar)</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { id: 'planejar', label: 'Planejar', tooltip: 'Desenvolver estratégias e cronogramas para o conteúdo de forma organizada' },
                      { id: 'engajar', label: 'Engajar', tooltip: 'Interagir e criar relacionamento genuíno com a audiência' },
                      { id: 'amplificar', label: 'Amplificar', tooltip: 'Expandir o alcance e visibilidade do conteúdo nas redes sociais' },
                      { id: 'converter_peace', label: 'Converter', tooltip: 'Transformar engajamento em resultados mensuráveis e vendas' },
                      { id: 'avaliar', label: 'Avaliar', tooltip: 'Medir e analisar performance para otimizar continuamente a estratégia' }
                    ].map((item) => (
                      <Tooltip key={item.id}>
                        <TooltipTrigger asChild>
                          <Button
                            variant={frameworksSelecionados.includes(item.id) ? 'default' : 'outline'}
                            className={`text-xs ${
                              frameworksSelecionados.includes(item.id) 
                                ? 'bg-primary hover:bg-primary/90 text-primary-foreground border-primary' 
                                : ''
                            }`}
                            onClick={() => {
                              const isSelected = frameworksSelecionados.includes(item.id);
                              if (isSelected) {
                                setFrameworksSelecionados(prev => prev.filter(id => id !== item.id));
                              } else {
                                setFrameworksSelecionados(prev => [...prev, item.id]);
                              }
                            }}
                          >
                            {item.label}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{item.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>

                {frameworksSelecionados.length > 0 && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Frameworks selecionados:</strong> {
                        frameworksSelecionados.map(framework => {
                          const labels = {
                            'humanizar': 'Humanizar',
                            'educar': 'Educar',
                            'resolver': 'Resolver',
                            'entreter': 'Entreter',
                            'converter': 'Converter',
                            'humano': 'Humano',
                            'emocao': 'Emoção',
                            'notavel': 'Notável',
                            'oferta': 'Oferta',
                            'planejar': 'Planejar',
                            'engajar': 'Engajar',
                            'amplificar': 'Amplificar',
                            'converter_peace': 'Converter (PEACE)',
                            'avaliar': 'Avaliar'
                          };
                          return labels[framework as keyof typeof labels];
                        }).join(', ')
                      }
                    </p>
                  </div>
                )}

                <Textarea
                  value={conteudoEditorial.posicionamento || ''}
                  onChange={(e) => setConteudoEditorial({...conteudoEditorial, posicionamento: e.target.value})}
                  onBlur={() => conteudoEditorial.posicionamento && saveField('posicionamento', conteudoEditorial.posicionamento)}
                  placeholder="Defina o posicionamento da marca nas redes sociais baseado nos frameworks selecionados..."
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Definição de Personas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-4">
                    Gere personas detalhadas baseadas nas informações coletadas nos quadros anteriores:
                    especialistas selecionados, frameworks de posicionamento, missão e dados do onboarding.
                  </p>
                  <Button 
                    onClick={async () => {
                      try {
                        setGenerating(true);
                        
                        // Buscar dados do cliente para contexto
                        const { data: onboardingData } = await supabase
                          .from('cliente_onboarding')
                          .select('*')
                          .eq('cliente_id', clienteId)
                          .single();

                        const { data: clienteData } = await supabase
                          .from('clientes')
                          .select('nome')
                          .eq('id', clienteId)
                          .single();

                        // Buscar objetivos estratégicos do cliente
                        const { data: objetivosData } = await supabase
                          .from('cliente_objetivos')
                          .select('*')
                          .eq('cliente_id', clienteId);

                        const prompt = `
Com base nas seguintes informações da empresa, crie 3 personas detalhadas e distintas:

INFORMAÇÕES DA MARCA:
- Nome da empresa: ${clienteData?.nome || 'Empresa'}
- Segmento: ${onboardingData?.segmento_atuacao || 'Não informado'}
- Produtos/Serviços: ${onboardingData?.produtos_servicos || 'Não informado'}
- Público-alvo: ${onboardingData?.publico_alvo?.join(', ') || 'Não informado'}
- Tipos de clientes: ${onboardingData?.tipos_clientes || 'Não informado'}
- Dores e problemas: ${onboardingData?.dores_problemas || 'Não informado'}
- O que é valorizado: ${onboardingData?.valorizado || 'Não informado'}
- Como encontram a empresa: ${onboardingData?.como_encontram?.join(', ') || 'Não informado'}
- Frequência de compra: ${onboardingData?.frequencia_compra || 'Não informado'}
- Ticket médio: ${onboardingData?.ticket_medio || 'Não informado'}
- Área de atendimento: ${onboardingData?.area_atendimento || 'Não informado'}
- Objetivos Estratégicos: ${objetivosData?.map(obj => obj.objetivos).join(', ') || 'Não informado'}

ESPECIALISTAS SELECIONADOS: ${especialistasSelecionados.join(', ')}
FRAMEWORKS SELECIONADOS: ${frameworksSelecionados.join(', ')}
MISSÃO ATUAL: ${conteudoEditorial.missao || ''}
POSICIONAMENTO ATUAL: ${conteudoEditorial.posicionamento || ''}

Crie 3 personas distintas e bem detalhadas. Para cada persona inclua:

1. Nome fictício e idade
2. Profissão e contexto socioeconômico detalhado
3. Principais dores e necessidades específicas
4. Comportamento digital e preferências de consumo
5. Motivações e objetivos pessoais/profissionais
6. Como a marca pode atender suas necessidades

As 3 personas devem representar diferentes segmentos do público-alvo da empresa, cobrindo variações em idade, poder aquisitivo, comportamento de compra, etc.

Formate a resposta exatamente assim (cada persona com no máximo 160 palavras):

🎯 PERSONA 1 - [NOME COMPLETO], [IDADE] anos
[PROFISSÃO]. [Descrição detalhada da persona incluindo características demográficas, comportamentais, dores, necessidades, hábitos digitais, motivações e como a marca pode ajudá-la. Use palavras-chave relevantes como Instagram, WhatsApp, qualidade, preço, exclusividade, confiança, tecidos, tapeçaria, confecção, Macapá, etc.]

🎯 PERSONA 2 - [NOME COMPLETO], [IDADE] anos
[PROFISSÃO]. [Descrição detalhada da persona 2 com perfil diferente da primeira]

🎯 PERSONA 3 - [NOME COMPLETO], [IDADE] anos
[PROFISSÃO]. [Descrição detalhada da persona 3 com perfil diferente das anteriores]

Use um tom profissional e inclua detalhes específicos do contexto do cliente.
                        `;

                        const { data, error } = await supabase.functions.invoke('generate-content-with-ai', {
                          body: { prompt }
                        });

                        if (error) throw error;

                        // Extrair o texto das personas - pode vir como string ou dentro de um objeto
                        let personasText = '';
                        if (typeof data === 'string') {
                          personasText = data;
                        } else if (data && typeof data === 'object') {
                          // Se vier como objeto JSON, tentar acessar propriedades comuns
                          personasText = data.generatedText || data.content || data.text || JSON.stringify(data, null, 2);
                        } else {
                          personasText = 'Erro ao processar as personas geradas.';
                        }

                        setConteudoEditorial(prev => ({...prev, persona: personasText}));
                        await saveField('persona', personasText);
                        
                        toast({
                          title: "Sucesso",
                          description: "3 personas geradas com base nas informações dos quadros anteriores!",
                        });

                      } catch (error) {
                        console.error('Erro ao gerar personas:', error);
                        toast({
                          title: "Erro",
                          description: "Erro ao gerar personas com IA.",
                          variant: "destructive",
                        });
                      } finally {
                        setGenerating(false);
                      }
                    }}
                    disabled={generating}
                    className="w-full"
                    size="lg"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    {generating ? 'Gerando 3 Personas...' : 'Gerar 3 Personas com base nas informações'}
                  </Button>
                </div>

                {conteudoEditorial.persona && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-lg font-semibold text-primary mb-6">
                      <Users className="h-5 w-5" />
                      Personas Definidas
                    </div>
                    
                    <div className="space-y-6">
                      {(() => {
                        // Separar as personas de forma mais robusta
                        const personasText = conteudoEditorial.persona;
                        let personas = [];
                        
                        // Tentar separar por 🎯 PERSONA primeiro
                        if (personasText.includes('🎯 PERSONA')) {
                          personas = personasText.split('🎯 PERSONA').filter(p => p.trim());
                        } 
                        // Se não encontrar, tentar por PERSONA
                        else if (personasText.includes('PERSONA')) {
                          personas = personasText.split(/PERSONA\s*\d+/).filter(p => p.trim());
                        }
                        // Se ainda não encontrar, dividir manualmente
                        else {
                          personas = [personasText]; // Mostrar tudo como uma persona
                        }
                        
                        return personas.map((persona, index) => {
                          // Extrair informações da persona
                          const lines = persona.trim().split('\n').filter(line => line.trim());
                          
                          // Pegar primeira linha como título/nome
                          let titleLine = lines[0] || `PERSONA ${index + 1}`;
                          titleLine = titleLine.replace(/^\d+\s*-\s*/, '').replace(/^-\s*/, '').trim();
                          
                          // Resto como conteúdo
                          const content = lines.slice(1).join(' ').trim() || lines[0] || '';
                          
                          // Extrair nome (primeiras palavras antes de vírgula ou idade)
                          const nameMatch = titleLine.match(/^([A-Za-zÀ-ÿ\s]+?)(?:,|\s*-|\s*\d+)/);
                          const name = nameMatch ? nameMatch[1].trim() : titleLine.split(',')[0].split('-')[0].trim();
                          
                          // Extrair idade se houver
                          const ageMatch = titleLine.match(/(\d+)\s*anos?/i);
                          const age = ageMatch ? ageMatch[1] : '';
                          
                          // Extrair profissão das primeiras palavras do conteúdo
                          const professionMatch = content.match(/^([^.!?]+?)(?:\.|,|é|atua|trabalha)/);
                          const profession = professionMatch ? professionMatch[1].trim() : '';
                          
                          // Ícones diferentes para cada persona
                          const icons = [UserCircle, User, Briefcase];
                          const IconComponent = icons[index] || UserCircle;
                          
                          return (
                            <Card key={index} className="border border-border bg-card">
                              <CardHeader className="border-b border-border bg-muted/30">
                                <div className="flex items-center gap-4">
                                  <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                    <IconComponent className="h-8 w-8 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h3 className="text-xl font-semibold text-foreground">
                                        {name || `Persona ${index + 1}`}
                                      </h3>
                                      {age && (
                                        <Badge variant="secondary" className="text-sm">
                                          {age} anos
                                        </Badge>
                                      )}
                                    </div>
                                    {profession && (
                                      <p className="text-muted-foreground font-medium">{profession}</p>
                                    )}
                                  </div>
                                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                    {index + 1}
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-6">
                                <div className="prose prose-sm max-w-none">
                                  <p className="text-muted-foreground leading-relaxed">
                                    {content}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

                {!conteudoEditorial.persona && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Personas não definidas</h3>
                    <p className="text-sm">Clique no botão acima para gerar as personas</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conteudo" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Geração de Conteúdo Editorial</CardTitle>
                <Button
                  onClick={generateConteudoWithIA}
                  disabled={generating || (especialistasSelecionados.length === 0 && frameworksSelecionados.length === 0)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  {generating ? 'Gerando...' : 'Gerar com IA'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {conteudoEditorial.conteudo_gerado ? (
                <div className="space-y-4">
                  <Badge className="bg-green-100 text-green-800">
                    Conteúdo gerado com sucesso!
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    O conteúdo foi gerado e as tarefas foram criadas automaticamente no calendário.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wand2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {especialistasSelecionados.length === 0 && frameworksSelecionados.length === 0
                      ? 'Selecione especialistas e frameworks na aba Posicionamento e clique em "Gerar com IA" para criar o planejamento de conteúdo.'
                      : 'Clique em "Gerar com IA" para criar automaticamente o planejamento de conteúdo baseado nas informações do cliente.'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Calendário */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendário Editorial
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewType === 'editorial' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewType('editorial')}
              >
                Editorial
              </Button>
              <Button
                variant={viewType === 'tarefas' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewType('tarefas')}
              >
                Tarefas
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Navegação do mês */}
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-semibold">
                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
              </h3>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Calendário */}
            <div className="grid grid-cols-7 gap-2">
              {/* Headers dos dias */}
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}

              {/* Dias do mês */}
              {getDaysInMonth().map((day) => {
                const postsForDay = getPostsForDay(day);
                
                return (
                  <div key={day.toString()} className="p-2 min-h-[80px] border rounded-lg hover:bg-muted/50">
                    <div className="text-sm font-medium mb-1">
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {postsForDay.map((post) => (
                        <div
                          key={post.id}
                          className="bg-primary/10 text-primary p-1 rounded text-xs cursor-pointer hover:bg-primary/20 flex items-center justify-between"
                          onClick={() => onPreviewPost(post)}
                        >
                          <span className="flex items-center gap-1">
                            {getFormatIcon(post.formato_postagem)}
                            <span className="truncate">{post.titulo}</span>
                          </span>
                          <Eye className="h-3 w-3" />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </TooltipProvider>
  );
}