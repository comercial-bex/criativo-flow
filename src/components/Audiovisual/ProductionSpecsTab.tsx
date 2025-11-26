import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, X, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AudiovisualSpecs {
  tipo_job: 'gravacao' | 'edicao' | 'corte_reels' | 'motion' | 'animacao';
  local?: string;
  data_captacao?: string;
  horario?: string;
  contato_local?: string;
  equipamentos: string[];
  entrega_tipo: string[];
  lut_cliente?: string;
  musica_link?: string;
}

interface ProductionSpecsTabProps {
  tarefaId: string;
  specs?: AudiovisualSpecs;
  onUpdate?: (specs: AudiovisualSpecs) => void;
}

const TIPOS_JOB = [
  { value: 'gravacao', label: '🎬 Gravação' },
  { value: 'edicao', label: '✂️ Edição' },
  { value: 'corte_reels', label: '📱 Corte de Reels' },
  { value: 'motion', label: '🎨 Motion Graphics' },
  { value: 'animacao', label: '✨ Animação' },
];

const EQUIPAMENTOS_DISPONIVEIS = [
  'camera_4k',
  'drone',
  'mic_lapela',
  'mic_shotgun',
  'tripe',
  'gimbal',
  'luz_led',
  'refletor',
  'lente_50mm',
  'lente_24-70mm'
];

const TIPOS_ENTREGA = [
  'vertical_9x16',
  'horizontal_16x9',
  'quadrado_1x1',
  'com_legenda',
  'sem_legenda',
  'curta_60s',
  'longa_3min'
];

export function ProductionSpecsTab({ tarefaId, specs: initialSpecs, onUpdate }: ProductionSpecsTabProps) {
  const { toast } = useToast();
  const [specs, setSpecs] = useState<AudiovisualSpecs>(initialSpecs || {
    tipo_job: 'gravacao',
    equipamentos: [],
    entrega_tipo: []
  });
  const [novoEquipamento, setNovoEquipamento] = useState('');
  const [date, setDate] = useState<Date>();

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
    if (kpis?.audiovisual_specs) {
      const loaded = kpis.audiovisual_specs;
      setSpecs(loaded);
      if (loaded.data_captacao) {
        setDate(new Date(loaded.data_captacao));
      }
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
            audiovisual_specs: {
              ...specs,
              data_captacao: date ? format(date, 'yyyy-MM-dd') : undefined
            }
          }
        })
        .eq('id', tarefaId);

      if (error) throw error;

      toast({ title: 'Especificações de produção salvas!' });
      onUpdate?.(specs);
    } catch (error) {
      console.error('Erro ao salvar especificações:', error);
      toast({ title: 'Erro ao salvar especificações', variant: 'destructive' });
    }
  };

  const toggleEquipamento = (equip: string) => {
    if (specs.equipamentos.includes(equip)) {
      setSpecs({ ...specs, equipamentos: specs.equipamentos.filter(e => e !== equip) });
    } else {
      setSpecs({ ...specs, equipamentos: [...specs.equipamentos, equip] });
    }
  };

  const toggleEntrega = (tipo: string) => {
    if (specs.entrega_tipo.includes(tipo)) {
      setSpecs({ ...specs, entrega_tipo: specs.entrega_tipo.filter(t => t !== tipo) });
    } else {
      setSpecs({ ...specs, entrega_tipo: [...specs.entrega_tipo, tipo] });
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Tipo de Job */}
      <div className="space-y-2">
        <Label>Tipo de Job</Label>
        <Select 
          value={specs.tipo_job} 
          onValueChange={(value: any) => setSpecs({ ...specs, tipo_job: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIPOS_JOB.map(tipo => (
              <SelectItem key={tipo.value} value={tipo.value}>
                {tipo.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Campos específicos de Gravação */}
      {(specs.tipo_job === 'gravacao' || specs.tipo_job === 'corte_reels') && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Local</Label>
              <Input 
                placeholder="Ex: Escritório cliente, Estúdio BEX"
                value={specs.local || ''}
                onChange={(e) => setSpecs({ ...specs, local: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Horário</Label>
              <Input 
                type="time"
                value={specs.horario || ''}
                onChange={(e) => setSpecs({ ...specs, horario: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Data da Captação</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ptBR }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Contato no Local</Label>
            <Input 
              placeholder="Nome e telefone"
              value={specs.contato_local || ''}
              onChange={(e) => setSpecs({ ...specs, contato_local: e.target.value })}
            />
          </div>

          {/* Equipamentos */}
          <div className="space-y-3">
            <Label>Equipamentos Necessários</Label>
            <div className="grid grid-cols-2 gap-2">
              {EQUIPAMENTOS_DISPONIVEIS.map(equip => (
                <Button
                  key={equip}
                  size="sm"
                  variant={specs.equipamentos.includes(equip) ? "default" : "outline"}
                  onClick={() => toggleEquipamento(equip)}
                >
                  {equip.replace(/_/g, ' ')}
                </Button>
              ))}
            </div>
            
            {/* Equipamento customizado */}
            <div className="flex gap-2">
              <Input 
                placeholder="Outro equipamento"
                value={novoEquipamento}
                onChange={(e) => setNovoEquipamento(e.target.value)}
              />
              <Button 
                size="sm" 
                onClick={() => {
                  if (novoEquipamento && !specs.equipamentos.includes(novoEquipamento)) {
                    setSpecs({ ...specs, equipamentos: [...specs.equipamentos, novoEquipamento] });
                    setNovoEquipamento('');
                  }
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Campos de Edição */}
      {(specs.tipo_job === 'edicao' || specs.tipo_job === 'corte_reels' || specs.tipo_job === 'motion') && (
        <>
          <div className="space-y-2">
            <Label>LUT do Cliente (opcional)</Label>
            <Input 
              placeholder="Ex: Sony S-Log3, Canon C-Log"
              value={specs.lut_cliente || ''}
              onChange={(e) => setSpecs({ ...specs, lut_cliente: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Link da Música (opcional)</Label>
            <Input 
              placeholder="Drive link ou Spotify"
              value={specs.musica_link || ''}
              onChange={(e) => setSpecs({ ...specs, musica_link: e.target.value })}
            />
          </div>

          {/* Tipos de Entrega */}
          <div className="space-y-3">
            <Label>Tipos de Entrega</Label>
            <div className="grid grid-cols-2 gap-2">
              {TIPOS_ENTREGA.map(tipo => (
                <Button
                  key={tipo}
                  size="sm"
                  variant={specs.entrega_tipo.includes(tipo) ? "default" : "outline"}
                  onClick={() => toggleEntrega(tipo)}
                >
                  {tipo.replace(/_/g, ' ')}
                </Button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Botão Salvar */}
      <Button onClick={handleSave} className="w-full">
        Salvar Especificações de Produção
      </Button>
    </div>
  );
}
