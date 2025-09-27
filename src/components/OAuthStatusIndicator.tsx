import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OAuthStatusIndicatorProps {
  provider: string;
  isConfigured: boolean;
  onConfigureClick?: () => void;
}

export function OAuthStatusIndicator({ provider, isConfigured, onConfigureClick }: OAuthStatusIndicatorProps) {
  if (isConfigured) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700">
          {provider} OAuth configurado corretamente
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-yellow-200 bg-yellow-50">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-700">
        <div className="flex items-center justify-between">
          <span>
            {provider} precisa ser configurado no painel do Supabase
          </span>
          {onConfigureClick && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onConfigureClick}
              className="ml-2"
            >
              <Settings className="h-3 w-3 mr-1" />
              Configurar
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}