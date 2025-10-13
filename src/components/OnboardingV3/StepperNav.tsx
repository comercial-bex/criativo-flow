import { cn } from "@/lib/utils";
import { Check, CircleDot } from "lucide-react";
import { bexThemeV3 } from "@/styles/bex-theme";

interface Step {
  id: number;
  label: string;
  icon: string;
  completed: boolean;
}

interface StepperNavProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (step: number) => void;
}

export function StepperNav({ steps, currentStep, onStepClick }: StepperNavProps) {
  return (
    <div className="w-full py-6 px-4 rounded-2xl border border-primary/10" style={{ background: `linear-gradient(to right, ${bexThemeV3.colors.surface}, ${bexThemeV3.colors.surfaceHover})` }}>
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <button
              onClick={() => onStepClick(step.id)}
              disabled={!step.completed && step.id > currentStep}
              className={cn(
                "relative flex flex-col items-center gap-2 transition-all group",
                step.id <= currentStep ? "cursor-pointer" : "cursor-not-allowed opacity-50"
              )}
              style={{ fontFamily: bexThemeV3.typography.body }}
            >
              <div
                className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all border-2",
                  step.id === currentStep && "ring-4 ring-primary/20 scale-110",
                  step.completed && step.id !== currentStep && "bg-success border-success",
                  !step.completed && step.id !== currentStep && "border-muted",
                  step.id === currentStep && "bg-primary border-primary"
                )}
                style={{
                  boxShadow: step.id === currentStep ? bexThemeV3.shadows.glow : 'none',
                  background: step.id === currentStep ? bexThemeV3.colors.primary : (step.completed && step.id !== currentStep ? bexThemeV3.colors.success : bexThemeV3.colors.surface)
                }}
              >
                {step.completed && step.id !== currentStep ? (
                  <Check className="w-6 h-6 text-white" />
                ) : step.id === currentStep ? (
                  <CircleDot className="w-6 h-6 text-bg animate-pulse" />
                ) : (
                  <span className="text-xl">{step.icon}</span>
                )}
              </div>
              
              <span
                className={cn(
                  "text-xs font-medium text-center max-w-[80px] transition-colors",
                  step.id === currentStep ? "text-primary font-semibold" : "text-textMuted"
                )}
                style={{ color: step.id === currentStep ? bexThemeV3.colors.primary : bexThemeV3.colors.textMuted }}
              >
                {step.label}
              </span>
            </button>
            
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 relative">
                <div className="absolute inset-0 bg-muted/30" />
                <div
                  className={cn(
                    "absolute inset-0 bg-primary transition-all duration-500",
                    step.completed ? "w-full" : "w-0"
                  )}
                  style={{
                    boxShadow: step.completed ? `0 0 8px ${bexThemeV3.colors.primaryGlow}` : 'none',
                    background: bexThemeV3.colors.primary
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}