import AgenteSelector from "../selectors/AgenteSelector";
import FrameworkSelector from "../selectors/FrameworkSelector";
import TomCreativoSelector from "../selectors/TomCreativoSelector";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lightbulb } from "lucide-react";
import { Label } from "@/components/ui/label";

interface Step3PersonalizacaoProps {
  formData: any;
  setFormData: (data: any) => void;
}

export default function Step3Personalizacao({ formData, setFormData }: Step3PersonalizacaoProps) {
  const handleAgenteSelect = (agenteIds: string[]) => {
    setFormData({ ...formData, agentes_ia_ids: agenteIds });
  };

  const handleFrameworkSelect = (frameworkIds: string[]) => {
    setFormData({ 
      ...formData, 
      frameworks_ids: frameworkIds,
      framework_id: frameworkIds[0] || '' // Manter compatibilidade
    });
  };

  const handleTomToggle = (ton: string) => {
    const tons = formData.tom_criativo || [];
    const newTons = tons.includes(ton)
      ? tons.filter((t: string) => t !== ton)
      : [...tons, ton];
    setFormData({ ...formData, tom_criativo: newTons });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">🤖 Personalização com IA</h2>
        <p className="text-muted-foreground">
          Escolha um agente criativo e um framework para estruturar seu roteiro
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="text-md font-semibold flex items-center gap-1">
          🤖 Agentes IA 
          <span className="text-destructive">*</span>
          <span className="text-muted-foreground text-xs font-normal">(selecione um ou mais)</span>
        </h4>
        <AgenteSelector 
          selectedIds={formData.agentes_ia_ids || []}
          onSelect={handleAgenteSelect}
          showError={!formData.agentes_ia_ids || formData.agentes_ia_ids.length === 0}
        />
        {(!formData.agentes_ia_ids || formData.agentes_ia_ids.length === 0) && (
          <p className="text-xs text-destructive">⚠️ Selecione pelo menos um agente IA</p>
        )}
      </div>

      <div className="space-y-2">
        <h4 className="text-md font-semibold flex items-center gap-1">
          📚 Frameworks 
          <span className="text-destructive">*</span>
          <span className="text-muted-foreground text-xs font-normal">(selecione um ou mais)</span>
        </h4>
        <FrameworkSelector
          selectedIds={formData.frameworks_ids || []}
          onSelect={handleFrameworkSelect}
          multiSelect={true}
          showError={!formData.frameworks_ids || formData.frameworks_ids.length === 0}
        />
        {(!formData.frameworks_ids || formData.frameworks_ids.length === 0) && (
          <p className="text-xs text-destructive">⚠️ Selecione pelo menos um framework</p>
        )}
      </div>

      <TomCreativoSelector
        selectedTons={formData.tom_criativo || []}
        onToggle={handleTomToggle}
      />

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          <strong>Dica:</strong> A combinação de agente + framework + tons criará um system prompt
          personalizado que influenciará o estilo e estrutura do roteiro gerado.
        </AlertDescription>
      </Alert>
    </div>
  );
}
