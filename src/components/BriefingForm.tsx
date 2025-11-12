import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Target, Users, Zap } from 'lucide-react';

interface BriefingFormProps {
  formData: any;
  setFormData: (data: any) => void;
  tipoTarefa?: string;
}

export function BriefingForm({ formData, setFormData, tipoTarefa }: BriefingFormProps) {
  // 🎯 Categorização detalhada por tipo de tarefa
  const isCriativoCard = tipoTarefa === 'criativo_card';
  const isCriativoCarrossel = tipoTarefa === 'criativo_carrossel';
  const isCriativoCartela = tipoTarefa === 'criativo_cartela';
  const isCriativoVT = tipoTarefa === 'criativo_vt';
  const isReelsInstagram = tipoTarefa === 'reels_instagram';
  const isStoriesInterativo = tipoTarefa === 'stories_interativo';
  const isFeedPost = tipoTarefa === 'feed_post';
  const isRoteiroReels = tipoTarefa === 'roteiro_reels';
  const isPlanejamentoEstrategico = tipoTarefa === 'planejamento_estrategico';
  const isDatasComemoratvas = tipoTarefa === 'datas_comemorativas';
  const isTrafegoPago = tipoTarefa === 'trafego_pago';
  
  // Grupos de tipos para facilitar condicionais
  const isVideo = [isCriativoVT, isReelsInstagram, isRoteiroReels].some(Boolean);
  const isCarrossel = isCriativoCarrossel;
  const isStories = isStoriesInterativo;
  const isCartela = isCriativoCartela;
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <FileText className="h-5 w-5" />
          Briefing Obrigatório
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tipo de Conteúdo (NOVO CAMPO ESTRATÉGICO) */}
        <div className="space-y-2">
          <Label htmlFor="tipo_conteudo" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Tipo de Conteúdo *
          </Label>
          <Select 
            value={formData.tipo_conteudo || 'informar'} 
            onValueChange={(value) => setFormData({ ...formData, tipo_conteudo: value })}
          >
            <SelectTrigger className="border-primary/30">
              <SelectValue placeholder="Selecione o tipo de conteúdo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="informar">
                <div className="flex items-center gap-3 py-1">
                  <span className="text-xl">💡</span>
                  <div className="text-left">
                    <div className="font-semibold">Informar</div>
                    <div className="text-xs text-muted-foreground">Trazer conhecimento prático</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="inspirar">
                <div className="flex items-center gap-3 py-1">
                  <span className="text-xl">✨</span>
                  <div>
                    <div className="font-semibold">Inspirar</div>
                    <div className="text-xs text-muted-foreground">Gerar conexão emocional</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="entreter">
                <div className="flex items-center gap-3 py-1">
                  <span className="text-xl">🎭</span>
                  <div>
                    <div className="font-semibold">Entreter</div>
                    <div className="text-xs text-muted-foreground">Criar vínculo leve</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="vender">
                <div className="flex items-center gap-3 py-1">
                  <span className="text-xl">💰</span>
                  <div>
                    <div className="font-semibold">Vender</div>
                    <div className="text-xs text-muted-foreground">Converter ou gerar leads</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="posicionar">
                <div className="flex items-center gap-3 py-1">
                  <span className="text-xl">🎯</span>
                  <div>
                    <div className="font-semibold">Posicionar</div>
                    <div className="text-xs text-muted-foreground">Reforçar identidade da marca</div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Define a intenção estratégica do conteúdo
          </p>
        </div>

        {/* Meta/Objetivo Mensurável (RENOMEADO) */}
        <div className="space-y-2">
          <Label htmlFor="objetivo" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Meta/Objetivo Mensurável
          </Label>
          <Textarea
            id="objetivo"
            value={formData.objetivo_postagem}
            onChange={(e) => setFormData({ ...formData, objetivo_postagem: e.target.value })}
            placeholder="Ex: Aumentar engajamento em 20%, gerar 50 leads, alcançar 10k visualizações"
            rows={2}
          />
          <p className="text-xs text-muted-foreground">
            Meta específica ou KPI esperado desta postagem
          </p>
        </div>

        {/* Target Audience */}
        <div className="space-y-2">
          <Label htmlFor="publico" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Público-Alvo *
          </Label>
          <Input
            id="publico"
            value={formData.publico_alvo}
            onChange={(e) => setFormData({ ...formData, publico_alvo: e.target.value })}
            placeholder="Ex: Mulheres, 25-35 anos, interessadas em moda"
            required
          />
        </div>

        {/* Format */}
        <div className="space-y-2">
          <Label htmlFor="formato">Formato Desejado *</Label>
          <Select 
            value={formData.formato_postagem} 
            onValueChange={(value) => setFormData({ ...formData, formato_postagem: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o formato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="post_feed">Post para Feed</SelectItem>
              <SelectItem value="stories">Stories</SelectItem>
              <SelectItem value="reels">Reels</SelectItem>
              <SelectItem value="carrossel">Carrossel</SelectItem>
              <SelectItem value="video">Vídeo</SelectItem>
              <SelectItem value="igtv">IGTV</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Strategic Context */}
        <div className="space-y-2">
          <Label htmlFor="contexto">Contexto Estratégico</Label>
          <Textarea
            id="contexto"
            value={formData.contexto_estrategico}
            onChange={(e) => setFormData({ ...formData, contexto_estrategico: e.target.value })}
            placeholder="Ex: Campanha de Black Friday, lançamento de produto, sazonalidade..."
            rows={2}
          />
        </div>

        {/* CTA */}
        <div className="space-y-2">
          <Label htmlFor="cta" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Call to Action (CTA)
          </Label>
          <Input
            id="cta"
            value={formData.call_to_action}
            onChange={(e) => setFormData({ ...formData, call_to_action: e.target.value })}
            placeholder="Ex: 'Confira no link da bio', 'Mande DM', 'Compre agora'"
          />
        </div>

        {/* Hashtags */}
        <div className="space-y-2">
          <Label htmlFor="hashtags">Hashtags Sugeridas</Label>
          <Input
            id="hashtags"
            value={formData.hashtags}
            onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
            placeholder="Ex: #blackfriday, #promocao, #moda (separadas por vírgula)"
          />
          <p className="text-xs text-muted-foreground">
            Separe as hashtags por vírgula. Máximo recomendado: 10 hashtags
          </p>
        </div>

        {/* Additional Notes */}
        <div className="space-y-2">
          <Label htmlFor="observacoes_briefing">Observações Adicionais</Label>
          <Textarea
            id="observacoes_briefing"
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            placeholder="Informações adicionais, referências, requisitos especiais..."
            rows={3}
          />
        </div>

        {/* ========== CAMPOS ESPECÍFICOS POR TIPO DE TAREFA ========== */}
        
        {/* A) CARD INSTAGRAM/FACEBOOK */}
        {isCriativoCard && (
          <>
            <div className="space-y-2">
              <Label htmlFor="mensagem_principal">Mensagem Principal *</Label>
              <Textarea
                id="mensagem_principal"
                placeholder="Mensagem que deve ser transmitida no card"
                value={formData.mensagem_principal || ''}
                onChange={(e) => setFormData({ ...formData, mensagem_principal: e.target.value })}
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tom_voz">Tom de Voz</Label>
              <Select
                value={formData.tom_voz || 'profissional'}
                onValueChange={(value) => setFormData({ ...formData, tom_voz: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="profissional">Profissional</SelectItem>
                  <SelectItem value="descontraido">Descontraído</SelectItem>
                  <SelectItem value="inspirador">Inspirador</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="elementos_visuais">Elementos Visuais</Label>
              <Select
                value={formData.elementos_visuais || 'foto'}
                onValueChange={(value) => setFormData({ ...formData, elementos_visuais: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="foto">📸 Foto</SelectItem>
                  <SelectItem value="ilustracao">🎨 Ilustração</SelectItem>
                  <SelectItem value="mockup">📱 Mockup</SelectItem>
                  <SelectItem value="texto_grafico">📊 Texto + Gráfico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paleta_cores">Paleta de Cores Sugerida</Label>
              <Input
                id="paleta_cores"
                placeholder="Ex: Azul e dourado, cores da marca..."
                value={formData.paleta_cores || ''}
                onChange={(e) => setFormData({ ...formData, paleta_cores: e.target.value })}
              />
            </div>
          </>
        )}

        {/* B) CARROSSEL */}
        {isCarrossel && (
          <>
            <div className="space-y-2">
              <Label htmlFor="num_cards" className="flex items-center gap-2">
                <span>📸</span> Número de Cards
              </Label>
              <Input
                id="num_cards"
                type="number"
                min={2}
                max={10}
                placeholder="Ex: 5"
                value={formData.num_cards || ''}
                onChange={(e) => setFormData({ ...formData, num_cards: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Recomendado: 5-7 cards para melhor engajamento</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="narrativa">Tipo de Narrativa</Label>
              <Select
                value={formData.narrativa || 'linear'}
                onValueChange={(value) => setFormData({ ...formData, narrativa: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear">Linear (1 → 2 → 3)</SelectItem>
                  <SelectItem value="sequencial">Sequencial (passo a passo)</SelectItem>
                  <SelectItem value="comparativa">Comparativa (antes/depois)</SelectItem>
                  <SelectItem value="storytelling">Storytelling</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chamada_inicial">Chamada do 1º Card</Label>
              <Input
                id="chamada_inicial"
                placeholder="Ex: 'Descubra como...', 'Você sabia que...'"
                value={formData.chamada_inicial || ''}
                onChange={(e) => setFormData({ ...formData, chamada_inicial: e.target.value })}
              />
            </div>
          </>
        )}

        {/* C) CARTELA */}
        {isCartela && (
          <>
            <div className="space-y-2">
              <Label htmlFor="num_imagens" className="flex items-center gap-2">
                <span>🖼️</span> Número de Imagens na Cartela
              </Label>
              <Input
                id="num_imagens"
                type="number"
                min={1}
                max={20}
                placeholder="Ex: 6"
                value={formData.num_imagens || ''}
                onChange={(e) => setFormData({ ...formData, num_imagens: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="layout_cartela">Layout da Cartela</Label>
              <Select
                value={formData.layout_cartela || 'grid'}
                onValueChange={(value) => setFormData({ ...formData, layout_cartela: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid (quadriculado)</SelectItem>
                  <SelectItem value="mosaico">Mosaico</SelectItem>
                  <SelectItem value="collage">Collage</SelectItem>
                  <SelectItem value="timeline">Timeline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tema_visual">Tema Visual</Label>
              <Input
                id="tema_visual"
                placeholder="Ex: Minimalista, Vintage, Moderno..."
                value={formData.tema_visual || ''}
                onChange={(e) => setFormData({ ...formData, tema_visual: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="filtros_efeitos">Filtros/Efeitos Sugeridos</Label>
              <Input
                id="filtros_efeitos"
                placeholder="Ex: Preto e branco, Sépia, Nenhum..."
                value={formData.filtros_efeitos || ''}
                onChange={(e) => setFormData({ ...formData, filtros_efeitos: e.target.value })}
              />
            </div>
          </>
        )}

        {/* D) VT - VÍDEO COMERCIAL */}
        {isCriativoVT && (
          <>
            <div className="space-y-2">
              <Label htmlFor="duracao_segundos" className="flex items-center gap-2">
                <span>⏱️</span> Duração (segundos)
              </Label>
              <Input
                id="duracao_segundos"
                type="number"
                min={15}
                max={60}
                placeholder="15-60s"
                value={formData.duracao_segundos || ''}
                onChange={(e) => setFormData({ ...formData, duracao_segundos: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roteiro_resumido">Roteiro Resumido</Label>
              <Textarea
                id="roteiro_resumido"
                placeholder="Descreva brevemente o que acontece no vídeo..."
                value={formData.roteiro_resumido || ''}
                onChange={(e) => setFormData({ ...formData, roteiro_resumido: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cenas_principais">Cenas Principais</Label>
              <Textarea
                id="cenas_principais"
                placeholder="Ex: Cena 1: Close no produto | Cena 2: Cliente satisfeito | Cena 3: Logo final"
                value={formData.cenas_principais || ''}
                onChange={(e) => setFormData({ ...formData, cenas_principais: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="com_locucao" className="flex items-center gap-2">
                <span>🎙️</span> Com Locução?
              </Label>
              <Select
                value={formData.com_locucao || 'nao'}
                onValueChange={(value) => setFormData({ ...formData, com_locucao: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sim">Sim</SelectItem>
                  <SelectItem value="nao">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="legendas" className="flex items-center gap-2">
                <span>💬</span> Legendas
              </Label>
              <Select
                value={formData.legendas || 'obrigatorio'}
                onValueChange={(value) => setFormData({ ...formData, legendas: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="obrigatorio">Obrigatório</SelectItem>
                  <SelectItem value="opcional">Opcional</SelectItem>
                  <SelectItem value="nao">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trilha_sonora" className="flex items-center gap-2">
                <span>🎵</span> Trilha Sonora Sugerida
              </Label>
              <Input
                id="trilha_sonora"
                placeholder="Ex: Trending TikTok 2024, Música motivacional"
                value={formData.trilha_sonora || ''}
                onChange={(e) => setFormData({ ...formData, trilha_sonora: e.target.value })}
              />
            </div>
          </>
        )}

        {/* E) REELS INSTAGRAM */}
        {isReelsInstagram && (
          <>
            <div className="space-y-2">
              <Label htmlFor="duracao_segundos">Duração (segundos)</Label>
              <Input
                id="duracao_segundos"
                type="number"
                min={7}
                max={90}
                placeholder="7-90s"
                value={formData.duracao_segundos || ''}
                onChange={(e) => setFormData({ ...formData, duracao_segundos: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hook_inicial">Hook Inicial (Primeiros 3s)</Label>
              <Input
                id="hook_inicial"
                placeholder="Ex: 'Você NÃO vai acreditar nisso...'"
                value={formData.hook_inicial || ''}
                onChange={(e) => setFormData({ ...formData, hook_inicial: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">O gancho que vai prender a atenção</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gancho_problema">Gancho/Problema</Label>
              <Textarea
                id="gancho_problema"
                placeholder="Qual problema/dor que será abordado?"
                value={formData.gancho_problema || ''}
                onChange={(e) => setFormData({ ...formData, gancho_problema: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="solucao_apresentada">Solução Apresentada</Label>
              <Textarea
                id="solucao_apresentada"
                placeholder="Como seu produto/serviço resolve o problema?"
                value={formData.solucao_apresentada || ''}
                onChange={(e) => setFormData({ ...formData, solucao_apresentada: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trending_audio">Usar Trending Audio?</Label>
              <Select
                value={formData.trending_audio || 'sim'}
                onValueChange={(value) => setFormData({ ...formData, trending_audio: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sim">Sim (recomendado)</SelectItem>
                  <SelectItem value="nao">Não</SelectItem>
                  <SelectItem value="indiferente">Indiferente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="legendas">Legendas</Label>
              <Select
                value={formData.legendas || 'obrigatorio'}
                onValueChange={(value) => setFormData({ ...formData, legendas: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="obrigatorio">Obrigatório</SelectItem>
                  <SelectItem value="opcional">Opcional</SelectItem>
                  <SelectItem value="nao">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* F) ROTEIRO REELS */}
        {isRoteiroReels && (
          <>
            <div className="space-y-2">
              <Label htmlFor="duracao_estimada">Duração Estimada (segundos)</Label>
              <Input
                id="duracao_estimada"
                type="number"
                min={7}
                max={90}
                placeholder="15-60s"
                value={formData.duracao_estimada || ''}
                onChange={(e) => setFormData({ ...formData, duracao_estimada: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gancho_roteiro">Gancho (Hook)</Label>
              <Textarea
                id="gancho_roteiro"
                placeholder="Primeira frase/cena que prende a atenção..."
                value={formData.gancho_roteiro || ''}
                onChange={(e) => setFormData({ ...formData, gancho_roteiro: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desenvolvimento_roteiro">Desenvolvimento</Label>
              <Textarea
                id="desenvolvimento_roteiro"
                placeholder="Descreva o meio do vídeo..."
                value={formData.desenvolvimento_roteiro || ''}
                onChange={(e) => setFormData({ ...formData, desenvolvimento_roteiro: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desfecho_cta">Desfecho/CTA</Label>
              <Textarea
                id="desfecho_cta"
                placeholder="Como o vídeo termina? Qual a chamada final?"
                value={formData.desfecho_cta || ''}
                onChange={(e) => setFormData({ ...formData, desfecho_cta: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="locacoes_necessarias">Locações Necessárias</Label>
              <Input
                id="locacoes_necessarias"
                placeholder="Ex: Estúdio, Externa - Parque, Casa..."
                value={formData.locacoes_necessarias || ''}
                onChange={(e) => setFormData({ ...formData, locacoes_necessarias: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipamentos_sugeridos">Equipamentos Sugeridos</Label>
              <Input
                id="equipamentos_sugeridos"
                placeholder="Ex: Câmera DSLR, Gimbal, Iluminação..."
                value={formData.equipamentos_sugeridos || ''}
                onChange={(e) => setFormData({ ...formData, equipamentos_sugeridos: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">O filmmaker reservará os equipamentos na Agenda de Captação</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes_captacao">Observações de Captação</Label>
              <Textarea
                id="observacoes_captacao"
                placeholder="Detalhes importantes para a gravação..."
                value={formData.observacoes_captacao || ''}
                onChange={(e) => setFormData({ ...formData, observacoes_captacao: e.target.value })}
                rows={2}
              />
            </div>
          </>
        )}

        {/* G) STORIES INTERATIVO */}
        {isStories && (
          <>
            <div className="space-y-2">
              <Label htmlFor="duracao_segundos">Duração (segundos)</Label>
              <Input
                id="duracao_segundos"
                type="number"
                min={7}
                max={15}
                placeholder="7-15s"
                value={formData.duracao_segundos || ''}
                onChange={(e) => setFormData({ ...formData, duracao_segundos: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_interacao">Tipo de Interação</Label>
              <Select
                value={formData.tipo_interacao || 'enquete'}
                onValueChange={(value) => setFormData({ ...formData, tipo_interacao: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enquete">📊 Enquete</SelectItem>
                  <SelectItem value="quiz">🎯 Quiz</SelectItem>
                  <SelectItem value="pergunta">❓ Caixa de Perguntas</SelectItem>
                  <SelectItem value="swipe_up">👆 Swipe Up</SelectItem>
                  <SelectItem value="contador">⏱️ Contagem Regressiva</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {['enquete', 'quiz', 'pergunta'].includes(formData.tipo_interacao || '') && (
              <div className="space-y-2">
                <Label htmlFor="texto_pergunta">Texto da Pergunta/Enquete</Label>
                <Input
                  id="texto_pergunta"
                  placeholder="Ex: 'Qual você prefere?', 'Você sabia?'"
                  value={formData.texto_pergunta || ''}
                  onChange={(e) => setFormData({ ...formData, texto_pergunta: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="swipe_up" className="flex items-center gap-2">
                <span>👆</span> Link Externo (Swipe Up)?
              </Label>
              <Select
                value={formData.swipe_up || 'nao'}
                onValueChange={(value) => setFormData({ ...formData, swipe_up: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sim">Sim</SelectItem>
                  <SelectItem value="nao">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.swipe_up === 'sim' && (
              <div className="space-y-2">
                <Label htmlFor="link_swipe_up">URL do Link</Label>
                <Input
                  id="link_swipe_up"
                  type="url"
                  placeholder="https://..."
                  value={formData.link_swipe_up || ''}
                  onChange={(e) => setFormData({ ...formData, link_swipe_up: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="musica_fundo">Música de Fundo</Label>
              <Input
                id="musica_fundo"
                placeholder="Ex: Trending, Upbeat, Chill..."
                value={formData.musica_fundo || ''}
                onChange={(e) => setFormData({ ...formData, musica_fundo: e.target.value })}
              />
            </div>
          </>
        )}

        {/* H) PLANEJAMENTO ESTRATÉGICO */}
        {isPlanejamentoEstrategico && (
          <>
            <div className="space-y-2">
              <Label htmlFor="objetivo_negocio">Objetivo de Negócio</Label>
              <Textarea
                id="objetivo_negocio"
                placeholder="Ex: Aumentar vendas em 30%, Lançar novo produto..."
                value={formData.objetivo_negocio || ''}
                onChange={(e) => setFormData({ ...formData, objetivo_negocio: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="periodo_vigencia">Período de Vigência</Label>
              <Input
                id="periodo_vigencia"
                placeholder="Ex: Janeiro a Março 2025"
                value={formData.periodo_vigencia || ''}
                onChange={(e) => setFormData({ ...formData, periodo_vigencia: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pilares_conteudo">Pilares de Conteúdo (3-5)</Label>
              <Textarea
                id="pilares_conteudo"
                placeholder="Ex: 1. Educacional | 2. Inspiracional | 3. Promocional | 4. Bastidores | 5. Depoimentos"
                value={formData.pilares_conteudo || ''}
                onChange={(e) => setFormData({ ...formData, pilares_conteudo: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kpis_esperados">KPIs Esperados</Label>
              <Textarea
                id="kpis_esperados"
                placeholder="Ex: 10k seguidores, 5% engajamento, 100 leads..."
                value={formData.kpis_esperados || ''}
                onChange={(e) => setFormData({ ...formData, kpis_esperados: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget_sugerido">Budget Sugerido</Label>
              <Input
                id="budget_sugerido"
                placeholder="Ex: R$ 5.000/mês"
                value={formData.budget_sugerido || ''}
                onChange={(e) => setFormData({ ...formData, budget_sugerido: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="concorrentes_principais">Concorrentes Principais</Label>
              <Input
                id="concorrentes_principais"
                placeholder="Ex: Empresa A, Empresa B, Empresa C"
                value={formData.concorrentes_principais || ''}
                onChange={(e) => setFormData({ ...formData, concorrentes_principais: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diferenciais_explorar">Diferenciais a Explorar</Label>
              <Textarea
                id="diferenciais_explorar"
                placeholder="O que diferencia a marca da concorrência?"
                value={formData.diferenciais_explorar || ''}
                onChange={(e) => setFormData({ ...formData, diferenciais_explorar: e.target.value })}
                rows={2}
              />
            </div>
          </>
        )}

        {/* I) DATAS COMEMORATIVAS */}
        {isDatasComemoratvas && (
          <>
            <div className="space-y-2">
              <Label htmlFor="data_evento">Data/Evento</Label>
              <Input
                id="data_evento"
                placeholder="Ex: Dia das Mães - 12/05"
                value={formData.data_evento || ''}
                onChange={(e) => setFormData({ ...formData, data_evento: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="angle_abordagem">Angle/Abordagem</Label>
              <Textarea
                id="angle_abordagem"
                placeholder="Qual ângulo usar para essa data? Ex: Emotivo, Promocional, Educativo..."
                value={formData.angle_abordagem || ''}
                onChange={(e) => setFormData({ ...formData, angle_abordagem: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conexao_marca">Conexão com a Marca</Label>
              <Textarea
                id="conexao_marca"
                placeholder="Como a data se relaciona com a marca/produto?"
                value={formData.conexao_marca || ''}
                onChange={(e) => setFormData({ ...formData, conexao_marca: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="formatos_sugeridos">Formatos Sugeridos</Label>
              <Input
                id="formatos_sugeridos"
                placeholder="Ex: Card + Reels + Stories"
                value={formData.formatos_sugeridos || ''}
                onChange={(e) => setFormData({ ...formData, formatos_sugeridos: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hashtags_trending">Hashtags Trending</Label>
              <Input
                id="hashtags_trending"
                placeholder="Ex: #DiadasMaes, #MaesSaoTudo, #Amor"
                value={formData.hashtags_trending || ''}
                onChange={(e) => setFormData({ ...formData, hashtags_trending: e.target.value })}
              />
            </div>
          </>
        )}

        {/* J) TRÁFEGO PAGO */}
        {isTrafegoPago && (
          <>
            <div className="space-y-2">
              <Label htmlFor="objetivo_campanha">Objetivo da Campanha</Label>
              <Select
                value={formData.objetivo_campanha || 'conversao'}
                onValueChange={(value) => setFormData({ ...formData, objetivo_campanha: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conversao">💰 Conversão/Vendas</SelectItem>
                  <SelectItem value="engajamento">❤️ Engajamento</SelectItem>
                  <SelectItem value="alcance">📢 Alcance/Awareness</SelectItem>
                  <SelectItem value="trafego">🔗 Tráfego para Site</SelectItem>
                  <SelectItem value="leads">📧 Geração de Leads</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="publico_detalhado">Público-Alvo Detalhado</Label>
              <Textarea
                id="publico_detalhado"
                placeholder="Ex: Mulheres, 25-40 anos, São Paulo, interesse em fitness e bem-estar..."
                value={formData.publico_detalhado || formData.publico_alvo || ''}
                onChange={(e) => setFormData({ ...formData, publico_detalhado: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orcamento_disponivel">Orçamento Disponível</Label>
              <Input
                id="orcamento_disponivel"
                placeholder="Ex: R$ 500/dia ou R$ 5.000/mês"
                value={formData.orcamento_disponivel || ''}
                onChange={(e) => setFormData({ ...formData, orcamento_disponivel: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plataforma_ads">Plataforma</Label>
              <Select
                value={formData.plataforma_ads || 'meta'}
                onValueChange={(value) => setFormData({ ...formData, plataforma_ads: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meta">Meta Ads (Facebook/Instagram)</SelectItem>
                  <SelectItem value="google">Google Ads</SelectItem>
                  <SelectItem value="tiktok">TikTok Ads</SelectItem>
                  <SelectItem value="linkedin">LinkedIn Ads</SelectItem>
                  <SelectItem value="multiplas">Múltiplas Plataformas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duracao_campanha">Duração da Campanha</Label>
              <Input
                id="duracao_campanha"
                placeholder="Ex: 15 dias, 1 mês, contínuo..."
                value={formData.duracao_campanha || ''}
                onChange={(e) => setFormData({ ...formData, duracao_campanha: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="copy_anuncio">Copy do Anúncio</Label>
              <Textarea
                id="copy_anuncio"
                placeholder="Texto que será usado no anúncio..."
                value={formData.copy_anuncio || ''}
                onChange={(e) => setFormData({ ...formData, copy_anuncio: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link_destino">Link de Destino</Label>
              <Input
                id="link_destino"
                type="url"
                placeholder="https://..."
                value={formData.link_destino || ''}
                onChange={(e) => setFormData({ ...formData, link_destino: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kpis_campanha">KPIs Esperados</Label>
              <Textarea
                id="kpis_campanha"
                placeholder="Ex: CPC abaixo de R$ 2, CTR > 3%, 100 conversões..."
                value={formData.kpis_campanha || ''}
                onChange={(e) => setFormData({ ...formData, kpis_campanha: e.target.value })}
                rows={2}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}