import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast-compat";

interface GenerateCaptionButtonProps {
  postId: string;
  onRefresh: () => void;
}

export function GenerateCaptionButton({ postId, onRefresh }: GenerateCaptionButtonProps) {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-post-caption', {
        body: { post_id: postId }
      });

      if (error) throw error;

      toast.success('Legenda gerada com sucesso!');
      onRefresh();
    } catch (error: any) {
      console.error('Erro ao gerar legenda:', error);
      toast.error(error.message || 'Erro ao gerar legenda com IA');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-bex hover:text-bex/80"
      onClick={handleGenerate}
      disabled={generating}
      title="Gerar legenda com IA"
    >
      {generating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
    </Button>
  );
}
