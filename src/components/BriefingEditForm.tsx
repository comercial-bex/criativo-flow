import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { TipoTarefa } from '@/types/tarefa';

interface BriefingEditFormProps {
  tipoTarefa: TipoTarefa;
  briefingData: any;
  onChange: (field: string, value: any) => void;
}

export function BriefingEditForm({ tipoTarefa, briefingData, onChange }: BriefingEditFormProps) {
  const renderCommonFields = () => (
    <>
      <div>
        <Label>Descrição Geral</Label>
        <Textarea
          value={briefingData?.descricao || ''}
          onChange={(e) => onChange('descricao', e.target.value)}
          placeholder="Descreva detalhadamente o que precisa ser feito..."
          rows={4}
        />
      </div>

      <div>
        <Label>Público-Alvo</Label>
        <Textarea
          value={briefingData?.publico_alvo || ''}
          onChange={(e) => onChange('publico_alvo', e.target.value)}
          placeholder="Descreva o público-alvo desta tarefa..."
          rows={3}
        />
      </div>

      <div>
        <Label>Canais de Veiculação</Label>
        <Input
          value={briefingData?.veiculacao?.join(', ') || ''}
          onChange={(e) => onChange('veiculacao', e.target.value.split(',').map((v: string) => v.trim()))}
          placeholder="Instagram, Facebook, LinkedIn..."
        />
      </div>

      <div>
        <Label>Observações Adicionais</Label>
        <Textarea
          value={briefingData?.observacoes || ''}
          onChange={(e) => onChange('observacoes', e.target.value)}
          placeholder="Qualquer informação adicional relevante..."
          rows={3}
        />
      </div>
    </>
  );

  const renderPlanejamentoEstrategicoFields = () => (
    <>
      <div>
        <Label>Objetivo da Campanha *</Label>
        <Textarea
          value={briefingData?.objetivo || ''}
          onChange={(e) => onChange('objetivo', e.target.value)}
          placeholder="Qual o objetivo principal desta campanha?"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Data de Início</Label>
          <Input
            type="date"
            value={briefingData?.data_inicio || ''}
            onChange={(e) => onChange('data_inicio', e.target.value)}
          />
        </div>
        <div>
          <Label>Data de Término</Label>
          <Input
            type="date"
            value={briefingData?.data_fim || ''}
            onChange={(e) => onChange('data_fim', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label>KPIs Esperados</Label>
        <Textarea
          value={briefingData?.kpis || ''}
          onChange={(e) => onChange('kpis', e.target.value)}
          placeholder="Engajamento, alcance, conversões, etc..."
          rows={3}
        />
      </div>

      <div>
        <Label>Orçamento Disponível</Label>
        <Input
          type="number"
          value={briefingData?.orcamento || ''}
          onChange={(e) => onChange('orcamento', parseFloat(e.target.value))}
          placeholder="R$ 0,00"
        />
      </div>
    </>
  );

  const renderCriativoFields = () => (
    <>
      <div>
        <Label>Mensagem Principal *</Label>
        <Textarea
          value={briefingData?.mensagem_chave || ''}
          onChange={(e) => onChange('mensagem_chave', e.target.value)}
          placeholder="Qual a mensagem principal que deve ser comunicada?"
          rows={3}
        />
      </div>

      <div>
        <Label>Call to Action (CTA)</Label>
        <Input
          value={briefingData?.call_to_action || ''}
          onChange={(e) => onChange('call_to_action', e.target.value)}
          placeholder="Saiba mais, Compre agora, Inscreva-se..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Dimensões</Label>
          <Select
            value={briefingData?.formato_postagem || ''}
            onValueChange={(v) => onChange('formato_postagem', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quadrado">Quadrado (1:1)</SelectItem>
              <SelectItem value="vertical">Vertical (4:5)</SelectItem>
              <SelectItem value="horizontal">Horizontal (16:9)</SelectItem>
              <SelectItem value="stories">Stories (9:16)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Tom de Voz</Label>
          <Select
            value={briefingData?.tom || ''}
            onValueChange={(v) => onChange('tom', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="descontraido">Descontraído</SelectItem>
              <SelectItem value="corporativo">Corporativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Paleta de Cores</Label>
        <Input
          value={briefingData?.paleta_cores || ''}
          onChange={(e) => onChange('paleta_cores', e.target.value)}
          placeholder="#000000, #FFFFFF, ..."
        />
      </div>

      <div>
        <Label>Referências Visuais (URLs)</Label>
        <Textarea
          value={briefingData?.referencias_visuais?.join('\n') || ''}
          onChange={(e) => onChange('referencias_visuais', e.target.value.split('\n').filter(Boolean))}
          placeholder="Cole os links de referência, um por linha..."
          rows={4}
        />
      </div>
    </>
  );

  const renderRoteiroReelsFields = () => (
    <>
      <div>
        <Label>Conceito do Vídeo *</Label>
        <Textarea
          value={briefingData?.objetivo_postagem || ''}
          onChange={(e) => onChange('objetivo_postagem', e.target.value)}
          placeholder="Descreva o conceito criativo do vídeo..."
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Duração Esperada</Label>
          <Select
            value={briefingData?.duracao || ''}
            onValueChange={(v) => onChange('duracao', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15s">15 segundos</SelectItem>
              <SelectItem value="30s">30 segundos</SelectItem>
              <SelectItem value="60s">60 segundos</SelectItem>
              <SelectItem value="90s">90 segundos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Locução</Label>
          <Select
            value={briefingData?.locucao || ''}
            onValueChange={(v) => onChange('locucao', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sim">Sim</SelectItem>
              <SelectItem value="nao">Não</SelectItem>
              <SelectItem value="depende">Depende</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Trilha Sonora</Label>
        <Input
          value={briefingData?.trilha_sonora || ''}
          onChange={(e) => onChange('trilha_sonora', e.target.value)}
          placeholder="Estilo musical, mood, referências..."
        />
      </div>

      <div>
        <Label>Legendas</Label>
        <Select
          value={briefingData?.legendas || ''}
          onValueChange={(v) => onChange('legendas', v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sim">Sim, obrigatório</SelectItem>
            <SelectItem value="nao">Não necessário</SelectItem>
            <SelectItem value="opcional">Opcional</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Ambiente/Locação</Label>
        <Input
          value={briefingData?.ambiente || ''}
          onChange={(e) => onChange('ambiente', e.target.value)}
          placeholder="Interno, externo, estúdio..."
        />
      </div>
    </>
  );

  const renderFeedPostFields = () => (
    <>
      <div>
        <Label>Copy do Post *</Label>
        <Textarea
          value={briefingData?.copy_post || ''}
          onChange={(e) => onChange('copy_post', e.target.value)}
          placeholder="Escreva ou descreva a copy desejada..."
          rows={6}
        />
      </div>

      <div>
        <Label>Hashtags</Label>
        <Input
          value={briefingData?.hashtags?.join(' ') || ''}
          onChange={(e) => onChange('hashtags', e.target.value.split(' ').filter(Boolean))}
          placeholder="#hashtag1 #hashtag2 #hashtag3"
        />
      </div>

      <div>
        <Label>Tom de Voz</Label>
        <Select
          value={briefingData?.tom || ''}
          onValueChange={(v) => onChange('tom', v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="informativo">Informativo</SelectItem>
            <SelectItem value="inspiracional">Inspiracional</SelectItem>
            <SelectItem value="educativo">Educativo</SelectItem>
            <SelectItem value="promocional">Promocional</SelectItem>
            <SelectItem value="entretenimento">Entretenimento</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Horário Ideal de Publicação</Label>
        <Input
          type="time"
          value={briefingData?.horario_publicacao || ''}
          onChange={(e) => onChange('horario_publicacao', e.target.value)}
        />
      </div>
    </>
  );

  const renderTrafegoPagoFields = () => (
    <>
      <div>
        <Label>Plataforma *</Label>
        <Select
          value={briefingData?.plataforma || ''}
          onValueChange={(v) => onChange('plataforma', v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="google_ads">Google Ads</SelectItem>
            <SelectItem value="meta_ads">Meta Ads (Facebook/Instagram)</SelectItem>
            <SelectItem value="linkedin_ads">LinkedIn Ads</SelectItem>
            <SelectItem value="tiktok_ads">TikTok Ads</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Orçamento Diário</Label>
          <Input
            type="number"
            value={briefingData?.orcamento_diario || ''}
            onChange={(e) => onChange('orcamento_diario', parseFloat(e.target.value))}
            placeholder="R$ 0,00"
          />
        </div>

        <div>
          <Label>Objetivo da Campanha</Label>
          <Select
            value={briefingData?.objetivo_campanha || ''}
            onValueChange={(v) => onChange('objetivo_campanha', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conversao">Conversão</SelectItem>
              <SelectItem value="trafego">Tráfego</SelectItem>
              <SelectItem value="alcance">Alcance</SelectItem>
              <SelectItem value="engajamento">Engajamento</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Segmentação</Label>
        <Textarea
          value={briefingData?.segmentacao || ''}
          onChange={(e) => onChange('segmentacao', e.target.value)}
          placeholder="Idade, localização, interesses, comportamentos..."
          rows={4}
        />
      </div>

      <div>
        <Label>Pixel/Evento de Conversão</Label>
        <Input
          value={briefingData?.pixel_conversao || ''}
          onChange={(e) => onChange('pixel_conversao', e.target.value)}
          placeholder="ID do pixel ou evento..."
        />
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      {/* Campos específicos por tipo */}
      {tipoTarefa === 'planejamento_estrategico' && renderPlanejamentoEstrategicoFields()}
      
      {(tipoTarefa === 'criativo_card' || 
        tipoTarefa === 'criativo_carrossel' || 
        tipoTarefa === 'criativo_cartela') && renderCriativoFields()}
      
      {(tipoTarefa === 'roteiro_reels' || 
        tipoTarefa === 'reels_instagram') && renderRoteiroReelsFields()}
      
      {(tipoTarefa === 'feed_post' || 
        tipoTarefa === 'stories_interativo') && renderFeedPostFields()}
      
      {tipoTarefa === 'trafego_pago' && renderTrafegoPagoFields()}

      {/* Campos comuns para todos os tipos */}
      {renderCommonFields()}
    </div>
  );
}
