import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Sparkles, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast-compat";
import { LinhaPost } from "./LinhaPost";
import { DialogAnaliseIA } from "./DialogAnaliseIA";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface TabelaPlanoEditorialProps {
  planejamentoId: string;
  clienteId: string;
  posts: any[];
  onPostsChange: (posts: any[]) => void;
  currentDate: Date;
}

export const TabelaPlanoEditorial: React.FC<TabelaPlanoEditorialProps> = ({
  planejamentoId,
  clienteId,
  posts,
  onPostsChange,
  currentDate,
}) => {
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [novoPost, setNovoPost] = useState<any>(null);
  const [responsaveis, setResponsaveis] = useState<any[]>([]);
  const [analisando, setAnalisando] = useState(false);
  const [dialogAnaliseOpen, setDialogAnaliseOpen] = useState(false);
  const [analiseIA, setAnaliseIA] = useState("");
  const [clienteNome, setClienteNome] = useState("");
  const [exportando, setExportando] = useState(false);

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

  const adicionarNovaLinha = () => {
    const novoPostData = {
      id: `temp-${Date.now()}`,
      planejamento_id: planejamentoId,
      titulo: `Post ${posts.length + 1}`,
      data_postagem: format(currentDate, "yyyy-MM-dd"),
      formato_postagem: "post",
      objetivo_postagem: "educar",
      legenda: "",
      tipo_criativo: "imagem",
      responsavel_id: "",
      contexto_estrategico: "",
      hashtags: [],
      status: "rascunho",
      isNew: true,
    };

    setNovoPost(novoPostData);
    setEditingRow(novoPostData.id);
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2">
              📊 Plano Editorial - {format(currentDate, "MMMM yyyy", { locale: ptBR })}
            </CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={analisarComIA} variant="outline" size="sm" disabled={analisando || posts.length === 0}>
                {analisando ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Analisar com IA
              </Button>
              <Button onClick={exportarPDF} variant="outline" size="sm" disabled={exportando || posts.length === 0}>
                {exportando ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                Gerar PDF
              </Button>
              <Button onClick={adicionarNovaLinha} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Post
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#EFF6FF]">
                  <TableHead className="w-[60px] font-bold">#</TableHead>
                  <TableHead className="w-[150px] font-bold">DIA DA SEMANA</TableHead>
                  <TableHead className="w-[130px] font-bold">CRIATIVO</TableHead>
                  <TableHead className="w-[130px] font-bold">OBJETIVO</TableHead>
                  <TableHead className="min-w-[300px] font-bold">LEGENDA</TableHead>
                  <TableHead className="w-[150px] font-bold">RESPONSÁVEL</TableHead>
                  <TableHead className="min-w-[200px] font-bold">OBSERVAÇÕES</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post, index) => (
                  <LinhaPost
                    key={post.id}
                    post={post}
                    index={index}
                    responsaveis={responsaveis}
                    onSave={salvarPost}
                    onGerarLegenda={gerarLegendaComIA}
                    isEditing={editingRow === post.id}
                    setIsEditing={(editing) => setEditingRow(editing ? post.id : null)}
                  />
                ))}
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
