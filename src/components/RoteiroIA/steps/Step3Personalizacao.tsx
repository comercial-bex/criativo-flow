import AgenteSelector from "../selectors/AgenteSelector";
import FrameworkSelector from "../selectors/FrameworkSelector";
import TomCreativoSelector from "../selectors/TomCreativoSelector";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lightbulb } from "lucide-react";

interface Step3PersonalizacaoProps {
  formData: any;
  setFormData: (data: any) => void;
}

export default function Step3Personalizacao({ formData, setFormData }: Step3PersonalizacaoProps) {
  const handleAgenteSelect = (agenteIds: string[]) => {
    setFormData({ ...formData, agentes_ia_ids: agenteIds });
  };

  const handleFrameworkSelect = (frameworkId: string) => {
    setFormData({ ...formData, frameworks_ids: frameworkId ? [frameworkId] : [] });
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

      <AgenteSelector
        selectedIds={formData.agentes_ia_ids || []}
        onSelect={handleAgenteSelect}
      />

      <FrameworkSelector
        selectedIds={formData.frameworks_ids || []}
        onSelect={handleFrameworkSelect}
        multiSelect={true}
      />

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
