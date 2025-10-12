import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import RoteiroPreview from "../RoteiroPreview";
import LogoUploader from "../LogoUploader";

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

  const handleLogoChange = (url: string) => {
    setFormData({ ...formData, logo_url: url });
  };

  const handleMetadataChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
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

      {/* Upload de Logo */}
      <div className="mb-4">
        <Label className="mb-2 block">📎 Logo do Cliente/Projeto</Label>
        <LogoUploader 
          currentLogoUrl={formData.logo_url}
          onLogoChange={handleLogoChange}
          roteiroId={formData.id}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Editor Markdown */}
        <div className="space-y-2">
          <Label htmlFor="roteiro">Roteiro (Markdown)</Label>
          <Textarea
            id="roteiro"
            value={formData.roteiro_markdown}
            onChange={(e) => setFormData({ ...formData, roteiro_markdown: e.target.value })}
            rows={24}
            placeholder="O roteiro gerado pela IA aparecerá aqui, ou você pode escrever manualmente..."
            className="font-mono text-sm"
          />
        </div>

        {/* Preview Formatado com Cores */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <Label>Preview Formatado</Label>
            <div className="text-xs text-muted-foreground space-x-2">
              <span className="inline-block w-3 h-3 bg-purple-500 rounded"></span>
              <span>Cenas</span>
              <span className="inline-block w-3 h-3 bg-orange-500 rounded ml-2"></span>
              <span>ON</span>
              <span className="inline-block w-3 h-3 bg-yellow-500 rounded ml-2"></span>
              <span>OFF</span>
            </div>
          </div>
          <div className="h-[600px] overflow-auto border rounded-lg p-4 bg-muted/30">
            {formData.roteiro_markdown ? (
              <RoteiroPreview
                roteiro={formData.roteiro_markdown}
                metadata={{
                  cliente: formData.cliente_nome || "Cliente",
                  titulo: formData.titulo || "Roteiro Audiovisual",
                  duracao: formData.duracao_prevista_seg || 30,
                  objetivo: formData.objetivo || "",
                  tom: Array.isArray(formData.tom) ? formData.tom.join(', ') : formData.tom || "",
                  agencia: formData.agencia || "BEX Communication",
                  produtora: formData.produtora || "INSPIRE FILMES",
                  data: new Date().toLocaleDateString('pt-BR'),
                }}
                logoUrl={formData.logo_url}
                onMetadataChange={handleMetadataChange}
                editable={true}
              />
            ) : (
              <p className="text-muted-foreground italic text-center mt-8">
                O preview formatado do roteiro aparecerá aqui...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
