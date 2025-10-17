import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, InfoIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import RoteiroPreview from "../RoteiroPreview";
import LogoUploader from "../LogoUploader";
import { marked } from "marked";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, TooltipPortal } from "@/components/ui/tooltip";
import { estimateTokens, estimateCost, buildPromptForEstimation } from "@/utils/tokenEstimator";

interface Step4RoteiroProps {
  formData: any;
  setFormData: (data: any) => void;
  onGenerateAI: () => void;
  isGenerating?: boolean;
}

export default function Step4Roteiro({ 
  formData, 
  setFormData, 
  onGenerateAI,
  isGenerating = false
}: Step4RoteiroProps) {
  const [costEstimate, setCostEstimate] = useState<any>(null);

  useEffect(() => {
    if (formData.cliente_id && formData.objetivo) {
      const prompt = buildPromptForEstimation(formData);
      const inputTokens = estimateTokens(prompt);
      const estimatedOutputTokens = 2000;
      
      const cost = estimateCost(inputTokens, estimatedOutputTokens);
      setCostEstimate({
        inputTokens,
        outputTokens: estimatedOutputTokens,
        ...cost
      });
    }
  }, [formData.cliente_id, formData.objetivo, formData.tom, formData.estilo]);

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

      {/* Estimativa de Custo */}
      {costEstimate && (
        <Card className="bg-muted/50 border-primary/20 mb-4">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <InfoIcon className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">💰 Estimativa de Custo da Geração</p>
                <p className="text-xs text-muted-foreground">
                  ~{costEstimate.inputTokens.toLocaleString()} tokens de entrada + 
                  ~{costEstimate.outputTokens.toLocaleString()} tokens de saída
                </p>
                <p className="text-sm font-semibold text-primary">
                  {costEstimate.formatted}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center mb-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  onClick={onGenerateAI}
                  disabled={isGenerating || !formData.objetivo}
                  size="lg"
                  className="gap-2 w-full max-w-md"
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
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent className="max-w-md p-4 z-[9999]">
                <div className="space-y-2">
                  <h4 className="font-bold text-sm">🤖 Como funciona a geração?</h4>
                  <p className="text-xs text-muted-foreground">
                    A IA GPT-4.1 combina dados do cliente (onboarding), agentes selecionados, frameworks, insights visuais e seu briefing para gerar um roteiro profissional formatado com cenas, locuções e CTAs.
                  </p>
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-xs font-semibold">✅ Pré-requisitos preenchidos</p>
                  </div>
                </div>
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>
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
              <span className="inline-block w-3 h-3 bg-green-500 rounded"></span>
              <span>Imagem</span>
              <span className="inline-block w-3 h-3 bg-blue-500 rounded ml-2"></span>
              <span>Fala ON</span>
              <span className="inline-block w-3 h-3 bg-yellow-500 rounded ml-2"></span>
              <span>Narração OFF</span>
              <span className="inline-block w-3 h-3 bg-orange-500 rounded ml-2"></span>
              <span>Efeitos</span>
            </div>
          </div>
          <div className="h-[600px] overflow-auto border rounded-lg p-6 bg-white">
            {isGenerating ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : formData.roteiro_markdown ? (
              <div 
                className="prose prose-sm max-w-none text-black"
                dangerouslySetInnerHTML={{ 
                  __html: String(marked.parse(formData.roteiro_markdown, { async: false }))
                    .replace(/📸 \*\*IMAGEM DE APOIO:\*\*/g, '<div class="bg-green-100 p-3 rounded my-2 text-black"><strong>📸 IMAGEM DE APOIO:</strong>')
                    .replace(/🎤 \*\*FALA \(ON\):\*\*/g, '</div><div class="bg-blue-100 p-3 rounded my-2 text-black"><strong>🎤 FALA (ON):</strong>')
                    .replace(/📢 \*\*NARRAÇÃO \(OFF\):\*\*/g, '</div><div class="bg-yellow-100 p-3 rounded my-2 text-black"><strong>📢 NARRAÇÃO (OFF):</strong>')
                    .replace(/🎬 \*\*EFEITOS VISUAIS\/ÁUDIO:\*\*/g, '</div><div class="bg-orange-100 p-3 rounded my-2 text-black"><strong>🎬 EFEITOS VISUAIS/ÁUDIO:</strong>')
                    .replace(/🎥 \*\*SUGESTÃO TÉCNICA:\*\*/g, '</div><div class="bg-gray-100 p-3 rounded my-2 text-black"><strong>🎥 SUGESTÃO TÉCNICA:</strong>')
                    .replace(/⏱️ \*\*DURAÇÃO ESTIMADA:\*\*/g, '</div><div class="bg-purple-100 p-2 rounded my-2 text-black"><strong>⏱️ DURAÇÃO:</strong>') + '</div>'
                }} 
              />
            ) : (
              <p className="text-muted-foreground italic text-center mt-8">
                Configure os parâmetros e clique em "Gerar Roteiro com IA"
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
