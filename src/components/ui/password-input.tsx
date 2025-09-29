import * as React from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./input";

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: "Mínimo 8 caracteres", test: (pwd) => pwd.length >= 8 },
  { label: "Uma letra maiúscula", test: (pwd) => /[A-Z]/.test(pwd) },
  { label: "Uma letra minúscula", test: (pwd) => /[a-z]/.test(pwd) },
  { label: "Um número", test: (pwd) => /\d/.test(pwd) },
  { label: "Um caractere especial", test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
];

interface PasswordInputProps extends Omit<React.ComponentProps<"input">, "type"> {
  showRequirements?: boolean;
  onValidityChange?: (isValid: boolean) => void;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showRequirements = false, onValidityChange, onChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [password, setPassword] = React.useState("");
    const [requirements, setRequirements] = React.useState(
      passwordRequirements.map(req => ({ ...req, met: false }))
    );

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newPassword = e.target.value;
      setPassword(newPassword);

      // Update requirements
      const updatedRequirements = passwordRequirements.map(req => ({
        ...req,
        met: req.test(newPassword)
      }));
      setRequirements(updatedRequirements);

      // Check if all requirements are met
      const isValid = updatedRequirements.every(req => req.met);
      onValidityChange?.(isValid);

      // Call original onChange
      onChange?.(e);
    };

    const getStrengthLevel = () => {
      const metCount = requirements.filter(req => req.met).length;
      if (metCount <= 2) return { level: "weak", color: "bg-destructive" };
      if (metCount <= 4) return { level: "medium", color: "bg-yellow-500" };
      return { level: "strong", color: "bg-green-500" };
    };

    const strength = getStrengthLevel();
    const strengthPercentage = (requirements.filter(req => req.met).length / requirements.length) * 100;

    return (
      <div className="space-y-2">
        <div className="relative">
          <Input
            ref={ref}
            type={showPassword ? "text" : "password"}
            className={cn("pr-10", className)}
            onChange={handlePasswordChange}
            {...props}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {showRequirements && password && (
          <div className="space-y-3 p-3 rounded-md border bg-card">
            {/* Password Strength Bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Força da senha:</span>
                <span className={cn(
                  "text-xs font-medium capitalize",
                  strength.level === "weak" && "text-destructive",
                  strength.level === "medium" && "text-yellow-600",
                  strength.level === "strong" && "text-green-600"
                )}>
                  {strength.level === "weak" && "Fraca"}
                  {strength.level === "medium" && "Média"}
                  {strength.level === "strong" && "Forte"}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className={cn("h-1.5 rounded-full transition-all duration-300", strength.color)}
                  style={{ width: `${strengthPercentage}%` }}
                />
              </div>
            </div>

            {/* Requirements List */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Requisitos:</p>
              <div className="space-y-1">
                {requirements.map((req, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center gap-2 text-sm transition-colors duration-200",
                      req.met ? "text-green-600" : "text-muted-foreground"
                    )}
                  >
                    {req.met ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <X className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className={cn(req.met && "line-through")}>{req.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
export type { PasswordInputProps };