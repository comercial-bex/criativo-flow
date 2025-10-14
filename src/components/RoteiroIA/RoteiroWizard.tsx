import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Save, FileText, Palette, Sparkles, FileDown, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/use-debounce";
import { useRoteiros } from "@/hooks/useRoteiros";
import { smartToast } from "@/lib/smart-toast";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider, TooltipPortal } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { downloadRoteiroAsPDF, exportRoteiroToPDF } from "@/utils/roteiroToPdf";
import Step1Briefing from "./steps/Step1Briefing";
import Step2TomEstilo from "./steps/Step2TomEstilo";
import Step3Personalizacao from "./steps/Step3Personalizacao";
import Step4Roteiro from "./steps/Step4Roteiro";

interface RoteiroWizardProps {
  mode: "create" | "edit";
  roteiroId?: string;
  initialData?: any;
}

const STEPS = [
  { 
    id: 1, 
    label: "Briefing", 
    icon: FileText,
    tooltip: {
      titulo: "📝 Por que preencher o Briefing?",
      descricao: "O briefing alimenta a IA com contexto do cliente, projeto e objetivo. Sem essas informações, o roteiro será genérico e sem relevância estratégica.",
      campos_obrigatorios: ["Cliente", "Projeto", "Plataforma", "Objetivo"]
    }
  },
  { 
    id: 2, 
    label: "Tom & Estilo", 
    icon: Palette,
    tooltip: {
      titulo: "🎨 Como o Tom & Estilo afetam o roteiro?",
      descricao: "O tom (ex: humanizado, épico) e o estilo (ex: narrativo, bullet points) definem a linguagem e estrutura do roteiro. A IA adapta locução e cenas baseadas nessas escolhas.",
      campos_obrigatorios: ["Tom (1+)", "Estilo (1+)"]
    }
  },
  { 
    id: 3, 
    label: "Personalização IA", 
    icon: Sparkles,
    tooltip: {
      titulo: "🤖 O que são Agentes e Frameworks?",
      descricao: "Agentes são especialistas virtuais (ex: copywriter, estrategista). Frameworks são estruturas criativas (ex: AIDA, Storytelling). A combinação deles molda o system prompt da IA para criar roteiros profissionais.",
      campos_obrigatorios: ["Agentes IA (1+)", "Frameworks (1+)"]
    }
  },
  { 
    id: 4, 
    label: "Roteiro & IA", 
    icon: FileDown,
    tooltip: {
      titulo: "✨ Como a IA gera o roteiro?",
      descricao: "A IA combina todos os dados anteriores (briefing, tom, agentes, frameworks) + dados do Supabase (onboarding do cliente) para gerar um roteiro profissional formatado em Markdown com cenas, locuções e CTAs.",
      campos_obrigatorios: []
    }
  },
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
    referencias_analisadas: [] as any[],
    insights_visuais: "",
    tom: [] as string[],
    estilo: [] as string[],
    persona_voz: "Guilherme – social media, linguagem meiga, PT-BR padrão, inserções sutis do Norte (Amapá)...",
    duracao_prevista_seg: 30,
    roteiro_markdown: "",
    roteiro_struct: null,
    status: "rascunho" as any,
    versao: 1,
    agente_ia_id: "",
    framework_id: "",
    agentes_ia_ids: [] as string[],
    frameworks_ids: [] as string[],
    tom_criativo: [] as string[],
    logo_url: "",
    cliente_nome: "",
    agencia: "BEX Communication",
    produtora: "INSPIRE FILMES",
    cta: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const debouncedFormData = useDebounce(formData, 1500);
  const hasLoadedInitialData = useRef(false);

  // Autosave quando dados mudam (apenas em modo edição)
  useEffect(() => {
    if (mode === "edit" && roteiroId && debouncedFormData && hasLoadedInitialData.current) {
      handleAutoSave();
    }
  }, [debouncedFormData]);

  // Carregar dados iniciais em modo edição (apenas uma vez)
  useEffect(() => {
    if (initialData && !hasLoadedInitialData.current) {
      setFormData(prev => ({ ...prev, ...initialData }));
      hasLoadedInitialData.current = true;
      
      // Buscar metadados do cliente
      const loadClienteMetadata = async () => {
        if (initialData.cliente_id) {
          const { data: cliente } = await supabase
            .from('clientes')
            .select('nome, logo_url')
            .eq('id', initialData.cliente_id)
            .single();
          
          if (cliente) {
            setFormData(prev => ({
              ...prev,
              cliente_nome: cliente.nome,
              logo_url: cliente.logo_url || ''
            }));
          }
        }
      };
      
      loadClienteMetadata();
    }
  }, [initialData]);

  // Carregar dados da tarefa automaticamente
  useEffect(() => {
    const loadTarefaData = async () => {
      if (formData.tarefa_id && !hasLoadedInitialData.current) {
        const { data: tarefa } = await supabase
          .from('tarefa')
          .select('titulo, descricao, publico_alvo, horas_estimadas')
          .eq('id', formData.tarefa_id)
          .single();
        
        if (tarefa) {
          setFormData(prev => ({
            ...prev,
            titulo: prev.titulo || tarefa.titulo,
            objetivo: prev.objetivo || tarefa.descricao,
            publico_alvo: prev.publico_alvo?.length ? prev.publico_alvo : (tarefa.publico_alvo ? [tarefa.publico_alvo] : []),
            duracao_prevista_seg: prev.duracao_prevista_seg || (tarefa.horas_estimadas ? Math.min(tarefa.horas_estimadas * 60, 60) : 30),
          }));
        }
      }
    };
    
    loadTarefaData();
  }, [formData.tarefa_id]);

  const handleAutoSave = async () => {
    if (!roteiroId) return;
    try {
      // Filtrar campos que não existem no schema
      const { logo_url, cliente_nome, agencia, produtora, referencias_analisadas, insights_visuais, ...roteiroData } = formData;
      
      // Salvar apenas se houver dados de análise
      const dataToSave = referencias_analisadas?.length > 0 
        ? { ...roteiroData, referencias_analisadas, insights_visuais }
        : roteiroData;
        
      await updateRoteiro({ id: roteiroId, data: dataToSave });
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
      // Filtrar campos que não existem no schema
      const { logo_url, cliente_nome, agencia, produtora, ...roteiroData } = formData;
      
      if (mode === "create") {
        const created = await createRoteiro({ ...roteiroData, status: "rascunho" });
        smartToast.success("Rascunho salvo com sucesso!");
        navigate(`/grs/roteiro-ia/${created.id}`);
      } else if (roteiroId) {
        await updateRoteiro({ id: roteiroId, data: { ...roteiroData, status: "rascunho" } });
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
      // IDS necessários para buscar dados do Supabase
      cliente_id: formData.cliente_id,
      projeto_id: formData.projeto_id,
      
      // IDENTIFICAÇÃO
      titulo: formData.titulo || "Roteiro Audiovisual",
      
      // CONTEXTO ESTRATÉGICO
      objetivo: formData.objetivo || "Promover engajamento e conversões",
      publico_alvo: formData.publico_alvo || [],
      pilares_mensagem: formData.pilares_mensagem || [],
      
      // TOM E ESTILO
      tom: formData.tom || [],
      estilo: formData.estilo || [],
      persona_voz: formData.persona_voz || "Linguagem natural e acessível",
      tom_criativo: formData.tom_criativo || [],
      
      // TÉCNICO
      plataforma: formData.plataforma || "reels",
      duracao_prevista_seg: formData.duracao_prevista_seg || 30,
      
      // CTA
      cta: formData.cta || "Saiba mais! Entre em contato.",
      
      // IA E FRAMEWORKS (múltiplos)
      agentes_ia_ids: formData.agentes_ia_ids || [],
      frameworks_ids: formData.frameworks_ids || [],
      
      // REFERÊNCIAS
      referencias: formData.referencias || "",
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

  const handleExportPDF = async () => {
    try {
      await downloadRoteiroAsPDF(formData);
      smartToast.success("PDF baixado com sucesso!");
    } catch (error: any) {
      smartToast.error("Erro ao exportar PDF", error.message);
    }
  };

  const handleUploadToStorage = async () => {
    if (!roteiroId) {
      smartToast.error("Salve o roteiro antes de fazer upload");
      return;
    }

    setIsExporting(true);
    try {
      // Gerar PDF
      const pdfBlob = await exportRoteiroToPDF(formData);
      
      // Definir caminho do arquivo
      const fileName = `${formData.cliente_id || 'sem-cliente'}/${formData.projeto_id || 'sem-projeto'}/${roteiroId}_v${formData.versao || 1}.pdf`;
      
      // Upload para storage
      const { error: uploadError } = await supabase.storage
        .from('roteiros')
        .upload(fileName, pdfBlob, { 
          upsert: true,
          contentType: 'application/pdf'
        });

      if (uploadError) throw uploadError;

      // Atualizar roteiro com caminho do PDF
      await updateRoteiro({ 
        id: roteiroId, 
        data: { storage_pdf_path: fileName } 
      });

      smartToast.success("PDF salvo no storage!");
    } catch (error: any) {
      smartToast.error("Erro ao fazer upload", error.message);
      console.error("Upload error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.cliente_id && formData.projeto_id && formData.plataforma && formData.objetivo;
    }
    if (currentStep === 2) {
      return formData.tom.length > 0 && formData.estilo.length > 0;
    }
    if (currentStep === 3) {
      return formData.agentes_ia_ids?.length > 0 && formData.frameworks_ids?.length > 0;
    }
    return true;
  };

  const progressValue = ((STEPS.findIndex((s) => s.id === currentStep) + 1) / STEPS.length) * 100;

  return (
    <TooltipProvider>
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
              <div key={step.id} className="flex flex-col items-center flex-1 relative">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors cursor-pointer ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : isCompleted
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <StepIcon className="h-5 w-5" />
                    </div>
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent side="bottom" className="max-w-md p-4 z-[9999]">
                      <div className="space-y-2">
                        <h4 className="font-bold text-sm">{step.tooltip.titulo}</h4>
                        <p className="text-xs text-muted-foreground">{step.tooltip.descricao}</p>
                        {step.tooltip.campos_obrigatorios.length > 0 && (
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-xs font-semibold mb-1">Campos obrigatórios:</p>
                            <ul className="text-xs space-y-0.5">
                              {step.tooltip.campos_obrigatorios.map((campo) => (
                                <li key={campo}>• {campo}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </TooltipPortal>
                </Tooltip>
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
              {currentStep === 3 && (
                <Step3Personalizacao formData={formData} setFormData={setFormData} />
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
          {/* Exportar PDF */}
          {formData.roteiro_markdown && (
            <>
              <Button 
                variant="outline" 
                onClick={handleExportPDF}
                disabled={isExporting}
              >
                <FileDown className="h-4 w-4 mr-1" />
                Baixar PDF
              </Button>

              {mode === "edit" && roteiroId && (
                <Button 
                  variant="outline" 
                  onClick={handleUploadToStorage}
                  disabled={isExporting}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  {isExporting ? "Salvando..." : "Salvar no Storage"}
                </Button>
              )}
            </>
          )}

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
    </TooltipProvider>
  );
}
