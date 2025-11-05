import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb } from 'lucide-react';
import { StepProps } from '../types';

export function StepSwot({ formData, setFormData }: StepProps) {
  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">📊 Análise SWOT</h3>
        <p className="text-sm text-muted-foreground">
          Avalie os pontos fortes, fracos, oportunidades e ameaças do seu negócio
        </p>
      </div>

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription className="text-xs">
          <strong>Dica:</strong> Forças e Fraquezas são fatores internos (dentro da empresa). 
          Oportunidades e Ameaças são fatores externos (mercado, economia, concorrência).
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="forcas" className="flex items-center gap-2">
            <span className="text-green-600">✅</span> Forças (Strengths)
          </Label>
          <Textarea
            id="forcas"
            value={formData.forcas}
            onChange={(e) => setFormData({ ...formData, forcas: e.target.value })}
            placeholder="Ex: Equipe experiente, localização privilegiada, qualidade reconhecida..."
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            O que sua empresa faz bem? Quais são seus pontos fortes internos?
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fraquezas" className="flex items-center gap-2">
            <span className="text-red-600">⚠️</span> Fraquezas (Weaknesses)
          </Label>
          <Textarea
            id="fraquezas"
            value={formData.fraquezas}
            onChange={(e) => setFormData({ ...formData, fraquezas: e.target.value })}
            placeholder="Ex: Poucos recursos para marketing, processo manual de vendas..."
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Onde sua empresa pode melhorar? Quais limitações internas você identifica?
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="oportunidades" className="flex items-center gap-2">
            <span className="text-blue-600">🌟</span> Oportunidades (Opportunities)
          </Label>
          <Textarea
            id="oportunidades"
            value={formData.oportunidades}
            onChange={(e) => setFormData({ ...formData, oportunidades: e.target.value })}
            placeholder="Ex: Crescimento do e-commerce, tendência de consumo sustentável..."
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Que tendências de mercado ou mudanças externas podem beneficiar seu negócio?
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ameacas" className="flex items-center gap-2">
            <span className="text-orange-600">⚡</span> Ameaças (Threats)
          </Label>
          <Textarea
            id="ameacas"
            value={formData.ameacas}
            onChange={(e) => setFormData({ ...formData, ameacas: e.target.value })}
            placeholder="Ex: Concorrentes com preços mais baixos, crise econômica..."
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Que fatores externos podem prejudicar seu negócio?
          </p>
        </div>
      </div>
    </div>
  );
}
