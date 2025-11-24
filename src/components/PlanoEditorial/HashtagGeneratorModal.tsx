import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Copy, RefreshCw, Hash, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface HashtagGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (hashtags: string[]) => void;
  contexto?: string;
  redeSocial?: string;
}

export function HashtagGeneratorModal({
  open,
  onOpenChange,
  onSelect,
  contexto = "",
  redeSocial = "instagram",
}: HashtagGeneratorModalProps) {
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState(contexto);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [selectedHashtags, setSelectedHashtags] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Atenção",
        description: "Digite um contexto para gerar hashtags relevantes.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("gerar-hashtags", {
        body: {
          contexto: prompt,
          redeSocial,
          quantidade: 20,
        },
      });

      if (error) throw error;

      if (data?.hashtags) {
        setHashtags(data.hashtags);
        // Auto-selecionar as 5 primeiras
        const autoSelected = new Set<string>(data.hashtags.slice(0, 5));
        setSelectedHashtags(autoSelected);
      }
    } catch (error: any) {
      console.error("Erro ao gerar hashtags:", error);
      
      // Fallback com hashtags genéricas
      const fallbackHashtags = [
        "#marketing",
        "#conteudo",
        "#digital",
        "#social",
        "#negocios",
        "#empreendedorismo",
        "#inovacao",
        "#crescimento",
        "#estrategia",
        "#sucesso",
      ];
      setHashtags(fallbackHashtags);
      setSelectedHashtags(new Set(fallbackHashtags.slice(0, 5)));
      
      toast({
        title: "Usando hashtags sugeridas",
        description: "Não foi possível gerar hashtags personalizadas.",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleHashtag = (tag: string) => {
    const newSelected = new Set(selectedHashtags);
    if (newSelected.has(tag)) {
      newSelected.delete(tag);
    } else {
      if (newSelected.size >= 30) {
        toast({
          title: "Limite atingido",
          description: "Máximo de 30 hashtags por post.",
          variant: "destructive",
        });
        return;
      }
      newSelected.add(tag);
    }
    setSelectedHashtags(newSelected);
  };

  const handleCopyAll = () => {
    const text = Array.from(selectedHashtags).join(" ");
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${selectedHashtags.size} hashtags copiadas para área de transferência.`,
    });
  };

  const handleConfirm = () => {
    onSelect(Array.from(selectedHashtags));
    onOpenChange(false);
    toast({
      title: "Hashtags adicionadas!",
      description: `${selectedHashtags.size} hashtags inseridas no post.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-primary" />
            Gerador de Hashtags Inteligente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Input de Contexto */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Descreva o conteúdo do post
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Post sobre lançamento de produto de beleza natural, público feminino 25-40 anos, tom inspirador..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Rede Social */}
          <div className="flex gap-2">
            {["instagram", "tiktok", "linkedin", "facebook"].map((rede) => (
              <Button
                key={rede}
                size="sm"
                variant={redeSocial === rede ? "default" : "outline"}
                onClick={() => setPrompt(prompt)}
                className="capitalize"
              >
                {rede}
              </Button>
            ))}
          </div>

          {/* Botão Gerar */}
          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Gerando hashtags...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Gerar Hashtags com IA
              </>
            )}
          </Button>

          {/* Hashtags Geradas */}
          {hashtags.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    Hashtags Sugeridas ({hashtags.length})
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedHashtags.size}/30 selecionadas
                </div>
              </div>

              <div className="flex flex-wrap gap-2 p-4 bg-muted rounded-lg max-h-[300px] overflow-y-auto">
                {hashtags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedHashtags.has(tag) ? "default" : "outline"}
                    className="cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => toggleHashtag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Hashtags Selecionadas Preview */}
              {selectedHashtags.size > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Preview</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopyAll}
                      className="gap-1 h-7"
                    >
                      <Copy className="h-3 w-3" />
                      Copiar
                    </Button>
                  </div>
                  <div className="p-3 bg-background border rounded-lg text-sm text-muted-foreground">
                    {Array.from(selectedHashtags).join(" ")}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              handleConfirm();
              // ✅ FASE 4: Disparar evento para sincronizar tabela
              window.dispatchEvent(new CustomEvent('posts-updated'));
            }}
            disabled={selectedHashtags.size === 0}
            className="gap-2"
          >
            Adicionar {selectedHashtags.size} Hashtags
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
