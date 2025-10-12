import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const TONS = [
  { value: "humanizado", label: "Humanizado", desc: "Próximo, empático, conversacional" },
  { value: "institucional", label: "Institucional", desc: "Formal, corporativo, profissional" },
  { value: "emocional", label: "Emocional", desc: "Apelativo, sensível, tocante" },
  { value: "didatico", label: "Didático", desc: "Educativo, explicativo, claro" },
  { value: "vendedor", label: "Vendedor", desc: "Persuasivo, comercial, objetivo" },
  { value: "divertido", label: "Divertido", desc: "Leve, descontraído, humorístico" },
];

const ESTILOS = [
  { value: "narrativo", label: "Narrativo", desc: "Conta uma história linear" },
  { value: "bullet", label: "Bullet Points", desc: "Listagem de tópicos/benefícios" },
  { value: "cenas", label: "Roteiro em Cenas", desc: "ON/OFF estruturado" },
  { value: "entrevista", label: "Entrevista", desc: "Perguntas e respostas" },
  { value: "voz_off", label: "Voz Off", desc: "Narração sobre imagens" },
  { value: "apresentador", label: "Apresentador", desc: "Direto para câmera" },
  { value: "documental", label: "Documental", desc: "Estilo documentário" },
  { value: "trend", label: "Trend/Viral", desc: "Segue tendências de redes sociais" },
];

export default function Step2TomEstilo({ formData, setFormData }: any) {
  const toggleArrayItem = (field: string, value: string) => {
    const currentArray = formData[field] || [];
    if (currentArray.includes(value)) {
      setFormData({ ...formData, [field]: currentArray.filter((item: string) => item !== value) });
    } else {
      setFormData({ ...formData, [field]: [...currentArray, value] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">🎨 Tom & Estilo</h2>
        <p className="text-muted-foreground">Defina a personalidade do roteiro</p>
      </div>

      <div className="space-y-3">
        <Label>Tom de Voz * (selecione um ou mais)</Label>
        <TooltipProvider>
          <div className="flex flex-wrap gap-2">
            {TONS.map((tom) => (
              <Tooltip key={tom.value}>
                <TooltipTrigger asChild>
                  <Badge
                    variant={formData.tom?.includes(tom.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem("tom", tom.value)}
                  >
                    {tom.label}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tom.desc}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </div>

      <div className="space-y-3">
        <Label>Estilo Narrativo * (selecione um ou mais)</Label>
        <TooltipProvider>
          <div className="flex flex-wrap gap-2">
            {ESTILOS.map((estilo) => (
              <Tooltip key={estilo.value}>
                <TooltipTrigger asChild>
                  <Badge
                    variant={formData.estilo?.includes(estilo.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem("estilo", estilo.value)}
                  >
                    {estilo.label}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{estilo.desc}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </div>

      <div className="space-y-2">
        <Label htmlFor="persona">Persona de Voz</Label>
        <Textarea
          id="persona"
          value={formData.persona_voz}
          onChange={(e) => setFormData({ ...formData, persona_voz: e.target.value })}
          rows={4}
          placeholder="Descreva a persona que narrará o roteiro..."
        />
        <p className="text-xs text-muted-foreground">
          Exemplo: "Guilherme – social media, linguagem meiga, PT-BR padrão, inserções sutis do Norte (Amapá)..."
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="legendas"
          checked={formData.incluir_legendas}
          onCheckedChange={(checked) => setFormData({ ...formData, incluir_legendas: checked })}
        />
        <Label htmlFor="legendas" className="cursor-pointer">
          Incluir sugestões de legendas com CTA, emojis e hashtags
        </Label>
      </div>
    </div>
  );
}
