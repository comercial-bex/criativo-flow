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
  Eye
} from "lucide-react";
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

      // Preparar o prompt para IA
      const prompt = `
PASSO A PASSO DE MONTAR O PLANEJAMENTO DE ASSESSORIA

ESPECIALIZAÇÃO: Atue como um social media renomado e famoso mundialmente por criar conteúdo altamente criativos e únicos para redes sociais, que despertam a curiosidade e geram um alto engajamento no público-alvo.

INFORMAÇÕES DA MARCA:
- Nome da empresa: ${clienteData?.nome || 'Empresa'}
- Segmento: ${onboardingData?.segmento_atuacao || 'Não informado'}
- Produtos/Serviços: ${onboardingData?.produtos_servicos || 'Não informado'}
- Tempo no mercado: ${onboardingData?.tempo_mercado || 'Não informado'}
- Localização: ${onboardingData?.localizacao || 'Não informado'}
- Público-alvo: ${onboardingData?.publico_alvo?.join(', ') || 'Não informado'}

DETALHES COMPLEMENTARES: ${planejamentoData?.descricao || ''}

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
    <div className="space-y-6">
      <Tabs defaultValue="missao" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50">
          <TabsTrigger value="missao">
            <Target className="h-4 w-4 mr-2" />
            Missão
          </TabsTrigger>
          <TabsTrigger value="posicionamento">
            <Users className="h-4 w-4 mr-2" />
            Posicionamento
          </TabsTrigger>
          <TabsTrigger value="persona">
            <Users className="h-4 w-4 mr-2" />
            Persona
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
          <Card>
            <CardHeader>
              <CardTitle>Posicionamento nas Redes Sociais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-5 gap-2">
                {['Humanizar', 'Educar', 'Resolver', 'Entreter', 'Converter'].map((tipo) => (
                  <Button
                    key={tipo}
                    variant="outline"
                    className="text-xs"
                    onClick={() => {
                      const current = conteudoEditorial.posicionamento || '';
                      const newValue = current.includes(tipo) 
                        ? current.replace(tipo, '').replace(/,\s*,/g, ',').trim()
                        : current ? `${current}, ${tipo}` : tipo;
                      setConteudoEditorial({...conteudoEditorial, posicionamento: newValue});
                      saveField('posicionamento', newValue);
                    }}
                  >
                    {tipo}
                  </Button>
                ))}
              </div>
              <Textarea
                value={conteudoEditorial.posicionamento || ''}
                onChange={(e) => setConteudoEditorial({...conteudoEditorial, posicionamento: e.target.value})}
                onBlur={() => conteudoEditorial.posicionamento && saveField('posicionamento', conteudoEditorial.posicionamento)}
                placeholder="Defina o posicionamento da marca nas redes sociais..."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="persona" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Definição de Persona</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={conteudoEditorial.persona || ''}
                onChange={(e) => setConteudoEditorial({...conteudoEditorial, persona: e.target.value})}
                onBlur={() => conteudoEditorial.persona && saveField('persona', conteudoEditorial.persona)}
                placeholder="Descreva as personas do cliente com base no onboarding..."
                className="min-h-[150px]"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conteudo" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Geração de Conteúdo Editorial</CardTitle>
                <Button
                  onClick={generateConteudoWithIA}
                  disabled={generating}
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
                    Clique em "Gerar com IA" para criar automaticamente o planejamento de conteúdo baseado nas informações do cliente.
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
  );
}