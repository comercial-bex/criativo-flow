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
  { id: 1, label: "Briefing", icon: FileText },
  { id: 2, label: "Tom & Estilo", icon: Palette },
  { id: 3, label: "Personalização IA", icon: Sparkles },
  { id: 4, label: "Roteiro & IA", icon: FileDown },
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
    duracao_prevista_seg: 30,
    roteiro_markdown: "",
    roteiro_struct: null,
    status: "rascunho" as any,
    versao: 1,
    agente_ia_id: "",
    framework_id: "",
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
      const { logo_url, cliente_nome, agencia, produtora, ...roteiroData } = formData;
      await updateRoteiro({ id: roteiroId, data: roteiroData });
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
      // IDENTIFICAÇÃO
      cliente_nome: formData.cliente_nome || formData.titulo || "Cliente BEX",
      titulo: formData.titulo || "Roteiro Audiovisual",
      agencia: "BEX Communication",
      produtora: "INSPIRE FILMES",
      
      // CONTEXTO ESTRATÉGICO
      objetivo: formData.objetivo || "Promover engajamento e conversões",
      publico_alvo_descricao: formData.publico_alvo?.join(", ") || "Público interessado em soluções",
      mensagem_chave: formData.pilares_mensagem?.join(" • ") || "Destaque benefícios principais",
      
      // TOM E ESTILO
      tom: (Array.isArray(formData.tom) ? formData.tom : [formData.tom]).filter(Boolean).join(", ") || "Humanizado",
      estilo: (Array.isArray(formData.estilo) ? formData.estilo : [formData.estilo]).filter(Boolean).join(", ") || "Narrativo",
      persona_voz: formData.persona_voz || "Linguagem natural e acessível",
      tom_criativo: formData.tom_criativo || [],
      
      // TÉCNICO
      plataforma: formData.plataforma || "reels",
      veiculacao: formData.plataforma ? [formData.plataforma] : ["Instagram Reels"],
      duracao_prevista_seg: formData.duracao_prevista_seg || 30,
      formato: formData.plataforma === 'youtube' ? 'Vídeo longo (2-5min)' : 
               formData.plataforma === 'reels' ? 'Reels 30-60s' : 
               'Vídeo institucional curto',
      
      // BENEFÍCIOS E CTA
      beneficios: formData.publico_alvo?.length > 0 ? formData.publico_alvo : [
        "Solução prática e imediata",
        "Confiança e credibilidade comprovada",
        "Resultados mensuráveis"
      ],
      cta: formData.cta || "Saiba mais! Entre em contato.",
      
      // IA E FRAMEWORKS
      agente_ia_id: formData.agente_ia_id,
      framework_id: formData.framework_id,
      
      // REFERÊNCIAS
      referencias: formData.referencias || "",
      ambiente: "externo",
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
      return formData.agente_ia_id && formData.framework_id;
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
  );
}
