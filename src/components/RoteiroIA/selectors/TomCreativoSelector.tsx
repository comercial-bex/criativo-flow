import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TONS = [
  { value: "humanizado", label: "Humanizado" },
  { value: "emocional", label: "Emocional" },
  { value: "institucional", label: "Institucional" },
  { value: "didatico", label: "Didático" },
  { value: "divertido", label: "Divertido" },
  { value: "vendedor", label: "Vendedor" },
];

interface TomCreativoSelectorProps {
  selectedTons: string[];
  onToggle: (ton: string) => void;
}

export default function TomCreativoSelector({ selectedTons, onToggle }: TomCreativoSelectorProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-md font-semibold">🎭 Tons Criativos</h4>
      <div className="flex flex-wrap gap-2">
        {TONS.map((ton) => (
          <Badge
            key={ton.value}
            variant={selectedTons.includes(ton.value) ? "default" : "outline"}
            className={cn(
              "cursor-pointer px-4 py-2 rounded-full transition-all",
              selectedTons.includes(ton.value) && "bg-primary text-primary-foreground"
            )}
            onClick={() => onToggle(ton.value)}
          >
            {ton.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
