import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";

interface DialogAnaliseIAProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analise: string;
  totalPosts: number;
  distribuicaoObjetivos: Record<string, number>;
  distribuicaoFormatos: Record<string, number>;
}

export const DialogAnaliseIA: React.FC<DialogAnaliseIAProps> = ({
  open,
  onOpenChange,
  analise,
  totalPosts,
  distribuicaoObjetivos,
  distribuicaoFormatos,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Análise Estratégica do Plano Editorial
          </DialogTitle>
          <DialogDescription>
            Insights gerados por IA para otimizar seu planejamento de conteúdo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Métricas Gerais */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{totalPosts}</div>
                  <div className="text-sm text-muted-foreground">Posts Planejados</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {Object.keys(distribuicaoObjetivos).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Objetivos Diferentes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {Object.keys(distribuicaoFormatos).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Formatos Usados</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Distribuição de Objetivos */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Distribuição por Objetivo
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(distribuicaoObjetivos).map(([objetivo, count]) => (
                <Badge key={objetivo} variant="outline" className="text-sm">
                  {objetivo}: {count} {count === 1 ? 'post' : 'posts'}
                </Badge>
              ))}
            </div>
          </div>

          {/* Distribuição de Formatos */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Distribuição por Formato
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(distribuicaoFormatos).map(([formato, count]) => (
                <Badge key={formato} variant="secondary" className="text-sm">
                  {formato}: {count} {count === 1 ? 'post' : 'posts'}
                </Badge>
              ))}
            </div>
          </div>

          {/* Análise da IA */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Insights da IA
            </h3>
            <Card>
              <CardContent className="pt-6">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {analise}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alertas */}
          {totalPosts < 8 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-1">Atenção à Frequência</h4>
                    <p className="text-sm text-yellow-700">
                      Com apenas {totalPosts} posts planejados, considere aumentar a frequência para melhor 
                      engajamento. Recomendamos pelo menos 2-3 posts por semana.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
