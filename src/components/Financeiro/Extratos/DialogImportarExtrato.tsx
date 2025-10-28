import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";
import { ExtratosUploadZone } from "./ExtratosUploadZone";
import { ExtratoParserConfig } from "./ExtratoParserConfig";
import { ExtratosTransacoesReview } from "./ExtratosTransacoesReview";
import { useImportarExtrato } from "@/hooks/useImportarExtrato";
import { useContasBancarias } from "@/hooks/useContasBancarias";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface DialogImportarExtratoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DialogImportarExtrato({ open, onOpenChange }: DialogImportarExtratoProps) {
  const [step, setStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedConta, setSelectedConta] = useState<string>("");
  const [parserConfig, setParserConfig] = useState<any>(null);
  const [extratoId, setExtratoId] = useState<string | null>(null);

  const { uploadExtrato, uploadingExtrato, parseExtrato, parsingExtrato, processarTransacoes, processandoTransacoes } = useImportarExtrato();
  const { contas } = useContasBancarias();

  const resetDialog = () => {
    setStep(1);
    setSelectedFile(null);
    setSelectedConta("");
    setParserConfig(null);
    setExtratoId(null);
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setStep(2);
  };

  const handleContaSelect = () => {
    if (!selectedFile || !selectedConta) return;
    
    uploadExtrato(
      { file: selectedFile, contaBancariaId: selectedConta },
      {
        onSuccess: (data: any) => {
          setExtratoId(data.id);
          
          // Se for CSV, vai para configuração, senão processa direto
          if (selectedFile.name.toLowerCase().endsWith('.csv')) {
            setStep(3);
          } else {
            parseExtrato({ extratoId: data.id });
            setStep(4);
          }
        },
      }
    );
  };

  const handleParserConfigSave = (config: any) => {
    setParserConfig(config);
    if (extratoId) {
      parseExtrato(
        { extratoId, config },
        {
          onSuccess: () => {
            setStep(4);
          },
        }
      );
    }
  };

  const handleProcessarSugestoes = () => {
    if (extratoId) {
      processarTransacoes(extratoId, {
        onSuccess: () => {
          setStep(5);
        },
      });
    }
  };

  const handleImportComplete = () => {
    resetDialog();
    onOpenChange(false);
  };

  const steps = [
    { number: 1, title: "Upload", icon: Upload },
    { number: 2, title: "Conta", icon: FileText },
    { number: 3, title: "Configuração", icon: FileText, optional: true },
    { number: 4, title: "Processamento", icon: FileText },
    { number: 5, title: "Revisão", icon: CheckCircle2 },
  ];

  const currentProgress = (step / steps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) resetDialog();
      onOpenChange(newOpen);
    }}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Importar Extrato Bancário</DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            {steps.map((s) => (
              <div
                key={s.number}
                className={`flex items-center gap-1 ${
                  step >= s.number ? "text-primary font-medium" : ""
                }`}
              >
                <s.icon className="w-4 h-4" />
                <span>{s.title}</span>
              </div>
            ))}
          </div>
          <Progress value={currentProgress} className="h-2" />
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="py-8">
            <ExtratosUploadZone onFileSelect={handleFileSelect} />
          </div>
        )}

        {/* Step 2: Seleção de Conta */}
        {step === 2 && (
          <div className="space-y-6 py-8">
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Arquivo selecionado:</p>
              <p className="font-medium">{selectedFile?.name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedFile && (selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>

            <div className="space-y-2">
              <Label>Conta Bancária de Destino</Label>
              <Select value={selectedConta} onValueChange={setSelectedConta}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a conta" />
                </SelectTrigger>
                <SelectContent>
                  {contas.map((conta) => (
                    <SelectItem key={conta.id} value={conta.id}>
                      {conta.nome} - {conta.banco}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button onClick={handleContaSelect} disabled={!selectedConta || uploadingExtrato}>
                {uploadingExtrato ? "Enviando..." : "Continuar"}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Configuração CSV */}
        {step === 3 && selectedFile?.name.toLowerCase().endsWith('.csv') && (
          <ExtratoParserConfig
            onSave={handleParserConfigSave}
            onBack={() => setStep(2)}
            loading={parsingExtrato}
          />
        )}

        {/* Step 4: Processamento */}
        {step === 4 && (
          <div className="space-y-6 py-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Processando extrato...</h3>
                <p className="text-sm text-muted-foreground">
                  Estamos analisando as transações e gerando sugestões de vinculação
                </p>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleProcessarSugestoes}
              disabled={processandoTransacoes}
            >
              {processandoTransacoes ? "Processando..." : "Gerar Sugestões de Vinculação"}
            </Button>
          </div>
        )}

        {/* Step 5: Revisão */}
        {step === 5 && extratoId && (
          <ExtratosTransacoesReview
            extratoId={extratoId}
            onImportComplete={handleImportComplete}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
