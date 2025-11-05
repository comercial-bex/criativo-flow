import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, Sparkles, Loader2, TrendingUp, Users, Eye, Check, X } from 'lucide-react';
import { StepProps } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { smartToast } from '@/lib/smart-toast';

interface ConcorrenteForm {
  nome: string;
  site?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  tiktok?: string;
  youtube?: string;
  observacoes?: string;
  analise_ia?: any;
  analisado?: boolean;
}

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

export function StepConcorrencia({ formData }: StepProps) {
  const [concorrentes, setConcorrentes] = useState<ConcorrenteForm[]>([
    { nome: '', analisado: false }
  ]);
  const [analyzing, setAnalyzing] = useState<number | null>(null);

  const handleAddConcorrente = () => {
    if (concorrentes.length < 5) {
      setConcorrentes([...concorrentes, { nome: '', analisado: false }]);
    }
  };

  const handleRemoveConcorrente = (index: number) => {
    setConcorrentes(concorrentes.filter((_, i) => i !== index));
  };

  const handleConcorrenteChange = (index: number, field: keyof ConcorrenteForm, value: string) => {
    const updated = [...concorrentes];
    updated[index] = { ...updated[index], [field]: value };
    setConcorrentes(updated);
  };

  const handleAnalyze = async (index: number) => {
    const conc = concorrentes[index];
    
    if (!conc.nome) {
      smartToast.error('Nome do concorrente é obrigatório');
      return;
    }

    setAnalyzing(index);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-competitor', {
        body: {
          nome: conc.nome,
          site: conc.site,
          instagram: conc.instagram,
          facebook: conc.facebook,
          tiktok: conc.tiktok,
          youtube: conc.youtube,
        }
      });

      if (error) throw error;

      if (data.success) {
        const updated = [...concorrentes];
        updated[index] = {
          ...updated[index],
          analise_ia: data.analise,
          analisado: true
        };
        setConcorrentes(updated);
        smartToast.success('Análise concluída!', `Concorrente "${conc.nome}" analisado com sucesso`);
      } else {
        throw new Error(data.error || 'Erro ao analisar concorrente');
      }
    } catch (error: any) {
      console.error('Erro ao analisar concorrente:', error);
      smartToast.error('Erro ao analisar', error.message || 'Tente novamente');
    } finally {
      setAnalyzing(null);
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">⚔️ Análise de Concorrência</h3>
        <p className="text-sm text-muted-foreground">
          Adicione até 5 concorrentes diretos para análise comparativa de presença digital
        </p>
      </div>

      <Alert>
        <TrendingUp className="h-4 w-4" />
        <AlertDescription className="text-xs">
          <strong>Dica:</strong> Quanto mais links você fornecer, mais precisa será a análise. 
          A IA irá comparar seguidores, engajamento, frequência de posts e diferenciais.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {concorrentes.map((conc, index) => {
          const isValid = conc.nome.length > 0;
          const hasLinks = !!(conc.site || conc.instagram || conc.facebook || conc.linkedin || conc.tiktok || conc.youtube);
          
          return (
            <Card key={index} className={conc.analisado ? 'border-green-500/50 bg-green-500/5' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Concorrente #{index + 1}
                    {conc.analisado && (
                      <span className="ml-2 text-xs text-green-600 font-normal">✓ Analisado</span>
                    )}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveConcorrente(index)}
                    disabled={concorrentes.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor={`conc-nome-${index}`}>Nome do Concorrente *</Label>
                  <Input
                    id={`conc-nome-${index}`}
                    value={conc.nome}
                    onChange={(e) => handleConcorrenteChange(index, 'nome', e.target.value)}
                    placeholder="Ex: Empresa Concorrente LTDA"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor={`conc-site-${index}`}>Site</Label>
                    <div className="relative">
                      <Input
                        id={`conc-site-${index}`}
                        type="url"
                        value={conc.site || ''}
                        onChange={(e) => handleConcorrenteChange(index, 'site', e.target.value)}
                        placeholder="https://www.site.com.br"
                        className={conc.site && !validateUrl(conc.site, 'site') ? 'border-destructive' : ''}
                      />
                      {conc.site && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          {validateUrl(conc.site, 'site') ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`conc-instagram-${index}`}>Instagram</Label>
                    <div className="relative">
                      <Input
                        id={`conc-instagram-${index}`}
                        type="url"
                        value={conc.instagram || ''}
                        onChange={(e) => handleConcorrenteChange(index, 'instagram', e.target.value)}
                        placeholder="https://instagram.com/concorrente"
                        className={conc.instagram && !validateUrl(conc.instagram, 'instagram') ? 'border-destructive' : ''}
                      />
                      {conc.instagram && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          {validateUrl(conc.instagram, 'instagram') ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`conc-facebook-${index}`}>Facebook</Label>
                    <div className="relative">
                      <Input
                        id={`conc-facebook-${index}`}
                        type="url"
                        value={conc.facebook || ''}
                        onChange={(e) => handleConcorrenteChange(index, 'facebook', e.target.value)}
                        placeholder="https://facebook.com/concorrente"
                        className={conc.facebook && !validateUrl(conc.facebook, 'facebook') ? 'border-destructive' : ''}
                      />
                      {conc.facebook && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          {validateUrl(conc.facebook, 'facebook') ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`conc-linkedin-${index}`}>LinkedIn</Label>
                    <div className="relative">
                      <Input
                        id={`conc-linkedin-${index}`}
                        type="url"
                        value={conc.linkedin || ''}
                        onChange={(e) => handleConcorrenteChange(index, 'linkedin', e.target.value)}
                        placeholder="https://linkedin.com/company/concorrente"
                        className={conc.linkedin && !validateUrl(conc.linkedin, 'linkedin') ? 'border-destructive' : ''}
                      />
                      {conc.linkedin && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          {validateUrl(conc.linkedin, 'linkedin') ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`conc-obs-${index}`}>Observações (opcional)</Label>
                  <Textarea
                    id={`conc-obs-${index}`}
                    value={conc.observacoes || ''}
                    onChange={(e) => handleConcorrenteChange(index, 'observacoes', e.target.value)}
                    placeholder="Ex: Principal concorrente local, forte em Instagram..."
                    rows={2}
                  />
                </div>

                <Button
                  onClick={() => handleAnalyze(index)}
                  disabled={!isValid || analyzing === index}
                  className="w-full"
                  variant={conc.analisado ? "outline" : "default"}
                >
                  {analyzing === index ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analisando...
                    </>
                  ) : conc.analisado ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Re-analisar Concorrente
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analisar com IA
                    </>
                  )}
                </Button>

                {conc.analise_ia && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-3">
                    <h4 className="font-semibold text-sm">Análise IA</h4>
                    
                    {conc.analise_ia.seguidores_instagram && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-primary" />
                        <span><strong>Instagram:</strong> {conc.analise_ia.seguidores_instagram} seguidores</span>
                      </div>
                    )}
                    
                    {conc.analise_ia.engajamento && (
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span><strong>Engajamento:</strong> {conc.analise_ia.engajamento}</span>
                      </div>
                    )}
                    
                    {conc.analise_ia.percepcao_visual && (
                      <div className="flex items-center gap-2 text-sm">
                        <Eye className="h-4 w-4 text-primary" />
                        <span><strong>Percepção:</strong> {conc.analise_ia.percepcao_visual}</span>
                      </div>
                    )}

                    {conc.analise_ia.diferenciais && (
                      <div className="text-sm">
                        <strong>Diferenciais:</strong>
                        <p className="text-muted-foreground mt-1">{conc.analise_ia.diferenciais}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button
        onClick={handleAddConcorrente}
        disabled={concorrentes.length >= 5}
        variant="outline"
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Concorrente ({concorrentes.length}/5)
      </Button>
    </div>
  );
}
