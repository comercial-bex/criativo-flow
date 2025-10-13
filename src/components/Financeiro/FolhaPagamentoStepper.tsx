import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useFolhaPonto } from '@/hooks/useFolhaPonto';
import { useAdiantamentos } from '@/hooks/useAdiantamentos';
import { CheckCircle2, Circle, Calendar, FileText, DollarSign, Send, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdiantamentosManager } from './AdiantamentosManager';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FolhaPagamentoStepperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competencia: string;
  onComplete: () => void;
}

const STEPS = [
  { id: 1, label: 'Ponto & Variáveis', icon: Calendar },
  { id: 2, label: 'Adiantamentos', icon: DollarSign },
  { id: 3, label: 'Revisão & Processamento', icon: FileText },
  { id: 4, label: 'Finalização', icon: Send },
];

export function FolhaPagamentoStepper({ open, onOpenChange, competencia, onComplete }: FolhaPagamentoStepperProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const { pontos } = useFolhaPonto(undefined, competencia);
  const { adiantamentos } = useAdiantamentos(undefined, competencia);

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
      onOpenChange(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="full" height="xl" padding="none" overflow="hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-montserrat">
            Processamento da Folha de Pagamento
          </DialogTitle>
          <p className="text-muted-foreground">
            Competência: {new Date(competencia).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-4 py-4">
          <Progress value={progress} className="h-2" />
          
          {/* Step Indicators */}
          <div className="flex justify-between items-center">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center transition-all
                      ${isCompleted ? 'bg-success text-success-foreground' : ''}
                      ${isActive ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : ''}
                      ${!isActive && !isCompleted ? 'bg-muted text-muted-foreground' : ''}
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <span className={`text-xs text-center font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && <Step1PontoVariaveis competencia={competencia} />}
              {currentStep === 2 && <Step2Adiantamentos competencia={competencia} />}
              {currentStep === 3 && <Step3Revisao competencia={competencia} pontos={pontos} adiantamentos={adiantamentos} />}
              {currentStep === 4 && <Step4Finalizacao />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          
          <Badge variant="outline" className="px-4 py-2">
            Passo {currentStep} de {STEPS.length}
          </Badge>

          <Button onClick={handleNext}>
            {currentStep === STEPS.length ? 'Concluir' : 'Próximo'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Step 1: Ponto & Variáveis
function Step1PontoVariaveis({ competencia }: { competencia: string }) {
  const { pontos, salvar } = useFolhaPonto(undefined, competencia);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Registro de Ponto e Variáveis</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Configure horas extras, adicionais noturnos, faltas e outras variáveis que afetam o cálculo da folha.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Total de Registros de Ponto</Label>
              <div className="text-3xl font-bold text-primary mt-2">{pontos.length}</div>
            </div>
            <div>
              <Label>Pendentes de Aprovação</Label>
              <div className="text-3xl font-bold text-warning mt-2">
                {pontos.filter(p => p.status === 'pendente').length}
              </div>
            </div>
          </div>

          {pontos.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum registro de ponto para esta competência</p>
            </div>
          )}

          {pontos.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left">Colaborador</th>
                    <th className="px-4 py-3 text-left">HE 50%</th>
                    <th className="px-4 py-3 text-left">HE 100%</th>
                    <th className="px-4 py-3 text-left">Noturno</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pontos.map(ponto => (
                    <tr key={ponto.id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3">{ponto.colaborador_id}</td>
                      <td className="px-4 py-3">{ponto.horas_he_50 || 0}h</td>
                      <td className="px-4 py-3">{ponto.horas_he_100 || 0}h</td>
                      <td className="px-4 py-3">{ponto.horas_noturno || 0}h</td>
                      <td className="px-4 py-3">
                        <Badge variant={ponto.status === 'aprovado_rh' ? 'default' : 'secondary'}>
                          {ponto.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// Step 2: Adiantamentos
function Step2Adiantamentos({ competencia }: { competencia: string }) {
  const { adiantamentos } = useAdiantamentos(undefined, competencia);
  
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Gestão de Adiantamentos</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Registre e gerencie adiantamentos salariais que serão descontados na folha.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Total de Adiantamentos</Label>
              <div className="text-3xl font-bold text-primary mt-2">{adiantamentos.length}</div>
            </div>
            <div>
              <Label>Valor Total</Label>
              <div className="text-3xl font-bold text-success mt-2">
                R$ {adiantamentos.reduce((sum, a) => sum + a.valor, 0).toFixed(2)}
              </div>
            </div>
          </div>

          {adiantamentos.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum adiantamento registrado para esta competência</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// Step 3: Revisão
function Step3Revisao({ competencia, pontos, adiantamentos }: { 
  competencia: string; 
  pontos: any[]; 
  adiantamentos: any[] 
}) {
  const totalAdiantamentos = adiantamentos
    .filter(a => a.status === 'registrado')
    .reduce((sum, a) => sum + a.valor, 0);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Revisão Final</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Revise todos os dados antes de processar a folha de pagamento.
        </p>

        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Registros de Ponto</Label>
            <div className="text-3xl font-bold">{pontos.length}</div>
            <p className="text-sm text-muted-foreground">
              {pontos.filter(p => p.status !== 'aprovado_rh').length} pendentes
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Adiantamentos</Label>
            <div className="text-3xl font-bold">{adiantamentos.length}</div>
            <p className="text-sm text-success">
              R$ {totalAdiantamentos.toFixed(2)}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Status</Label>
            <Badge variant="outline" className="text-lg px-4 py-2">
              Pronto para processar
            </Badge>
          </div>
        </div>

        <div className="mt-8 p-4 bg-warning/10 border border-warning/20 rounded-lg">
          <p className="text-sm font-medium text-warning-foreground">
            ⚠️ Atenção: Após processar a folha, os valores serão calculados e não poderão ser alterados automaticamente.
          </p>
        </div>
      </Card>
    </div>
  );
}

// Step 4: Finalização
function Step4Finalizacao() {
  return (
    <div className="space-y-6">
      <Card className="p-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <h3 className="text-2xl font-semibold">Folha Processada com Sucesso!</h3>
          <p className="text-muted-foreground max-w-md">
            A folha de pagamento foi processada. Você pode visualizar os detalhes na tela principal.
          </p>
        </div>
      </Card>
    </div>
  );
}
