import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";

export default function Step4Roteiro({ formData, setFormData, onGenerateAI }: any) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerateAI();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">✨ Roteiro & IA</h2>
        <p className="text-muted-foreground">Gere ou escreva seu roteiro</p>
      </div>

      <div className="flex justify-center mb-4">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !formData.objetivo}
          size="lg"
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Gerando com IA...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Gerar Roteiro com IA
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="roteiro">Roteiro (Markdown)</Label>
          <Textarea
            id="roteiro"
            value={formData.roteiro_markdown}
            onChange={(e) => setFormData({ ...formData, roteiro_markdown: e.target.value })}
            rows={20}
            placeholder="O roteiro gerado pela IA aparecerá aqui, ou você pode escrever manualmente..."
            className="font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label>Preview</Label>
          <Card className="p-4 h-[500px] overflow-auto prose prose-sm max-w-none">
            {formData.roteiro_markdown ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: formData.roteiro_markdown.replace(/\n/g, "<br>"),
                }}
              />
            ) : (
              <p className="text-muted-foreground italic">
                O preview do roteiro aparecerá aqui...
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
