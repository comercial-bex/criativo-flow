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
        {/* Objective */}
        <div className="space-y-2">
          <Label htmlFor="objetivo" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Objetivo da Postagem *
          </Label>
          <Textarea
            id="objetivo"
            value={formData.objetivo_postagem}
            onChange={(e) => setFormData({ ...formData, objetivo_postagem: e.target.value })}
            placeholder="Ex: Aumentar engajamento e gerar leads para o produto X"
            required
            rows={2}
          />
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

        {/* Campos específicos por tipo de conteúdo */}
        {isCarrossel && (
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
        )}

        {isVideo && (
          <>
            <div className="space-y-2">
              <Label htmlFor="duracao_segundos" className="flex items-center gap-2">
                <span>⏱️</span> Duração (segundos)
              </Label>
              <Input
                id="duracao_segundos"
                type="number"
                min={7}
                max={90}
                placeholder={isStories ? "7-15s" : "15-60s"}
                value={formData.duracao_segundos || ''}
                onChange={(e) => setFormData({ ...formData, duracao_segundos: e.target.value })}
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

        {isStories && (
          <>
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
          </>
        )}

        {isCartela && (
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
        )}
      </CardContent>
    </Card>
  );
}