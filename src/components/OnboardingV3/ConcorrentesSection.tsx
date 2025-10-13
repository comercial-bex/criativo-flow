import { Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConcorrenteCard } from "./ConcorrenteCard";
import { bexThemeV3 } from "@/styles/bex-theme";

interface ConcorrenteData {
  id?: string;
  nome: string;
  site?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  linkedin?: string;
  observacoes?: string;
  analise_ia?: any;
  analisado_em?: string;
}

interface ConcorrentesSectionProps {
  concorrentes: ConcorrenteData[];
  setConcorrentes: (concorrentes: ConcorrenteData[]) => void;
  clienteId: string;
}

export function ConcorrentesSection({ concorrentes, setConcorrentes, clienteId }: ConcorrentesSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold" style={{ fontFamily: bexThemeV3.typography.heading }}>
          Análise de Concorrentes
        </h2>
        <Button
          onClick={() => {
            if (concorrentes.length < 10) {
              setConcorrentes([...concorrentes, { nome: '' }]);
            }
          }}
          disabled={concorrentes.length >= 10}
          className="font-semibold"
          style={{ background: bexThemeV3.colors.primary, color: bexThemeV3.colors.bg }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Concorrente ({concorrentes.length}/10)
        </Button>
      </div>

      {concorrentes.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-2" style={{ borderColor: `${bexThemeV3.colors.primary}30` }}>
          <AlertCircle className="h-12 w-12 mx-auto mb-4" style={{ color: bexThemeV3.colors.primary }} />
          <p className="mb-4" style={{ color: bexThemeV3.colors.textMuted }}>
            Nenhum concorrente adicionado ainda
          </p>
          <Button 
            onClick={() => setConcorrentes([{ nome: '' }])}
            style={{ background: bexThemeV3.colors.primary, color: bexThemeV3.colors.bg }}
          >
            Adicionar Primeiro Concorrente
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {concorrentes.map((conc, index) => (
            <ConcorrenteCard
              key={index}
              index={index}
              data={conc}
              onChange={(i, newData) => {
                const updated = [...concorrentes];
                updated[i] = newData;
                setConcorrentes(updated);
              }}
              onRemove={(i) => {
                setConcorrentes(concorrentes.filter((_, idx) => idx !== i));
              }}
              clienteId={clienteId}
            />
          ))}
        </div>
      )}
    </div>
  );
}