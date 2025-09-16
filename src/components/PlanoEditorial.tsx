import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Brain, Users, Target, PenTool, BookOpen, Award, Calendar, Table, Sparkles, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DataTable } from '@/components/DataTable';
import { CalendarioEditorial } from '@/components/CalendarioEditorial';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { usePostDragDrop } from '@/hooks/usePostDragDrop';

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

interface DraggablePostProps {
  post: any;
  onPreviewPost: (post: any) => void;
  getFormatIcon: (formato: string) => string;
  isUpdating: boolean;
  canDragPost: (post: any) => boolean;
}

const DraggablePost: React.FC<DraggablePostProps> = ({ post, onPreviewPost, getFormatIcon, isUpdating, canDragPost }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useDraggable({ 
    id: post.id,
    disabled: !canDragPost(post)
  });

  const [clickTimer, setClickTimer] = React.useState<NodeJS.Timeout | null>(null);

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (clickTimer) {
      clearTimeout(clickTimer);
      setClickTimer(null);
    }

    const timer = setTimeout(() => {
      if (!isDragging) {
        onPreviewPost(post);
      }
    }, 100);
    
    setClickTimer(timer);
  };

  React.useEffect(() => {
    return () => {
      if (clickTimer) {
        clearTimeout(clickTimer);
      }
    };
  }, [clickTimer]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`
              flex items-center gap-1 px-1.5 py-0.5 bg-card border border-border rounded-md
              hover:bg-accent/50 transition-all duration-200 h-7 min-w-0
              shadow-sm hover:shadow-md text-xs
              ${isUpdating ? 'animate-pulse' : ''}
              ${isDragging ? 'shadow-lg ring-2 ring-primary/60 bg-primary/10 rotate-1 scale-105' : ''}
              ${post.formato_postagem === 'post' ? 'bg-blue-50 border-blue-200' : 
                post.formato_postagem === 'stories' ? 'bg-purple-50 border-purple-200' : 
                'bg-green-50 border-green-200'}
              ${canDragPost(post) ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed opacity-50'}
            `}
            onClick={handleClick}
          >
            <span className="text-xs flex-shrink-0">{getFormatIcon(post.formato_postagem)}</span>
            <span className="text-xs font-medium truncate">
              {post.titulo.length > 6 ? post.titulo.substring(0, 6) : post.titulo}
            </span>
            {isUpdating && <Loader2 className="h-3 w-3 animate-spin text-primary flex-shrink-0" />}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span>{getFormatIcon(post.formato_postagem)}</span>
              <Badge variant="secondary" className="text-xs">
                {post.formato_postagem.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {post.tipo_criativo === 'imagem' ? '🖼️' : '🎬'} {post.tipo_criativo}
              </Badge>
            </div>
            {post.anexo_url && (
              <div className="w-20 h-20 rounded overflow-hidden">
                <img 
                  src={post.anexo_url} 
                  alt={post.titulo}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <p className="text-sm font-medium">{post.titulo}</p>
            <Badge variant="outline" className="text-xs">
              🎯 {post.objetivo_postagem?.replace('_', ' ') || 'Objetivo não definido'}
            </Badge>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface DroppableDayProps {
  day: number | null;
  dateStr: string;
  dayPosts: any[];
  onPreviewPost: (post: any) => void;
  getFormatIcon: (formato: string) => string;
  atualizandoPost: string | null;
  currentDate: Date;
  isDroppable: (day: number, currentMonth: Date) => boolean;
  canDragPost: (post: any) => boolean;
}

const DroppableDay: React.FC<DroppableDayProps> = ({ 
  day, 
  dateStr, 
  dayPosts, 
  onPreviewPost, 
  getFormatIcon, 
  atualizandoPost, 
  currentDate, 
  isDroppable,
  canDragPost
}) => {
  const { setNodeRef, isOver } = useDroppable({ 
    id: day ? day.toString() : 'empty',
    disabled: !day || !isDroppable(day, currentDate)
  });

  const isToday = day && new Date().toDateString() === new Date(dateStr).toDateString();
  const canDrop = day ? isDroppable(day, currentDate) : false;

  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-[120px] p-1.5 border rounded-lg transition-all duration-200
        ${day ? 'bg-card hover:bg-accent/30 border-border' : 'bg-muted/30 border-muted-foreground/20'}
        ${isOver && day && canDrop ? 'ring-2 ring-primary/60 bg-primary/10 border-primary/40' : ''}
        ${isOver && day && !canDrop ? 'ring-2 ring-destructive/60 bg-destructive/10 border-destructive/40' : ''}
        ${isToday ? 'ring-2 ring-blue-400 bg-blue-50/50' : ''}
        ${day && !canDrop ? 'opacity-50' : ''}
      `}
      style={{ 
        cursor: day && !canDrop ? 'not-allowed' : 'default' 
      }}
    >
      {day && (
        <>
          <div className={`
            text-sm font-semibold mb-1.5 flex items-center justify-between
            ${isToday ? 'text-blue-600' : 'text-foreground'}
          `}>
            <span>{day}</span>
            {dayPosts.length > 0 && (
              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                {dayPosts.length}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-1 auto-rows-min">
            {dayPosts.map((post) => (
              <DraggablePost
                key={post.id}
                post={post}
                onPreviewPost={onPreviewPost}
                getFormatIcon={getFormatIcon}
                isUpdating={atualizandoPost === post.id}
                canDragPost={canDragPost}
              />
            ))}
            {dayPosts.length === 0 && !isOver && (
              <div className="col-span-2 w-full text-center py-3 text-xs text-muted-foreground/60 border border-dashed border-muted-foreground/20 rounded">
                <div className="mb-1">📝</div>
                <div>Arraste posts</div>
              </div>
            )}
            {isOver && (
              <div className="col-span-2 w-full p-2 border border-primary/30 rounded bg-primary/10 text-xs text-primary">
                <div className="flex items-center justify-center gap-1">
                  <span>📌</span>
                  <span>Soltar aqui</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

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
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingPosts, setIsSavingPosts] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [postsGerados, setPostsGerados] = useState<any[]>([]);

  const [salvando, setSalvando] = useState(false);
  const [salvandoPosicionamento, setSalvandoPosicionamento] = useState(false);
  const [salvandoEspecialistas, setSalvandoEspecialistas] = useState(false);
  const [salvandoFrameworks, setSalvandoFrameworks] = useState(false);
  const [salvandoPersonas, setSalvandoPersonas] = useState(false);
  const [salvandoMissao, setSalvandoMissao] = useState(false);
  const [gerandoMissao, setGerandoMissao] = useState(false);
  const [gerandoPosicionamento, setGerandoPosicionamento] = useState(false);
  const [gerandoPersonas, setGerandoPersonas] = useState(false);
  const [clienteAssinatura, setClienteAssinatura] = useState<any>(null);
  const [componentesSelecionados, setComponentesSelecionados] = useState<string[]>([]);
  const [dadosOnboarding, setDadosOnboarding] = useState<any>(null);
  const [dadosObjetivos, setDadosObjetivos] = useState<any>(null);
  const [atualizandoPost, setAtualizandoPost] = useState<string | null>(null);
  const [draggedPost, setDraggedPost] = useState<any>(null);
  const [visualizacaoTabela, setVisualizacaoTabela] = useState(false);
  const [visualizacaoCalendario, setVisualizacaoCalendario] = useState(false);
  const [calendarioExpanded, setCalendarioExpanded] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const {
    isDragging,
    canDragPost,
    isDroppable,
    handleDragStart: onDragStart,
    handleDragEnd: onDragEnd,
    handleDrop: onDrop
  } = usePostDragDrop({
    posts,
    onPostsUpdate: setPosts
  });

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
    buscarDadosOnboarding().then(setDadosOnboarding);
    buscarDadosObjetivos().then(setDadosObjetivos);
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

  // Buscar dados da assinatura do cliente
  const fetchClienteAssinatura = async () => {
    if (!clienteId) return;
    
    try {
      // Buscar cliente e sua assinatura
      const { data: cliente, error: clienteError } = await supabase
        .from('clientes')
        .select(`
          assinatura_id,
          assinaturas (
            id,
            nome,
            preco,
            posts_mensais,
            reels_suporte,
            anuncios_facebook,
            anuncios_google,
            recursos
          )
        `)
        .eq('id', clienteId)
        .single();

      if (clienteError) throw clienteError;

      if (cliente?.assinaturas) {
        setClienteAssinatura(cliente.assinaturas);
      } else {
        console.log("Este cliente não possui um plano de assinatura definido.");
      }
    } catch (error) {
      console.error('Erro ao buscar assinatura:', error);
      console.error("Não foi possível carregar os dados da assinatura.");
    }
  };

  const buscarDadosOnboarding = async () => {
    try {
      const { data, error } = await supabase
        .from('cliente_onboarding')
        .select('*')
        .eq('cliente_id', clienteId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar dados do onboarding:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar dados do onboarding:', error);
      return null;
    }
  };

  // Buscar dados dos objetivos e análise SWOT
  const buscarDadosObjetivos = async () => {
    if (!clienteId) return null;

    try {
      const { data, error } = await supabase
        .from('cliente_objetivos')
        .select('*')
        .eq('cliente_id', clienteId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar dados dos objetivos:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar dados dos objetivos:', error);
      return null;
    }
  };

  const validarDadosCompletos = () => {
    if (!dadosOnboarding || !dadosObjetivos) {
      toast({
        title: "Erro",
        description: "Dados de onboarding ou objetivos não encontrados",
        variant: "destructive"
      });
      return false;
    }

    if (!conteudo.missao || conteudo.missao.length < 20) {
      toast({
        title: "Erro",
        description: "É necessário ter uma missão definida e salva com pelo menos 20 caracteres",
        variant: "destructive"
      });
      return false;
    }

    if (!conteudo.posicionamento || conteudo.posicionamento.length < 50) {
      toast({
        title: "Erro",
        description: "É necessário ter um posicionamento definido e salvo com pelo menos 50 caracteres",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const gerarMissaoComIA = async () => {
    if (!dadosOnboarding || !dadosObjetivos) {
      toast({
        title: "Erro",
        description: "Dados de onboarding ou objetivos não encontrados",
        variant: "destructive"
      });
      return;
    }

    setGerandoMissao(true);
    try {
      const prompt = `Com base nas informações da empresa ${dadosOnboarding.nome_empresa}, 
        que atua no segmento ${dadosOnboarding.segmento_atuacao}, 
        oferece ${dadosOnboarding.produtos_servicos},
        atende ao público ${dadosOnboarding?.publico_alvo?.join(', ') || 'não definido'} 
        e tem como dores/problemas dos clientes: ${dadosOnboarding.dores_problemas},
        
        Valores principais: ${dadosOnboarding.valores_principais || 'Não definidos'}
        
        Gere uma missão empresarial clara, inspiradora e focada no propósito da empresa. 
        A missão deve ser concisa (máximo 2 frases) e expressar o que a empresa faz, 
        para quem faz e qual o impacto que busca causar.`;

      const { data, error } = await supabase.functions.invoke('generate-content-with-ai', {
        body: { prompt }
      });

      if (error) throw error;

      const missaoGerada = data.generatedText?.trim();
      if (missaoGerada) {
        setConteudo(prev => ({
          ...prev,
          missao: missaoGerada
        }));
        
        toast({
          title: "Sucesso!",
          description: "Missão gerada com IA! Revise e salve se estiver satisfeito."
        });
      }
    } catch (error) {
      console.error('Erro ao gerar missão:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar missão com IA. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setGerandoMissao(false);
    }
  };

  const gerarPosicionamentoComIA = async () => {
    if (!dadosOnboarding || !dadosObjetivos) {
      toast({
        title: "Erro",
        description: "Dados de onboarding ou objetivos não encontrados",
        variant: "destructive"
      });
      return;
    }

    setGerandoPosicionamento(true);
    try {
      const prompt = `Com base nas informações da empresa ${dadosOnboarding.nome_empresa}:
        
        Segmento: ${dadosOnboarding.segmento_atuacao}
        Produtos/Serviços: ${dadosOnboarding.produtos_servicos}
        Público-alvo: ${dadosOnboarding?.publico_alvo?.join(', ') || 'não definido'}
        Diferenciais: ${dadosOnboarding.diferenciais || 'Não definidos'}
        Concorrentes: ${dadosOnboarding.concorrentes_diretos || 'Não identificados'}
        Valores: ${dadosOnboarding.valores_principais || 'Não definidos'}
        Tom de voz desejado: ${dadosOnboarding?.tom_voz?.join(', ') || 'Não definido'}
        Como quer ser lembrada: ${dadosOnboarding.como_lembrada || 'Não definido'}
        
        Crie um posicionamento de marca estratégico que defina:
        1. Como a marca se diferencia dos concorrentes
        2. Qual valor único entrega ao cliente
        3. Como quer ser percebida pelo mercado
        4. Seu tom de comunicação e personalidade
        
        O posicionamento deve ser claro, único e memorável (máximo 4 parágrafos).`;

      const { data, error } = await supabase.functions.invoke('generate-content-with-ai', {
        body: { prompt }
      });

      if (error) throw error;

      const posicionamentoGerado = data.generatedText?.trim();
      if (posicionamentoGerado) {
        setConteudo(prev => ({
          ...prev,
          posicionamento: posicionamentoGerado
        }));
        
        toast({
          title: "Sucesso!",
          description: "Posicionamento gerado com IA! Revise e salve se estiver satisfeito."
        });
      }
    } catch (error) {
      console.error('Erro ao gerar posicionamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar posicionamento com IA. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setGerandoPosicionamento(false);
    }
  };

  const gerarPersonasComIA = async () => {
    if (!dadosOnboarding || !dadosObjetivos) {
      toast({
        title: "Erro",
        description: "Dados de onboarding ou objetivos não encontrados",
        variant: "destructive"
      });
      return;
    }

    setGerandoPersonas(true);
    try {
      const prompt = `Com base nas informações da empresa ${dadosOnboarding.nome_empresa}:
        
        Segmento: ${dadosOnboarding.segmento_atuacao}
        Produtos/Serviços: ${dadosOnboarding.produtos_servicos}
        Público-alvo: ${dadosOnboarding?.publico_alvo?.join(', ') || 'não definido'}
        Dores/Problemas dos clientes: ${dadosOnboarding.dores_problemas}
        O que é valorizado pelos clientes: ${dadosOnboarding.valorizado || 'Não definido'}
        Como encontram a empresa: ${dadosOnboarding?.como_encontram?.join(', ') || 'Não definido'}
        Tipos de clientes: ${dadosOnboarding.tipos_clientes || 'Não definido'}
        
        Crie 2-3 personas detalhadas dos clientes ideais, incluindo para cada uma:
        1. Nome e dados demográficos
        2. Comportamentos e hábitos
        3. Dores e necessidades específicas
        4. Objetivos e motivações
        5. Como consome conteúdo/mídia
        6. Linguagem e tom preferidos
        
        Seja específico e realista, criando personas que ajudem na criação de conteúdo direcionado.`;

      const { data, error } = await supabase.functions.invoke('generate-content-with-ai', {
        body: { prompt }
      });

      if (error) throw error;

      const personasGeradas = data.generatedText?.trim();
      if (personasGeradas) {
        setConteudo(prev => ({
          ...prev,
          persona: personasGeradas
        }));
        
        toast({
          title: "Sucesso!",
          description: "Personas geradas com IA! Revise e salve se estiver satisfeito."
        });
      }
    } catch (error) {
      console.error('Erro ao gerar personas:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar personas com IA. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setGerandoPersonas(false);
    }
  };

  const salvarCampo = async (campo: keyof ConteudoEditorial, valor: any, estadoSalvando: React.Dispatch<React.SetStateAction<boolean>>) => {
    estadoSalvando(true);
    try {
      const dadosParaSalvar = {
        planejamento_id: planejamento.id,
        [campo]: valor
      };

      const { data: existingData } = await supabase
        .from('conteudo_editorial')
        .select('id')
        .eq('planejamento_id', planejamento.id)
        .maybeSingle();

      if (existingData) {
        // Atualizar registro existente
        const { error } = await supabase
          .from('conteudo_editorial')
          .update(dadosParaSalvar)
          .eq('planejamento_id', planejamento.id);

        if (error) throw error;
      } else {
        // Criar novo registro
        const { error } = await supabase
          .from('conteudo_editorial')
          .insert(dadosParaSalvar);

        if (error) throw error;
      }

      toast({
        title: "Sucesso!",
        description: `${campo} salvo com sucesso!`
      });

    } catch (error) {
      console.error(`Erro ao salvar ${campo}:`, error);
      toast({
        title: "Erro",
        description: `Erro ao salvar ${campo}. Tente novamente.`,
        variant: "destructive"
      });
    } finally {
      estadoSalvando(false);
    }
  };

  const salvarTodas = async () => {
    setSalvando(true);
    try {
      const dadosParaSalvar = {
        planejamento_id: planejamento.id,
        missao: conteudo.missao,
        posicionamento: conteudo.posicionamento,
        persona: conteudo.persona,
        frameworks_selecionados: componentesSelecionados,
        especialistas_selecionados: conteudo.especialistas_selecionados
      };

      const { data: existingData } = await supabase
        .from('conteudo_editorial')
        .select('id')
        .eq('planejamento_id', planejamento.id)
        .maybeSingle();

      if (existingData) {
        const { error } = await supabase
          .from('conteudo_editorial')
          .update(dadosParaSalvar)
          .eq('planejamento_id', planejamento.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('conteudo_editorial')
          .insert(dadosParaSalvar);

        if (error) throw error;
      }

      toast({
        title: "Sucesso!",
        description: "Todas as seleções foram salvas!"
      });

    } catch (error) {
      console.error('Erro ao salvar seleções:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar seleções. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setSalvando(false);
    }
  };

  const resetarAnaliseEditorial = async () => {
    try {
      const { error } = await supabase
        .from('conteudo_editorial')
        .delete()
        .eq('planejamento_id', planejamento.id);

      if (error) throw error;

      // Resetar estado local
      setConteudo({
        planejamento_id: planejamento.id,
        frameworks_selecionados: [],
        especialistas_selecionados: []
      });
      setComponentesSelecionados([]);

      toast({
        title: "Sucesso!",
        description: "Análise editorial resetada com sucesso!"
      });

    } catch (error) {
      console.error('Erro ao resetar análise:', error);
      toast({
        title: "Erro",
        description: "Erro ao resetar análise. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const gerarConteudoEditorial = useCallback(async () => {
    if (!validarDadosCompletos()) {
      return;
    }

    setIsGeneratingContent(true);
    
    try {
      const componentesSelecionadosTexto = componentesSelecionados.length > 0 
        ? componentesSelecionados.map(comp => {
            const [framework, componente] = comp.split(': ');
            const frameworkObj = frameworks.find(f => f.nome === framework);
            const componenteObj = frameworkObj?.componentes.find(c => c.nome === componente);
            return `${componente} (${componenteObj?.descricao || ''})`;
          }).join(', ')
        : 'Nenhum componente específico selecionado';

      const especialistasTexto = conteudo.especialistas_selecionados?.length 
        ? conteudo.especialistas_selecionados.map(esp => {
            const especialistaObj = especialistas.find(e => e.nome === esp);
            return `${esp} (${especialistaObj?.descricao || ''})`;
          }).join(', ')
        : 'Nenhum especialista específico selecionado';

      const prompt = `Como especialista em marketing de conteúdo, crie um planejamento editorial detalhado com base nos seguintes dados:

DADOS DA EMPRESA:
- Nome: ${dadosOnboarding?.nome_empresa}
- Segmento: ${dadosOnboarding?.segmento_atuacao}
- Produtos/Serviços: ${dadosOnboarding?.produtos_servicos}
- Público-alvo: ${dadosOnboarding?.publico_alvo?.join(', ') || 'Não definido'}

ANÁLISE ESTRATÉGICA:
Missão: ${conteudo.missao}
Posicionamento: ${conteudo.posicionamento}
Personas: ${conteudo.persona}

FRAMEWORKS SELECIONADOS: ${componentesSelecionadosTexto}
ESPECIALISTAS DE REFERÊNCIA: ${especialistasTexto}

ASSINATURA DO CLIENTE: ${clienteAssinatura?.nome || 'Não definida'} (${clienteAssinatura?.posts_mensais || 0} posts mensais)

INSTRUÇÕES:
1. Crie 30 ideias de posts seguindo os frameworks e especialistas selecionados
2. Varie entre posts educativos, promocionais, de relacionamento e de engajamento
3. Use as personas definidas para direcionar o conteúdo
4. Inclua diferentes formatos: posts carrossel, vídeos, imagens simples, stories
5. Para cada post, defina: título, tipo de conteúdo, objetivo, formato sugerido
6. Distribua os posts ao longo do mês de forma estratégica

Gere o conteúdo editorial completo agora:`;

      const { data, error } = await supabase.functions.invoke('generate-content-with-ai', {
        body: { prompt }
      });

      if (error) throw error;

      if (data?.generatedText) {
        setConteudo(prev => ({
          ...prev,
          conteudo_gerado: data.generatedText
        }));

        // Parse and extract posts from generated content
        try {
          const postsData = parseGeneratedPosts(data.generatedText);
          setPostsGerados(postsData);
        } catch (parseError) {
          console.error('Erro ao parsear posts:', parseError);
        }
        
        toast({
          title: "Sucesso!",
          description: "Conteúdo editorial gerado com sucesso!"
        });
      }
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar conteúdo editorial. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingContent(false);
    }
  }, [planejamento.id, conteudo.missao, conteudo.posicionamento, conteudo.persona, componentesSelecionados, conteudo.especialistas_selecionados]);

  // Parse generated content to extract posts
  const parseGeneratedPosts = (content: string) => {
    // Simple parsing logic - in real implementation, this would be more sophisticated
    const posts = [];
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    
    let currentDay = 1;
    for (const line of lines) {
      if (line.includes('Dia') || line.includes('Post')) {
        posts.push({
          id: `generated-${Date.now()}-${posts.length}`,
          titulo: line.substring(0, 50),
          tipo_criativo: 'post',
          formato_postagem: 'post',
          objetivo_postagem: 'engajamento',
          data_postagem: `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`,
          planejamento_id: planejamento.id
        });
        currentDay++;
        if (currentDay > 31) currentDay = 1;
      }
    }
    
    return posts.slice(0, 30); // Limit to 30 posts
  };

  // Save generated posts to database
  const salvarPosts = useCallback(async () => {
    if (postsGerados.length === 0) {
      toast({
        title: "Aviso",
        description: "Nenhum post gerado para salvar.",
        variant: "destructive"
      });
      return;
    }

    setIsSavingPosts(true);
    
    try {
      const { data, error } = await supabase
        .from('posts_planejamento')
        .insert(postsGerados.map(post => ({
          titulo: post.titulo,
          tipo_criativo: post.tipo_criativo,
          formato_postagem: post.formato_postagem,
          objetivo_postagem: post.objetivo_postagem,
          data_postagem: post.data_postagem,
          planejamento_id: planejamento.id
        })));

      if (error) throw error;

      // Add saved posts to the posts list
      setPosts([...posts, ...postsGerados]);
      setPostsGerados([]); // Clear generated posts

      toast({
        title: "Sucesso!",
        description: `${postsGerados.length} posts salvos com sucesso!`
      });

    } catch (error) {
      console.error('Erro ao salvar posts:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar posts. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSavingPosts(false);
    }
  }, [postsGerados, planejamento.id]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      if (direction === 'prev') {
        return subMonths(prev, 1);
      } else {
        return addMonths(prev, 1);
      }
    });
  };

  const getPostsForMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    
    const monthPosts = posts.filter(post => {
      const postDate = new Date(post.data_postagem);
      return postDate >= start && postDate <= end;
    });

    return days.map(day => {
      const dayPosts = monthPosts.filter(post => 
        isSameDay(new Date(post.data_postagem), day)
      );
      
      return {
        day: day.getDate(),
        date: format(day, 'yyyy-MM-dd'),
        posts: dayPosts,
        isToday: isToday(day)
      };
    });
  };

  const getFormatIcon = (formato: string) => {
    switch (formato) {
      case 'post':
        return '📝';
      case 'stories':
        return '📱';
      case 'reel':
        return '🎬';
      default:
        return '📄';
    }
  };

  function handleDragStart(event: DragStartEvent) {
    const postId = event.active.id as string;
    setActiveId(postId);
    onDragStart(postId);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    onDragEnd();

    if (!over) return;

    const draggedPostId = active.id as string;
    const droppedDay = parseInt(over.id as string);
    
    if (isNaN(droppedDay)) return;

    // Use the drag drop hook to handle the drop
    onDrop(draggedPostId, droppedDay, currentDate);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  const columns = [
    {
      key: "data_postagem",
      label: "Data",
      render: (row: any) => {
        const date = new Date(row.data_postagem);
        return format(date, "dd/MM/yyyy", { locale: ptBR });
      },
    },
    {
      accessorKey: "titulo",
      header: "Título",
    },
    {
      accessorKey: "formato_postagem",
      header: "Formato",
      cell: ({ row }: any) => {
        const formato = row.getValue("formato_postagem");
        return (
          <Badge variant="outline">
            {getFormatIcon(formato)} {formato}
          </Badge>
        );
      },
    },
    {
      accessorKey: "tipo_criativo",
      header: "Tipo",
      cell: ({ row }: any) => {
        const tipo = row.getValue("tipo_criativo");
        return (
          <Badge variant="secondary">
            {tipo === 'imagem' ? '🖼️' : '🎬'} {tipo}
          </Badge>
        );
      },
    },
    {
      accessorKey: "objetivo_postagem",
      header: "Objetivo",
      cell: ({ row }: any) => {
        const objetivo = row.getValue("objetivo_postagem");
        return (
          <Badge variant="outline">
            🎯 {objetivo?.replace('_', ' ')}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPreviewPost(row.original)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="missao" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="missao">Missão</TabsTrigger>
          <TabsTrigger value="posicionamento">Posicionamento</TabsTrigger>
          <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
        </TabsList>

        <TabsContent value="missao" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Missão da Empresa
              </CardTitle>
              <CardDescription>
                Defina a missão da empresa ou gere automaticamente com IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={gerarMissaoComIA}
                  disabled={gerandoMissao || !dadosOnboarding}
                  variant="outline"
                  size="sm"
                >
                  {gerandoMissao ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Gerar com IA
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => salvarCampo('missao', conteudo.missao, setSalvandoMissao)}
                  disabled={salvandoMissao || !conteudo.missao}
                  size="sm"
                >
                  {salvandoMissao ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar
                    </>
                  )}
                </Button>
              </div>
              
              <Textarea
                placeholder="Defina a missão da empresa..."
                value={conteudo.missao || ''}
                onChange={(e) => setConteudo(prev => ({ ...prev, missao: e.target.value }))}
                className="min-h-[120px]"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Personas
              </CardTitle>
              <CardDescription>
                Defina as personas do público-alvo ou gere automaticamente com IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={gerarPersonasComIA}
                  disabled={gerandoPersonas || !dadosOnboarding}
                  variant="outline"
                  size="sm"
                >
                  {gerandoPersonas ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Gerar com IA
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => salvarCampo('persona', conteudo.persona, setSalvandoPersonas)}
                  disabled={salvandoPersonas || !conteudo.persona}
                  size="sm"
                >
                  {salvandoPersonas ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar
                    </>
                  )}
                </Button>
              </div>
              
              <Textarea
                placeholder="Descreva as personas do público-alvo..."
                value={conteudo.persona || ''}
                onChange={(e) => setConteudo(prev => ({ ...prev, persona: e.target.value }))}
                className="min-h-[200px]"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posicionamento" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Posicionamento da Marca
              </CardTitle>
              <CardDescription>
                Defina o posicionamento estratégico da marca ou gere automaticamente com IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={gerarPosicionamentoComIA}
                  disabled={gerandoPosicionamento || !dadosOnboarding}
                  variant="outline"
                  size="sm"
                >
                  {gerandoPosicionamento ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Gerar com IA
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => salvarCampo('posicionamento', conteudo.posicionamento, setSalvandoPosicionamento)}
                  disabled={salvandoPosicionamento || !conteudo.posicionamento}
                  size="sm"
                >
                  {salvandoPosicionamento ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar
                    </>
                  )}
                </Button>
              </div>
              
              <Textarea
                placeholder="Defina o posicionamento estratégico da marca..."
                value={conteudo.posicionamento || ''}
                onChange={(e) => setConteudo(prev => ({ ...prev, posicionamento: e.target.value }))}
                className="min-h-[200px]"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Frameworks de Conteúdo
              </CardTitle>
              <CardDescription>
                Selecione os componentes dos frameworks que serão utilizados no conteúdo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {frameworks.map((framework) => (
                <div key={framework.nome} className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-lg">{framework.nome}</h4>
                    <p className="text-sm text-muted-foreground">{framework.descricao}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {framework.componentes.map((componente) => {
                      const componenteId = `${framework.nome}: ${componente.nome}`;
                      const isSelected = componentesSelecionados.includes(componenteId);
                      
                      return (
                        <div key={componenteId} className="flex items-start space-x-2">
                          <Checkbox
                            id={componenteId}
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setComponentesSelecionados(prev => [...prev, componenteId]);
                              } else {
                                setComponentesSelecionados(prev => 
                                  prev.filter(item => item !== componenteId)
                                );
                              }
                            }}
                          />
                          <div className="space-y-1">
                            <label 
                              htmlFor={componenteId}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {componente.nome}
                            </label>
                            <p className="text-xs text-muted-foreground">
                              {componente.descricao}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => salvarCampo('frameworks_selecionados', componentesSelecionados, setSalvandoFrameworks)}
                  disabled={salvandoFrameworks}
                  size="sm"
                >
                  {salvandoFrameworks ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Frameworks
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Especialistas de Marketing
              </CardTitle>
              <CardDescription>
                Selecione especialistas cujas abordagens influenciarão o conteúdo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {especialistas.map((especialista) => {
                  const isSelected = conteudo.especialistas_selecionados?.includes(especialista.nome) || false;
                  
                  return (
                    <div key={especialista.nome} className="flex items-start space-x-2">
                      <Checkbox
                        id={especialista.nome}
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          const novosEspecialistas = checked
                            ? [...(conteudo.especialistas_selecionados || []), especialista.nome]
                            : (conteudo.especialistas_selecionados || []).filter(nome => nome !== especialista.nome);
                          
                          setConteudo(prev => ({
                            ...prev,
                            especialistas_selecionados: novosEspecialistas
                          }));
                        }}
                      />
                      <div className="space-y-1">
                        <label 
                          htmlFor={especialista.nome}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {especialista.nome}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {especialista.descricao}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => salvarCampo('especialistas_selecionados', conteudo.especialistas_selecionados, setSalvandoEspecialistas)}
                  disabled={salvandoEspecialistas}
                  size="sm"
                >
                  {salvandoEspecialistas ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Especialistas
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conteudo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="h-5 w-5" />
                Geração de Conteúdo Editorial
              </CardTitle>
              <CardDescription>
                Gere conteúdo automático para o planejamento baseado nas suas seleções
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <Button
                  onClick={gerarConteudoEditorial}
                  disabled={isGeneratingContent}
                  className="flex-1"
                >
                  {isGeneratingContent ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando Conteúdo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Gerar Conteúdo Editorial
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={salvarPosts}
                  disabled={postsGerados.length === 0 || isSavingPosts}
                  variant="outline"
                  className="flex-1"
                >
                  {isSavingPosts ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Posts ({postsGerados.length})
                    </>
                  )}
                </Button>
              </div>

              {conteudo.conteudo_gerado && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Conteúdo Gerado</h4>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setVisualizacaoTabela(!visualizacaoTabela)}
                      >
                        <Table className="mr-2 h-4 w-4" />
                        {visualizacaoTabela ? 'Ocultar' : 'Ver'} Tabela
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setVisualizacaoCalendario(!visualizacaoCalendario)}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {visualizacaoCalendario ? 'Ocultar' : 'Ver'} Calendário
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <pre className="whitespace-pre-wrap text-sm">{conteudo.conteudo_gerado}</pre>
                  </div>
                </div>
              )}

              {visualizacaoTabela && posts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Posts do Planejamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DataTable 
                      data={posts} 
                      columns={columns}
                    />
                  </CardContent>
                </Card>
              )}

              {visualizacaoCalendario && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Calendário Editorial</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigateMonth('prev')}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium">
                          {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigateMonth('next')}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DndContext
                      sensors={sensors}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="grid grid-cols-7 gap-2">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
                          <div key={dia} className="p-2 text-center font-semibold text-sm bg-muted rounded">
                            {dia}
                          </div>
                        ))}
                        
                        {getPostsForMonth().map((dayData, index) => {
                          const dayOfWeek = new Date(dayData.date).getDay();
                          const isFirstWeek = index < 7;
                          const shouldRenderEmptyCell = isFirstWeek && index < dayOfWeek;
                          
                          if (shouldRenderEmptyCell) {
                            return (
                              <DroppableDay
                                key={`empty-${index}`}
                                day={null}
                                dateStr=""
                                dayPosts={[]}
                                onPreviewPost={onPreviewPost}
                                getFormatIcon={getFormatIcon}
                                atualizandoPost={atualizandoPost}
                                currentDate={currentDate}
                                isDroppable={isDroppable}
                                canDragPost={canDragPost}
                              />
                            );
                          }
                          
                          return (
                            <DroppableDay
                              key={dayData.date}
                              day={dayData.day}
                              dateStr={dayData.date}
                              dayPosts={dayData.posts}
                              onPreviewPost={onPreviewPost}
                              getFormatIcon={getFormatIcon}
                              atualizandoPost={atualizandoPost}
                              currentDate={currentDate}
                              isDroppable={isDroppable}
                              canDragPost={canDragPost}
                            />
                          );
                        })}
                      </div>
                      
                      <DragOverlay>
                        {activeId ? (
                          <div className="bg-primary/20 border-2 border-primary rounded p-2">
                            Movendo post...
                          </div>
                        ) : null}
                      </DragOverlay>
                    </DndContext>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={salvarTodas}
                  disabled={salvando}
                  variant="outline"
                >
                  {salvando ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Todas as Seleções
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={resetarAnaliseEditorial}
                  variant="destructive"
                  size="sm"
                >
                  Resetar Análise
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CalendarioEditorial
        isOpen={calendarioExpanded}
        onClose={() => setCalendarioExpanded(false)}
        posts={posts}
        onPostClick={onPreviewPost}
      />
    </div>
  );
};

export default PlanoEditorial;