import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Palette } from "lucide-react";
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';

export default function DesignAprovacoes() {
  const { startTutorial, hasSeenTutorial } = useTutorial('design-aprovacoes');
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Eye className="h-8 w-8 text-primary" />
            Aprovações
          </h1>
          <p className="text-muted-foreground">Fila de aprovações de designs</p>
        </div>
        <TutorialButton onStart={startTutorial} hasSeenTutorial={hasSeenTutorial} />
      </div>

      <Card>
        <CardContent className="text-center py-12">
          <Eye className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Sistema de aprovações em desenvolvimento</p>
        </CardContent>
      </Card>
    </div>
  );
}