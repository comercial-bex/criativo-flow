import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Sparkles, Hash, Clock, Send, Link as LinkIcon, X } from 'lucide-react';
import { InstagramPreview } from './InstagramPreview';
import { UploadArquivoVisual } from './UploadArquivoVisual';
import { usePostEditor } from '@/hooks/usePostEditor';
import { useTextGenerator } from '@/hooks/useTextGenerator';
import { HashtagGenerator } from './HashtagGenerator';
import { AgendamentoInteligente } from './AgendamentoInteligente';
import { SolicitarAprovacaoModal } from './SolicitarAprovacaoModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

interface EditarPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: any;
  clienteId: string;
  projetoId?: string;
  responsaveis?: any[];
  onSave: (updatedPost: any) => void;
  onRefresh?: () => void;
}

export function EditarPostModal({
  open,
  onOpenChange,
  post,
  clienteId,
  projetoId,
  responsaveis = [],
  onSave,
  onRefresh
}: EditarPostModalProps) {
  const {
    editedPost,
    updateField,
    handleSave,
    isSaving,
    hasChanges,
    criarTarefaVinculada
  } = usePostEditor({
    post,
    onSave,
    autoSave: false
  });

  const { gerarTextoEstruturado, loading: loadingTexto } = useTextGenerator();
  
  const [showHashtagGen, setShowHashtagGen] = useState(false);
  const [showAgendamento, setShowAgendamento] = useState(false);
  const [showAprovacao, setShowAprovacao] = useState(false);
  const [criarTarefa, setCriarTarefa] = useState(false);

  const handleGerarTexto = async () => {
    const textoGerado = await gerarTextoEstruturado(editedPost);
    if (textoGerado) {
      updateField('texto_estruturado', textoGerado);
    }
  };

  const handleHashtagsGeradas = (hashtags: string) => {
    const hashtagsArray = hashtags.split(/\s+/).filter(h => h.trim());
    updateField('hashtags', hashtagsArray);
  };

  const handleUploadComplete = (url: string, tipo: string) => {
    updateField('arquivo_visual_url', url);
    updateField('tipo_criativo', tipo);
  };

  const handleSaveAndClose = async () => {
    await handleSave();
    
    if (criarTarefa && !editedPost.tarefa_vinculada_id) {
      await criarTarefaVinculada(clienteId, projetoId);
    }
    
    if (onRefresh) {
      onRefresh();
    }
    
    onOpenChange(false);
  };

  const handleAplicarHorario = (novaData: string) => {
    updateField('data_postagem', novaData);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl">
              ✏️ Editor Completo do Post
              {hasChanges && (
                <Badge variant="secondary" className="ml-2">
                  Não salvo
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col lg:flex-row h-full overflow-hidden">
            {/* Lado Esquerdo - Preview (40%) */}
            <div className="lg:w-2/5 bg-muted/20 p-6 border-r overflow-y-auto">
              <div className="sticky top-0">
                <div className="mb-3">
                  <Badge variant="outline" className="mb-2">
                    Preview em Tempo Real
                  </Badge>
                </div>
                <InstagramPreview post={editedPost} />
              </div>
            </div>

            {/* Lado Direito - Formulário (60%) */}
            <div className="lg:w-3/5 flex flex-col">
              <Tabs defaultValue="conteudo" className="flex-1 flex flex-col">
                <TabsList className="w-full justify-start rounded-none border-b px-6">
                  <TabsTrigger value="conteudo">📝 Conteúdo</TabsTrigger>
                  <TabsTrigger value="visual">🎨 Visual</TabsTrigger>
                  <TabsTrigger value="ia">🚀 IA</TabsTrigger>
                  <TabsTrigger value="config">⚙️ Config</TabsTrigger>
                </TabsList>

                <ScrollArea className="flex-1 px-6 py-4">
                  {/* Tab: Conteúdo */}
                  <TabsContent value="conteudo" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <Label htmlFor="titulo">Título</Label>
                      <Input
                        id="titulo"
                        value={editedPost.titulo || ''}
                        onChange={(e) => updateField('titulo', e.target.value)}
                        placeholder="Digite o título do post..."
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="texto">Legenda / Texto Estruturado</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleGerarTexto}
                          disabled={loadingTexto}
                        >
                          {loadingTexto ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Gerar com IA
                            </>
                          )}
                        </Button>
                      </div>
                      <Textarea
                        id="texto"
                        value={editedPost.texto_estruturado || editedPost.legenda || ''}
                        onChange={(e) => updateField('texto_estruturado', e.target.value)}
                        placeholder="Digite o texto do post..."
                        rows={8}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        {(editedPost.texto_estruturado || editedPost.legenda || '').length} caracteres
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="hashtags">Hashtags</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowHashtagGen(true)}
                        >
                          <Hash className="h-4 w-4 mr-2" />
                          Gerar com IA
                        </Button>
                      </div>
                      <Input
                        id="hashtags"
                        value={editedPost.hashtags?.join(' ') || ''}
                        onChange={(e) => {
                          const tags = e.target.value.split(/\s+/).filter(t => t.trim());
                          updateField('hashtags', tags);
                        }}
                        placeholder="#exemplo #hashtag #marketing"
                      />
                      <div className="flex flex-wrap gap-1">
                        {editedPost.hashtags?.map((tag: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                            <X
                              className="h-3 w-3 ml-1 cursor-pointer"
                              onClick={() => {
                                const novasTags = editedPost.hashtags.filter((_: any, i: number) => i !== idx);
                                updateField('hashtags', novasTags);
                              }}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="data">Data de Postagem</Label>
                        <Input
                          id="data"
                          type="date"
                          value={editedPost.data_postagem?.split('T')[0] || ''}
                          onChange={(e) => updateField('data_postagem', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Horário</Label>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setShowAgendamento(true)}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Sugerir Melhor Horário
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="objetivo">Objetivo da Postagem</Label>
                      <Select
                        value={editedPost.objetivo_postagem || editedPost.tipo_conteudo}
                        onValueChange={(value) => updateField('objetivo_postagem', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o objetivo..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="informar">📊 Informar</SelectItem>
                          <SelectItem value="educar">📚 Educar</SelectItem>
                          <SelectItem value="inspirar">💡 Inspirar</SelectItem>
                          <SelectItem value="engajar">💬 Engajar</SelectItem>
                          <SelectItem value="vender">💰 Vender</SelectItem>
                          <SelectItem value="entreter">🎭 Entreter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cta">Call to Action (CTA)</Label>
                      <Input
                        id="cta"
                        value={editedPost.call_to_action || ''}
                        onChange={(e) => updateField('call_to_action', e.target.value)}
                        placeholder="Ex: Clique no link da bio!"
                      />
                    </div>
                  </TabsContent>

                  {/* Tab: Visual */}
                  <TabsContent value="visual" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <Label>Formato da Postagem</Label>
                      <Select
                        value={editedPost.formato_postagem || editedPost.formato_criativo}
                        onValueChange={(value) => updateField('formato_postagem', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o formato..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="post">📸 Post</SelectItem>
                          <SelectItem value="reels">🎥 Reels</SelectItem>
                          <SelectItem value="story">📱 Story</SelectItem>
                          <SelectItem value="carrossel">🎠 Carrossel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Upload de Imagem/Vídeo</Label>
                      <UploadArquivoVisual
                        postId={editedPost.id}
                        arquivoAtual={editedPost.arquivo_visual_url || editedPost.anexo_url}
                        arquivoTipo={editedPost.tipo_criativo}
                        onUploadComplete={handleUploadComplete}
                      />
                    </div>

                    <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                      <p className="text-sm font-medium">Informações do Arquivo</p>
                      <div className="text-xs space-y-1 text-muted-foreground">
                        <p>Tipo: {editedPost.tipo_criativo || 'Não definido'}</p>
                        <p>Status: {editedPost.arquivo_visual_url ? '✅ Anexado' : '⚠️ Sem arquivo'}</p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Tab: IA & Automação */}
                  <TabsContent value="ia" className="space-y-4 mt-0">
                    <div className="space-y-3">
                      <Button
                        className="w-full justify-start"
                        variant="outline"
                        onClick={handleGerarTexto}
                        disabled={loadingTexto}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Gerar Texto Completo com IA
                      </Button>

                      <Button
                        className="w-full justify-start"
                        variant="outline"
                        onClick={() => setShowHashtagGen(true)}
                      >
                        <Hash className="h-4 w-4 mr-2" />
                        Gerar Hashtags Inteligentes
                      </Button>

                      <Button
                        className="w-full justify-start"
                        variant="outline"
                        onClick={() => setShowAgendamento(true)}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Sugerir Melhor Horário (ML)
                      </Button>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                      <p className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Recursos de IA Disponíveis
                      </p>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        <li>✨ Geração de texto otimizado para engajamento</li>
                        <li>🏷️ Sugestão de hashtags baseadas em tendências</li>
                        <li>⏰ Análise preditiva de melhor horário de postagem</li>
                        <li>📊 Previsão de performance do conteúdo</li>
                      </ul>
                    </div>
                  </TabsContent>

                  {/* Tab: Configurações */}
                  <TabsContent value="config" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <Label>Responsável</Label>
                      <Select
                        value={editedPost.responsavel_id || ''}
                        onValueChange={(value) => updateField('responsavel_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o responsável..." />
                        </SelectTrigger>
                        <SelectContent>
                          {responsaveis.map((resp) => (
                            <SelectItem key={resp.id} value={resp.id}>
                              {resp.nome_completo || resp.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Rede Social</Label>
                      <Select
                        value={editedPost.rede_social || 'instagram'}
                        onValueChange={(value) => updateField('rede_social', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instagram">📸 Instagram</SelectItem>
                          <SelectItem value="facebook">👍 Facebook</SelectItem>
                          <SelectItem value="linkedin">💼 LinkedIn</SelectItem>
                          <SelectItem value="twitter">🐦 Twitter</SelectItem>
                          <SelectItem value="tiktok">🎵 TikTok</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={editedPost.status_post || 'rascunho'}
                        onValueChange={(value) => updateField('status_post', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rascunho">📝 Rascunho</SelectItem>
                          <SelectItem value="agendado">📅 Agendado</SelectItem>
                          <SelectItem value="publicado">✅ Publicado</SelectItem>
                          <SelectItem value="arquivado">📦 Arquivado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="criar-tarefa"
                          checked={criarTarefa || !!editedPost.tarefa_vinculada_id}
                          onCheckedChange={(checked) => setCriarTarefa(checked as boolean)}
                          disabled={!!editedPost.tarefa_vinculada_id}
                        />
                        <label
                          htmlFor="criar-tarefa"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Criar tarefa vinculada
                        </label>
                      </div>
                      
                      {editedPost.tarefa_vinculada_id && (
                        <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                          <p className="text-xs text-green-800 flex items-center gap-2">
                            <LinkIcon className="h-3 w-3" />
                            Tarefa vinculada criada com sucesso
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="persona">Persona Alvo</Label>
                      <Input
                        id="persona"
                        value={editedPost.persona_alvo || ''}
                        onChange={(e) => updateField('persona_alvo', e.target.value)}
                        placeholder="Ex: Empreendedores digitais"
                      />
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>

              {/* Footer com botões de ação */}
              <div className="border-t p-4 bg-background">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAprovacao(true)}
                      disabled={!editedPost.arquivo_visual_url}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Solicitar Aprovação
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveAndClose} disabled={isSaving || !hasChanges}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modais auxiliares */}
      <HashtagGenerator
        open={showHashtagGen}
        onOpenChange={setShowHashtagGen}
        post={editedPost}
        onHashtagsGenerated={handleHashtagsGeradas}
      />

      <AgendamentoInteligente
        isOpen={showAgendamento}
        onClose={() => setShowAgendamento(false)}
        post={editedPost}
        clienteId={clienteId}
        onAplicarHorario={handleAplicarHorario}
      />

      <SolicitarAprovacaoModal
        open={showAprovacao}
        onOpenChange={setShowAprovacao}
        post={editedPost}
        clienteId={clienteId}
        projetoId={projetoId}
        onSuccess={() => {
          handleSaveAndClose();
        }}
      />
    </>
  );
}
