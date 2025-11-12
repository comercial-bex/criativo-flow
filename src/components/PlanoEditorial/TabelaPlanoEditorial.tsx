import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Sparkles, FileText, Loader2, GripVertical, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast-compat";
import { LinhaPost } from "./LinhaPost";
import { DialogAnaliseIA } from "./DialogAnaliseIA";
import { FiltrosPlanoEditorial } from "./FiltrosPlanoEditorial";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import type { TipoTarefa } from '@/types/tarefa';

interface TabelaPlanoEditorialProps {
  planejamentoId: string;
  clienteId: string;
  projetoId: string;
  posts: any[];
  onPostsChange: (posts: any[]) => void;
  currentDate: Date;
  onGerarConteudoIA?: () => void;
  hasCompleteAnalysis?: () => boolean;
  gerando?: boolean;
}

export const TabelaPlanoEditorial: React.FC<TabelaPlanoEditorialProps> = ({
  planejamentoId,
  clienteId,
  projetoId,
  posts,
  onPostsChange,
  currentDate,
  onGerarConteudoIA,
  hasCompleteAnalysis,
  gerando = false,
}) => {
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [novoPost, setNovoPost] = useState<any>(null);
  const [responsaveis, setResponsaveis] = useState<any[]>([]);
  const [analisando, setAnalisando] = useState(false);
  const [dialogAnaliseOpen, setDialogAnaliseOpen] = useState(false);
  const [analiseIA, setAnaliseIA] = useState("");
  const [clienteNome, setClienteNome] = useState("");
  const [exportando, setExportando] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Estados de filtros
  const [formatosFiltrados, setFormatosFiltrados] = useState<string[]>([]);
  const [objetivosFiltrados, setObjetivosFiltrados] = useState<string[]>([]);
  const [statusFiltrados, setStatusFiltrados] = useState<string[]>([]);

  // Configurar sensores para drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        delay: 200,
        tolerance: 5,
      },
    })
  );

  useEffect(() => {
    if (clienteId) {
      fetchResponsaveis();
      fetchClienteNome();
    }
  }, [clienteId]);

  const fetchResponsaveis = async () => {
    try {
      const { data, error } = await supabase
        .from("pessoas")
        .select("id, nome");

      if (error) throw error;
      setResponsaveis(data || []);
    } catch (error) {
      console.error("Erro ao buscar responsáveis:", error);
    }
  };

  const fetchClienteNome = async () => {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("nome")
        .eq("id", clienteId)
        .single();

      if (error) throw error;
      setClienteNome(data?.nome || "Cliente");
    } catch (error) {
      console.error("Erro ao buscar nome do cliente:", error);
    }
  };

  // Calcular próxima data disponível
  const getProximaDataDisponivel = () => {
    const datasExistentes = posts
      .map(p => p.data_postagem)
      .filter(Boolean)
      .map(d => new Date(d).getDate());
    
    const mesAtual = currentDate.getMonth();
    const anoAtual = currentDate.getFullYear();
    
    // Sugerir próximo dia que não tem post
    for (let dia = 1; dia <= 31; dia++) {
      if (!datasExistentes.includes(dia)) {
        const dataProxima = new Date(anoAtual, mesAtual, dia);
        // Verificar se é data válida (não passa do mês)
        if (dataProxima.getMonth() === mesAtual) {
          return dataProxima;
        }
      }
    }
    
    return new Date(anoAtual, mesAtual, 1); // Fallback: primeiro dia do mês
  };

  const adicionarNovaLinha = () => {
    setShowCreateModal(true);
  };

  // Mapeamento de campos: Tarefa → Post
  const mapearTarefaParaPost = (tarefa: any) => {
    const tipoParaFormato: Record<string, string> = {
      'reels_instagram': 'reels',
      'stories_interativo': 'story',
      'criativo_card': 'card',
      'criativo_carrossel': 'carrossel',
      'criativo_vt': 'motion',
      'feed_post': 'post',
      'criativo_cartela': 'post'
    };

    const statusParaPost: Record<string, string> = {
      'backlog': 'a_fazer',
      'em_producao': 'em_producao',
      'aguardando_aprovacao': 'em_producao',
      'aprovado': 'pronto',
      'publicado': 'publicado',
      'temporario': 'temporario'
    };

    return {
      planejamento_id: planejamentoId,
      titulo: tarefa.titulo,
      descricao: tarefa.descricao || '',
      formato_postagem: tipoParaFormato[tarefa.tipo] || 'post',
      tipo_criativo: 'imagem',
      
      // NOVO: Mapear tipo_conteudo do briefing
      tipo_conteudo: tarefa.kpis?.briefing?.tipo_conteudo || 'informar',
      
      // MANTER: objetivo_postagem como meta/finalidade (texto livre)
      objetivo_postagem: tarefa.kpis?.briefing?.objetivo_postagem || '',
      
      // NOVO: texto_estruturado será gerado APÓS criação
      texto_estruturado: '',
      
      data_postagem: tarefa.prazo_executor || new Date().toISOString(),
      responsavel_id: tarefa.executor_id,
      copy_caption: '',
      persona_alvo: tarefa.kpis?.briefing?.publico_alvo || '',
      status_post: (statusParaPost[tarefa.status] || 'a_fazer') as 'a_fazer' | 'em_producao' | 'pronto' | 'publicado' | 'temporario',
      tarefa_vinculada_id: tarefa.id,
      arquivo_visual_url: tarefa.kpis?.referencias?.visuais?.[0] || null,
      hashtags: tarefa.kpis?.briefing?.hashtags || [],
      call_to_action: tarefa.kpis?.briefing?.call_to_action || '',
      contexto_estrategico: tarefa.kpis?.briefing?.contexto_estrategico || '',
    };
  };

  const handleTaskCreated = async (tarefa: any) => {
    try {
      const postData = mapearTarefaParaPost(tarefa);

      // Criar post vinculado à tarefa
      const { data: novoPost, error } = await supabase
        .from('posts_planejamento')
        .insert([postData])
        .select()
        .single();

      if (error) throw error;

      // Atualizar lista de posts
      onPostsChange([...posts, novoPost]);
      
      toast.success('Post criado a partir da tarefa!');
      setShowCreateModal(false);

      return novoPost;
    } catch (error) {
      console.error('Erro ao criar post a partir da tarefa:', error);
      toast.error('Erro ao criar post');
      throw error;
    }
  };

  const salvarPost = async (post: any) => {
    try {
      if (!post.data_postagem) {
        toast.error("Data é obrigatória");
        return;
      }
      if (!post.formato_postagem) {
        toast.error("Formato é obrigatório");
        return;
      }
      if (!post.objetivo_postagem) {
        toast.error("Objetivo é obrigatório");
        return;
      }

      let postSalvo;

      if (post.isNew || post.id?.startsWith("temp-")) {
        const { data, error } = await supabase
          .from("posts_planejamento")
          .insert({
            planejamento_id: planejamentoId,
            titulo: post.titulo || `Post ${posts.length + 1}`,
            data_postagem: post.data_postagem,
            formato_postagem: post.formato_postagem,
            objetivo_postagem: post.objetivo_postagem,
            legenda: post.legenda,
            tipo_criativo: post.tipo_criativo || "imagem",
            responsavel_id: post.responsavel_id || null,
            contexto_estrategico: post.contexto_estrategico,
            hashtags: post.hashtags || [],
          })
          .select()
          .single();

        if (error) throw error;
        postSalvo = data;

        if (post.responsavel_id) {
          await criarTarefa(postSalvo);
        }

        onPostsChange([...posts.filter((p) => p.id !== post.id), postSalvo]);
        setNovoPost(null);
      } else {
        const { data, error } = await supabase
          .from("posts_planejamento")
          .update({
            titulo: post.titulo,
            data_postagem: post.data_postagem,
            formato_postagem: post.formato_postagem,
            objetivo_postagem: post.objetivo_postagem,
            legenda: post.legenda,
            tipo_criativo: post.tipo_criativo,
            responsavel_id: post.responsavel_id,
            contexto_estrategico: post.contexto_estrategico,
            hashtags: post.hashtags,
          })
          .eq("id", post.id)
          .select()
          .single();

        if (error) throw error;
        postSalvo = data;

        onPostsChange(posts.map((p) => (p.id === post.id ? postSalvo : p)));
      }

      toast.success("Post salvo com sucesso!");
    } catch (error: any) {
      console.error("Erro ao salvar post:", error);
      toast.error("Erro ao salvar post");
    }
  };

  const criarTarefa = async (post: any) => {
    try {
      const { data: tarefa, error } = await supabase
        .from("tarefa")
        .insert({
          titulo: `Criar: ${post.titulo}`,
          descricao: `Criação de ${post.formato_postagem} para ${format(
            new Date(post.data_postagem),
            "dd/MM/yyyy"
          )}`,
          responsavel_id: post.responsavel_id,
          status: "backlog",
          prioridade: "media",
        })
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from("posts_planejamento")
        .update({ tarefa_criacao_id: tarefa.id })
        .eq("id", post.id);

      console.log("Tarefa criada e vinculada:", tarefa.id);
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
    }
  };

  const gerarLegendaComIA = async (post: any): Promise<string> => {
    try {
      const prompt = `Você é um especialista em copywriting para redes sociais.

Crie uma legenda criativa e envolvente para o seguinte post:
- Formato: ${post.formato_postagem}
- Objetivo: ${post.objetivo_postagem}
- Tom de voz: profissional e humanizado

A legenda deve:
- Ter entre 100-150 caracteres
- Incluir emojis relevantes
- Ter um CTA (call-to-action) claro
- Incluir 3-5 hashtags estratégicas no final

Retorne apenas a legenda pronta para uso.`;

      const { data, error } = await supabase.functions.invoke("generate-content-with-ai", {
        body: {
          prompt,
          type: "legenda",
          model: "gemini",
        },
      });

      if (error) throw error;

      return data.generatedText || data.content || "";
    } catch (error) {
      console.error("Erro ao gerar legenda:", error);
      toast.error("Erro ao gerar legenda com IA");
      return "";
    }
  };

  const analisarComIA = async () => {
    try {
      setAnalisando(true);

      const distribuicaoObjetivos = posts.reduce((acc: Record<string, number>, post) => {
        acc[post.objetivo_postagem] = (acc[post.objetivo_postagem] || 0) + 1;
        return acc;
      }, {});

      const distribuicaoFormatos = posts.reduce((acc: Record<string, number>, post) => {
        acc[post.formato_postagem] = (acc[post.formato_postagem] || 0) + 1;
        return acc;
      }, {});

      const prompt = `Analise o seguinte plano editorial e forneça insights estratégicos:

📊 Dados do Plano:
- Total de posts: ${posts.length}
- Distribuição de objetivos: ${JSON.stringify(distribuicaoObjetivos)}
- Distribuição de formatos: ${JSON.stringify(distribuicaoFormatos)}
- Cobertura mensal: ${((posts.length / 30) * 100).toFixed(1)}%

Forneça:
1. Análise de equilíbrio entre objetivos (está balanceado?)
2. Recomendações de ajustes (o que melhorar?)
3. Pontos de atenção (o que evitar?)
4. Sugestões de frequência ideal de postagem

Seja objetivo e prático.`;

      const { data, error } = await supabase.functions.invoke("generate-content-with-ai", {
        body: {
          prompt,
          type: "post",
          model: "gemini",
        },
      });

      if (error) throw error;

      setAnaliseIA(data.generatedText || data.content || "");
      setDialogAnaliseOpen(true);
    } catch (error) {
      console.error("Erro ao analisar plano:", error);
      toast.error("Erro ao analisar com IA");
    } finally {
      setAnalisando(false);
    }
  };

  const exportarPDF = async () => {
    try {
      setExportando(true);

      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.setTextColor(0, 107, 255);
      doc.text("PLANO EDITORIAL MENSAL", 105, 20, { align: "center" });

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Cliente: ${clienteNome}`, 20, 35);
      doc.text(`Período: ${format(currentDate, "MMMM yyyy", { locale: ptBR })}`, 20, 42);
      doc.text(`Total de Posts: ${posts.length}`, 20, 49);

      autoTable(doc, {
        startY: 60,
        head: [["#", "Data", "Criativo", "Objetivo", "Legenda", "Responsável"]],
        body: posts.map((post, index) => [
          String(index + 1).padStart(2, "0"),
          format(new Date(post.data_postagem), "dd/MM", { locale: ptBR }),
          post.formato_postagem,
          post.objetivo_postagem,
          post.legenda?.substring(0, 50) + "..." || "-",
          responsaveis.find((p) => p.id === post.responsavel_id)?.nome || "-",
        ]),
        headStyles: { fillColor: [0, 107, 255] },
        alternateRowStyles: { fillColor: [250, 250, 250] },
      });

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("Agência BEX - Criatividade sem limites", 105, 285, { align: "center" });
        doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: "center" });
      }

      doc.save(`PlanoEditorial_${clienteNome}_${format(currentDate, "yyyy-MM")}.pdf`);
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF");
    } finally {
      setExportando(false);
    }
  };

  // Função de filtragem com useMemo para performance
  const postsFiltrados = useMemo(() => {
    return posts
      .filter(post => {
        const passaFormato = formatosFiltrados.length === 0 || 
                           formatosFiltrados.includes(post.formato_postagem);
        
        const passaObjetivo = objetivosFiltrados.length === 0 || 
                            objetivosFiltrados.includes(post.objetivo_postagem);
        
        const passaStatus = statusFiltrados.length === 0 || 
                          statusFiltrados.includes(post.status || 'rascunho');
        
        return passaFormato && passaObjetivo && passaStatus;
      })
      .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
  }, [posts, formatosFiltrados, objetivosFiltrados, statusFiltrados]);

  // Função para lidar com drag-and-drop
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = postsFiltrados.findIndex((p) => p.id === active.id);
    const newIndex = postsFiltrados.findIndex((p) => p.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(postsFiltrados, oldIndex, newIndex);
    
    // Atualizar estado local imediatamente para feedback visual
    const updatedPosts = posts.map(post => {
      const index = reordered.findIndex(p => p.id === post.id);
      if (index !== -1) {
        return { ...post, ordem: index };
      }
      return post;
    });
    onPostsChange(updatedPosts);

    // Salvar novas ordens no banco
    try {
      const updates = reordered.map((post, idx) => 
        supabase
          .from('posts_planejamento')
          .update({ ordem: idx })
          .eq('id', post.id)
      );

      await Promise.all(updates);

      toast.success('Ordem atualizada!');
    } catch (error) {
      console.error('Erro ao salvar ordem:', error);
      toast.error('Erro ao salvar ordem');
      // Reverter mudança local em caso de erro
      onPostsChange(posts);
    }
  };

  const distribuicaoObjetivos = posts.reduce((acc: Record<string, number>, post) => {
    acc[post.objetivo_postagem] = (acc[post.objetivo_postagem] || 0) + 1;
    return acc;
  }, {});

  const distribuicaoFormatos = posts.reduce((acc: Record<string, number>, post) => {
    acc[post.formato_postagem] = (acc[post.formato_postagem] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <Card className="border-primary/20 shadow-xl bg-gradient-to-b from-card to-card/50">
        <CardHeader className="border-b border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-2xl font-bold font-['Montserrat'] flex items-center gap-3 text-foreground">
              <div className="h-10 w-1.5 bg-gradient-to-b from-primary via-primary to-primary/50 rounded-full shadow-lg shadow-primary/30" />
              📊 Plano Editorial - {format(currentDate, "MMMM yyyy", { locale: ptBR })}
            </CardTitle>
            <Badge variant="outline" className="text-sm px-4 py-2 bg-primary/10 border-primary/30 shadow-sm font-['Inter']">
              {postsFiltrados.length} / {posts.length} posts
            </Badge>
          </div>
          <div className="flex gap-3 mt-4 flex-wrap p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl border border-primary/20">
            <Button 
              onClick={adicionarNovaLinha} 
              className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 font-['Inter']"
            >
              <Plus className="h-4 w-4" />
              Adicionar Post
            </Button>
            
            <Button 
              onClick={analisarComIA} 
              variant="outline" 
              disabled={analisando || posts.length === 0}
              className="gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 font-['Inter']"
            >
              {analisando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Analisar com IA
            </Button>
            
            <Button 
              onClick={exportarPDF} 
              variant="outline" 
              disabled={exportando || posts.length === 0}
              className="gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 font-['Inter']"
            >
              {exportando ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              Exportar PDF
            </Button>
            
            {onGerarConteudoIA && (
              <Button 
                onClick={onGerarConteudoIA}
                disabled={gerando || (hasCompleteAnalysis && !hasCompleteAnalysis())}
                className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-['Inter']"
              >
                {gerando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Gerar Conteúdo IA
              </Button>
            )}
          </div>
          
          {/* Aviso de validação */}
          {onGerarConteudoIA && hasCompleteAnalysis && !hasCompleteAnalysis() && (
            <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-900 dark:text-amber-100">
                <strong>Complete a missão, posicionamento e seleções para gerar conteúdo.</strong>
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {/* Filtros Visuais */}
          <FiltrosPlanoEditorial
            formatosSelecionados={formatosFiltrados}
            objetivosSelecionados={objetivosFiltrados}
            statusSelecionados={statusFiltrados}
            onFormatoChange={setFormatosFiltrados}
            onObjetivoChange={setObjetivosFiltrados}
            onStatusChange={setStatusFiltrados}
            onLimparTodos={() => {
              setFormatosFiltrados([]);
              setObjetivosFiltrados([]);
              setStatusFiltrados([]);
            }}
            totalPosts={posts.length}
            totalPostsFiltrados={postsFiltrados.length}
          />

          {/* Tabela com Drag & Drop e Visual BEX */}
          <div className="overflow-x-auto rounded-xl border border-primary/20 shadow-md">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <Table>
                <TableHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent backdrop-blur-sm sticky top-0 z-10">
                  <TableRow className="border-primary/20 hover:bg-primary/5">
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead className="text-center font-bold text-primary w-[60px] font-['Montserrat']">#</TableHead>
                    <TableHead className="text-center font-bold text-primary min-w-[150px] font-['Montserrat']">DIA DA SEMANA</TableHead>
                    <TableHead className="text-center font-bold text-primary min-w-[140px] font-['Montserrat']">CRIATIVO</TableHead>
                    <TableHead className="text-center font-bold text-primary min-w-[140px] font-['Montserrat']">CONTEÚDO</TableHead>
                    <TableHead className="font-bold text-primary min-w-[300px] font-['Montserrat']">TEXTO ESTRUTURADO</TableHead>
                    <TableHead className="text-center font-bold text-primary min-w-[120px] font-['Montserrat']">ARQUIVO VISUAL</TableHead>
                    <TableHead className="font-bold text-primary min-w-[150px] font-['Montserrat']">RESPONSÁVEL</TableHead>
                    <TableHead className="font-bold text-primary min-w-[200px] font-['Montserrat']">OBSERVAÇÕES</TableHead>
                    <TableHead className="text-center font-bold text-primary w-[100px] font-['Montserrat']">AÇÕES</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext
                    items={postsFiltrados.map(p => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {postsFiltrados.map((post, index) => {
                      const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
                        id: post.id 
                      });

                      const style = {
                        transform: CSS.Transform.toString(transform),
                        transition,
                        opacity: isDragging ? 0.5 : 1,
                      };

                      return (
                        <tbody key={post.id} ref={setNodeRef} style={style}>
                          <LinhaPost
                            post={post}
                            index={index}
                            responsaveis={responsaveis}
                            onSave={salvarPost}
                            onGerarLegenda={gerarLegendaComIA}
                            isEditing={editingRow === post.id}
                            setIsEditing={(editing) => setEditingRow(editing ? post.id : null)}
                            dragHandle={
                              <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
                                <GripVertical className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                              </div>
                            }
                            clienteId={clienteId}
                          />
                        </tbody>
                      );
                    })}
                  </SortableContext>
                  {novoPost && (
                    <LinhaPost
                      post={novoPost}
                      index={posts.length}
                      responsaveis={responsaveis}
                      onSave={salvarPost}
                      onGerarLegenda={gerarLegendaComIA}
                      isEditing={true}
                      setIsEditing={(editing) => {
                        if (!editing) setNovoPost(null);
                      }}
                    />
                  )}
                </TableBody>
              </Table>
            </DndContext>
          </div>

          {posts.length === 0 && !novoPost && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">Nenhum post planejado ainda.</p>
              <Button onClick={adicionarNovaLinha} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Post
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de criação de tarefa */}
      <CreateTaskModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        projetoId={projetoId}
        clienteId={clienteId}
        defaultData={{
          titulo: `Post ${posts.length + 1}`,
          descricao: 'Descreva o objetivo e contexto deste conteúdo...',
          data_prazo: getProximaDataDisponivel(),
          tipo: 'feed_post' as TipoTarefa,
          objetivo_postagem: 'engajamento',
          call_to_action: 'Saiba mais'
        }}
        onTaskCreate={async (taskData) => {
          // Criar tarefa
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Usuário não autenticado');

          const { data: tarefa, error } = await supabase
            .from('tarefa')
            .insert({
              ...taskData,
              cliente_id: clienteId,
              projeto_id: projetoId
            })
            .select()
            .single();
          
          if (error) throw error;
          
          // Criar post vinculado
          await handleTaskCreated(tarefa);
          
          return tarefa;
        }}
      />

      <DialogAnaliseIA
        open={dialogAnaliseOpen}
        onOpenChange={setDialogAnaliseOpen}
        analise={analiseIA}
        totalPosts={posts.length}
        distribuicaoObjetivos={distribuicaoObjetivos}
        distribuicaoFormatos={distribuicaoFormatos}
      />
    </>
  );
};
