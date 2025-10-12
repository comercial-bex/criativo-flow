import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Search, X, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { smartToast } from "@/lib/smart-toast";

interface LinkAnalysisCardProps {
  formData: any;
  setFormData: (data: any) => void;
}

export default function LinkAnalysisCard({ formData, setFormData }: LinkAnalysisCardProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [linksInput, setLinksInput] = useState(formData.referencias || "");

  const handleAnalyzeLinks = async () => {
    // Extrair URLs do texto
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = linksInput.match(urlRegex);

    if (!urls || urls.length === 0) {
      smartToast.error("Nenhum link válido encontrado");
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-social-links', {
        body: { links: urls }
      });

      if (error) throw error;

      if (data.success) {
        setFormData({
          ...formData,
          referencias_analisadas: data.links_analisados,
          insights_visuais: data.insights_consolidados,
          referencias: linksInput,
        });
        smartToast.success(`${data.links_analisados.length} link(s) analisado(s) com sucesso!`);
      }
    } catch (error: any) {
      smartToast.error("Erro ao analisar links", error.message);
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRemoveLink = (urlToRemove: string) => {
    const updatedLinks = formData.referencias_analisadas.filter(
      (l: any) => l.url !== urlToRemove
    );
    setFormData({
      ...formData,
      referencias_analisadas: updatedLinks,
    });
  };

  const getPlatformEmoji = (plataforma: string) => {
    const emojis: Record<string, string> = {
      tiktok: '🎵',
      instagram: '📱',
      youtube: '▶️',
      desconhecido: '🔗',
    };
    return emojis[plataforma] || '🔗';
  };

  const getPlatformColor = (plataforma: string) => {
    const colors: Record<string, string> = {
      tiktok: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      instagram: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      youtube: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      desconhecido: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    };
    return colors[plataforma] || colors.desconhecido;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">📎 Referências (Links de Mídia Social)</label>
        <Textarea
          value={linksInput}
          onChange={(e) => setLinksInput(e.target.value)}
          placeholder="Cole links do TikTok, Instagram, YouTube... (um por linha ou separados por espaço)"
          rows={3}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleAnalyzeLinks}
          disabled={isAnalyzing || !linksInput.trim()}
          className="w-full sm:w-auto"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Analisar Links
            </>
          )}
        </Button>
      </div>

      {formData.referencias_analisadas && formData.referencias_analisadas.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              ✅ {formData.referencias_analisadas.length} link(s) analisado(s)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.referencias_analisadas.map((link: any, idx: number) => (
              <div key={idx} className="bg-background p-3 rounded-md border space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className={getPlatformColor(link.plataforma)} variant="secondary">
                        {getPlatformEmoji(link.plataforma)} {link.plataforma.toUpperCase()}
                      </Badge>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                      >
                        Link <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <p className="font-medium text-sm">{link.titulo}</p>
                    {link.descricao && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{link.descricao}</p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {link.estilo_visual_detectado.map((estilo: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {estilo}
                        </Badge>
                      ))}
                      <Badge variant="default" className="text-xs">
                        {link.tom_narrativo}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveLink(link.url)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {formData.insights_visuais && (
              <div className="bg-accent/50 p-3 rounded-md border border-accent">
                <p className="text-sm font-semibold mb-2">💡 Insights Consolidados:</p>
                <p className="text-sm whitespace-pre-line">{formData.insights_visuais}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
