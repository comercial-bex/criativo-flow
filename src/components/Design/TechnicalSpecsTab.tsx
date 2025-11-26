import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DesignSpecs {
  tipo_peca: string;
  formato: 'retrato' | 'paisagem' | 'quadrado';
  tamanho_px: { width: number; height: number };
  margem_segura_texto: boolean;
  versoes: string[];
}

interface TechnicalSpecsTabProps {
  tarefaId: string;
  specs?: DesignSpecs;
  onUpdate?: (specs: DesignSpecs) => void;
}

const TIPOS_PECA = [
  'CARD_FEED_1080x1350',
  'REELS_9x16', 
  'STORY',
  'ARTE_IMPRESSA_A4',
  'BANNER',
  'THUMBNAIL',
  'CAPA_DESTAQUE',
  'OUTRO'
];

const VERSOES_COMUNS = [
  'com_texto',
  'sem_texto', 
  'com_preco',
  'sem_preco',
  'com_cta',
  'sem_cta'
];

export function TechnicalSpecsTab({ tarefaId, specs: initialSpecs, onUpdate }: TechnicalSpecsTabProps) {
  const { toast } = useToast();
  const [specs, setSpecs] = useState<DesignSpecs>(initialSpecs || {
    tipo_peca: 'CARD_FEED_1080x1350',
    formato: 'retrato',
    tamanho_px: { width: 1080, height: 1350 },
    margem_segura_texto: true,
    versoes: []
  });
  const [novaVersao, setNovaVersao] = useState('');

  useEffect(() => {
    loadSpecs();
  }, [tarefaId]);

  const loadSpecs = async () => {
    const { data } = await supabase
      .from('tarefa')
      .select('kpis')
      .eq('id', tarefaId)
      .single();
    
    const kpis = data?.kpis as any;
    if (kpis?.design_specs) {
      setSpecs(kpis.design_specs);
    }
  };

  const handleSave = async () => {
    try {
      const { data: currentData } = await supabase
        .from('tarefa')
        .select('kpis')
        .eq('id', tarefaId)
        .single();

      const currentKpis = (currentData?.kpis || {}) as any;

      const { error } = await supabase
        .from('tarefa')
        .update({
          kpis: {
            ...currentKpis,
            design_specs: specs
          }
        })
        .eq('id', tarefaId);

      if (error) throw error;

      toast({ title: 'Especificações salvas com sucesso!' });
      onUpdate?.(specs);
    } catch (error) {
      console.error('Erro ao salvar especificações:', error);
      toast({ title: 'Erro ao salvar especificações', variant: 'destructive' });
    }
  };

  const adicionarVersao = () => {
    if (novaVersao && !specs.versoes.includes(novaVersao)) {
      setSpecs({ ...specs, versoes: [...specs.versoes, novaVersao] });
      setNovaVersao('');
    }
  };

  const removerVersao = (versao: string) => {
    setSpecs({ ...specs, versoes: specs.versoes.filter(v => v !== versao) });
  };

  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Tipo de Peça */}
        <div className="space-y-2">
          <Label>Tipo de Peça</Label>
          <Select 
            value={specs.tipo_peca} 
            onValueChange={(value) => setSpecs({ ...specs, tipo_peca: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_PECA.map(tipo => (
                <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Formato */}
        <div className="space-y-2">
          <Label>Formato</Label>
          <Select 
            value={specs.formato} 
            onValueChange={(value: any) => setSpecs({ ...specs, formato: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="retrato">Retrato (9:16)</SelectItem>
              <SelectItem value="paisagem">Paisagem (16:9)</SelectItem>
              <SelectItem value="quadrado">Quadrado (1:1)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tamanho */}
        <div className="space-y-2">
          <Label>Largura (px)</Label>
          <Input 
            type="number"
            value={specs.tamanho_px.width}
            onChange={(e) => setSpecs({ 
              ...specs, 
              tamanho_px: { ...specs.tamanho_px, width: parseInt(e.target.value) }
            })}
          />
        </div>

        <div className="space-y-2">
          <Label>Altura (px)</Label>
          <Input 
            type="number"
            value={specs.tamanho_px.height}
            onChange={(e) => setSpecs({ 
              ...specs, 
              tamanho_px: { ...specs.tamanho_px, height: parseInt(e.target.value) }
            })}
          />
        </div>
      </div>

      {/* Margem Segura */}
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="margem"
          checked={specs.margem_segura_texto}
          onCheckedChange={(checked) => setSpecs({ ...specs, margem_segura_texto: checked as boolean })}
        />
        <Label htmlFor="margem">Aplicar margem segura de texto</Label>
      </div>

      {/* Versões */}
      <div className="space-y-3">
        <Label>Versões Necessárias</Label>
        
        {/* Versões comuns (quick add) */}
        <div className="flex flex-wrap gap-2">
          {VERSOES_COMUNS.map(versao => (
            <Button
              key={versao}
              size="sm"
              variant={specs.versoes.includes(versao) ? "default" : "outline"}
              onClick={() => {
                if (specs.versoes.includes(versao)) {
                  removerVersao(versao);
                } else {
                  setSpecs({ ...specs, versoes: [...specs.versoes, versao] });
                }
              }}
            >
              {versao.replace(/_/g, ' ')}
            </Button>
          ))}
        </div>

        {/* Versões adicionadas */}
        {specs.versoes.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {specs.versoes.map(versao => (
              <Badge key={versao} variant="secondary" className="gap-1">
                {versao.replace(/_/g, ' ')}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removerVersao(versao)}
                />
              </Badge>
            ))}
          </div>
        )}

        {/* Adicionar versão customizada */}
        <div className="flex gap-2">
          <Input 
            placeholder="Versão customizada (ex: com_logo_cliente)"
            value={novaVersao}
            onChange={(e) => setNovaVersao(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && adicionarVersao()}
          />
          <Button size="sm" onClick={adicionarVersao}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Botão Salvar */}
      <Button onClick={handleSave} className="w-full">
        Salvar Especificações
      </Button>
    </div>
  );
}
