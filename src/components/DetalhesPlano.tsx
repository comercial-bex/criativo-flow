import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Save, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DetalhesPlanoProps {
  planejamento: {
    id: string;
    titulo: string;
    status: string;
    descricao?: string;
  };
  setPlanejamento: (planejamento: any) => void;
  clienteId: string;
}

export function DetalhesPlano({ planejamento, setPlanejamento, clienteId }: DetalhesPlanoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [descricao, setDescricao] = useState(planejamento.descricao || '');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const { data, error } = await supabase
        .from('planejamentos')
        .update({ descricao })
        .eq('id', planejamento.id)
        .select()
        .single();

      if (error) throw error;

      setPlanejamento(data);
      setIsEditing(false);
      
      toast({
        title: "Sucesso",
        description: "Detalhes salvos com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao salvar detalhes:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar detalhes. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDescricao(planejamento.descricao || '');
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              Detalhes Complementares
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              disabled={saving}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancelar' : 'Editar'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Descrição complementar para geração de conteúdo
            </label>
            <p className="text-sm text-muted-foreground">
              Esta descrição será usada como apoio para novas informações relevantes no desenvolvimento do planejamento visual do cliente.
            </p>
            
            {isEditing ? (
              <div className="space-y-4">
                <Textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Digite aqui informações complementares que ajudarão na geração de conteúdo, como:
• Tom de voz da marca
• Diretrizes específicas de comunicação
• Informações sobre produtos/serviços em destaque
• Campanhas sazonais ou promocionais
• Características do público-alvo
• Diferenciais competitivos
• Valores da empresa
• Estilo visual preferido"
                  className="min-h-[200px] resize-none"
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Salvando...' : 'Salvar'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-muted/50 min-h-[200px]">
                {descricao ? (
                  <p className="text-sm whitespace-pre-wrap">{descricao}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Clique em "Editar" para adicionar informações complementares que ajudarão na geração de conteúdo.
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card informativo sobre como usar os detalhes */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader>
          <CardTitle className="text-blue-700 dark:text-blue-300 text-base">
            💡 Como usar os detalhes complementares
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-blue-600 dark:text-blue-400 space-y-2">
            <p><strong>Geração de Conteúdo com IA:</strong> As informações aqui serão utilizadas junto com os dados do onboarding para gerar conteúdo mais personalizado e alinhado com a marca.</p>
            
            <p><strong>Sugestões do que incluir:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Campanhas ou promoções em andamento</li>
              <li>Produtos/serviços em destaque este mês</li>
              <li>Eventos ou datas importantes para a empresa</li>
              <li>Mudanças recentes na estratégia de comunicação</li>
              <li>Feedback do cliente sobre conteúdos anteriores</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}