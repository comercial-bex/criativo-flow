import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TEMPLATES_TEXTO, getTemplatesPorTipo } from "@/lib/templates-texto-estruturado";
import { Sparkles } from "lucide-react";

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  tipo_conteudo: string;
  tipo_criativo?: string;
  onSelectTemplate: (textoPreenchido: string) => void;
}

export const TemplateSelector = ({ 
  isOpen, 
  onClose, 
  tipo_conteudo, 
  tipo_criativo,
  onSelectTemplate 
}: TemplateSelectorProps) => {
  const templates = getTemplatesPorTipo(tipo_conteudo, tipo_criativo);

  if (templates.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Templates de Texto Estruturado</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Nenhum template disponível para este tipo de conteúdo e formato.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Templates de Texto Estruturado
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Selecione um template para começar. Você pode personalizá-lo depois.
          </p>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(85vh-120px)] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {templates.map(template => (
              <Card key={template.id} className="hover:border-primary hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{template.nome}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {template.framework.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{template.descricao}</p>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Preview do Exemplo */}
                  <div className="bg-muted/50 p-3 rounded-lg border">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Preview:</p>
                    <div className="text-xs font-mono leading-relaxed max-h-32 overflow-y-auto text-foreground/80">
                      {template.exemplo}
                    </div>
                  </div>
                  
                  {/* Variáveis Necessárias */}
                  {template.variaveis.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Variáveis: {template.variaveis.length}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {template.variaveis.slice(0, 4).map((variavel, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {variavel}
                          </Badge>
                        ))}
                        {template.variaveis.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.variaveis.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    size="sm" 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    onClick={() => {
                      onSelectTemplate(template.template);
                      onClose();
                    }}
                  >
                    <Sparkles className="h-3 w-3 mr-2" />
                    Usar este Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
