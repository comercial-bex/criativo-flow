import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2, Sparkles, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { bexThemeV3 } from "@/styles/bex-theme";

interface ConcorrenteData {
  id?: string;
  nome: string;
  site?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  linkedin?: string;
  observacoes?: string;
  analise_ia?: any;
  analisado_em?: string;
}

interface ConcorrenteCardProps {
  index: number;
  data: ConcorrenteData;
  onChange: (index: number, data: ConcorrenteData) => void;
  onRemove: (index: number) => void;
  clienteId: string;
}

export function ConcorrenteCard({ 
  index, 
  data, 
  onChange, 
  onRemove,
  clienteId 
}: ConcorrenteCardProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [showAnalise, setShowAnalise] = useState(false);

  const handleAnalyze = async () => {
    if (!data.nome) {
      toast.error('Nome do concorrente é obrigatório');
      return;
    }

    setAnalyzing(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('analyze-competitor', {
        body: {
          nome: data.nome,
          site: data.site,
          instagram: data.instagram,
          facebook: data.facebook,
          tiktok: data.tiktok,
          youtube: data.youtube,
        }
      });

      if (error) throw error;

      if (result.success) {
        onChange(index, {
          ...data,
          analise_ia: result.analise,
          analisado_em: result.timestamp
        });

        if (data.id) {
          await supabase
            .from('concorrentes_analise')
            .update({
              analise_ia: result.analise,
              analisado_em: result.timestamp,
              updated_at: new Date().toISOString()
            })
            .eq('id', data.id);
        } else {
          const { data: inserted } = await supabase
            .from('concorrentes_analise')
            .insert({
              cliente_id: clienteId,
              nome: data.nome,
              site: data.site,
              instagram: data.instagram,
              facebook: data.facebook,
              tiktok: data.tiktok,
              youtube: data.youtube,
              linkedin: data.linkedin,
              observacoes: data.observacoes,
              analise_ia: result.analise,
              analisado_em: result.timestamp
            })
            .select()
            .single();

          if (inserted) {
            onChange(index, { ...data, id: inserted.id });
          }
        }

        toast.success('Análise IA concluída!');
        setShowAnalise(true);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Erro ao analisar concorrente:', error);
      toast.error(error.message || 'Erro ao analisar concorrente');
    } finally {
      setAnalyzing(false);
    }
  };

  const hasAnalise = data.analise_ia && Object.keys(data.analise_ia).length > 0;

  return (
    <Card 
      className="relative overflow-hidden transition-all hover:shadow-lg border-primary/20"
      style={{
        background: `linear-gradient(135deg, ${bexThemeV3.colors.surface} 0%, ${bexThemeV3.colors.surfaceHover} 100%)`,
        fontFamily: bexThemeV3.typography.body
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Concorrente #{index + 1}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="hover:bg-danger/10"
            style={{ color: bexThemeV3.colors.danger }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Nome do Concorrente *</Label>
          <Input
            value={data.nome}
            onChange={(e) => onChange(index, { ...data, nome: e.target.value })}
            placeholder="Ex: Marca Concorrente"
            className="border-primary/20"
            style={{ background: bexThemeV3.colors.bg }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Site</Label>
            <Input
              value={data.site}
              onChange={(e) => onChange(index, { ...data, site: e.target.value })}
              placeholder="https://..."
              className="border-primary/20"
              style={{ background: bexThemeV3.colors.bg }}
            />
          </div>
          <div className="space-y-2">
            <Label>Instagram</Label>
            <Input
              value={data.instagram}
              onChange={(e) => onChange(index, { ...data, instagram: e.target.value })}
              placeholder="@perfil"
              className="border-primary/20"
              style={{ background: bexThemeV3.colors.bg }}
            />
          </div>
          <div className="space-y-2">
            <Label>Facebook</Label>
            <Input
              value={data.facebook}
              onChange={(e) => onChange(index, { ...data, facebook: e.target.value })}
              placeholder="fb.com/perfil"
              className="border-primary/20"
              style={{ background: bexThemeV3.colors.bg }}
            />
          </div>
          <div className="space-y-2">
            <Label>TikTok</Label>
            <Input
              value={data.tiktok}
              onChange={(e) => onChange(index, { ...data, tiktok: e.target.value })}
              placeholder="@perfil"
              className="border-primary/20"
              style={{ background: bexThemeV3.colors.bg }}
            />
          </div>
          <div className="space-y-2">
            <Label>YouTube</Label>
            <Input
              value={data.youtube}
              onChange={(e) => onChange(index, { ...data, youtube: e.target.value })}
              placeholder="youtube.com/@canal"
              className="border-primary/20"
              style={{ background: bexThemeV3.colors.bg }}
            />
          </div>
          <div className="space-y-2">
            <Label>LinkedIn</Label>
            <Input
              value={data.linkedin}
              onChange={(e) => onChange(index, { ...data, linkedin: e.target.value })}
              placeholder="linkedin.com/company/..."
              className="border-primary/20"
              style={{ background: bexThemeV3.colors.bg }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Observações Estratégicas</Label>
          <Textarea
            value={data.observacoes}
            onChange={(e) => onChange(index, { ...data, observacoes: e.target.value })}
            placeholder="Anotações sobre o concorrente..."
            rows={2}
            className="border-primary/20"
            style={{ background: bexThemeV3.colors.bg }}
          />
        </div>

        <div className="pt-2 border-t border-primary/10">
          <Button
            onClick={handleAnalyze}
            disabled={analyzing || !data.nome}
            className="w-full font-semibold"
            style={{
              background: `linear-gradient(to right, ${bexThemeV3.colors.primary}, ${bexThemeV3.colors.accent})`,
              color: bexThemeV3.colors.bg
            }}
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analisando com IA...
              </>
            ) : hasAnalise ? (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Reanalisar com IA
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analisar com IA
              </>
            )}
          </Button>

          {hasAnalise && (
            <div className="mt-3 p-3 rounded-lg" style={{ background: `${bexThemeV3.colors.success}10`, border: `1px solid ${bexThemeV3.colors.success}20` }}>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 mt-0.5" style={{ color: bexThemeV3.colors.success }} />
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: bexThemeV3.colors.success }}>Análise IA Disponível</p>
                  <p className="text-xs mt-1" style={{ color: bexThemeV3.colors.textMuted }}>
                    Analisado em {new Date(data.analisado_em!).toLocaleString('pt-BR')}
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setShowAnalise(!showAnalise)}
                    className="p-0 h-auto mt-2"
                    style={{ color: bexThemeV3.colors.primary }}
                  >
                    {showAnalise ? 'Ocultar' : 'Ver'} Resumo
                  </Button>
                </div>
              </div>

              {showAnalise && data.analise_ia && (
                <div className="mt-3 pt-3 space-y-2 text-sm" style={{ borderTop: `1px solid ${bexThemeV3.colors.success}20` }}>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span style={{ color: bexThemeV3.colors.textMuted }}>Instagram:</span>
                      <span className="ml-2 font-medium">{data.analise_ia.seguidores?.instagram?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div>
                      <span style={{ color: bexThemeV3.colors.textMuted }}>Engajamento:</span>
                      <span className="ml-2 font-medium" style={{ color: bexThemeV3.colors.accent }}>{data.analise_ia.engajamento_percent || 'N/A'}%</span>
                    </div>
                    <div>
                      <span style={{ color: bexThemeV3.colors.textMuted }}>Posts/semana:</span>
                      <span className="ml-2 font-medium">{data.analise_ia.frequencia_posts_semana || 'N/A'}</span>
                    </div>
                    <div>
                      <span style={{ color: bexThemeV3.colors.textMuted }}>Formato forte:</span>
                      <span className="ml-2 font-medium">{data.analise_ia.formatos_fortes?.[0] || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <span className="block mb-1" style={{ color: bexThemeV3.colors.textMuted }}>Percepção Visual:</span>
                    <p className="text-xs" style={{ color: bexThemeV3.colors.text }}>{data.analise_ia.percepcao_visual || 'Sem dados'}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}