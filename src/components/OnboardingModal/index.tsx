import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { StepEmpresa } from './steps/StepEmpresa';
import { StepPublico } from './steps/StepPublico';
import { StepDigital } from './steps/StepDigital';
import { StepSwot } from './steps/StepSwot';
import { StepObjetivos } from './steps/StepObjetivos';
import { StepMarca } from './steps/StepMarca';
import type { OnboardingData } from './types';

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clienteId: string;
  clienteNome: string;
  onComplete?: () => void;
}

export function OnboardingModal({ 
  open, 
  onOpenChange, 
  clienteId, 
  clienteNome,
  onComplete 
}: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    // Step 1: Empresa
    nome_empresa: clienteNome,
    segmento_atuacao: '',
    produtos_servicos: '',
    tempo_mercado: '',
    localizacao: '',
    
    // Step 2: Público
    publico_alvo: [],
    dores_problemas: '',
    valorizado: '',
    ticket_medio: '',
    
    // Step 3: Digital
    presenca_digital: [],
    frequencia_postagens: '',
    tipos_conteudo: [],
    midia_paga: '',
    
    // Step 4: SWOT
    forcas: '',
    fraquezas: '',
    oportunidades: '',
    ameacas: '',
    
    // Step 5: Objetivos
    objetivos_digitais: '',
    objetivos_offline: '',
    onde_6_meses: '',
    resultados_esperados: [],
    
    // Step 6: Marca
    historia_marca: '',
    valores_principais: '',
    tom_voz: [],
    como_lembrada: ''
  });

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  const steps = [
    { number: 1, title: 'Empresa', icon: '🏢', component: StepEmpresa },
    { number: 2, title: 'Público', icon: '🎯', component: StepPublico },
    { number: 3, title: 'Digital', icon: '📱', component: StepDigital },
    { number: 4, title: 'SWOT', icon: '📊', component: StepSwot },
    { number: 5, title: 'Objetivos', icon: '🎯', component: StepObjetivos },
    { number: 6, title: 'Marca', icon: '✨', component: StepMarca }
  ];

  useEffect(() => {
    if (open && clienteId) {
      loadExistingData();
    }
  }, [open, clienteId]);

  const loadExistingData = async () => {
    try {
      const { data, error } = await supabase
        .from('cliente_onboarding')
        .select('*')
        .eq('cliente_id', clienteId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar onboarding:', error);
        return;
      }

      if (data) {
        setFormData({
          nome_empresa: data.nome_empresa || clienteNome,
          segmento_atuacao: data.segmento_atuacao || '',
          produtos_servicos: data.produtos_servicos || '',
          tempo_mercado: data.tempo_mercado || '',
          localizacao: data.localizacao || '',
          publico_alvo: data.publico_alvo || [],
          dores_problemas: data.dores_problemas || '',
          valorizado: data.valorizado || '',
          ticket_medio: data.ticket_medio || '',
          presenca_digital: data.presenca_digital || [],
          frequencia_postagens: data.frequencia_postagens || '',
          tipos_conteudo: data.tipos_conteudo || [],
          midia_paga: data.midia_paga || '',
          forcas: data.forcas || '',
          fraquezas: data.fraquezas || '',
          oportunidades: data.oportunidades || '',
          ameacas: data.ameacas || '',
          objetivos_digitais: data.objetivos_digitais || '',
          objetivos_offline: data.objetivos_offline || '',
          onde_6_meses: data.onde_6_meses || '',
          resultados_esperados: data.resultados_esperados || [],
          historia_marca: data.historia_marca || '',
          valores_principais: data.valores_principais || '',
          tom_voz: data.tom_voz || [],
          como_lembrada: data.como_lembrada || ''
        });

        // Determinar step baseado nos dados salvos
        if (data.como_lembrada) setCurrentStep(6);
        else if (data.objetivos_digitais) setCurrentStep(5);
        else if (data.forcas) setCurrentStep(4);
        else if (data.presenca_digital?.length) setCurrentStep(3);
        else if (data.publico_alvo?.length) setCurrentStep(2);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleSave = async (autoAdvance = false) => {
    setLoading(true);
    try {
      const { data: existing } = await supabase
        .from('cliente_onboarding')
        .select('id')
        .eq('cliente_id', clienteId)
        .maybeSingle();

      const payload = {
        cliente_id: clienteId,
        ...formData
      };

      let result;
      if (existing) {
        result = await supabase
          .from('cliente_onboarding')
          .update(payload)
          .eq('cliente_id', clienteId);
      } else {
        result = await supabase
          .from('cliente_onboarding')
          .insert([payload]);
      }

      if (result.error) throw result.error;

      toast.success('Progresso salvo com sucesso!');
      
      if (autoAdvance && currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else if (currentStep === totalSteps) {
        toast.success('🎉 Onboarding concluído!');
        onComplete?.();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar progresso');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    handleSave(true);
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepNumber: number) => {
    setCurrentStep(stepNumber);
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Onboarding - {clienteNome}
          </DialogTitle>
          <div className="space-y-2 mt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Etapa {currentStep} de {totalSteps}</span>
              <span>{Math.round(progress)}% completo</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </DialogHeader>

        {/* Steps Navigator */}
        <div className="flex items-center justify-between gap-2 py-4 border-y">
          {steps.map((step, idx) => (
            <button
              key={step.number}
              onClick={() => handleStepClick(step.number)}
              className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-lg transition-all
                ${currentStep === step.number 
                  ? 'bg-primary/10 text-primary border-2 border-primary' 
                  : currentStep > step.number
                  ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                  : 'hover:bg-muted text-muted-foreground'
                }
              `}
            >
              <div className="text-2xl">{step.icon}</div>
              <div className="text-xs font-medium truncate w-full text-center">
                {step.title}
              </div>
              {currentStep > step.number && (
                <Check className="h-3 w-3 text-green-600" />
              )}
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-1">
          <CurrentStepComponent 
            formData={formData} 
            setFormData={setFormData}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>

          <Button
            onClick={handleNext}
            disabled={loading}
          >
            {loading ? 'Salvando...' : currentStep === totalSteps ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Concluir
              </>
            ) : (
              <>
                Próximo
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
