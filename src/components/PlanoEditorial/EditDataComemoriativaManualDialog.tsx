import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { DataComemorativa } from '@/hooks/useDatasComemoratias';
import { toast } from '@/lib/toast-compat';
import { supabase } from '@/integrations/supabase/client';

interface EditDataComemoriativaManualDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: DataComemorativa | null;
  onDataEditada: () => void;
}

const REGIOES = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];
const SEGMENTOS = ['Saúde', 'Educação', 'Tecnologia', 'Moda', 'Alimentação', 'Beleza', 'Esportes', 'Financeiro'];

export function EditDataComemoriativaManualDialog({
  open,
  onOpenChange,
  data,
  onDataEditada
}: EditDataComemoriativaManualDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    data_fixa: '',
    tipo: 'nacional' as 'nacional' | 'regional' | 'segmento',
    regiao: '',
    segmentos: [] as string[],
    descricao: '',
    potencial_engajamento: 'medio' as 'alto' | 'medio' | 'baixo',
    sugestao_campanha: ''
  });

  useEffect(() => {
    if (data && open) {
      setFormData({
        nome: data.nome,
        data_fixa: data.data_fixa || '',
        tipo: data.tipo,
        regiao: data.regiao || '',
        segmentos: data.segmentos || [],
        descricao: data.descricao || '',
        potencial_engajamento: data.potencial_engajamento,
        sugestao_campanha: data.sugestao_campanha || ''
      });
    }
  }, [data, open]);

  const handleSubmit = async () => {
    if (!data) return;

    if (!formData.nome || !formData.data_fixa) {
      toast.error('Nome e data são obrigatórios');
      return;
    }

    if (formData.tipo === 'regional' && !formData.regiao) {
      toast.error('Selecione a região');
      return;
    }

    if (formData.tipo === 'segmento' && formData.segmentos.length === 0) {
      toast.error('Selecione ao menos um segmento');
      return;
    }

    setLoading(true);

    try {
      const [dia, mes] = formData.data_fixa.split('/');
      
      const { error } = await supabase
        .from('datas_comemorativas')
        .update({
          nome: formData.nome,
          data_fixa: formData.data_fixa,
          mes_referencia: parseInt(mes),
          tipo: formData.tipo,
          regiao: formData.tipo === 'regional' ? formData.regiao : null,
          segmentos: formData.tipo === 'segmento' ? formData.segmentos : [],
          descricao: formData.descricao,
          potencial_engajamento: formData.potencial_engajamento,
          sugestao_campanha: formData.sugestao_campanha
        })
        .eq('id', data.id)
        .eq('manual', true);

      if (error) throw error;

      toast.success('Data comemorativa atualizada com sucesso!');
      onDataEditada();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao atualizar data comemorativa:', error);
      toast.error('Erro ao atualizar data comemorativa');
    } finally {
      setLoading(false);
    }
  };

  const toggleSegmento = (segmento: string) => {
    setFormData(prev => ({
      ...prev,
      segmentos: prev.segmentos.includes(segmento)
        ? prev.segmentos.filter(s => s !== segmento)
        : [...prev.segmentos, segmento]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>✏️ Editar Data Comemorativa Manual</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Data Comemorativa *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Aniversário da Loja"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_fixa">Data Fixa (DD/MM) *</Label>
            <Input
              id="data_fixa"
              value={formData.data_fixa}
              onChange={(e) => setFormData({ ...formData, data_fixa: e.target.value })}
              placeholder="Ex: 15/03"
              maxLength={5}
            />
            <p className="text-xs text-muted-foreground">Formato: DD/MM (dia e mês)</p>
          </div>

          <div className="space-y-2">
            <Label>Tipo *</Label>
            <RadioGroup
              value={formData.tipo}
              onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nacional" id="edit-nacional" />
                <Label htmlFor="edit-nacional" className="cursor-pointer">🇧🇷 Nacional</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="regional" id="edit-regional" />
                <Label htmlFor="edit-regional" className="cursor-pointer">📍 Regional</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="segmento" id="edit-segmento" />
                <Label htmlFor="edit-segmento" className="cursor-pointer">🎯 Segmento Específico</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.tipo === 'regional' && (
            <div className="space-y-2">
              <Label htmlFor="regiao">Região *</Label>
              <select
                id="regiao"
                value={formData.regiao}
                onChange={(e) => setFormData({ ...formData, regiao: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">Selecione a região</option>
                {REGIOES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          )}

          {formData.tipo === 'segmento' && (
            <div className="space-y-2">
              <Label>Segmentos *</Label>
              <div className="grid grid-cols-2 gap-3">
                {SEGMENTOS.map(seg => (
                  <div key={seg} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-seg-${seg}`}
                      checked={formData.segmentos.includes(seg)}
                      onCheckedChange={() => toggleSegmento(seg)}
                    />
                    <Label htmlFor={`edit-seg-${seg}`} className="cursor-pointer">{seg}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descreva a data comemorativa e sua importância"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Potencial de Engajamento</Label>
            <RadioGroup
              value={formData.potencial_engajamento}
              onValueChange={(value: any) => setFormData({ ...formData, potencial_engajamento: value })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="alto" id="edit-alto" />
                <Label htmlFor="edit-alto" className="cursor-pointer">⭐ Alto</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medio" id="edit-medio" />
                <Label htmlFor="edit-medio" className="cursor-pointer">📊 Médio</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="baixo" id="edit-baixo" />
                <Label htmlFor="edit-baixo" className="cursor-pointer">📉 Baixo</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sugestao_campanha">Sugestão de Campanha</Label>
            <Textarea
              id="sugestao_campanha"
              value={formData.sugestao_campanha}
              onChange={(e) => setFormData({ ...formData, sugestao_campanha: e.target.value })}
              placeholder="Ideias de como explorar esta data em campanhas"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
