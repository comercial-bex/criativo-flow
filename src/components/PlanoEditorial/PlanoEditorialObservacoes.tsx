import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast-compat";

interface PlanoEditorialObservacoesProps {
  planejamentoId: string;
  observacoes: string | null;
  onSave: () => void;
}

export function PlanoEditorialObservacoes({ planejamentoId, observacoes, onSave }: PlanoEditorialObservacoesProps) {
  const [text, setText] = useState(observacoes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('planejamentos')
        .update({ observacoes_estrategista: text })
        .eq('id', planejamentoId);

      if (error) throw error;
      toast.success('Observações salvas com sucesso');
      onSave();
    } catch (error) {
      console.error('Erro ao salvar observações:', error);
      toast.error('Erro ao salvar observações');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="mt-6 rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-bold">💬 Observações do Estrategista</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Adicione observações, insights, sugestões estratégicas ou feedback sobre o plano editorial..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          className="resize-none"
        />
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Observações'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
