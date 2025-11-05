import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { StepProps } from '../types';

const publicoOptions = [
  { value: 'b2b', label: 'Empresas (B2B)' },
  { value: 'b2c', label: 'Consumidor Final (B2C)' },
  { value: 'jovens', label: 'Jovens (18-25)' },
  { value: 'adultos', label: 'Adultos (26-45)' },
  { value: 'maduros', label: 'Maduros (45+)' },
  { value: 'classes_ab', label: 'Classes A/B' },
  { value: 'classes_cd', label: 'Classes C/D' }
];

export function StepPublico({ formData, setFormData }: StepProps) {
  const handleCheckbox = (value: string) => {
    const current = formData.publico_alvo || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setFormData({ ...formData, publico_alvo: updated });
  };

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">🎯 Público-Alvo</h3>
        <p className="text-sm text-muted-foreground">
          Quem são seus clientes ideais?
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <Label>Perfil do Público *</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {publicoOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={option.value}
                  checked={formData.publico_alvo?.includes(option.value)}
                  onCheckedChange={() => handleCheckbox(option.value)}
                />
                <label
                  htmlFor={option.value}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dores">Dores e Problemas do Cliente *</Label>
          <Textarea
            id="dores"
            value={formData.dores_problemas}
            onChange={(e) => setFormData({ ...formData, dores_problemas: e.target.value })}
            placeholder="Ex: Dificuldade em gerar leads, falta de visibilidade online..."
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Quais problemas seus clientes têm que seu produto/serviço resolve?
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="valorizado">O que é mais valorizado?</Label>
          <Textarea
            id="valorizado"
            value={formData.valorizado}
            onChange={(e) => setFormData({ ...formData, valorizado: e.target.value })}
            placeholder="Ex: Atendimento rápido, qualidade, preço competitivo..."
            rows={2}
          />
          <p className="text-xs text-muted-foreground">
            O que seus clientes mais apreciam ao comprar de você?
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ticket">Ticket Médio</Label>
          <Input
            id="ticket"
            value={formData.ticket_medio}
            onChange={(e) => setFormData({ ...formData, ticket_medio: e.target.value })}
            placeholder="Ex: R$ 500 - R$ 1.000"
          />
          <p className="text-xs text-muted-foreground">
            Valor médio que um cliente gasta por compra/contrato
          </p>
        </div>
      </div>
    </div>
  );
}
