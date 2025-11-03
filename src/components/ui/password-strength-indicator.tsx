import { Progress } from "@/components/ui/progress";
import { Check, X } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{}]/.test(password),
  };
  
  const score = Object.values(checks).filter(Boolean).length;
  const strength = score < 2 ? 'Fraca' : score < 4 ? 'Média' : 'Forte';
  const color = score < 2 ? 'destructive' : score < 4 ? 'warning' : 'success';
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Força da senha:</span>
        <span className={`text-sm font-bold ${
          color === 'destructive' ? 'text-destructive' : 
          color === 'warning' ? 'text-yellow-500' : 
          'text-green-500'
        }`}>
          {strength}
        </span>
      </div>
      <Progress value={(score / 5) * 100} className="h-2" />
      <ul className="space-y-1 text-xs">
        <RequirementItem met={checks.length} label="Mínimo 8 caracteres" />
        <RequirementItem met={checks.lowercase} label="Letra minúscula" />
        <RequirementItem met={checks.uppercase} label="Letra maiúscula" />
        <RequirementItem met={checks.number} label="Número" />
        <RequirementItem met={checks.special} label="Caractere especial (!@#$%...)" />
      </ul>
    </div>
  );
}

function RequirementItem({ met, label }: { met: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-2 ${met ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
      {met ? (
        <Check className="h-3 w-3" />
      ) : (
        <X className="h-3 w-3" />
      )}
      <span>{label}</span>
    </li>
  );
}
