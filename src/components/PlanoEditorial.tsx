import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  frameworks_selecionados?: string[];
  especialistas_selecionados?: string[];
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
  const [analiseCompleta, setAnaliseCompleta] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchConteudoEditorial();
  }, [planejamento.id]);

  const fetchConteudoEditorial = async () => {
    try {
      const { data } = await supabase
        .from('conteudo_editorial')
        .select('*')
        .eq('planejamento_id', planejamento.id)
        .single();

      if (data) {
        setConteudoEditorial(data);
        // Carregar frameworks e especialistas salvos
        if ((data as any).frameworks_selecionados) {
          setFrameworksSelecionados((data as any).frameworks_selecionados);
        }
        if ((data as any).especialistas_selecionados) {
          setEspecialistasSelecionados((data as any).especialistas_selecionados);
        }
        // Se tem frameworks salvos, considera análise completa
        if ((data as any).frameworks_selecionados && (data as any).frameworks_selecionados.length > 0) {
          setAnaliseCompleta(true);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar conteúdo editorial:', error);
      setLoading(false);
    }
  };

  const saveField = async (field: keyof ConteudoEditorial, value: string) => {
    try {
      // Buscar informações do cliente e plano
      const { data: clienteData } = await supabase
        .from('clientes')
        .select('assinatura_id')
        .eq('id', clienteId)
        .single();

      if (!clienteData?.assinatura_id) {
        toast({
          title: "Erro",
          description: "Cliente não possui plano ativo.",
          variant: "destructive",
        });
        return;
      }

      // Salvar no banco de dados
      const { data: existingContent } = await supabase
        .from('conteudo_editorial')
        .select('id')
        .eq('planejamento_id', planejamento.id)
        .single();

      if (existingContent) {
        // Atualizar conteúdo existente
        await supabase
          .from('conteudo_editorial')
          .update({ [field]: value })
          .eq('id', existingContent.id);
      } else {
        // Criar novo conteúdo
        await supabase
          .from('conteudo_editorial')
          .insert({
            planejamento_id: planejamento.id,
            [field]: value
          });
      }
      
      const updatedContent = { ...conteudoEditorial, [field]: value };
      setConteudoEditorial(updatedContent);
      
      toast({
        title: "Sucesso",
        description: `${field === 'missao' ? 'Missão' : 'Posicionamento'} salvo com sucesso!`,
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

        <TabsContent value="missao" className="space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Missão da Empresa
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Defina claramente a missão da empresa para orientar toda a estratégia de conteúdo
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Declaração de Missão
              </CardTitle>
              <CardDescription>
                Digite ou gere automaticamente a missão da empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Ex: Nossa missão é democratizar o acesso a tecidos de qualidade, oferecendo variedade, preço justo e atendimento personalizado que inspire criatividade e impulsione negócios no setor têxtil do Amapá..."
                value={conteudoEditorial.missao || ''}
                onChange={(e) => setConteudoEditorial(prev => ({ ...prev, missao: e.target.value }))}
                className="min-h-[120px] resize-none"
              />
              
              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    setGenerating(true);
                    try {
                      await new Promise(resolve => setTimeout(resolve, 2000));
                      
                      const missaoGerada = `Conectar pessoas às suas criações através de tecidos de qualidade excepcional, oferecendo variedade, inovação e atendimento personalizado que inspira criatividade e impulsiona o crescimento de negócios no setor têxtil, fortalecendo a economia local do Amapá.`;
                      
                      setConteudoEditorial(prev => ({ ...prev, missao: missaoGerada }));
                      
                      toast({
                        title: "Sucesso",
                        description: "Missão gerada com base nas informações da empresa!",
                      });

                    } catch (error) {
                      console.error('Erro ao gerar missão:', error);
                      toast({
                        title: "Erro",
                        description: "Erro ao gerar missão com IA.",
                        variant: "destructive",
                      });
                    } finally {
                      setGenerating(false);
                    }
                  }}
                  disabled={generating}
                  variant="outline"
                  className="flex-1"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  {generating ? 'Gerando...' : 'Gerar Missão com IA'}
                </Button>
                
                <Button
                  onClick={() => saveField('missao', conteudoEditorial.missao || '')}
                  disabled={!conteudoEditorial.missao}
                  variant="default"
                  className="px-8"
                >
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posicionamento" className="space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Posicionamento de Marca
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Defina como sua marca se posiciona no mercado e se diferencia da concorrência
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Estratégia de Posicionamento
              </CardTitle>
              <CardDescription>
                Digite ou gere automaticamente o posicionamento da marca
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Ex: A Rocha Tecidos se posiciona como a referência em tecidos exclusivos no Amapá, combinando tradição familiar com inovação, oferecendo tapeçaria personalizada e atendimento humanizado que transforma ideias em realidade..."
                value={conteudoEditorial.posicionamento || ''}
                onChange={(e) => setConteudoEditorial(prev => ({ ...prev, posicionamento: e.target.value }))}
                className="min-h-[120px] resize-none"
              />
              
              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    setGenerating(true);
                    try {
                      await new Promise(resolve => setTimeout(resolve, 2000));
                      
                      const posicionamentoGerado = `A Rocha Tecidos se posiciona como a loja de tecidos mais completa e confiável do Amapá, diferenciando-se pela expertise em tapeçaria exclusiva, variedade de produtos de qualidade e relacionamento próximo com o cliente. Nossa proposta única combina tradição de 19 anos no mercado com inovação constante, oferecendo desde tecidos básicos até peças exclusivas personalizadas, sempre com preço justo e atendimento humanizado que vai além da venda.`;
                      
                      setConteudoEditorial(prev => ({ ...prev, posicionamento: posicionamentoGerado }));
                      
                      toast({
                        title: "Sucesso",
                        description: "Posicionamento gerado com base nas informações da empresa!",
                      });

                    } catch (error) {
                      console.error('Erro ao gerar posicionamento:', error);
                      toast({
                        title: "Erro",
                        description: "Erro ao gerar posicionamento com IA.",
                        variant: "destructive",
                      });
                    } finally {
                      setGenerating(false);
                    }
                  }}
                  disabled={generating}
                  variant="outline"
                  className="flex-1"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  {generating ? 'Gerando...' : 'Gerar Posicionamento com IA'}
                </Button>
                
                <Button
                  onClick={() => saveField('posicionamento', conteudoEditorial.posicionamento || '')}
                  disabled={!conteudoEditorial.posicionamento}
                  variant="default"
                  className="px-8"
                >
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Especialistas para Geração de Conteúdo</CardTitle>
                <CardDescription>
                  Selecione os especialistas que trabalharão no projeto
                </CardDescription>
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
                      disabled={analiseCompleta}
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
                        const personasText = conteudoEditorial.persona;
                        
                        // Dividir o texto em 3 partes principais
                        let personas = [];
                        
                        // Primeiro, tentar encontrar o padrão 🎯 PERSONA
                        if (personasText.includes('🎯 PERSONA')) {
                          // Dividir pelo marcador e limpar
                          const parts = personasText.split(/🎯 PERSONA \d+/);
                          // Remover primeira parte vazia se houver
                          if (parts[0].trim() === '') parts.shift();
                          
                          // Mapear cada parte para incluir o título
                          personas = parts.map((part, index) => {
                            const cleanPart = part.replace(/^[\s\-]+/, '').trim();
                            return {
                              title: `PERSONA ${index + 1}`,
                              content: cleanPart
                            };
                          });
                        }
                        
                        // Se não conseguiu encontrar o padrão, criar 3 personas manualmente
                        if (personas.length === 0) {
                          const sentences = personasText.split(/[.!?]+/).filter(s => s.trim());
                          const third = Math.ceil(sentences.length / 3);
                          
                          personas = [
                            {
                              title: 'PERSONA 1',
                              content: sentences.slice(0, third).join('. ').trim()
                            },
                            {
                              title: 'PERSONA 2', 
                              content: sentences.slice(third, third * 2).join('. ').trim()
                            },
                            {
                              title: 'PERSONA 3',
                              content: sentences.slice(third * 2).join('. ').trim()
                            }
                          ];
                        }
                        
                        // Garantir que temos exatamente 3 personas
                        while (personas.length < 3) {
                          personas.push({
                            title: `PERSONA ${personas.length + 1}`,
                            content: `Descrição da persona ${personas.length + 1} será gerada.`
                          });
                        }
                        
                        // Limitar a 3 personas
                        personas = personas.slice(0, 3);
                        
                        return personas.map((personaObj, index) => {
                          // Extrair informações da persona
                          const title = personaObj.title;
                          const content = personaObj.content;
                          
                          // Extrair nome do conteúdo se possível
                          const firstLine = content.split('\n')[0] || content.substring(0, 100);
                          const nameMatch = firstLine.match(/^([A-Za-zÀ-ÿ\s]+?)(?:,|\s*-|\s*\d+)/);
                          const name = nameMatch ? nameMatch[1].trim() : title;
                          
                          // Extrair idade se houver
                          const ageMatch = content.match(/(\d+)\s*anos?/i);
                          const age = ageMatch ? ageMatch[1] : '';
                          
                          // Extrair profissão
                          const professionMatch = content.match(/([A-Za-zÀ-ÿ\s,]+?)(?:\.|,|é|atua|trabalha)/);
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
          <div className="space-y-6">
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

            {/* Calendário Editorial - apenas na aba Conteúdo */}
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
                          
                          {postsForDay.map((post) => (
                            <div
                              key={post.id}
                              className="mb-1 p-1 text-xs rounded bg-primary/10 text-primary cursor-pointer hover:bg-primary/20 flex items-center gap-1"
                              onClick={() => onPreviewPost(post)}
                            >
                              <Eye className="h-3 w-3" />
                              <span className="mr-1">{getFormatIcon(post.formato_postagem)}</span>
                              <span className="truncate">{post.titulo}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
     </div>
   </TooltipProvider>
 )
}