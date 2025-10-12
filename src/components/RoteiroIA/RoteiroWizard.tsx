import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Save, FileText, Palette, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/use-debounce";
import { useRoteiros } from "@/hooks/useRoteiros";
import { smartToast } from "@/lib/smart-toast";
import Step1Briefing from "./steps/Step1Briefing";
import Step2TomEstilo from "./steps/Step2TomEstilo";
import Step4Roteiro from "./steps/Step4Roteiro";

interface RoteiroWizardProps {
  mode: "create" | "edit";
  roteiroId?: string;
  initialData?: any;
}

const STEPS = [
  { id: 1, label: "Briefing", icon: FileText },
  { id: 2, label: "Tom & Estilo", icon: Palette },
  { id: 4, label: "Roteiro & IA", icon: Sparkles },
];

export default function RoteiroWizard({ mode, roteiroId, initialData }: RoteiroWizardProps) {
  const navigate = useNavigate();
  const { createRoteiro, updateRoteiro, generateWithAI } = useRoteiros();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    titulo: "",
    cliente_id: "",
    projeto_id: "",
    tarefa_id: "",
    plataforma: "reels" as any,
    objetivo: "",
    publico_alvo: [] as string[],
    pilares_mensagem: [] as string[],
    referencias: "",
    tom: [] as string[],
    estilo: [] as string[],
    persona_voz: "Guilherme – social media, linguagem meiga, PT-BR padrão, inserções sutis do Norte (Amapá)...",
    incluir_legendas: true,
    duracao_prevista_seg: 30,
    roteiro_markdown: "",
    roteiro_struct: null,
    status: "rascunho" as any,
  });

  const [isSaving, setIsSaving] = useState(false);
  const debouncedFormData = useDebounce(formData, 1500);

  // Autosave quando dados mudam (apenas em modo edição)
  useEffect(() => {
    if (mode === "edit" && roteiroId && debouncedFormData) {
      handleAutoSave();
    }
  }, [debouncedFormData]);

  // Carregar dados iniciais em modo edição
  useEffect(() => {
    if (initialData) {
      setFormData({ ...formData, ...initialData });
    }
  }, [initialData]);

  const handleAutoSave = async () => {
    if (!roteiroId) return;
    try {
      await updateRoteiro({ id: roteiroId, data: formData });
    } catch (error) {
      console.error("Autosave error:", error);
    }
  };

  const handleNext = () => {
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      if (mode === "create") {
        const created = await createRoteiro({ ...formData, status: "rascunho" });
        smartToast.success("Rascunho salvo com sucesso!");
        navigate(`/grs/roteiro-ia/${created.id}`);
      } else if (roteiroId) {
        await updateRoteiro({ id: roteiroId, data: { ...formData, status: "rascunho" } });
        smartToast.success("Rascunho atualizado!");
      }
    } catch (error: any) {
      smartToast.error("Erro ao salvar", error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateAI = async () => {
    const briefingData = {
      cliente_nome: formData.titulo || "Cliente",
      titulo: formData.titulo || "Roteiro Audiovisual",
      objetivo: formData.objetivo || "Apresentar o produto/serviço",
      tom: formData.tom.join(", ") || "Humanizado",
      veiculacao: formData.plataforma ? [formData.plataforma] : ["Reel"],
      mensagem_chave: formData.pilares_mensagem.join(", ") || "Mensagem principal",
      beneficios: formData.publico_alvo,
      cta: "Acesse nosso site e saiba mais!",
      ambiente: "genérico",
    };

    try {
      const result = await generateWithAI(briefingData);
      
      if (result?.roteiro) {
        setFormData({
          ...formData,
          roteiro_markdown: result.roteiro,
          roteiro_struct: result.roteiro_struct,
        });
        smartToast.success("Roteiro gerado com IA!");
      }
    } catch (error: any) {
      smartToast.error("Erro ao gerar roteiro", error.message);
      console.error("Erro na geração:", error);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.cliente_id && formData.projeto_id && formData.plataforma && formData.objetivo;
    }
    if (currentStep === 2) {
      return formData.tom.length > 0 && formData.estilo.length > 0;
    }
    return true;
  };

  const progressValue = ((STEPS.findIndex((s) => s.id === currentStep) + 1) / STEPS.length) * 100;

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          🎬 {mode === "create" ? "Novo Roteiro" : "Editar Roteiro"}
        </h1>
        <p className="text-muted-foreground">
          Crie roteiros audiovisuais com inteligência artificial
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {STEPS.map((step, idx) => {
            const StepIcon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = STEPS.findIndex((s) => s.id === currentStep) > idx;

            return (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <StepIcon className="h-5 w-5" />
                </div>
                <span className={`text-sm ${isActive ? "font-semibold" : ""}`}>{step.label}</span>
              </div>
            );
          })}
        </div>
        <Progress value={progressValue} className="h-2" />
      </div>

      {/* Steps Content */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 1 && (
                <Step1Briefing formData={formData} setFormData={setFormData} />
              )}
              {currentStep === 2 && (
                <Step2TomEstilo formData={formData} setFormData={setFormData} />
              )}
              {currentStep === 4 && (
                <Step4Roteiro
                  formData={formData}
                  setFormData={setFormData}
                  onGenerateAI={handleGenerateAI}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={STEPS.findIndex((s) => s.id === currentStep) === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
            <Save className="h-4 w-4 mr-1" />
            {isSaving ? "Salvando..." : "Salvar Rascunho"}
          </Button>

          {STEPS.findIndex((s) => s.id === currentStep) < STEPS.length - 1 ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Próximo
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSaveDraft} disabled={isSaving || !formData.roteiro_markdown}>
              Finalizar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
