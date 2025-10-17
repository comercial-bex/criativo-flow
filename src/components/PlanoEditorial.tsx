import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, Loader2, Users, Target, BookOpen, Sparkles, Save, Eye, Undo2, AlertTriangle, X, CheckCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarioEditorial } from "@/components/CalendarioEditorial";
import { PostPreviewModal } from "@/components/PostPreviewModal";
import { PostViewModal } from "@/components/PostViewModal";
import { DataTable } from "@/components/DataTable";
import { TableView } from "@/components/TableView";
import { PostsContentView } from "@/components/PostsContentView";
import { ListaPostsView } from "@/components/ListaPostsView";
import { DndContext, closestCenter, DragEndEvent, DragStartEvent, DragOverlay, useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { usePostDragDrop } from "@/hooks/usePostDragDrop";

interface PlanoEditorialProps {
  planejamento: {
    id: string;
    titulo: string;
    cliente_id: string;
  };
  clienteId: string;
  projetoId: string;
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
}

const DraggablePost: React.FC<DraggablePostProps> = ({ post, onPreviewPost, getFormatIcon, isUpdating }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: post.id });

  const [clickTimer, setClickTimer] = React.useState<NodeJS.Timeout | null>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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
                  inline-flex items-center gap-1 px-2 py-1 m-0.5 bg-card border border-border rounded-md
                  hover:bg-accent/50 transition-all duration-200 cursor-grab active:cursor-grabbing
                  shadow-sm hover:shadow-md text-xs
                  ${isUpdating ? 'animate-pulse' : ''}
                  ${isDragging ? 'shadow-lg ring-2 ring-primary/60 bg-primary/10 rotate-1 scale-105' : ''}
                  ${post.formato_postagem === 'post' ? 'bg-blue-50 border-blue-200' : 
                    post.formato_postagem === 'story' ? 'bg-pink-50 border-pink-200' : 
                    'bg-purple-50 border-purple-200'}
                `}
                onClick={handleClick}
              >
                <span className="text-sm">{getFormatIcon(post.formato_postagem)}</span>
                <span className="text-xs font-medium truncate max-w-[80px]">
                  {post.titulo.length > 15 ? post.titulo.substring(0, 15) + '...' : post.titulo}
                </span>
                {isUpdating && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
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
                  <div className="w-24 h-24 rounded overflow-hidden">
                    <img 
                      src={post.anexo_url} 
                      alt={post.titulo}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <p className="text-sm font-medium">{post.titulo}</p>
                {post.legenda && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {post.legenda.length > 100 ? post.legenda.substring(0, 100) + '...' : post.legenda}
                  </p>
                )}
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">
                    🎯 {post.objetivo_postagem?.replace('_', ' ') || 'Objetivo não definido'}
                  </Badge>
                  {post.persona_alvo && (
                    <Badge variant="outline" className="text-xs">
                      👤 {post.persona_alvo}
                    </Badge>
                  )}
                </div>
                {post.hashtags && post.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.hashtags.slice(0, 3).map((tag: string, index: number) => (
                      <span key={index} className="text-xs bg-primary/10 text-primary px-1 py-0.5 rounded">
                        #{tag.replace('#', '')}
                      </span>
                    ))}
                    {post.hashtags.length > 3 && (
                      <span className="text-xs text-muted-foreground">+{post.hashtags.length - 3}</span>
                    )}
                  </div>
                )}
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
}

const DroppableDay: React.FC<DroppableDayProps> = ({ day, dateStr, dayPosts, onPreviewPost, getFormatIcon, atualizandoPost }) => {
  const { setNodeRef, isOver } = useDroppable({ 
    id: dateStr,
    disabled: !day
  });

  const isToday = day && new Date().toDateString() === new Date(dateStr).toDateString();

  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-[100px] p-2 border rounded-lg transition-all duration-200
        ${day ? 'bg-card hover:bg-accent/30 border-border' : 'bg-muted/30 border-muted-foreground/20'}
        ${isOver && day ? 'ring-2 ring-primary/60 bg-primary/10 border-primary/40' : ''}
        ${isToday ? 'ring-2 ring-blue-400 bg-blue-50/50' : ''}
      `}
    >
      {day && (
        <>
          <div className={`
            text-sm font-semibold mb-2 flex items-center justify-between
            ${isToday ? 'text-blue-600' : 'text-foreground'}
          `}>
            <span>{day}</span>
            {dayPosts.length > 0 && (
              <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                {dayPosts.length}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {dayPosts.map((post) => (
              <DraggablePost
                key={post.id}
                post={post}
                onPreviewPost={onPreviewPost}
                getFormatIcon={getFormatIcon}
                isUpdating={atualizandoPost === post.id}
              />
            ))}
            {dayPosts.length === 0 && !isOver && (
              <div className="w-full text-center py-4 text-xs text-muted-foreground/60 border border-dashed border-muted-foreground/20 rounded">
                <div className="mb-1">📝</div>
                <div>Arraste posts</div>
              </div>
            )}
            {isOver && (
              <div className="w-full p-2 border border-primary/30 rounded bg-primary/10 text-xs text-primary">
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
  projetoId,
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
  const [calendarioExpanded, setCalendarioExpanded] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [gerandoMissao, setGerandoMissao] = useState(false);
  const [gerandoPosicionamento, setGerandoPosicionamento] = useState(false);
  const [gerandoPersonas, setGerandoPersonas] = useState(false);
  const [salvandoConteudoCompleto, setSalvandoConteudoCompleto] = useState(false);
  const [selectedContentModel, setSelectedContentModel] = useState<'gemini' | 'gpt4'>('gemini');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [clienteAssinatura, setClienteAssinatura] = useState<any>(null);
  const [postsGerados, setPostsGerados] = useState<Array<{
    id?: string;
    titulo: string;
    legenda: string;
    objetivo_postagem: string;
    tipo_criativo: string;
    formato_postagem: string;
    componente_hesec: string;
    persona_alvo: string;
    call_to_action: string;
    hashtags: string[];
    contexto_estrategico: string;
    data_postagem: string;
    status: 'temporario' | 'aprovado';
    data_salvamento?: string;
    anexo_url?: string;
    responsavel_id?: string;
    headline?: string;
    conteudo_completo?: string;
  }>>([]);
  const [postsTemporarios, setPostsTemporarios] = useState<any[]>([]);
  const [postsAprovadosCounter, setPostsAprovadosCounter] = useState(0);
  const [componentesSelecionados, setComponentesSelecionados] = useState<string[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewPosts, setPreviewPosts] = useState<any[]>([]);
  const [dadosOnboarding, setDadosOnboarding] = useState<any>(null);
  const [dadosObjetivos, setDadosObjetivos] = useState<any>(null);
  const [atualizandoPost, setAtualizandoPost] = useState<string | null>(null);
  const [draggedPost, setDraggedPost] = useState<any>(null);
  const [visualizacaoTabela, setVisualizacaoTabela] = useState(true);
  const [visualizacaoCalendario, setVisualizacaoCalendario] = useState(false);
  const [visualizacaoLista, setVisualizacaoLista] = useState(false);
  const [salvandoPostsGerados, setSalvandoPostsGerados] = useState(false);
  const [showPostViewModal, setShowPostViewModal] = useState(false);
  const [selectedPostForView, setSelectedPostForView] = useState<any>(null);
  const [gerandoConteudo, setGerandoConteudo] = useState(false);
  const [datasComemorativas, setDatasComemorativas] = useState<string[]>([]);
  const [datasPersonalizadas, setDatasPersonalizadas] = useState<Array<{nome: string, data: string}>>([]);
  const [objetivosTrafego, setObjetivosTrafego] = useState<string[]>([]);
  const [publicoAlvo, setPublicoAlvo] = useState('');
  const [orcamentoSugerido, setOrcamentoSugerido] = useState('');

  // Initialize drag & drop hook
  const {
    reschedulePost,
    undoLastAction,
    checkConflicts,
    isUpdating,
    canUndo,
    validateReschedule
  } = usePostDragDrop({
    posts,
    setPosts,
    onUndoAction: (message) => toast.info(message)
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
    carregarPostsTemporarios();
  }, [planejamento.id]);

  // Auto-save posts temporários a cada 30 segundos
  useEffect(() => {
    if (postsGerados.length === 0) return;
    
    const interval = setInterval(async () => {
      await salvarPostsTemporarios();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [postsGerados]);

  // Auto-save para conteúdo editorial com debounce
  useEffect(() => {
    if (!conteudo.missao && !conteudo.posicionamento && !conteudo.persona && 
        !componentesSelecionados.length && !conteudo.especialistas_selecionados?.length) {
      return;
    }

    setAutoSaveStatus('unsaved');
    
    const timer = setTimeout(() => {
      autoSaveContent();
    }, 3000); // Auto-save após 3 segundos de inatividade

    return () => clearTimeout(timer);
  }, [conteudo.missao, conteudo.posicionamento, conteudo.persona, componentesSelecionados, conteudo.especialistas_selecionados]);

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

  // Carregar posts temporários salvos anteriormente
  const carregarPostsTemporarios = async () => {
    try {
      const { data, error } = await supabase
        .from('posts_gerados_temp')
        .select('*')
        .eq('planejamento_id', planejamento.id);

      if (error) {
        console.error('Erro ao carregar posts temporários:', error);
        return;
      }

      if (data && data.length > 0) {
        const postsFormatados = data.map(post => ({
          id: post.id,
          titulo: post.titulo,
          legenda: post.legenda || '',
          objetivo_postagem: post.objetivo_postagem,
          tipo_criativo: post.tipo_criativo,
          formato_postagem: post.formato_postagem,
          componente_hesec: post.componente_hesec || '',
          persona_alvo: post.persona_alvo || '',
          call_to_action: post.call_to_action || '',
          hashtags: post.hashtags || [],
          contexto_estrategico: post.contexto_estrategico || '',
          data_postagem: post.data_postagem,
          status: 'temporario' as const,
          anexo_url: post.anexo_url
        }));
        
        setPostsGerados(postsFormatados);
        setPostsTemporarios(data);
        
        // 🔒 SECURITY FIX: Usar sessionStorage em vez de localStorage para dados temporários sensíveis
        sessionStorage.setItem(`posts_temp_${planejamento.id}`, JSON.stringify(postsFormatados));
        
        toast.info(`${data.length} posts temporários recuperados`);
      } else {
        // 🔒 SECURITY FIX: Tentar recuperar do sessionStorage como fallback
        const postsLocal = sessionStorage.getItem(`posts_temp_${planejamento.id}`);
        if (postsLocal) {
          const posts = JSON.parse(postsLocal);
          setPostsGerados(posts);
          toast.info(`${posts.length} posts recuperados do cache local`);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar posts temporários:', error);
      // Fallback para LocalStorage
      const postsLocal = localStorage.getItem(`posts_temp_${planejamento.id}`);
      if (postsLocal) {
        const posts = JSON.parse(postsLocal);
        setPostsGerados(posts);
        toast.info(`${posts.length} posts recuperados do cache local`);
      }
    }
  };

  // Buscar especialista por especialidade
  const buscarEspecialistaPorEspecialidade = async (especialidade: 'design' | 'videomaker' | 'filmmaker' | 'gerente_redes_sociais'): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('especialidade', especialidade)
        .maybeSingle();
      
      if (error) {
        console.error('Erro ao buscar especialista:', error);
        return null;
      }
      
      return data?.id || null;
    } catch (error) {
      console.error('Erro ao buscar especialista:', error);
      return null;
    }
  };

  // Criar tarefa automática
  const criarTarefaAutomatica = async (post: any, especialistaId: string, projetoId: string) => {
    try {
      const tipoTarefa = post.tipo_criativo === 'video' || post.tipo_criativo === 'stories' ? 'criativo_vt' : 'feed_post';
      const tituloTarefa = `Criar conteúdo: ${post.titulo}`;
      
      const descricaoTarefa = `
**Tipo:** ${post.tipo_criativo}
**Objetivo:** ${post.objetivo_postagem}
**Persona:** ${post.persona_alvo || 'Não definida'}
**Data de postagem:** ${post.data_postagem}
**CTA:** ${post.call_to_action || 'Não definido'}
      `.trim();

      const { data, error } = await supabase
        .from('tarefa')
        .insert([{
          projeto_id: projetoId,
          titulo: tituloTarefa,
          descricao: descricaoTarefa,
          tipo: tipoTarefa,
          prioridade: 'media',
          status: 'backlog',
          responsavel_id: especialistaId
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar tarefa automática:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao criar tarefa automática:', error);
      return null;
    }
  };

  // Salvar posts temporariamente no banco
  const salvarPostsTemporarios = async () => {
    if (postsGerados.length === 0) return;

    try {
      // Primeiro, deletar posts temporários existentes
      await supabase
        .from('posts_gerados_temp')
        .delete()
        .eq('planejamento_id', planejamento.id);

      // Inserir novos posts temporários
      const postsParaSalvar = postsGerados.map(post => ({
        planejamento_id: planejamento.id,
        titulo: post.titulo,
        legenda: post.legenda,
        objetivo_postagem: post.objetivo_postagem,
        tipo_criativo: post.tipo_criativo,
        formato_postagem: post.formato_postagem,
        componente_hesec: post.componente_hesec,
        persona_alvo: post.persona_alvo,
        call_to_action: post.call_to_action,
        hashtags: post.hashtags,
        contexto_estrategico: post.contexto_estrategico,
        data_postagem: post.data_postagem,
        anexo_url: post.anexo_url || null,
        responsavel_id: post.responsavel_id || null,
        // Novos campos para conteúdo diferenciado
        headline: post.headline,
        conteudo_completo: post.conteudo_completo
      }));

      console.log('💾 Salvando posts temporários:', {
        quantidade: postsParaSalvar.length,
        comHeadline: postsParaSalvar.filter(p => p.headline).length,
        comConteudo: postsParaSalvar.filter(p => p.conteudo_completo).length,
        tipos: postsParaSalvar.reduce((acc: any, p) => {
          acc[p.tipo_criativo] = (acc[p.tipo_criativo] || 0) + 1;
          return acc;
        }, {})
      });

      const { error } = await supabase
        .from('posts_gerados_temp')
        .insert(postsParaSalvar);

      if (error) {
        console.error('Erro ao salvar posts temporários:', error);
        throw error;
      }

      // 🔒 SECURITY FIX: Backup no sessionStorage (dados apagados ao fechar aba)
      sessionStorage.setItem(`posts_temp_${planejamento.id}`, JSON.stringify(postsGerados));
      
      console.log('Posts temporários salvos automaticamente');
    } catch (error) {
      console.error('Erro ao salvar posts temporários:', error);
      // 🔒 SECURITY FIX: Salvar pelo menos no sessionStorage como fallback
      sessionStorage.setItem(`posts_temp_${planejamento.id}`, JSON.stringify(postsGerados));
    }
  };

  // Buscar dados da assinatura do cliente
  const fetchClienteAssinatura = async () => {
    if (!clienteId) return;
    
    // setLoadingAssinatura(true);
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
    } finally {
      // setLoadingAssinatura(false);
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
      toast.error('Dados de onboarding ou objetivos não encontrados');
      return false;
    }

    if (!conteudo.missao || conteudo.missao.length < 20) {
      toast.error('É necessário ter uma missão definida e salva com pelo menos 20 caracteres');
      return false;
    }

    if (!conteudo.posicionamento || conteudo.posicionamento.length < 50) {
      toast.error('É necessário ter um posicionamento definido e salvo com pelo menos 50 caracteres');
      return false;
    }

    return true;
  };

  const gerarMissaoComIA = async () => {
    if (!dadosOnboarding || !dadosObjetivos) {
      toast.error('Dados de onboarding ou objetivos não encontrados');
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
        Diferenciais: ${dadosOnboarding.diferenciais || 'Não definidos'}
        Objetivos definidos: ${JSON.stringify(dadosObjetivos.objetivos)}
        
        Gere uma missão empresarial que:
        1. Defina claramente o propósito da empresa
        2. Seja inspiradora e motivadora
        3. Reflita os valores e diferenciais
        4. Tenha máximo 70 palavras
        5. Seja focada no impacto que a empresa gera
        
        Responda apenas com o texto da missão, sem títulos ou formatações extras.`;

      const response = await supabase.functions.invoke('generate-content-with-ai', {
        body: { prompt, model: selectedContentModel }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }
      
      // Show which model was used
      const modelUsed = selectedContentModel === 'gemini' ? 'Lovable AI (Gemini)' : 'OpenAI GPT-4.1';
      console.log(`✨ Content generated using: ${modelUsed}`);

      console.log('Resposta da API:', response);
      
      if (response.data) {
        // A edge function retorna { generatedText: "texto aqui" }
        const missaoGerada = response.data.generatedText || response.data;
        
        console.log('Missão gerada:', missaoGerada);
        
        if (missaoGerada && typeof missaoGerada === 'string' && missaoGerada.trim().length > 0) {
          setConteudo(prev => ({ ...prev, missao: missaoGerada.trim() }));
          toast.success('Missão gerada com sucesso!');
        } else {
          throw new Error('Missão gerada inválida');
        }
      } else {
        throw new Error('Nenhum dado retornado pela IA');
      }
    } catch (error) {
      console.error('Erro ao gerar missão:', error);
      toast.error('Erro ao gerar missão com IA');
    } finally {
      setGerandoMissao(false);
    }
  };

  const gerarPosicionamentoComIA = async () => {
    setGerandoPosicionamento(true);

    try {
      const dadosOnboarding = await buscarDadosOnboarding();
      
      if (!dadosOnboarding) {
        toast.error('Não foram encontrados dados de onboarding para este cliente. Complete o onboarding primeiro.');
        return;
      }

      // Construir prompt estruturado
      const prompt = `
Baseando-se nas informações de onboarding abaixo, gere um POSICIONAMENTO DE MARCA estratégico e bem estruturado para a empresa. O posicionamento deve ter no máximo 700 palavras e abordar como a empresa quer ser percebida no mercado.

**INFORMAÇÕES DA EMPRESA:**
- Nome: ${dadosOnboarding.nome_empresa || 'Não informado'}
- Segmento: ${dadosOnboarding.segmento_atuacao || 'Não informado'}
- Produtos/Serviços: ${dadosOnboarding.produtos_servicos || 'Não informado'}
- Tempo no mercado: ${dadosOnboarding.tempo_mercado || 'Não informado'}
- Localização: ${dadosOnboarding.localizacao || 'Não informado'}

**PÚBLICO-ALVO E MERCADO:**
- Público-alvo: ${dadosOnboarding?.publico_alvo?.join(', ') || 'Não informado'}
- Tipos de clientes: ${dadosOnboarding.tipos_clientes || 'Não informado'}
- Dores/Problemas dos clientes: ${dadosOnboarding.dores_problemas || 'Não informado'}
- O que valorizam: ${dadosOnboarding.valorizado || 'Não informado'}

**DIFERENCIAIS COMPETITIVOS:**
- Principais diferenciais: ${dadosOnboarding.diferenciais || 'Não informado'}
- Concorrentes diretos: ${dadosOnboarding.concorrentes_diretos || 'Não informado'}

**IDENTIDADE DA MARCA:**
- História da marca: ${dadosOnboarding.historia_marca || 'Não informado'}
- Valores principais: ${dadosOnboarding.valores_principais || 'Não informado'}
- Tom de voz: ${dadosOnboarding?.tom_voz?.join(', ') || 'Não informado'}
- Como quer ser lembrada: ${dadosOnboarding.como_lembrada || 'Não informado'}

**ANÁLISE SWOT:**
- Forças: ${dadosOnboarding.forcas || 'Não informado'}
- Fraquezas: ${dadosOnboarding.fraquezas || 'Não informado'}
- Oportunidades: ${dadosOnboarding.oportunidades || 'Não informado'}
- Ameaças: ${dadosOnboarding.ameacas || 'Não informado'}

**OBJETIVOS:**
- Objetivos digitais: ${dadosOnboarding.objetivos_digitais || 'Não informado'}
- Onde quer estar em 6 meses: ${dadosOnboarding.onde_6_meses || 'Não informado'}
- Resultados esperados: ${dadosOnboarding?.resultados_esperados?.join(', ') || 'Não informado'}

Com base nessas informações, elabore um posicionamento de marca que:
1. Defina claramente como a empresa quer ser percebida
2. Destaque seus diferenciais únicos
3. Conecte com as necessidades do público-alvo
4. Seja consistente com os valores e história da marca
5. Seja aplicável nas estratégias de comunicação

Responda com um texto corrido, bem estruturado e com no máximo 700 palavras.
`;

      const { data: response, error } = await supabase.functions.invoke('generate-content-with-ai', {
        body: { prompt }
      });

      if (error) {
        throw error;
      }

      const posicionamentoGerado = typeof response === 'string' ? response : response.toString();
      
      // Auto-save será ativado automaticamente pelo useEffect
      
      setConteudo(prev => ({
        ...prev,
        posicionamento: posicionamentoGerado
      }));

      toast.success('Posicionamento gerado e salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar posicionamento:', error);
      toast.error('Erro ao gerar posicionamento. Tente novamente.');
    } finally {
      setGerandoPosicionamento(false);
    }
  };

  // Gerar 3 personas com IA baseado no onboarding, objetivos, posicionamento e frameworks
  const gerarPersonasComIA = async () => {
    setGerandoPersonas(true);

    try {
      const dadosOnboarding = await buscarDadosOnboarding();
      const dadosObjetivos = await buscarDadosObjetivos();
      
      if (!validarDadosCompletos()) {
        return;
      }

      // Construir prompt estruturado para gerar 3 personas
      const frameworksTexto = componentesSelecionados.map((comp: any) => `${comp.nome}: ${comp.descricao}`).join('\n');
      const especialistasTexto = conteudo.especialistas_selecionados?.map((esp: any) => `${esp.nome}: ${esp.descricao}`).join('\n') || '';

      const prompt = `
Baseando-se nas informações completas abaixo, gere 3 PERSONAS DISTINTAS para estratégia de marketing digital. Formate a resposta em JSON válido com a estrutura especificada.

**INFORMAÇÕES DA EMPRESA:**
- Nome: ${dadosOnboarding.nome_empresa}
- Segmento: ${dadosOnboarding.segmento_atuacao}
- Produtos/Serviços: ${dadosOnboarding.produtos_servicos}
- Posicionamento: ${conteudo.posicionamento}

**PÚBLICO-ALVO:**
- Tipos: ${dadosOnboarding?.publico_alvo?.join(', ') || 'Não informado'}
- Dores/Problemas: ${dadosOnboarding?.dores_problemas || 'Não informado'}
- O que valorizam: ${dadosOnboarding?.valorizado || 'Não informado'}
- Como encontram a empresa: ${dadosOnboarding?.como_encontram?.join(', ') || 'Não informado'}
- Frequência de compra: ${dadosOnboarding.frequencia_compra}

**ANÁLISE SWOT:**
- Forças: ${(dadosObjetivos.analise_swot as any)?.forcas || dadosOnboarding.forcas}
- Fraquezas: ${(dadosObjetivos.analise_swot as any)?.fraquezas || dadosOnboarding.fraquezas}
- Oportunidades: ${(dadosObjetivos.analise_swot as any)?.oportunidades || dadosOnboarding.oportunidades}
- Ameaças: ${(dadosObjetivos.analise_swot as any)?.ameacas || dadosOnboarding.ameacas}

**OBJETIVOS ESTRATÉGICOS:**
${JSON.stringify(dadosObjetivos.objetivos, null, 2)}

**FRAMEWORKS DE CONTEÚDO SELECIONADOS:**
${frameworksTexto}

**ESPECIALISTAS SELECIONADOS:**
${especialistasTexto}

Gere 3 personas bem distintas que representem diferentes segmentos do público-alvo. Cada persona deve ser única e abordar diferentes aspectos do mercado.

Formate a resposta em JSON válido com esta estrutura EXATA:
{
  "personas": [
    {
      "nome": "Nome da Persona",
      "idade": "Faixa etária",
      "profissao": "Profissão/Cargo",
      "resumo": "Breve resumo em 2-3 linhas",
      "dores": ["dor 1", "dor 2", "dor 3"],
      "motivacoes": ["motivação 1", "motivação 2", "motivação 3"],
      "canais_preferidos": ["canal 1", "canal 2", "canal 3"],
      "comportamento_compra": "Como toma decisões de compra",
      "objecoes": ["objeção 1", "objeção 2"],
      "como_ajudar": "Como a empresa pode ajudar esta persona"
    }
  ]
}

IMPORTANTE: Retorne APENAS o JSON válido, sem texto adicional.
`;

      const { data: response, error } = await supabase.functions.invoke('generate-content-with-ai', {
        body: { prompt }
      });

      if (error) {
        throw error;
      }

      let personasGeradas;
      try {
        personasGeradas = typeof response === 'string' ? JSON.parse(response) : response;
      } catch (parseError) {
        console.error('Erro ao parsear resposta da IA:', parseError);
        throw new Error('Resposta da IA não está em formato JSON válido');
      }

      // Validar estrutura das personas
      if (!personasGeradas.personas || !Array.isArray(personasGeradas.personas) || personasGeradas.personas.length !== 3) {
        throw new Error('IA não gerou 3 personas válidas');
      }

      // Auto-save será ativado automaticamente pelo useEffect
      
      setConteudo(prev => ({
        ...prev,
        persona: JSON.stringify(personasGeradas)
      }));

      toast.success('3 Personas geradas e salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar personas:', error);
      toast.error('Erro ao gerar personas. Tente novamente.');
    } finally {
      setGerandoPersonas(false);
    }
  };

  // Auto-save único para todos os campos
  const autoSaveContent = async () => {
    if (autoSaveStatus === 'saving') return;
    
    setAutoSaveStatus('saving');
    try {
      const updateData = {
        missao: conteudo.missao,
        posicionamento: conteudo.posicionamento,
        persona: conteudo.persona,
        frameworks_selecionados: componentesSelecionados,
        especialistas_selecionados: conteudo.especialistas_selecionados
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
        if (data) {
          setConteudo(prev => ({ ...prev, id: data.id }));
        }
      }
      
      setAutoSaveStatus('saved');
      toast.success('Progresso salvo automaticamente');
    } catch (error) {
      console.error('Erro ao salvar automaticamente:', error);
      setAutoSaveStatus('unsaved');
      toast.error('Erro ao salvar automaticamente');
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

  // Indicador de progresso de salvamento
  const getSaveStatusColor = () => {
    switch (autoSaveStatus) {
      case 'saved': return 'text-green-600';
      case 'saving': return 'text-yellow-600';
      case 'unsaved': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getSaveStatusText = () => {
    switch (autoSaveStatus) {
      case 'saved': return 'Salvo automaticamente';
      case 'saving': return 'Salvando...';
      case 'unsaved': return 'Alterações não salvas';
      default: return '';
    }
  };

  const hasUnsavedContent = () => {
    return (
      (conteudo.missao && conteudo.missao.trim().length > 0) ||
      (conteudo.posicionamento && conteudo.posicionamento.trim().length > 0) ||
      (conteudo.persona && conteudo.persona.trim().length > 0) ||
      (conteudo.especialistas_selecionados && conteudo.especialistas_selecionados.length > 0) ||
      (componentesSelecionados && componentesSelecionados.length > 0)
    );
  };

  const salvarConteudoEditorialCompleto = async () => {
    if (!hasUnsavedContent()) {
      toast.error('Não há conteúdo para salvar');
      return;
    }

    setSalvandoConteudoCompleto(true);
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

      toast.success('Conteúdo editorial completo salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar conteúdo editorial:', error);
      toast.error('Erro ao salvar conteúdo editorial. Tente novamente.');
    } finally {
      setSalvandoConteudoCompleto(false);
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
    const limitePosts = clienteAssinatura?.posts_mensais || 12;
    
    let mesAtual = mes;
    let anoAtual = ano;
    
    // Gerar exatamente a quantidade de posts da assinatura
    while (cronograma.length < limitePosts) {
      const ultimoDiaDoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
      
      // Coletar datas do mês atual
      for (let dia = 1; dia <= ultimoDiaDoMes && cronograma.length < limitePosts; dia++) {
        const data = new Date(anoAtual, mesAtual, dia);
        if (diasSemana.includes(data.getDay())) {
          cronograma.push(data);
        }
      }
      
      // Se ainda não temos posts suficientes, pular para o próximo mês
      if (cronograma.length < limitePosts) {
        mesAtual++;
        if (mesAtual > 11) {
          mesAtual = 0;
          anoAtual++;
        }
      }
    }
    
    console.log(`📅 Cronograma gerado: ${cronograma.length} datas para ${limitePosts} posts do plano`);
    return cronograma.slice(0, limitePosts); // Garantir exatamente a quantidade
  };

  // Função removida - geração de conteúdo agora é feita diretamente no gerarConteudoEditorial

  const gerarConteudoEditorial = async () => {
    if (!clienteAssinatura) {
      toast.error('Dados da assinatura não encontrados');
      return;
    }

    if (!conteudo.missao || !conteudo.posicionamento) {
      toast.error('Missão e posicionamento são obrigatórios para gerar conteúdo');
      return;
    }

    // Verificar se há componentes H.E.S.E.C selecionados
    if (!componentesSelecionados || componentesSelecionados.length === 0) {
      toast.error('Selecione pelo menos um componente H.E.S.E.C antes de gerar o conteúdo');
      return;
    }

    // Verificar se há personas definidas
    if (!conteudo.persona || conteudo.persona.trim().length === 0) {
      toast.error('É necessário gerar e salvar as personas antes de criar o conteúdo editorial');
      return;
    }

    setGerando(true);
    try {
      const cronograma = gerarCronogramaPostagens(currentDate.getMonth(), currentDate.getFullYear());
      const quantidadePosts = cronograma.length;
      
      // Tipos de criativo e distribuição equilibrada conforme assinatura
      const tiposCreativos = ['post', 'carrossel', 'video'];
      const distribuicaoTipos = [];
      for (let i = 0; i < quantidadePosts; i++) {
        distribuicaoTipos.push(tiposCreativos[i % tiposCreativos.length]);
      }

      console.log(`Gerando ${quantidadePosts} posts para plano de ${clienteAssinatura.posts_mensais} posts mensais`);
      console.log('📊 Distribuição de tipos:', distribuicaoTipos);
      console.log('📅 Cronograma:', cronograma.map(d => d.toLocaleDateString()));

      if (quantidadePosts === 0) {
        toast.error('Não foi possível gerar cronograma de postagens para este mês');
        return;
      }

      // Extrair personas do JSON
      let personas = [];
      try {
        const personasData = JSON.parse(conteudo.persona);
        personas = personasData.personas || [];
      } catch (error) {
        console.error('Erro ao fazer parse das personas:', error);
        toast.error('Erro ao processar personas. Gere novamente.');
        return;
      }

      // Distribuir componentes H.E.S.E.C pelos posts
      const componentesDistribuidos = [];
      componentesSelecionados.forEach((comp, index) => {
        const postsParaEsteComponente = Math.ceil(quantidadePosts / componentesSelecionados.length);
        for (let i = 0; i < postsParaEsteComponente && componentesDistribuidos.length < quantidadePosts; i++) {
          componentesDistribuidos.push(comp);
        }
      });

      // Buscar dados adicionais para contexto
      console.log('🔍 Buscando dados do onboarding...');
      const dadosOnboarding = await buscarDadosOnboarding();
      console.log('✅ Dados onboarding:', {
        nome: dadosOnboarding?.nome_empresa,
        temTomVoz: !!dadosOnboarding?.tom_voz,
        temValores: !!dadosOnboarding?.valores_principais,
        temDiferenciais: !!dadosOnboarding?.diferenciais
      });
      
      console.log('🔍 Buscando dados de objetivos...');
      const dadosObjetivos = await buscarDadosObjetivos();
      console.log('✅ Dados objetivos:', {
        temSwot: !!dadosObjetivos?.analise_swot
      });

      // Prompt seguindo modelo BEX com geração completa de conteúdo e dados do onboarding
      const prompt = `
Gere um calendário editorial completo seguindo o MODELO BEX para marketing digital profissional.

**CONTEXTO COMPLETO DA EMPRESA:**
- Nome: ${dadosOnboarding?.nome_empresa || 'Nome não informado'}
- Segmento: ${dadosOnboarding?.segmento_atuacao || 'Segmento não informado'}
- Tom de Voz: ${dadosOnboarding?.tom_voz || 'Não definido'}
- Valores Principais: ${dadosOnboarding?.valores_principais || 'Não definidos'}
- Diferenciais: ${dadosOnboarding?.diferenciais || 'Não definidos'}
- Dores/Problemas dos Clientes: ${dadosOnboarding?.dores_problemas || 'Não definidas'}
- O que é valorizado pelos clientes: ${dadosOnboarding?.valorizado || 'Não definido'}
- Como quer ser lembrada: ${dadosOnboarding?.como_lembrada || 'Não definido'}
- Missão: ${conteudo.missao}
- Posicionamento: ${conteudo.posicionamento}

**ANÁLISE SWOT EMPRESA:**
${dadosObjetivos?.analise_swot ? `
- Forças: ${Array.isArray((dadosObjetivos.analise_swot as any)?.forcas) ? (dadosObjetivos.analise_swot as any).forcas.join(', ') : 'Não definidas'}
- Fraquezas: ${Array.isArray((dadosObjetivos.analise_swot as any)?.fraquezas) ? (dadosObjetivos.analise_swot as any).fraquezas.join(', ') : 'Não definidas'}
- Oportunidades: ${Array.isArray((dadosObjetivos.analise_swot as any)?.oportunidades) ? (dadosObjetivos.analise_swot as any).oportunidades.join(', ') : 'Não definidas'}
- Ameaças: ${Array.isArray((dadosObjetivos.analise_swot as any)?.ameacas) ? (dadosObjetivos.analise_swot as any).ameacas.join(', ') : 'Não definidas'}
` : 'Análise SWOT não disponível'}

**PERSONAS DEFINIDAS:**
${personas.map((p, i) => `PERSONA ${i+1}: ${p.nome} - ${p.resumo} - Dores: ${p.dores?.join(', ') || 'Não definidas'} - Características: ${p.caracteristicas?.join(', ') || 'Não definidas'}`).join('\n')}

**COMPONENTES H.E.S.E.C SELECIONADOS:**
${componentesSelecionados.map(comp => typeof comp === 'string' ? comp : (comp as any)?.nome || comp).join(', ')}

**ESPECIALISTAS DE REFERÊNCIA:**
${conteudo.especialistas_selecionados?.map(esp => typeof esp === 'string' ? esp : (esp as any)?.nome || esp).join(', ') || 'Marketing estratégico'}

**CRONOGRAMA E DISTRIBUIÇÃO:**
${cronograma.map((data, index) => {
  const formattedDate = data.toLocaleDateString('pt-BR');
  const dayOfWeek = data.toLocaleDateString('pt-BR', { weekday: 'long' });
  const componenteAssociado = componentesDistribuidos[index] || componentesSelecionados[0];
  const componenteNome = typeof componenteAssociado === 'string' ? componenteAssociado : componenteAssociado?.nome || 'Componente';
  const personaIndex = index % personas.length;
  const persona = personas[personaIndex];
  const tipoPost = distribuicaoTipos[index];
  
  return `${index + 1}. ${formattedDate} (${dayOfWeek}) - TIPO: ${tipoPost.toUpperCase()} - Componente: ${componenteNome} - Persona: ${persona?.nome || 'Persona 1'}`;
}).join('\n')}

**DIRETRIZES ESPECÍFICAS POR TIPO:**
🎥 PARA VÍDEOS (${distribuicaoTipos.filter(t => t === 'video').length} posts):
- Campo "conteudo_completo" DEVE conter ROTEIRO TÉCNICO COMPLETO
- Usar tom de voz da empresa: ${dadosOnboarding?.tom_voz || 'profissional'}
- Duração ideal: 15-30 segundos para engagement máximo
- Hook nos primeiros 3 segundos é OBRIGATÓRIO

📚 PARA POSTS/CARROSSEL (${distribuicaoTipos.filter(t => t !== 'video').length} posts):
- Campo "conteudo_completo" DEVE conter LEGENDA ELABORADA (150-300 palavras)
- Integrar valores da empresa: ${dadosOnboarding?.valores_principais || 'valores corporativos'}
- Abordar dores específicas: ${dadosOnboarding?.dores_problemas || 'dores do público'}
- Reforçar diferenciais: ${dadosOnboarding?.diferenciais || 'diferenciais únicos'}

**FORMATO TÉCNICO OBRIGATÓRIO PARA VÍDEOS:**

IDENTIFICAÇÃO:
– Cliente: ${dadosOnboarding?.nome_empresa || '[NOME_EMPRESA]'}
– Segmento: ${dadosOnboarding?.segmento_atuacao || '[SEGMENTO]'}
– Peça: Reel/Vídeo 15-30"
– Título: [Título específico do vídeo]
– Duração: 15-30 segundos
– Plataforma: Instagram/TikTok/LinkedIn
– Tom: ${dadosOnboarding?.tom_voz || 'profissional'}

OBJETIVO E ESTRATÉGIA:
– Objetivo: [baseado no componente H.E.S.E.C]
– Tom de voz: ${dadosOnboarding?.tom_voz || 'profissional'}
– Persona-alvo: [persona específica do cronograma]

ROTEIRO DETALHADO:
🎬 ABERTURA (0-3s) - HOOK OBRIGATÓRIO:
[Imagem/Cena]: Descrição visual específica
[Locução OFF]: Frase de impacto para capturar atenção

🎬 DESENVOLVIMENTO (3-20s):
[Imagem/Cena]: Desenvolvimento do conteúdo
[Locução OFF]: Desenvolvimento da narrativa
[Elementos visuais]: Textos, gráficos, transições

🎬 ENCERRAMENTO (20-30s):
[Imagem/Cena]: Call-to-action visual
[Locução OFF]: Frase de fechamento + CTA
[Elementos finais]: Logo, contato, hashtag principal

Gere um JSON com array de ${quantidadePosts} posts seguindo esta estrutura EXATA:
[
  {
    "titulo": "Título específico e engajador",
    "headline": "Headline chamativa de máximo 60 caracteres",
    "conteudo_completo": "SE VIDEO: roteiro técnico completo seguindo formato acima | SE POST/CARROSSEL: legenda elaborada 150-300 palavras integrando dados do onboarding",
    "legenda": "Resumo da legenda para compatibilidade",
    "objetivo_postagem": "engajamento|vendas|educacao|relacionamento|branding",
    "tipo_criativo": "post|carrossel|video",
    "formato_postagem": "post|reel|story", 
    "componente_hesec": "componente_do_framework_selecionado",
    "persona_alvo": "nome_da_persona_especifica",
    "call_to_action": "CTA específico baseado no objetivo",
    "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
    "contexto_estrategico": "Estratégia baseada no onboarding e análise SWOT"
  }
]

REGRAS CRÍTICAS:
✅ Distribua EXATAMENTE conforme especificado: ${distribuicaoTipos.join(', ')}
✅ Para vídeos: "conteudo_completo" = ROTEIRO TÉCNICO COMPLETO
✅ Para posts/carrossel: "conteudo_completo" = LEGENDA ELABORADA com dados do onboarding
✅ SEMPRE preencha "headline" E "conteudo_completo" para TODOS os posts
✅ Use tom de voz da empresa: ${dadosOnboarding?.tom_voz || 'profissional'}
✅ Integre valores: ${dadosOnboarding?.valores_principais || 'valores corporativos'}
✅ Aborde dores: ${dadosOnboarding?.dores_problemas || 'dores do público'}

IMPORTANTE: Responda APENAS com o JSON válido, sem comentários ou texto adicional.`;

      console.log('📤 Enviando prompt para IA. Tamanho:', prompt.length);
      console.log('📝 Prompt preparado com dados:', {
        temOnboarding: !!dadosOnboarding,
        temSwot: !!dadosObjetivos?.analise_swot,
        quantidadePosts,
        tiposDistribuidos: distribuicaoTipos
      });

      const { data, error } = await supabase.functions.invoke('generate-content-with-ai', {
        body: { prompt }
      });

      if (error) {
        console.error('❌ Erro na função generate-content-with-ai:', error);
        throw error;
      }

      console.log('✅ Resposta da IA recebida:', {
        hasData: !!data,
        hasGeneratedText: !!data?.generatedText,
        textLength: data?.generatedText?.length || 0
      });

      let postsData;
      try {
        // A edge function pode retornar diferentes estruturas
        const responseText = data.generatedText || data.content || data;
        console.log('🔍 Processando resposta da IA...');
        console.log('📄 Tipo de resposta:', typeof responseText);
        console.log('📝 Primeiros 300 chars:', typeof responseText === 'string' ? responseText.substring(0, 300) : JSON.stringify(responseText).substring(0, 300));
        
        if (typeof responseText === 'string') {
          postsData = JSON.parse(responseText);
        } else {
          postsData = responseText;
        }
      } catch (e) {
        console.error('❌ Erro ao fazer parse do JSON:', e);
        console.log('📄 Resposta completa que falhou:', data);
        toast.error('Erro no formato da resposta da IA. Tente novamente.');
        return;
      }

      if (!Array.isArray(postsData) || postsData.length === 0) {
        console.error('❌ Resposta inválida da IA:', postsData);
        toast.error('IA não retornou posts válidos');
        return;
      }

      console.log('🎯 Posts extraídos:', postsData.length);
      console.log('🔍 Posts recebidos da IA:', postsData.map(p => ({ titulo: p.titulo, tipo: p.tipo_criativo })));

      // Buscar especialistas do projeto para atribuição
      const { data: projetoEspecialistas, error: especialistasError } = await supabase
        .from('projeto_especialistas')
        .select('*')
        .eq('projeto_id', clienteId);

      console.log('📋 Especialistas do projeto:', projetoEspecialistas);

      // Mapear posts com cronograma, tipo específico e responsável
      const postsComCronograma = postsData.map((post, index) => {
        const dataPostagem = cronograma[index]?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];
        const tipoEsperado = distribuicaoTipos[index];
        const tipoCreativo = post.tipo_criativo || tipoEsperado;
        
        // Atribuir responsável baseado no tipo criativo
        let responsavelId = null;
        if (projetoEspecialistas) {
          if (tipoCreativo === 'video') {
            // Para vídeos, procurar filmmaker ou videomaker
            const filmmaker = projetoEspecialistas.find(pe => 
              pe.especialidade === 'filmmaker' || pe.especialidade === 'videomaker'
            );
            responsavelId = filmmaker?.especialista_id || null;
          } else if (tipoCreativo === 'carrossel' || tipoCreativo === 'post') {
            // Para carrossel e post, procurar designer
            const designer = projetoEspecialistas.find(pe => pe.especialidade === 'design');
            responsavelId = designer?.especialista_id || null;
          }
        }
        
        return {
          ...post,
          data_postagem: dataPostagem,
          tipo_criativo: tipoCreativo,
          anexo_url: null, // Geração de imagem será implementada separadamente
          id: `temp-${Date.now()}-${index}`,
          status: 'temporario' as const,
          hashtags: Array.isArray(post.hashtags) ? post.hashtags : [],
          especificacoes_tecnicas: post.especificacoes_tecnicas || {},
          // Garantir que headline e conteudo_completo estejam sempre presentes
          headline: post.headline || post.titulo,
          conteudo_completo: post.conteudo_completo || post.legenda || '',
          responsavel_id: responsavelId
        };
      });

      // Sobrescrever posts anteriores completamente
      setPostsGerados(postsComCronograma);
      setPreviewPosts(postsComCronograma);
      setShowPreviewModal(true);

      toast.success(`${postsData.length} posts gerados com conteúdo completo!`);

    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      toast.error('Erro ao gerar conteúdo. Tente novamente.');
    } finally {
      setGerando(false);
    }
  };

  const salvarPostsCalendario = async (novosPost: any[]) => {
    try {
      console.log('🔄 Iniciando salvamento de posts:', novosPost);
      console.log('📊 Quantidade de posts:', novosPost.length);
      console.log('📊 Limite de posts da assinatura:', clienteAssinatura?.posts_mensais || "não definido");
      
      // Validação informativa de quantidade de posts
      if (clienteAssinatura?.posts_mensais && novosPost.length !== clienteAssinatura.posts_mensais) {
        console.warn(`⚠️ Quantidade divergente: ${novosPost.length} posts gerados, esperado ${clienteAssinatura.posts_mensais}`);
        toast(`Sistema gerou ${novosPost.length} posts. Seu plano permite ${clienteAssinatura.posts_mensais} posts mensais.`);
      }
      
      // Deletar posts existentes do mês atual
      const { error: deleteError } = await supabase
        .from('posts_planejamento')
        .delete()
        .eq('planejamento_id', planejamento.id)
        .gte('data_postagem', `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`)
        .lt('data_postagem', `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 2).padStart(2, '0')}-01`);

      if (deleteError) {
        console.error('❌ Erro ao deletar posts existentes:', deleteError);
        throw deleteError;
      }
      console.log('✅ Posts existentes removidos');

          // Inserir novos posts
          const postsParaInserir = novosPost.map(post => {
            // Converter valores para compatibilidade com constraints do banco
            let formatoPostagem = post.formato_postagem;
            if (formatoPostagem === 'stories') {
              formatoPostagem = 'story'; // Converter para o valor aceito pela constraint
            }
            
            // Validar e converter tipo_criativo para constraint do banco
            let tipoCriativo = post.tipo_criativo;
            // Converter video para stories no banco de dados (para compatibilidade)
            if (tipoCriativo === 'video') {
              tipoCriativo = 'stories';
            }
            const tiposPermitidos = ['post', 'carrossel', 'stories'];
            if (!tiposPermitidos.includes(tipoCriativo)) {
              console.warn(`⚠️ tipo_criativo "${tipoCriativo}" não permitido, usando "post" como fallback`);
              tipoCriativo = 'post';
            }
            
            return {
              planejamento_id: planejamento.id,
              titulo: post.titulo,
              legenda: post.legenda || '',
              headline: post.headline || '', // 🔥 INCLUIR headline
              conteudo_completo: post.conteudo_completo || '', // 🔥 INCLUIR conteudo_completo
              objetivo_postagem: post.objetivo_postagem,
              tipo_criativo: tipoCriativo,
              formato_postagem: formatoPostagem,
              componente_hesec: post.componente_hesec || '',
              persona_alvo: post.persona_alvo || '',
              call_to_action: post.call_to_action || '',
              hashtags: post.hashtags || [],
              contexto_estrategico: post.contexto_estrategico || '',
              data_postagem: post.data_postagem,
              anexo_url: post.anexo_url || null  // 🔥 INCLUIR anexo_url
            };
          });

      console.log('📝 Posts formatados para inserção:', JSON.stringify(postsParaInserir, null, 2));

      const { data, error } = await supabase
        .from('posts_planejamento')
        .insert(postsParaInserir)
        .select();

      if (error) {
        console.error('❌ Erro na inserção:', error);
        throw error;
      }

      console.log('✅ Posts inseridos com sucesso:', data);

      // NOVO: Criar tarefas automáticas para cada post
      console.log('🔄 Criando tarefas automáticas...');
      console.log('📊 projetoId disponível:', projetoId);
      console.log('📊 Posts para processar:', data?.length || 0);
      const tarefasCriadas = [];

      for (const post of data) {
        try {
          console.log(`🔍 Processando post: ${post.titulo} - Tipo: ${post.tipo_criativo}`);
          
          // Determinar especialidade baseada no tipo criativo
          let especialidade: 'design' | 'videomaker' | 'filmmaker' | 'gerente_redes_sociais' | null = null;
          if (post.tipo_criativo === 'video' || post.tipo_criativo === 'stories') {
            especialidade = 'videomaker';
          } else if (post.tipo_criativo === 'post' || post.tipo_criativo === 'carrossel') {
            especialidade = 'design';
          }

          console.log(`🎯 Especialidade determinada: ${especialidade}`);

          if (especialidade) {
            console.log(`🔍 Buscando especialista para: ${especialidade}`);
            const especialistaId = await buscarEspecialistaPorEspecialidade(especialidade);
            console.log(`🔍 Especialista encontrado: ${especialistaId}`);
            
            if (especialistaId) {
              console.log(`🔄 Criando tarefa para especialista ${especialistaId}`);
              const tarefaCriada = await criarTarefaAutomatica(post, especialistaId, projetoId);
              if (tarefaCriada) {
                tarefasCriadas.push(tarefaCriada);
                console.log(`✅ Tarefa criada para ${post.titulo} - ${especialidade} - ID: ${tarefaCriada.id}`);
              } else {
                console.error(`❌ Falha ao criar tarefa para ${post.titulo}`);
              }
            } else {
              console.warn(`⚠️ Especialista não encontrado para: ${especialidade}`);
            }
          } else {
            console.warn(`⚠️ Especialidade não definida para tipo_criativo: ${post.tipo_criativo}`);
          }
        } catch (error) {
          console.error(`❌ Erro ao processar post ${post.titulo}:`, error);
        }
      }

      console.log(`🎯 Total de tarefas criadas: ${tarefasCriadas.length}`);

      // Atualizar estado local com os novos posts
      const updatedPosts = [...posts.filter(p => !novosPost.find(np => np.data_postagem === p.data_postagem)), ...data];
      setPosts(updatedPosts);
      console.log('🔄 Estado local atualizado com', updatedPosts.length, 'posts');
      
      if (tarefasCriadas.length > 0) {
        toast.success(`${data.length} posts salvos + ${tarefasCriadas.length} tarefas criadas automaticamente!`);
      } else {
        toast.success(`${data.length} posts salvos no calendário!`);
      }
    } catch (error) {
      console.error('💥 Erro crítico ao salvar posts:', error);
      toast.error('Erro ao salvar posts no calendário');
      throw error; // Re-throw para que a função que chama possa lidar com o erro
    }
  };

  const handleApproveIndividualPost = async (post: any, index: number) => {
    console.log('🚀 handleApproveIndividualPost chamada para post:', post.titulo);
    try {
      // Salvar apenas este post específico
      await salvarPostsCalendario([post]);
      toast.success(`Post "${post.titulo}" aprovado e salvo com sucesso!`);
      console.log('✅ Post individual salvo com sucesso');
    } catch (error) {
      console.error('💥 Erro ao aprovar post individual:', error);
      toast.error(`Erro ao aprovar post "${post.titulo}"`);
      throw error;
    }
  };

  const handleApproveAllPosts = async () => {
    console.log('🚀 handleApproveAllPosts chamada para todos os posts temporários');
    try {
      if (postsGerados.length === 0) {
        toast.warning('Nenhum post para aprovar');
        return;
      }

      // Filtrar apenas posts temporários
      const postsTemporariosParaAprovar = postsGerados.filter(post => post.status === 'temporario');
      
      if (postsTemporariosParaAprovar.length === 0) {
        toast.warning('Nenhum post temporário para aprovar');
        return;
      }

      await salvarPostsCalendario(postsTemporariosParaAprovar);
      toast.success(`${postsTemporariosParaAprovar.length} posts aprovados e salvos automaticamente!`);
      console.log('✅ Todos os posts aprovados com sucesso');
    } catch (error) {
      console.error('💥 Erro ao aprovar todos os posts:', error);
      toast.error('Erro ao aprovar todos os posts');
      throw error;
    }
  };

  const handlePreviewSave = async (postsEditados: any[]) => {
    console.log('🚀 handlePreviewSave chamada com:', postsEditados);
    setSalvando(true);
    try {
      console.log('📤 Enviando posts para salvarPostsCalendario...');
      await salvarPostsCalendario(postsEditados);
      console.log('✅ Salvamento concluído, atualizando estados...');
      setPostsGerados(postsEditados.map(post => ({ ...post, status: 'salvo' as const })));
      setShowPreviewModal(false);
      setPreviewPosts([]);
      console.log('🎉 Modal fechado e estados limpos');
      toast.success('Calendário editorial salvo com sucesso!');
    } catch (error) {
      console.error('💥 Erro em handlePreviewSave:', error);
      toast.error('Erro ao salvar posts no calendário');
    } finally {
      setSalvando(false);
      console.log('🔄 Estado de salvando resetado');
    }
  };

  const handlePreviewCancel = () => {
    console.log('❌ Preview cancelado');
    setShowPreviewModal(false);
    setPreviewPosts([]);
    toast.info('Geração de conteúdo cancelada');
  };

  // Estado para controlar se está aprovando/salvando post
  const [aprovandoPost, setAprovandoPost] = useState<string | null>(null);

  // Função para aprovar um post individual e salvar automaticamente
  const aprovarPost = async (postId: string) => {
    const post = postsGerados.find(p => p.id === postId);
    if (!post) return;

    try {
      setAprovandoPost(postId);
      
      // Mover post para tabela principal
      const { error } = await supabase
        .from('posts_planejamento')
        .insert({
          planejamento_id: planejamento.id,
          titulo: post.titulo,
          legenda: post.legenda,
          objetivo_postagem: post.objetivo_postagem,
          tipo_criativo: post.tipo_criativo,
          formato_postagem: post.formato_postagem,
          componente_hesec: post.componente_hesec,
          persona_alvo: post.persona_alvo,
          call_to_action: post.call_to_action,
          hashtags: post.hashtags,
          contexto_estrategico: post.contexto_estrategico,
          data_postagem: post.data_postagem,
          anexo_url: post.anexo_url,
          responsavel_id: post.responsavel_id,
          // Novos campos para conteúdo diferenciado
          headline: post.headline,
          conteudo_completo: post.conteudo_completo
        });

      if (error) throw error;

      // Remover da tabela temporária
      if (post.id) {
        await supabase
          .from('posts_gerados_temp')
          .delete()
          .eq('id', post.id);
      }

      // Atualizar estado local
      setPostsGerados(prev => prev.filter(p => p.id !== postId));
      
      // 🔒 SECURITY FIX: Atualizar sessionStorage
      const updatedTempPosts = postsGerados.filter(p => p.id !== postId);
      sessionStorage.setItem(`posts_temp_${planejamento.id}`, JSON.stringify(updatedTempPosts));
      
      // Recarregar posts salvos usando setPosts (sem verificações aqui pois já foi salvo no DB)
      // setPosts será atualizado automaticamente quando o componente pai recarregar
      // Posts serão recarregados pelo componente pai quando necessário
      
      toast.success("Post aprovado e salvo automaticamente!");
    } catch (error) {
      console.error('Erro ao aprovar post:', error);
      toast.error("Erro ao aprovar post");
    } finally {
      setAprovandoPost(null);
    }
  };

  const salvarPostsGerados = async () => {
    const postsTemporarios = postsGerados.filter(post => post.status === 'temporario');
    
    if (postsTemporarios.length === 0) {
      toast.error('Nenhum post temporário para salvar');
      return;
    }

    setSalvandoPostsGerados(true);
    try {
      await salvarPostsCalendario(postsTemporarios);
      
      // Marcar posts como salvos em vez de limpar
      const postsAtualizadosLocal = postsGerados.map(post => 
        post.status === 'temporario' 
          ? { ...post, status: 'aprovado' as const, data_salvamento: new Date().toISOString() }
          : post
      );
      setPostsGerados(postsAtualizadosLocal);
      
      // Recarregar posts do banco para sincronizar
      const mesAtual = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      const { data: postsDoBanco } = await supabase
        .from('posts_planejamento')
        .select('*')
        .eq('planejamento_id', planejamento.id)
        .like('data_postagem', `${mesAtual}%`);

      if (postsDoBanco) {
        setPosts(postsDoBanco);
      }

      toast.success(`${postsTemporarios.length} posts salvos com sucesso!`, {
        description: "Os posts foram adicionados ao planejamento e permanecem visíveis para acompanhamento.",
        duration: 5000,
      });
    } catch (error) {
      console.error('Erro ao salvar posts gerados:', error);
      toast.error('Erro ao salvar posts');
    } finally {
      setSalvandoPostsGerados(false);
    }
  };

  const atualizarDataPost = async (postId: string, novaData: string) => {
    try {
      setAtualizandoPost(postId);
      
      const { error } = await supabase
        .from('posts_planejamento')
        .update({ data_postagem: novaData })
        .eq('id', postId);

      if (error) throw error;

      // Atualizar estado local
      const updatedPosts = posts.map(post => 
        post.id === postId ? { ...post, data_postagem: novaData } : post
      );
      setPosts(updatedPosts);

      // Atualizar posts gerados também se existir
      if (postsGerados.length > 0) {
        const updatedPostsGerados = postsGerados.map(post => 
          post.id === postId ? { ...post, data_postagem: novaData } : post
        );
        setPostsGerados(updatedPostsGerados);
      }

      toast.success('Data do post atualizada!');
    } catch (error) {
      console.error('Erro ao atualizar post:', error);
      toast.error('Erro ao atualizar data do post');
    } finally {
      setAtualizandoPost(null);
    }
  };

  // Função para visualizar post individual
  const handleViewPost = (post: any) => {
    setSelectedPostForView(post);
    setShowPostViewModal(true);
  };

  const handleClosePostView = () => {
    setShowPostViewModal(false);
    setSelectedPostForView(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const postId = event.active.id as string;
    const post = [...posts, ...postsGerados].find(p => p.id === postId);
    console.log('Drag started:', { postId, post: post?.titulo });
    setDraggedPost(post);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedPost(null);

    console.log('Drag ended:', { 
      activeId: active.id, 
      overId: over?.id,
      activePost: [...posts, ...postsGerados].find(p => p.id === active.id)?.titulo
    });

    if (!over) {
      console.log('No drop target found');
      toast.error('Não foi possível mover o post. Tente novamente.');
      return;
    }

    const postId = active.id as string;
    const newDateStr = over.id as string;

    console.log('Attempting to move post:', postId, 'to date:', newDateStr);

    // Validar se é uma data válida
    if (!newDateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      console.log('Invalid date format:', newDateStr);
      toast.error('Data inválida para mover o post.');
      return;
    }

    // Verificar se é uma data válida
    if (!newDateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      console.log('Invalid date format:', newDateStr);
      return;
    }

    // Encontrar o post nos arrays
    const post = [...posts, ...postsGerados].find(p => p.id === postId);
    if (!post) {
      console.log('Post not found:', postId);
      return;
    }
    
    if (post.data_postagem === newDateStr) {
      console.log('Post already on this date');
      return;
    }

    console.log('Moving post from', post.data_postagem, 'to', newDateStr);
    atualizarDataPost(postId, newDateStr);
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
    
    // Combinar posts do banco com posts gerados localmente
    const postsFromDb = posts.filter(post => post.data_postagem === dateStr);
    const postsFromGenerated = postsGerados.filter(post => {
      const postDate = new Date(post.data_postagem);
      const postDateStr = `${postDate.getFullYear()}-${String(postDate.getMonth() + 1).padStart(2, '0')}-${String(postDate.getDate()).padStart(2, '0')}`;
      return postDateStr === dateStr;
    });
    
    // Combinar e remover duplicatas baseado no título
    const allPosts = [...postsFromDb, ...postsFromGenerated];
    const uniquePosts = allPosts.filter((post, index, self) => 
      index === self.findIndex(p => p.titulo === post.titulo)
    );
    
    return uniquePosts;
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

  const gerarSugestoesDatasComIA = async () => {
    setGerandoConteudo(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content-with-ai', {
        body: {
          prompt: `Com base no segmento "${dadosOnboarding?.segmento_atuacao || 'não especificado'}" e produtos/serviços "${dadosOnboarding?.produtos_servicos || 'não especificado'}", sugira 8-10 datas comemorativas relevantes para campanhas de marketing. Retorne apenas uma lista JSON com formato: [{"nome": "Nome da Data", "data": "DD/MM", "relevancia": "motivo da relevância"}]`,
          client_id: clienteId,
          context: 'datas_comemorativas'
        }
      });

      if (error) throw error;
      
      if (data?.content) {
        try {
          const sugestoes = JSON.parse(data.content);
          if (Array.isArray(sugestoes)) {
            toast.success(`${sugestoes.length} datas comemorativas sugeridas pela IA`);
          }
        } catch (parseError) {
          console.error('Erro ao parsear sugestões:', parseError);
          toast.info('Sugestões geradas, verifique o conteúdo');
        }
      }
    } catch (error) {
      console.error('Erro ao gerar sugestões:', error);
      toast.error('Erro ao gerar sugestões de datas comemorativas');
    } finally {
      setGerandoConteudo(false);
    }
  };

  const gerarEstrategiaTrafegoPago = async () => {
    setGerandoConteudo(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content-with-ai', {
        body: {
          prompt: `Com base no perfil do cliente (segmento: "${dadosOnboarding?.segmento_atuacao || 'não especificado'}", produtos/serviços: "${dadosOnboarding?.produtos_servicos || 'não especificado'}", público-alvo: "${dadosOnboarding?.publico_alvo || 'não especificado'}") e assinatura que inclui ${clienteAssinatura?.anuncios_facebook ? 'Facebook Ads' : ''} ${clienteAssinatura?.anuncios_google ? 'Google Ads' : ''}, crie uma estratégia completa de tráfego pago incluindo: 1) Objetivos recomendados, 2) Segmentação de público, 3) Tipos de campanha, 4) Orçamento sugerido, 5) KPIs para acompanhar`,
          client_id: clienteId,
          context: 'estrategia_trafego_pago'
        }
      });

      if (error) throw error;
      
      if (data?.content) {
        toast.success('Estratégia de tráfego pago gerada com sucesso');
      }
    } catch (error) {
      console.error('Erro ao gerar estratégia:', error);
      toast.error('Erro ao gerar estratégia de tráfego pago');
    } finally {
      setGerandoConteudo(false);
    }
  };

  const toggleDataComemorativa = (data: string) => {
    setDatasComemorativas(prev => 
      prev.includes(data) 
        ? prev.filter(d => d !== data)
        : [...prev, data]
    );
  };

  const toggleObjetivoTrafego = (objetivo: string) => {
    setObjetivosTrafego(prev => 
      prev.includes(objetivo) 
        ? prev.filter(o => o !== objetivo)
        : [...prev, objetivo]
    );
  };

  const adicionarDataPersonalizada = (nome: string, data: string) => {
    if (nome && data) {
      setDatasPersonalizadas(prev => [...prev, { nome, data }]);
    }
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
        <TabsList className="grid w-full grid-cols-5">
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
            Editorial
          </TabsTrigger>
          <TabsTrigger value="datas-comemorativas" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Datas
          </TabsTrigger>
          <TabsTrigger value="trafego-pago" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Tráfego
          </TabsTrigger>
        </TabsList>

        <TabsContent value="missao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Missão da Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Modelo de IA</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={selectedContentModel === 'gemini' ? 'default' : 'outline'}
                    onClick={() => setSelectedContentModel('gemini')}
                    size="sm"
                    className="flex-1"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Lovable AI
                  </Button>
                  <Button
                    type="button"
                    variant={selectedContentModel === 'gpt4' ? 'default' : 'outline'}
                    onClick={() => setSelectedContentModel('gpt4')}
                    size="sm"
                    className="flex-1"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    GPT-4.1
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedContentModel === 'gemini' 
                    ? '⚡ Mais rápido e econômico (padrão)'
                    : '🎯 Mais criativo (requer API key)'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={gerarMissaoComIA}
                  disabled={gerandoMissao}
                  size="sm"
                  variant="outline"
                  className="gap-2"
                >
                  {gerandoMissao ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Gerar Missão
                </Button>
              </div>
              <Textarea
                placeholder="Descreva a missão da empresa..."
                value={conteudo.missao || ''}
                onChange={(e) => setConteudo(prev => ({ ...prev, missao: e.target.value }))}
                rows={4}
                disabled={gerandoMissao}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posicionamento" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Posicionamento da Marca</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="posicionamento">Posicionamento da Marca</Label>
                  <div className="flex gap-2">
                    <Button 
                      onClick={gerarPosicionamentoComIA}
                      disabled={gerandoPosicionamento}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      {gerandoPosicionamento ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Gerar com IA
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <Textarea
                  id="posicionamento"
                  placeholder="Descreva o posicionamento da marca ou use a IA para gerar automaticamente..."
                  value={conteudo.posicionamento || ''}
                  onChange={(e) => setConteudo(prev => ({ ...prev, posicionamento: e.target.value }))}
                  rows={6}
                  disabled={gerandoPosicionamento}
                />
                <p className="text-xs text-muted-foreground">
                  A IA irá gerar o posicionamento baseado nos dados de onboarding do cliente. Máximo 700 palavras.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Especialistas de Referência</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <CardTitle>Personas do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>3 Personas Estratégicas</Label>
                  <Button 
                    onClick={gerarPersonasComIA}
                    disabled={gerandoPersonas}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    {gerandoPersonas ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Gerar 3 Personas com IA
                      </>
                    )}
                  </Button>
                </div>

                {/* Exibir personas geradas */}
                {conteudo.persona && (() => {
                  try {
                    // Verificar se é JSON válido antes do parse
                    let personasData;
                    if (conteudo.persona.startsWith('{') || conteudo.persona.startsWith('[')) {
                      personasData = JSON.parse(conteudo.persona);
                    } else {
                      // Se não for JSON, tratar como texto simples
                      return (
                        <div className="mt-4 p-4 bg-muted rounded-lg">
                          <p className="text-sm whitespace-pre-wrap">{conteudo.persona}</p>
                        </div>
                      );
                    }
                    
                    if (personasData.personas && Array.isArray(personasData.personas)) {
                      return (
                        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                          {personasData.personas.map((persona: any, index: number) => (
                            <Card key={index} className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-sm font-semibold text-primary">
                                      {index + 1}
                                    </span>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm">{persona.nome}</h4>
                                    <p className="text-xs text-muted-foreground">
                                      {persona.idade} • {persona.profissao}
                                    </p>
                                  </div>
                                </div>
                                
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {persona.resumo}
                                </p>
                                
                                <div className="space-y-2 text-xs">
                                  <div>
                                    <span className="font-medium text-red-600">Dores:</span>
                                    <p className="text-muted-foreground mt-1">
                                      {persona.dores?.join(', ') || 'Não definido'}
                                    </p>
                                  </div>
                                  
                                  <div>
                                    <span className="font-medium text-green-600">Motivações:</span>
                                    <p className="text-muted-foreground mt-1">
                                      {persona.motivacoes?.join(', ') || 'Não definido'}
                                    </p>
                                  </div>
                                  
                                  <div>
                                    <span className="font-medium text-blue-600">Canais:</span>
                                    <p className="text-muted-foreground mt-1">
                                      {persona.canais_preferidos?.join(', ') || 'Não definido'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      );
                    }
                  } catch (error) {
                    console.error('Erro ao parsear personas:', error);
                    // Exibir conteúdo como texto simples em caso de erro
                    return (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Conteúdo das personas (formato não JSON):
                        </p>
                        <p className="text-sm whitespace-pre-wrap mt-2">{conteudo.persona}</p>
                      </div>
                    );
                  }
                })()}

                {/* Fallback para edição manual */}
                <div className="space-y-2">
                  <Label htmlFor="persona-manual">Edição Manual (JSON ou Texto)</Label>
                  <Textarea
                    id="persona-manual"
                    placeholder="Cole aqui o JSON das personas ou descreva as personas manualmente..."
                    value={conteudo.persona || ''}
                    onChange={(e) => setConteudo(prev => ({ ...prev, persona: e.target.value }))}
                    rows={4}
                    disabled={gerandoPersonas}
                  />
                </div>
                
                <p className="text-xs text-muted-foreground">
                  A IA irá gerar 3 personas distintas baseadas no onboarding, objetivos, posicionamento e frameworks selecionados.
                </p>
              </div>
            </CardContent>
          </Card>

        </TabsContent>

        <TabsContent value="conteudo" className="space-y-4">
          {clienteAssinatura && (
            <Card>
              <CardHeader>
                <CardTitle>Plano de Assinatura</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary">{clienteAssinatura?.nome || 'Plano não definido'}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {clienteAssinatura?.posts_mensais || 0} posts/mês
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Reels: {clienteAssinatura?.reels_suporte ? 'Sim' : 'Não'}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Anúncios: {clienteAssinatura?.anuncios_facebook || clienteAssinatura?.anuncios_google ? 'Sim' : 'Não'}
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
              <div className="flex gap-2">
                <Button 
                  onClick={gerarConteudoEditorial}
                  disabled={gerando || !hasCompleteAnalysis()}
                  className="flex-1"
                >
                  {gerando ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Gerar Conteúdo Editorial Completo
                </Button>
                
              </div>
                
                {postsGerados.length > 0 && (
                  <div className="flex flex-col items-end gap-3 p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {postsGerados.filter(p => p.status === 'temporario').length} temporários, {postsGerados.filter(p => p.status === 'aprovado').length} aprovados
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => setPostsGerados([])}
                        disabled={salvandoPostsGerados}
                        className="border-destructive/20 text-destructive hover:bg-destructive/10"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Limpar Tudo
                      </Button>
                      
                      {postsGerados.filter(p => p.status === 'temporario').length > 0 && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              disabled={salvandoPostsGerados}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                            >
                              {salvandoPostsGerados ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Salvando...
                                </>
                              ) : (
                                <>
                                  <Save className="w-4 h-4 mr-2" />
                                  Salvar Posts no Calendário Editorial
                                </>
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar salvamento</AlertDialogTitle>
                              <AlertDialogDescription>
                                Você está prestes a salvar {postsGerados.filter(p => p.status === 'temporario').length} posts temporários no planejamento editorial. 
                                Os posts salvos permanecerão visíveis para acompanhamento do desenvolvimento.
                                Tem certeza que deseja continuar?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={salvarPostsGerados}
                                className="bg-emerald-600 hover:bg-emerald-700"
                              >
                                Sim, salvar posts pendentes
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                )}
              
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
                <CardTitle className="flex items-center justify-between">
                  <span>Posts Gerados</span>
                   <div className="flex gap-2">
                     <Button
                       variant={!visualizacaoCalendario && !visualizacaoLista ? "default" : "outline"}
                       size="sm"
                       onClick={() => {
                         setVisualizacaoTabela(true);
                         setVisualizacaoCalendario(false);
                         setVisualizacaoLista(false);
                       }}
                     >
                       Tabela
                     </Button>
                     <Button
                       variant={visualizacaoLista ? "default" : "outline"}
                       size="sm"
                       onClick={() => {
                         setVisualizacaoTabela(false);
                         setVisualizacaoCalendario(false);
                         setVisualizacaoLista(true);
                       }}
                     >
                       Lista
                     </Button>
                     <Button
                       variant={visualizacaoCalendario ? "default" : "outline"}
                       size="sm"
                       onClick={() => {
                         setVisualizacaoTabela(false);
                         setVisualizacaoCalendario(true);
                         setVisualizacaoLista(false);
                       }}
                     >
                       <Calendar className="h-4 w-4 mr-1" />
                       Calendário
                     </Button>
                   </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                 {visualizacaoCalendario ? (
                   <DndContext
                     collisionDetection={closestCenter}
                     onDragStart={handleDragStart}
                     onDragEnd={handleDragEnd}
                   >
                     <SortableContext 
                       items={[...posts, ...postsGerados].map(p => p.id)}
                     >
                       <div className="flex items-center justify-between mb-6">
                         <div className="flex items-center gap-3">
                           <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                             <ChevronLeft className="h-4 w-4" />
                           </Button>
                           <span className="text-lg font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                             {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                           </span>
                           <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                             <ChevronRight className="h-4 w-4" />
                           </Button>
                         </div>
                         <Button 
                           variant="outline" 
                           size="sm" 
                           onClick={() => setCalendarioExpanded(true)}
                           className="bg-primary/5 hover:bg-primary/10 border-primary/20"
                         >
                           <Calendar className="h-4 w-4 mr-1" />
                           Visualizar Completo
                         </Button>
                       </div>
                       
                       <div className="grid grid-cols-7 gap-1 mb-2 p-2 bg-muted/30 rounded-lg">
                         {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                           <div key={day} className="p-2 text-center text-xs font-bold text-muted-foreground uppercase tracking-wide">
                             {day}
                           </div>
                         ))}
                       </div>
                       <div className="grid grid-cols-7 gap-1 p-2 bg-background border rounded-xl shadow-sm">
                         {getDaysInMonth().map((day, index) => {
                           const dayPosts = day ? getPostsForDay(day) : [];
                           const dateStr = day ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
                           
                           return (
                             <DroppableDay
                               key={index}
                               day={day}
                               dateStr={dateStr}
                               dayPosts={dayPosts}
                               onPreviewPost={onPreviewPost}
                               getFormatIcon={getFormatIcon}
                               atualizandoPost={atualizandoPost}
                             />
                           );
                         })}
                       </div>
                     </SortableContext>
                     <DragOverlay>
                       {draggedPost ? (
                         <div className="flex items-center gap-2 p-2 rounded-lg border border-primary bg-primary/10 shadow-lg">
                           <span className="text-lg flex-shrink-0">{getFormatIcon(draggedPost.formato_postagem)}</span>
                           <span className="flex-1 truncate text-sm font-medium text-foreground" title={draggedPost.titulo}>
                             {draggedPost.titulo.length > 20 ? `${draggedPost.titulo.substring(0, 20)}...` : draggedPost.titulo}
                           </span>
                         </div>
                       ) : null}
                     </DragOverlay>
                   </DndContext>
                 ) : visualizacaoLista ? (
                   <ListaPostsView
                     posts={[...posts, ...postsGerados]}
                     onPreviewPost={onPreviewPost}
                   />
                 ) : (
                   <PostsContentView
                     planejamentoId={planejamento.id}
                     isTemp={true}
                   />
                 )}
              </CardContent>
            </Card>
          )}

            <CalendarioEditorial
            isOpen={calendarioExpanded}
            onClose={() => setCalendarioExpanded(false)}
            posts={posts}
            postsGerados={postsGerados}
            onPostClick={onPreviewPost}
            onPostsUpdate={(updatedPosts) => {
              setPosts(updatedPosts);
            }}
          />
        </TabsContent>

        <TabsContent value="datas-comemorativas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Datas Comemorativas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label>Datas Estratégicas para o Segmento</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Selecione datas comemorativas relevantes para o segmento do cliente
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { nome: "Dia da Mulher", data: "08/03" },
                      { nome: "Dia do Trabalhador", data: "01/05" },
                      { nome: "Dia das Mães", data: "2º dom/mai" },
                      { nome: "Dia dos Namorados", data: "12/06" },
                      { nome: "Festa Junina", data: "Jun" },
                      { nome: "Dia dos Pais", data: "2º dom/ago" },
                      { nome: "Dia do Cliente", data: "15/09" },
                      { nome: "Dia das Crianças", data: "12/10" },
                      { nome: "Black Friday", data: "Nov" },
                      { nome: "Natal", data: "25/12" },
                      { nome: "Ano Novo", data: "31/12" },
                      { nome: "Carnaval", data: "Fev/Mar" }
                    ].map((data) => (
                      <div key={data.nome} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                        <input 
                          type="checkbox" 
                          id={data.nome} 
                          className="rounded" 
                          checked={datasComemorativas.includes(data.nome)}
                          onChange={() => toggleDataComemorativa(data.nome)}
                        />
                        <div className="flex-1">
                          <label htmlFor={data.nome} className="text-sm font-medium cursor-pointer">
                            {data.nome}
                          </label>
                          <p className="text-xs text-muted-foreground">{data.data}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Datas Personalizadas</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Adicione datas específicas importantes para o cliente
                  </p>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input placeholder="Nome da data comemorativa" />
                      <Input type="date" />
                      <Button variant="outline" size="sm">
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <Button 
                    className="gap-2"
                    disabled={gerandoConteudo}
                    onClick={gerarSugestoesDatasComIA}
                  >
                    {gerandoConteudo ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Gerar Sugestões com IA
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    A IA analisará o segmento do cliente e sugerirá datas comemorativas relevantes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trafego-pago" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Estratégias de Tráfego Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {clienteAssinatura && (
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <h4 className="font-medium mb-2">Recursos Disponíveis na Assinatura</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={clienteAssinatura?.anuncios_facebook ? "default" : "secondary"}>
                      Facebook Ads: {clienteAssinatura?.anuncios_facebook ? "Incluído" : "Não incluído"}
                    </Badge>
                    <Badge variant={clienteAssinatura?.anuncios_google ? "default" : "secondary"}>
                      Google Ads: {clienteAssinatura?.anuncios_google ? "Incluído" : "Não incluído"}
                    </Badge>
                  </div>
                </div>
              )}

              <div className="grid gap-4">
                <div>
                  <Label>Objetivos de Campanha</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Selecione os principais objetivos para as campanhas de tráfego pago
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { nome: "Reconhecimento de Marca", descricao: "Aumentar visibilidade e awareness" },
                      { nome: "Tráfego para Website", descricao: "Direcionar visitantes qualificados" },
                      { nome: "Geração de Leads", descricao: "Capturar contatos interessados" },
                      { nome: "Conversões de Venda", descricao: "Aumentar vendas diretas" },
                      { nome: "Engajamento", descricao: "Interações nas redes sociais" },
                      { nome: "Remarketing", descricao: "Reconectar com visitantes anteriores" }
                    ].map((objetivo) => (
                      <div key={objetivo.nome} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                        <input 
                          type="checkbox" 
                          id={objetivo.nome} 
                          className="rounded mt-1" 
                          checked={objetivosTrafego.includes(objetivo.nome)}
                          onChange={() => toggleObjetivoTrafego(objetivo.nome)}
                        />
                        <div className="flex-1">
                          <label htmlFor={objetivo.nome} className="text-sm font-medium cursor-pointer">
                            {objetivo.nome}
                          </label>
                          <p className="text-xs text-muted-foreground">{objetivo.descricao}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Públicos-Alvo</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Configure os públicos para segmentação das campanhas
                  </p>
                  <Textarea 
                    placeholder="Descreva os públicos-alvo prioritários para as campanhas (idade, localização, interesses, comportamentos...)"
                    rows={4}
                    value={publicoAlvo}
                    onChange={(e) => setPublicoAlvo(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Orçamento Sugerido</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Investimento mensal recomendado para tráfego pago
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { valor: "R$ 500", tipo: "Básico" },
                      { valor: "R$ 1.000", tipo: "Intermediário" },
                      { valor: "R$ 2.500", tipo: "Avançado" },
                      { valor: "Custom", tipo: "Personalizado" }
                    ].map((orcamento) => (
                      <Button 
                        key={orcamento.tipo}
                        variant={orcamentoSugerido === orcamento.valor ? "default" : "outline"} 
                        className="h-auto py-3 flex flex-col gap-1"
                        onClick={() => setOrcamentoSugerido(orcamento.valor)}
                      >
                        <span className="font-medium">{orcamento.valor}</span>
                        <span className="text-xs text-muted-foreground">{orcamento.tipo}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Button 
                    className="gap-2"
                    disabled={gerandoConteudo}
                    onClick={gerarEstrategiaTrafegoPago}
                  >
                    {gerandoConteudo ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Gerar Estratégia com IA
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    A IA criará uma estratégia personalizada baseada no perfil e objetivos do cliente
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Preview dos Posts Gerados */}
      <PostPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        posts={previewPosts}
        onSave={handlePreviewSave}
        onCancel={handlePreviewCancel}
        onApprovePost={handleApproveIndividualPost}
        onApproveAll={handleApproveAllPosts}
      />

      {/* Modal de Visualização Individual do Post */}
      <PostViewModal
        isOpen={showPostViewModal}
        onClose={handleClosePostView}
        post={selectedPostForView}
        onApprove={selectedPostForView?.status === 'temporario' ? (post) => handleApproveIndividualPost(post, 0) : undefined}
        isApproving={aprovandoPost === selectedPostForView?.id}
      />
    </div>
  );
};

export default PlanoEditorial;