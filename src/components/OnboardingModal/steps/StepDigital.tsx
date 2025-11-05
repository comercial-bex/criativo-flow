import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, Check, X } from 'lucide-react';
import { StepProps } from '../types';

const presencaDigitalOptions = [
  { value: 'instagram', label: 'Instagram', linkField: 'link_instagram', placeholder: 'https://instagram.com/sua.empresa' },
  { value: 'facebook', label: 'Facebook', linkField: 'link_facebook', placeholder: 'https://facebook.com/suaempresa' },
  { value: 'linkedin', label: 'LinkedIn', linkField: 'link_linkedin', placeholder: 'https://linkedin.com/company/suaempresa' },
  { value: 'tiktok', label: 'TikTok', linkField: 'link_tiktok', placeholder: 'https://tiktok.com/@suaempresa' },
  { value: 'youtube', label: 'YouTube', linkField: 'link_youtube', placeholder: 'https://youtube.com/@suaempresa' },
  { value: 'site', label: 'Site próprio', linkField: 'link_site', placeholder: 'https://www.seusite.com.br' },
  { value: 'ecommerce', label: 'E-commerce' }
];

const validateUrl = (url: string, platform: string): boolean => {
  if (!url) return true;
  try {
    const urlObj = new URL(url);
    const platformDomains: Record<string, string[]> = {
      instagram: ['instagram.com'],
      facebook: ['facebook.com', 'fb.com'],
      linkedin: ['linkedin.com'],
      tiktok: ['tiktok.com'],
      youtube: ['youtube.com', 'youtu.be'],
      site: []
    };
    
    if (platformDomains[platform]?.length === 0) return true;
    return platformDomains[platform]?.some(domain => urlObj.hostname.includes(domain)) ?? false;
  } catch {
    return false;
  }
};

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
          <Alert className="mb-3">
            <ExternalLink className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Adicione os links das redes sociais para análise automática de métricas e comparação com concorrentes.
            </AlertDescription>
          </Alert>
          <div className="space-y-3">
            {presencaDigitalOptions.map((option) => {
              const isChecked = formData.presenca_digital?.includes(option.value);
              const linkField = option.linkField as keyof typeof formData;
              const linkValue = linkField ? (formData[linkField] as string) || '' : '';
              const isValidUrl = linkField ? validateUrl(linkValue, option.value) : true;
              
              return (
                <div key={option.value} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`presenca-${option.value}`}
                      checked={isChecked}
                      onCheckedChange={() => handlePresencaCheckbox(option.value)}
                    />
                    <label
                      htmlFor={`presenca-${option.value}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                  
                  {isChecked && linkField && (
                    <div className="ml-6 relative">
                      <Input
                        type="url"
                        value={linkValue}
                        onChange={(e) => setFormData({ ...formData, [linkField]: e.target.value })}
                        placeholder={option.placeholder}
                        className={`pr-8 ${linkValue && !isValidUrl ? 'border-destructive' : linkValue && isValidUrl ? 'border-green-500' : ''}`}
                      />
                      {linkValue && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          {isValidUrl ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                      )}
                      {linkValue && !isValidUrl && (
                        <p className="text-xs text-destructive mt-1">
                          URL inválida para {option.label}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="presenca-ecommerce"
                checked={formData.presenca_digital?.includes('ecommerce')}
                onCheckedChange={() => handlePresencaCheckbox('ecommerce')}
              />
              <label htmlFor="presenca-ecommerce" className="text-sm font-medium leading-none cursor-pointer">
                E-commerce
              </label>
            </div>
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
