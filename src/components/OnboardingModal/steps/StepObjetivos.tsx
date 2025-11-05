import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { StepProps } from '../types';

const resultadosOptions = [
  { value: 'aumentar_vendas', label: 'Aumentar vendas' },
  { value: 'gerar_leads', label: 'Gerar mais leads' },
  { value: 'brand_awareness', label: 'Fortalecer marca' },
  { value: 'engajamento', label: 'Aumentar engajamento' },
  { value: 'trafego', label: 'Aumentar tráfego' },
  { value: 'fidelizacao', label: 'Fidelizar clientes' }
];

export function StepObjetivos({ formData, setFormData }: StepProps) {
  const handleResultadosCheckbox = (value: string) => {
    const current = formData.resultados_esperados || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setFormData({ ...formData, resultados_esperados: updated });
  };

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">🎯 Objetivos e Metas</h3>
        <p className="text-sm text-muted-foreground">
          Onde você quer chegar com seu negócio?
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="objetivos_digitais">Objetivos Digitais *</Label>
          <Textarea
            id="objetivos_digitais"
            value={formData.objetivos_digitais}
            onChange={(e) => setFormData({ ...formData, objetivos_digitais: e.target.value })}
            placeholder="Ex: Aumentar seguidores no Instagram em 50%, gerar 100 leads/mês pelo site..."
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Quais são suas metas relacionadas ao ambiente digital nos próximos 6 meses?
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="objetivos_offline">Objetivos Offline</Label>
          <Textarea
            id="objetivos_offline"
            value={formData.objetivos_offline}
            onChange={(e) => setFormData({ ...formData, objetivos_offline: e.target.value })}
            placeholder="Ex: Abrir uma segunda loja, participar de 3 feiras do setor..."
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Metas relacionadas ao mundo físico/presencial
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="onde_6_meses">Visão de 6 meses *</Label>
          <Textarea
            id="onde_6_meses"
            value={formData.onde_6_meses}
            onChange={(e) => setFormData({ ...formData, onde_6_meses: e.target.value })}
            placeholder="Ex: Ser referência regional no meu segmento, dobrar o faturamento..."
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Como você imagina sua empresa daqui a 6 meses?
          </p>
        </div>

        <div className="space-y-3">
          <Label>Resultados Esperados *</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {resultadosOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`resultado-${option.value}`}
                  checked={formData.resultados_esperados?.includes(option.value)}
                  onCheckedChange={() => handleResultadosCheckbox(option.value)}
                />
                <label
                  htmlFor={`resultado-${option.value}`}
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
