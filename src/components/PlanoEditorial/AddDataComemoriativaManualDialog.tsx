import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, Plus } from 'lucide-react';
import { toast } from '@/lib/toast-compat';
import { supabase } from '@/integrations/supabase/client';

interface AddDataComemoriativaManualDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataCriada: () => void;
}

const REGIOES = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];
const SEGMENTOS = ['Saúde', 'Educação', 'Beleza', 'Moda', 'Tecnologia', 'Alimentação', 'Fitness', 'Varejo', 'Serviços', 'Imobiliário'];

export function AddDataComemoriativaManualDialog({
  open,
  onOpenChange,
  onDataCriada
}: AddDataComemoriativaManualDialogProps) {
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

  const handleSubmit = async () => {
    // Validações
    if (!formData.nome.trim()) {
      toast.error('Nome da data comemorativa é obrigatório');
      return;
    }
    if (!formData.data_fixa) {
      toast.error('Data é obrigatória');
      return;
    }
    if (formData.tipo === 'regional' && !formData.regiao) {
      toast.error('Selecione uma região');
      return;
    }
    if (formData.tipo === 'segmento' && formData.segmentos.length === 0) {
      toast.error('Selecione ao menos um segmento');
      return;
    }

    setLoading(true);
    try {
      // Extrair dia e mês da data
      const date = new Date(formData.data_fixa);
      const dia = date.getDate();
      const mes = date.getMonth() + 1;
      const dataFixaFormatada = `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}`;

      const { data: userData } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('datas_comemorativas')
        .insert({
          nome: formData.nome.trim(),
          data_fixa: dataFixaFormatada,
          mes_referencia: mes,
          tipo: formData.tipo,
          regiao: formData.tipo === 'regional' ? formData.regiao : null,
          segmentos: formData.tipo === 'segmento' ? formData.segmentos : [],
          descricao: formData.descricao.trim() || null,
          potencial_engajamento: formData.potencial_engajamento,
          sugestao_campanha: formData.sugestao_campanha.trim() || null,
          manual: true,
          created_by: userData.user?.id
        });

      if (error) throw error;

      toast.success('Data comemorativa criada com sucesso!');
      onDataCriada();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error('Erro ao criar data comemorativa:', error);
      toast.error(error.message || 'Erro ao criar data comemorativa');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      data_fixa: '',
      tipo: 'nacional',
      regiao: '',
      segmentos: [],
      descricao: '',
      potencial_engajamento: 'medio',
      sugestao_campanha: ''
    });
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
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Criar Data Comemorativa Manual
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nome da Data */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Data Comemorativa *</Label>
            <Input
              id="nome"
              placeholder="Ex: Aniversário da Loja"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
            />
          </div>

          {/* Data Fixa */}
          <div className="space-y-2">
            <Label htmlFor="data_fixa">Data *</Label>
            <Input
              id="data_fixa"
              type="date"
              value={formData.data_fixa}
              onChange={(e) => setFormData(prev => ({ ...prev, data_fixa: e.target.value }))}
            />
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label>Tipo *</Label>
            <RadioGroup
              value={formData.tipo}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, tipo: value, regiao: '', segmentos: [] }))}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nacional" id="tipo-nacional" />
                <Label htmlFor="tipo-nacional" className="cursor-pointer">🇧🇷 Nacional</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="regional" id="tipo-regional" />
                <Label htmlFor="tipo-regional" className="cursor-pointer">📍 Regional</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="segmento" id="tipo-segmento" />
                <Label htmlFor="tipo-segmento" className="cursor-pointer">🎯 Segmento</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Região (se tipo = regional) */}
          {formData.tipo === 'regional' && (
            <div className="space-y-2">
              <Label htmlFor="regiao">Região *</Label>
              <select
                id="regiao"
                value={formData.regiao}
                onChange={(e) => setFormData(prev => ({ ...prev, regiao: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">Selecione uma região</option>
                {REGIOES.map(regiao => (
                  <option key={regiao} value={regiao}>{regiao}</option>
                ))}
              </select>
            </div>
          )}

          {/* Segmentos (se tipo = segmento) */}
          {formData.tipo === 'segmento' && (
            <div className="space-y-2">
              <Label>Segmentos * (selecione ao menos um)</Label>
              <div className="grid grid-cols-2 gap-3 p-4 border rounded-md bg-muted/30">
                {SEGMENTOS.map(segmento => (
                  <div key={segmento} className="flex items-center space-x-2">
                    <Checkbox
                      id={`segmento-${segmento}`}
                      checked={formData.segmentos.includes(segmento)}
                      onCheckedChange={() => toggleSegmento(segmento)}
                    />
                    <Label htmlFor={`segmento-${segmento}`} className="cursor-pointer text-sm">
                      {segmento}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              placeholder="Descreva a data comemorativa e seu contexto..."
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Potencial de Engajamento */}
          <div className="space-y-2">
            <Label>Potencial de Engajamento *</Label>
            <RadioGroup
              value={formData.potencial_engajamento}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, potencial_engajamento: value }))}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="alto" id="engaj-alto" />
                <Label htmlFor="engaj-alto" className="cursor-pointer">⭐ Alto</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medio" id="engaj-medio" />
                <Label htmlFor="engaj-medio" className="cursor-pointer">📊 Médio</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="baixo" id="engaj-baixo" />
                <Label htmlFor="engaj-baixo" className="cursor-pointer">📉 Baixo</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Sugestão de Campanha */}
          <div className="space-y-2">
            <Label htmlFor="sugestao_campanha">Sugestão de Campanha</Label>
            <Textarea
              id="sugestao_campanha"
              placeholder="Sugestões de como trabalhar essa data na campanha..."
              value={formData.sugestao_campanha}
              onChange={(e) => setFormData(prev => ({ ...prev, sugestao_campanha: e.target.value }))}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>Criando...</>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Criar Data Comemorativa
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
