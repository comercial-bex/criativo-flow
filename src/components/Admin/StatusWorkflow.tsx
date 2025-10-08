import { CheckCircle, Circle, Clock, FileSignature, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusWorkflowProps {
  currentStatus: "rascunho" | "enviado" | "assinado" | "cancelado" | "vigente";
  type?: "contrato" | "proposta";
}

const contratoSteps = [
  { key: "rascunho", label: "Rascunho", icon: Circle },
  { key: "enviado", label: "Enviado", icon: Clock },
  { key: "assinado", label: "Assinado", icon: FileSignature },
  { key: "vigente", label: "Vigente", icon: FileCheck },
];

const propostaSteps = [
  { key: "pendente", label: "Pendente", icon: Circle },
  { key: "enviado", label: "Enviado", icon: Clock },
  { key: "assinado", label: "Aceito", icon: CheckCircle },
];

const statusOrder: Record<string, number> = {
  rascunho: 0,
  pendente: 0,
  enviado: 1,
  assinado: 2,
  vigente: 3,
  cancelado: -1,
};

export function StatusWorkflow({ currentStatus, type = "contrato" }: StatusWorkflowProps) {
  const steps = type === "contrato" ? contratoSteps : propostaSteps;
  const currentOrder = statusOrder[currentStatus];

  if (currentStatus === "cancelado") {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
        <p className="text-sm font-medium text-destructive">
          ❌ Cancelado
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = statusOrder[step.key] <= currentOrder;
          const isCurrent = step.key === currentStatus;

          return (
            <div key={step.key} className="flex-1 relative">
              <div className="flex flex-col items-center">
                {/* Círculo do status */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all",
                    isActive
                      ? "bg-primary border-primary text-primary-foreground shadow-lg"
                      : "bg-muted border-border text-muted-foreground",
                    isCurrent && "ring-4 ring-primary/20 scale-110"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Label */}
                <p
                  className={cn(
                    "mt-2 text-xs font-medium text-center",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </p>
              </div>

              {/* Linha conectora */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute top-6 left-1/2 w-full h-0.5 -z-10",
                    isActive ? "bg-primary" : "bg-border"
                  )}
                  style={{ transform: "translateY(-50%)" }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
