import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { StepProps } from '../types';

const tomVozOptions = [
  { value: 'formal', label: 'Formal e Profissional' },
  { value: 'amigavel', label: 'Amigável e Próximo' },
  { value: 'descontraido', label: 'Descontraído e Divertido' },
  { value: 'inspirador', label: 'Inspirador e Motivacional' },
  { value: 'educativo', label: 'Educativo e Informativo' },
  { value: 'exclusivo', label: 'Exclusivo e Premium' }
];

export function StepMarca({ formData, setFormData }: StepProps) {
  const handleTomVozCheckbox = (value: string) => {
    const current = formData.tom_voz || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setFormData({ ...formData, tom_voz: updated });
  };

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">✨ Identidade da Marca</h3>
        <p className="text-sm text-muted-foreground">
          Como você quer que sua marca seja percebida e lembrada?
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="historia">História da Marca</Label>
          <Textarea
            id="historia"
            value={formData.historia_marca}
            onChange={(e) => setFormData({ ...formData, historia_marca: e.target.value })}
            placeholder="Ex: Fundada em 2015 por dois irmãos que identificaram uma lacuna no mercado..."
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            Como sua empresa começou? Qual a motivação dos fundadores?
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="valores">Valores Principais *</Label>
          <Textarea
            id="valores"
            value={formData.valores_principais}
            onChange={(e) => setFormData({ ...formData, valores_principais: e.target.value })}
            placeholder="Ex: Transparência, qualidade acima de tudo, valorização das pessoas..."
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Quais princípios e crenças guiam seu negócio?
          </p>
        </div>

        <div className="space-y-3">
          <Label>Tom de Voz da Marca *</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tomVozOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`tom-${option.value}`}
                  checked={formData.tom_voz?.includes(option.value)}
                  onCheckedChange={() => handleTomVozCheckbox(option.value)}
                />
                <label
                  htmlFor={`tom-${option.value}`}
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Como sua marca se comunica com o público? Selecione até 3 opções.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="como_lembrada">Como quer ser lembrada? *</Label>
          <Textarea
            id="como_lembrada"
            value={formData.como_lembrada}
            onChange={(e) => setFormData({ ...formData, como_lembrada: e.target.value })}
            placeholder="Ex: A empresa que sempre entrega no prazo, referência em atendimento..."
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Como você quer que os clientes pensem na sua marca no futuro?
          </p>
        </div>
      </div>
    </div>
  );
}
