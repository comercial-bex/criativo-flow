import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { useInteractiveGuide } from "@/hooks/useInteractiveGuide";
import { useLocation } from "react-router-dom";

interface InteractiveGuideButtonProps {
  className?: string;
}

export function InteractiveGuideButton({ className }: InteractiveGuideButtonProps) {
  const location = useLocation();
  const { startGuide, hasGuideForRoute, isGuideActive } = useInteractiveGuide();

  if (!hasGuideForRoute(location.pathname)) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => startGuide()}
      disabled={isGuideActive}
      className={className}
    >
      <HelpCircle className="h-4 w-4 mr-2" />
      Guia Interativo
    </Button>
  );
}