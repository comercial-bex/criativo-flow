import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { StepProps } from '../types';

const presencaDigitalOptions = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'site', label: 'Site próprio' },
  { value: 'ecommerce', label: 'E-commerce' }
];

const conteudoOptions = [
  { value: 'fotos', label: 'Fotos/Imagens' },
  { value: 'videos', label: 'Vídeos' },
  { value: 'stories', label: 'Stories' },
  { value: 'reels', label: 'Reels/Shorts' },
  { value: 'blog', label: 'Artigos/Blog' },
  { value: 'lives', label: 'Lives' }
];

export function StepDigital({ formData, setFormData }: StepProps) {
  const handlePresencaCheckbox = (value: string) => {
    const current = formData.presenca_digital || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setFormData({ ...formData, presenca_digital: updated });
  };

  const handleConteudoCheckbox = (value: string) => {
    const current = formData.tipos_conteudo || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setFormData({ ...formData, tipos_conteudo: updated });
  };

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">📱 Presença Digital</h3>
        <p className="text-sm text-muted-foreground">
          Como sua empresa se posiciona no ambiente online?
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <Label>Onde sua empresa está presente? *</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {presencaDigitalOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`presenca-${option.value}`}
                  checked={formData.presenca_digital?.includes(option.value)}
                  onCheckedChange={() => handlePresencaCheckbox(option.value)}
                />
                <label
                  htmlFor={`presenca-${option.value}`}
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Frequência de Postagens</Label>
          <RadioGroup
            value={formData.frequencia_postagens}
            onValueChange={(value) => setFormData({ ...formData, frequencia_postagens: value })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="diaria" id="diaria" />
              <label htmlFor="diaria" className="text-sm cursor-pointer">Diariamente</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3x_semana" id="3x_semana" />
              <label htmlFor="3x_semana" className="text-sm cursor-pointer">3x por semana</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="semanal" id="semanal" />
              <label htmlFor="semanal" className="text-sm cursor-pointer">Semanalmente</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="quinzenal" id="quinzenal" />
              <label htmlFor="quinzenal" className="text-sm cursor-pointer">Quinzenalmente</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rara" id="rara" />
              <label htmlFor="rara" className="text-sm cursor-pointer">Raramente</label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label>Tipos de Conteúdo Produzido</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {conteudoOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`conteudo-${option.value}`}
                  checked={formData.tipos_conteudo?.includes(option.value)}
                  onCheckedChange={() => handleConteudoCheckbox(option.value)}
                />
                <label
                  htmlFor={`conteudo-${option.value}`}
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="midia_paga">Investimento em Mídia Paga</Label>
          <Textarea
            id="midia_paga"
            value={formData.midia_paga}
            onChange={(e) => setFormData({ ...formData, midia_paga: e.target.value })}
            placeholder="Ex: Instagram Ads R$ 500/mês, Google Ads R$ 800/mês, não investe..."
            rows={2}
          />
          <p className="text-xs text-muted-foreground">
            Quanto você investe em anúncios online? Onde anuncia?
          </p>
        </div>
      </div>
    </div>
  );
}
