import React, { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar as CalendarIcon, Save, X, Edit, Clock, Target, Rocket, ExternalLink, Loader2, Sparkles, Link as LinkIcon, Hash, CheckCircle, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getCreativeColor, getCreativeIcon, getTipoConteudoColor, getTipoConteudoIcon, formatarDataPorExtenso } from "@/lib/plano-editorial-helpers";
import { normalizarPost } from "@/utils/normalizarPost";
import { UploadArquivoVisual } from "./UploadArquivoVisual";
import { supabase } from "@/integrations/supabase/client";
import { AgendamentoInteligente } from "./AgendamentoInteligente";
import { PrevisaoPerformance } from "./PrevisaoPerformance";
import { PublicacaoAutomatica } from "./PublicacaoAutomatica";
import { TextoEstruturadoEditor } from "./TextoEstruturadoEditor";
import { HashtagGenerator } from "./HashtagGenerator";
import { SolicitarAprovacaoModal } from "./SolicitarAprovacaoModal";


interface LinhaPostProps {
  post: any;
  index: number;
  responsaveis: any[];
  onSave: (post: any) => Promise<void>;
  onGerarLegenda: (post: any) => Promise<string>;
  onDelete?: (postId: string) => Promise<void>;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  dragHandle?: React.ReactNode;
  clienteId?: string;
}

