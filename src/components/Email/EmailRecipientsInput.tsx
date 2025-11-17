import { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface EmailRecipient {
  email: string;
  name?: string;
}

interface EmailRecipientsInputProps {
  to: string[];
  onToChange: (emails: string[]) => void;
  cc?: string[];
  onCcChange?: (emails: string[]) => void;
  bcc?: string[];
  onBccChange?: (emails: string[]) => void;
  maxRecipients?: number;
  suggestions?: EmailRecipient[];
}

export function EmailRecipientsInput({
  to,
  onToChange,
  cc = [],
  onCcChange,
  bcc = [],
  onBccChange,
  maxRecipients = 10,
  suggestions = []
}: EmailRecipientsInputProps) {
  const [toInput, setToInput] = useState("");
  const [ccInput, setCcInput] = useState("");
  const [bccInput, setBccInput] = useState("");
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email.trim());
  };

  const addEmail = (type: 'to' | 'cc' | 'bcc', email: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedEmail) return;

    if (!validateEmail(trimmedEmail)) {
      setErrors({ ...errors, [type]: 'Email inválido' });
      return;
    }

    const currentList = type === 'to' ? to : type === 'cc' ? cc : bcc;
    const allEmails = [...to, ...cc, ...bcc];

    if (allEmails.includes(trimmedEmail)) {
      setErrors({ ...errors, [type]: 'Email já adicionado' });
      return;
    }

    if (allEmails.length >= maxRecipients) {
      setErrors({ ...errors, [type]: `Máximo de ${maxRecipients} destinatários` });
      return;
    }

    const newList = [...currentList, trimmedEmail];
    
    if (type === 'to') {
      onToChange(newList);
      setToInput("");
    } else if (type === 'cc' && onCcChange) {
      onCcChange(newList);
      setCcInput("");
    } else if (type === 'bcc' && onBccChange) {
      onBccChange(newList);
      setBccInput("");
    }

    setErrors({ ...errors, [type]: '' });
  };

  const removeEmail = (type: 'to' | 'cc' | 'bcc', email: string) => {
    const currentList = type === 'to' ? to : type === 'cc' ? cc : bcc;
    const newList = currentList.filter(e => e !== email);
    
    if (type === 'to') {
      onToChange(newList);
    } else if (type === 'cc' && onCcChange) {
      onCcChange(newList);
    } else if (type === 'bcc' && onBccChange) {
      onBccChange(newList);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, type: 'to' | 'cc' | 'bcc') => {
    const input = type === 'to' ? toInput : type === 'cc' ? ccInput : bccInput;
    
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addEmail(type, input);
    } else if (e.key === 'Backspace' && !input) {
      const currentList = type === 'to' ? to : type === 'cc' ? cc : bcc;
      if (currentList.length > 0) {
        removeEmail(type, currentList[currentList.length - 1]);
      }
    }
  };

  const renderEmailBadges = (emails: string[], type: 'to' | 'cc' | 'bcc') => {
    return emails.map(email => (
      <Badge key={email} variant="secondary" className="gap-1">
        {email}
        <button
          type="button"
          onClick={() => removeEmail(type, email)}
          className="ml-1 hover:text-destructive"
        >
          <X className="w-3 h-3" />
        </button>
      </Badge>
    ));
  };

  const totalRecipients = to.length + cc.length + bcc.length;

  return (
    <div className="space-y-4">
      {/* Campo Para */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="to">
            Para <span className="text-destructive">*</span>
          </Label>
          <span className="text-xs text-muted-foreground">
            {totalRecipients}/{maxRecipients} destinatários
          </span>
        </div>
        <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px] focus-within:ring-2 focus-within:ring-ring">
          {renderEmailBadges(to, 'to')}
          <Input
            id="to"
            value={toInput}
            onChange={(e) => {
              setToInput(e.target.value);
              setErrors({ ...errors, to: '' });
            }}
            onKeyDown={(e) => handleKeyDown(e, 'to')}
            placeholder={to.length === 0 ? "destinatario@exemplo.com" : ""}
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-6"
          />
        </div>
        {errors.to && (
          <p className="text-xs text-destructive">{errors.to}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Pressione Enter, vírgula ou espaço para adicionar
        </p>
      </div>

      {/* Toggle CC/BCC */}
      {!showCcBcc && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowCcBcc(true)}
          className="text-xs"
        >
          + Adicionar CC/CCO
        </Button>
      )}

      {/* Campos CC e BCC */}
      <Collapsible open={showCcBcc} onOpenChange={setShowCcBcc}>
        <CollapsibleContent className="space-y-4">
          {/* Campo CC */}
          <div className="space-y-2">
            <Label htmlFor="cc">CC (com cópia)</Label>
            <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px] focus-within:ring-2 focus-within:ring-ring">
              {renderEmailBadges(cc, 'cc')}
              <Input
                id="cc"
                value={ccInput}
                onChange={(e) => {
                  setCcInput(e.target.value);
                  setErrors({ ...errors, cc: '' });
                }}
                onKeyDown={(e) => handleKeyDown(e, 'cc')}
                placeholder={cc.length === 0 ? "cc@exemplo.com" : ""}
                className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-6"
              />
            </div>
            {errors.cc && (
              <p className="text-xs text-destructive">{errors.cc}</p>
            )}
          </div>

          {/* Campo BCC */}
          <div className="space-y-2">
            <Label htmlFor="bcc">CCO (cópia oculta)</Label>
            <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px] focus-within:ring-2 focus-within:ring-ring">
              {renderEmailBadges(bcc, 'bcc')}
              <Input
                id="bcc"
                value={bccInput}
                onChange={(e) => {
                  setBccInput(e.target.value);
                  setErrors({ ...errors, bcc: '' });
                }}
                onKeyDown={(e) => handleKeyDown(e, 'bcc')}
                placeholder={bcc.length === 0 ? "bcc@exemplo.com" : ""}
                className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-6"
              />
            </div>
            {errors.bcc && (
              <p className="text-xs text-destructive">{errors.bcc}</p>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowCcBcc(false)}
            className="text-xs"
          >
            <ChevronUp className="w-4 h-4 mr-1" />
            Ocultar CC/CCO
          </Button>
        </CollapsibleContent>
      </Collapsible>

      {/* Sugestões de contatos */}
      {suggestions.length > 0 && toInput.length > 2 && (
        <div className="border rounded-md p-2 space-y-1 max-h-40 overflow-y-auto">
          <p className="text-xs font-medium text-muted-foreground mb-2">Sugestões:</p>
          {suggestions
            .filter(s => s.email.toLowerCase().includes(toInput.toLowerCase()) || 
                        s.name?.toLowerCase().includes(toInput.toLowerCase()))
            .slice(0, 5)
            .map(suggestion => (
              <button
                key={suggestion.email}
                type="button"
                onClick={() => addEmail('to', suggestion.email)}
                className="w-full text-left px-2 py-1 text-sm hover:bg-accent rounded transition-colors"
              >
                {suggestion.name && <span className="font-medium">{suggestion.name} </span>}
                <span className="text-muted-foreground">&lt;{suggestion.email}&gt;</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
