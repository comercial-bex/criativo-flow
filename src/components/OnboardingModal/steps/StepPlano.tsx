import { StepProps } from '../types';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Target, TrendingUp, Plus, X, Sparkles, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { smartToast } from '@/lib/smart-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useProdutosCatalogo, type ProdutoCatalogo } from '@/hooks/useProdutosCatalogo';
import { supabase } from '@/integrations/supabase/client';

export function StepPlano({ formData, setFormData }: StepProps) {
  const { produtos: assinaturas } = useProdutosCatalogo({ 
    tipo: 'plano_assinatura',
    ativo: true 
  });
  const [novaCampanha, setNovaCampanha] = useState({ mes: 1, nome: '', tipo: 'promocional' as const, descricao: '' });
  const [suggeringCampaigns, setSuggeringCampaigns] = useState(false);

  const areasFocoOptions = [
    { value: 'vendas', label: '💰 Vendas e Conversão', description: 'Aumentar vendas diretas e taxas de conversão' },
    { value: 'branding', label: '🎨 Branding e Reconhecimento', description: 'Fortalecer identidade e awareness da marca' },
    { value: 'engajamento', label: '❤️ Engajamento e Comunidade', description: 'Criar conexão e interação com audiência' },
    { value: 'trafego', label: '📈 Tráfego e Alcance', description: 'Aumentar visitantes e impressões' },
    { value: 'retencao', label: '🔄 Retenção de Clientes', description: 'Manter clientes atuais engajados' },
    { value: 'lancamento', label: '🚀 Lançamento de Produtos', description: 'Estratégias para novos produtos/serviços' },
  ];

  const toggleAreaFoco = (area: string) => {
    const current = formData.areas_foco || [];
    const updated = current.includes(area)
      ? current.filter(a => a !== area)
      : [...current, area];
    setFormData({ ...formData, areas_foco: updated });
  };

  const adicionarCampanha = () => {
    if (!novaCampanha.nome) return;
    
    const campanhas = formData.campanhas_mensais || [];
    setFormData({
      ...formData,
      campanhas_mensais: [...campanhas, { ...novaCampanha }]
    });
    setNovaCampanha({ mes: 1, nome: '', tipo: 'promocional', descricao: '' });
  };

  const removerCampanha = (index: number) => {
    const campanhas = formData.campanhas_mensais || [];
    setFormData({
      ...formData,
      campanhas_mensais: campanhas.filter((_, i) => i !== index)
    });
  };

  const sugerirCampanhas = async () => {
    if (!formData.localizacao || !formData.segmento_atuacao || !formData.duracao_contrato_meses) {
      smartToast.error('Preencha localização, segmento e duração do contrato primeiro');
      return;
    }

    setSuggeringCampaigns(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('suggest-campaigns', {
        body: {
          localizacao: formData.localizacao,
          segmento: formData.segmento_atuacao,
          duracao_meses: formData.duracao_contrato_meses
        }
      });

      if (error) throw error;

      if (data.success && data.campanhas) {
        setFormData({
          ...formData,
          campanhas_mensais: data.campanhas
        });
        smartToast.success('Campanhas sugeridas!', `${data.campanhas.length} campanhas adicionadas`);
      } else {
        throw new Error(data.error || 'Erro ao sugerir campanhas');
      }
    } catch (error: any) {
      console.error('Erro ao sugerir campanhas:', error);
      smartToast.error('Erro ao sugerir campanhas', error.message || 'Tente novamente');
    } finally {
      setSuggeringCampaigns(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Calendar className="w-12 h-12 mx-auto mb-3 text-primary" />
        <h3 className="text-2xl font-bold">Plano de Trabalho</h3>
        <p className="text-muted-foreground mt-2">
          Defina a duração, áreas de foco e campanhas sazonais. Quanto mais detalhes, melhor será o plano estratégico gerado pela IA.
        </p>
      </div>

      {/* Duração do Contrato */}
      <div className="space-y-3">
        <Label className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Duração do Contrato
        </Label>
        <RadioGroup
          value={formData.duracao_contrato_meses?.toString()}
          onValueChange={(value) => setFormData({ ...formData, duracao_contrato_meses: parseInt(value) as 3 | 6 | 12 })}
          className="grid grid-cols-3 gap-4"
        >
          {[
            { value: 3, label: '3 meses', desc: 'Teste inicial' },
            { value: 6, label: '6 meses', desc: 'Bom balanço' },
            { value: 12, label: '12 meses', desc: 'Resultados sólidos' }
          ].map(({ value, label, desc }) => (
            <label
              key={value}
              className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.duracao_contrato_meses === value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <RadioGroupItem value={value.toString()} className="sr-only" />
              <span className="font-bold text-lg">{label}</span>
              <span className="text-sm text-muted-foreground">{desc}</span>
            </label>
          ))}
        </RadioGroup>
      </div>

      {/* Plano/Assinatura */}
      <div className="space-y-3">
        <Label htmlFor="assinatura">Plano de Posts</Label>
        <Select
          value={formData.assinatura_id}
          onValueChange={(value) => setFormData({ ...formData, assinatura_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o plano de posts" />
          </SelectTrigger>
          <SelectContent>
            {assinaturas.map(ass => (
              <SelectItem key={ass.id} value={ass.id}>
                {ass.nome} - {ass.posts_mensais || 0} posts/mês
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Áreas de Foco */}
      <div className="space-y-3">
        <Label className="text-lg font-semibold flex items-center gap-2">
          <Target className="w-5 h-5" />
          Áreas de Foco (selecione 2-4)
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {areasFocoOptions.map(({ value, label, description }) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleAreaFoco(value)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                formData.areas_foco?.includes(value)
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="font-semibold">{label}</div>
              <div className="text-sm text-muted-foreground mt-1">{description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Campanhas Mensais */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-lg font-semibold">Campanhas Sazonais (Opcional)</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Adicione campanhas importantes como Black Friday, Natal, etc. A IA irá incorporá-las no cronograma de ações.
            </p>
          </div>
          <Button
            type="button"
            onClick={sugerirCampanhas}
            disabled={suggeringCampaigns || !formData.localizacao || !formData.segmento_atuacao || !formData.duracao_contrato_meses}
            variant="outline"
          >
            {suggeringCampaigns ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Sugerir Campanhas
              </>
            )}
          </Button>
        </div>

        {(!formData.localizacao || !formData.segmento_atuacao || !formData.duracao_contrato_meses) && (
          <Alert>
            <AlertDescription className="text-xs">
              Para gerar sugestões inteligentes, complete os dados de <strong>Empresa</strong> (Step 1) e selecione a <strong>duração do contrato</strong> acima.
            </AlertDescription>
          </Alert>
        )}

        {/* Lista de campanhas adicionadas */}
        {formData.campanhas_mensais && formData.campanhas_mensais.length > 0 && (
          <div className="space-y-2 mb-4">
            {formData.campanhas_mensais.map((camp, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <span className="font-semibold">Mês {camp.mes}: {camp.nome}</span>
                  <span className="text-sm text-muted-foreground ml-2">({camp.tipo})</span>
                  {camp.descricao && <p className="text-sm text-muted-foreground">{camp.descricao}</p>}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removerCampanha(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Formulário para adicionar nova campanha */}
        <div className="grid grid-cols-12 gap-2 p-4 border rounded-lg">
          <div className="col-span-2">
            <Input
              type="number"
              placeholder="Mês"
              min="1"
              max={formData.duracao_contrato_meses || 12}
              value={novaCampanha.mes}
              onChange={(e) => setNovaCampanha({ ...novaCampanha, mes: parseInt(e.target.value) || 1 })}
            />
          </div>
          <div className="col-span-4">
            <Input
              placeholder="Nome da campanha"
              value={novaCampanha.nome}
              onChange={(e) => setNovaCampanha({ ...novaCampanha, nome: e.target.value })}
            />
          </div>
          <div className="col-span-3">
            <Select
              value={novaCampanha.tipo}
              onValueChange={(value: any) => setNovaCampanha({ ...novaCampanha, tipo: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="promocional">Promocional</SelectItem>
                <SelectItem value="sazonal">Sazonal</SelectItem>
                <SelectItem value="lancamento">Lançamento</SelectItem>
                <SelectItem value="institucional">Institucional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-3">
            <Button
              type="button"
              onClick={adicionarCampanha}
              className="w-full"
              disabled={!novaCampanha.nome}
            >
              <Plus className="w-4 h-4 mr-1" /> Adicionar
            </Button>
          </div>
          <div className="col-span-12">
            <Textarea
              placeholder="Descrição da campanha (opcional)"
              value={novaCampanha.descricao}
              onChange={(e) => setNovaCampanha({ ...novaCampanha, descricao: e.target.value })}
              rows={2}
            />
          </div>
        </div>
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-6">
        <p className="text-sm">
          <strong>💡 Dica:</strong> Quanto mais completo o preenchimento, melhor será a análise da IA. 
          Ela gerará automaticamente: relatório estratégico, metas SMART mensais e cronograma de ações detalhado.
        </p>
      </div>
    </div>
  );
}