export const LinhaPost: React.FC<LinhaPostProps> = ({
  post,
  index,
  responsaveis,
  onSave,
  onGerarLegenda,
  onDelete,
  isEditing,
  setIsEditing,
  dragHandle,
  clienteId,
}) => {
  // ✅ FASE 2: Normalizar post antes de usar
  const postNormalizado = normalizarPost(post);
  const [editedPost, setEditedPost] = useState(postNormalizado);
  const [saving, setSaving] = useState(false);
  const [showTextoEditor, setShowTextoEditor] = useState(false);
  const [showAgendamento, setShowAgendamento] = useState(false);
  const [showPrevisao, setShowPrevisao] = useState(false);
  const [showPublicacao, setShowPublicacao] = useState(false);
  const [showHashtagGen, setShowHashtagGen] = useState(false);
  const [showSolicitarAprovacao, setShowSolicitarAprovacao] = useState(false);

  const handleSaveTexto = async (texto: string) => {
    const updatedPost = { ...editedPost, texto_estruturado: texto };
    setEditedPost(updatedPost);
    await onSave(updatedPost);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(editedPost);
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar post:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadComplete = async (url: string, tipo: string, nome: string) => {
    // Atualizar estado local
    const updatedPost = {
      ...editedPost,
      arquivo_visual_url: url,
      arquivo_visual_tipo: tipo,
      arquivo_visual_nome: nome
    };
    setEditedPost(updatedPost);

    // Se não estiver em modo de edição, salvar automaticamente
    if (!isEditing && post.id && !post.id.startsWith('temp-')) {
      try {
        const { error } = await supabase
          .from('posts_planejamento')
          .update({
            arquivo_visual_url: url,
            arquivo_visual_tipo: tipo,
            arquivo_visual_nome: nome
          })
          .eq('id', post.id);

        if (error) throw error;
      } catch (error) {
        console.error('Erro ao atualizar arquivo visual:', error);
      }
    }
  };

  const handleCancel = () => {
    setEditedPost(post);
    setIsEditing(false);
  };

  return (
    <TableRow className="border-b border-primary/10 hover:bg-primary/5 hover:shadow-sm transition-all duration-200 group">
      {/* DRAG HANDLE */}
      {dragHandle && (
        <TableCell className="w-[40px] p-2">
          {dragHandle}
        </TableCell>
      )}
      
      {/* POST # */}
      <TableCell className="font-mono text-center font-semibold font-['Inter']">
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-1.5">
            {String(index + 1).padStart(2, '0')}
            {post.tarefa_vinculada_id && (
              <LinkIcon className="h-3 w-3 text-primary" />
            )}
          </div>
          {/* Badge de Status de Aprovação */}
          {post.status_aprovacao_cliente && (
            <Badge 
              variant={
                post.status_aprovacao_cliente === 'aprovado' ? 'default' :
                post.status_aprovacao_cliente === 'reprovado' ? 'destructive' :
                'secondary'
              }
              className="text-[10px] px-1.5 py-0"
            >
              {post.status_aprovacao_cliente === 'pendente' && '⏳'}
              {post.status_aprovacao_cliente === 'aprovado' && '✅'}
              {post.status_aprovacao_cliente === 'reprovado' && '❌'}
              {post.status_aprovacao_cliente === 'revisao' && '🔄'}
            </Badge>
          )}
        </div>
      </TableCell>

      {/* DIA DA SEMANA */}
      <TableCell>
        {isEditing ? (
          <div className="space-y-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left text-sm">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {editedPost.data_postagem
                    ? formatarDataPorExtenso(editedPost.data_postagem)
                    : "Selecione..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={editedPost.data_postagem ? new Date(editedPost.data_postagem + 'T00:00:00') : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      setEditedPost({ ...editedPost, data_postagem: `${year}-${month}-${day}` });
                    }
                  }}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
            
            {clienteId && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAgendamento(true)}
                className="w-full gap-2 text-xs"
              >
                <Sparkles className="h-3 w-3" />
                Sugerir Horário
              </Button>
            )}
          </div>
        ) : (
          <div className="text-sm">
            {post.data_postagem ? formatarDataPorExtenso(post.data_postagem) : '-'}
          </div>
        )}
      </TableCell>

      {/* CRIATIVO */}
      <TableCell>
        {isEditing ? (
          <Select
            value={editedPost.formato_postagem}
            onValueChange={(value) => setEditedPost({ ...editedPost, formato_postagem: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="reels">🎥 Vídeo (Reels)</SelectItem>
              <SelectItem value="card">🖼️ Card</SelectItem>
              <SelectItem value="carrossel">🧩 Carrossel</SelectItem>
              <SelectItem value="motion">🎞️ Motion</SelectItem>
              <SelectItem value="story">📸 Story</SelectItem>
              <SelectItem value="post">📱 Post</SelectItem>
              <SelectItem value="outro">📢 Outro</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Badge className={getCreativeColor(post.formato_postagem)}>
            {getCreativeIcon(post.formato_postagem)} {post.formato_postagem}
          </Badge>
        )}
      </TableCell>

      {/* CONTEÚDO (TIPO DE CONTEÚDO) */}
      <TableCell className="min-w-[140px]">
        {isEditing ? (
          <Select
            value={editedPost.tipo_conteudo || 'informar'}
            onValueChange={(value) => setEditedPost({ ...editedPost, tipo_conteudo: value })}
          >
            <SelectTrigger className="w-full border-primary/30">
              <SelectValue placeholder="Tipo de conteúdo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="informar">
                <div className="flex items-center gap-2">
                  <span>💡</span>
                  <div className="text-left">
                    <div className="font-medium">Informar</div>
                    <div className="text-xs text-muted-foreground">Trazer conhecimento</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="inspirar">
                <div className="flex items-center gap-2">
                  <span>✨</span>
                  <div>
                    <div className="font-medium">Inspirar</div>
                    <div className="text-xs text-muted-foreground">Conexão emocional</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="entreter">
                <div className="flex items-center gap-2">
                  <span>🎭</span>
                  <div>
                    <div className="font-medium">Entreter</div>
                    <div className="text-xs text-muted-foreground">Vínculo leve</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="vender">
                <div className="flex items-center gap-2">
                  <span>💰</span>
                  <div>
                    <div className="font-medium">Vender</div>
                    <div className="text-xs text-muted-foreground">Gerar conversão</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="posicionar">
                <div className="flex items-center gap-2">
                  <span>🎯</span>
                  <div>
                    <div className="font-medium">Posicionar</div>
                    <div className="text-xs text-muted-foreground">Identidade da marca</div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Badge className={getTipoConteudoColor(post.tipo_conteudo)}>
            {getTipoConteudoIcon(post.tipo_conteudo)} {post.tipo_conteudo || 'Informar'}
          </Badge>
        )}
      </TableCell>

      {/* TEXTO ESTRUTURADO */}
      <TableCell className="max-w-[200px]">
        {isEditing ? (
          <Button
            variant="outline"
            onClick={() => setShowTextoEditor(true)}
            className="w-full justify-start text-left h-auto min-h-[40px]"
          >
            <Edit className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">
              {editedPost.texto_estruturado 
                ? editedPost.texto_estruturado.substring(0, 30) + '...'
                : 'Clique para editar...'}
            </span>
          </Button>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-sm line-clamp-2 cursor-help">
                  {post.texto_estruturado || '-'}
                </div>
              </TooltipTrigger>
              {post.texto_estruturado && (
                <TooltipContent className="max-w-md p-3">
                  <p className="text-sm whitespace-pre-wrap">{post.texto_estruturado}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )}
      </TableCell>

      {/* ARQUIVO VISUAL */}
      <TableCell>
        <UploadArquivoVisual
          postId={post.id || `temp-${Date.now()}`}
          arquivoAtual={editedPost.arquivo_visual_url}
          arquivoTipo={editedPost.arquivo_visual_tipo}
          onUploadComplete={handleUploadComplete}
          disabled={saving}
        />
      </TableCell>

      {/* RESPONSÁVEL */}
      <TableCell>
        {isEditing ? (
          <Select
            value={editedPost.responsavel_id || ''}
            onValueChange={(value) => setEditedPost({ ...editedPost, responsavel_id: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {responsaveis.map((pessoa) => (
                <SelectItem key={pessoa.id} value={pessoa.id}>
                  {pessoa.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="text-sm">
            {responsaveis.find((p) => p.id === post.responsavel_id)?.nome || '-'}
          </div>
        )}
      </TableCell>

      {/* OBSERVAÇÕES */}
      <TableCell className="max-w-[200px]">
        {isEditing ? (
          <Textarea
            value={editedPost.contexto_estrategico || ''}
            onChange={(e) => setEditedPost({ ...editedPost, contexto_estrategico: e.target.value })}
            placeholder="Análises, instruções ou feedback..."
            className="min-h-[60px] text-sm"
          />
        ) : (
          <div className="text-sm text-muted-foreground line-clamp-2">
            {post.contexto_estrategico || '-'}
          </div>
        )}
      </TableCell>

      {/* AÇÕES */}
      <TableCell>
        <div className="flex flex-col gap-2">
          <div className="flex gap-1">
            {/* Botão Ver Tarefa */}
            {post.tarefa_vinculada_id && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  window.open(`/admin/tarefas?id=${post.tarefa_vinculada_id}`, '_blank');
                }}
                title="Ver tarefa vinculada"
                className="text-primary hover:text-primary/80"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
            
            {isEditing ? (
              <>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancel} disabled={saving}>
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Ações Avançadas */}
          {isEditing && (
            <div className="flex flex-wrap gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSolicitarAprovacao(true)}
                className="gap-1 text-xs px-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                title="Solicitar aprovação do cliente"
              >
                <CheckCircle className="h-3 w-3" />
                Aprovar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowHashtagGen(true)}
                className="gap-1 text-xs px-2"
                title="Gerar hashtags com IA"
              >
                <Hash className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </TableCell>
      
      {/* Modais */}
      {isEditing && clienteId && (
        <>
          <TextoEstruturadoEditor
            open={showTextoEditor}
            onOpenChange={setShowTextoEditor}
            post={editedPost}
            onSave={handleSaveTexto}
            clienteId={clienteId}
          />
          
          <AgendamentoInteligente
            isOpen={showAgendamento}
            onClose={() => setShowAgendamento(false)}
            post={editedPost}
            clienteId={clienteId}
            onAplicarHorario={(novaData) => {
              setEditedPost({ ...editedPost, data_postagem: novaData });
            }}
          />

          <PrevisaoPerformance
            isOpen={showPrevisao}
            onClose={() => setShowPrevisao(false)}
            post={editedPost}
            clienteId={clienteId}
          />

          <PublicacaoAutomatica
            isOpen={showPublicacao}
            onClose={() => setShowPublicacao(false)}
            post={editedPost}
            clienteId={clienteId}
          />
          
          <HashtagGenerator
            open={showHashtagGen}
            onOpenChange={setShowHashtagGen}
            post={editedPost}
            onHashtagsGenerated={(hashtags) => {
              // ✅ Converter string para array
              const hashtagsArray = typeof hashtags === 'string' 
                ? hashtags.split(/\s+/).filter(h => h.trim())
                : hashtags;
              setEditedPost({ ...editedPost, hashtags: hashtagsArray });
              setShowHashtagGen(false);
            }}
          />
          
          <SolicitarAprovacaoModal
            open={showSolicitarAprovacao}
            onOpenChange={setShowSolicitarAprovacao}
            post={editedPost}
            clienteId={clienteId}
            projetoId={post.projeto_id}
            onSuccess={() => {
              // Recarregar posts se necessário
            }}
          />
        </>
      )}
    </TableRow>
  );
};
