import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Target, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast-compat";

interface SuggestObjectiveButtonProps {
  postId: string;
  currentObjective: string | null;
  onRefresh: () => void;
}

export function SuggestObjectiveButton({ postId, currentObjective, onRefresh }: SuggestObjectiveButtonProps) {
  const [suggesting, setSuggesting] = useState(false);

  const handleSuggest = async () => {
    setSuggesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-post-objective', {
        body: { post_id: postId }
      });

      if (error) throw error;

      toast.success('Objetivo sugerido com sucesso!');
      onRefresh();
    } catch (error: any) {
      console.error('Erro ao sugerir objetivo:', error);
      toast.error(error.message || 'Erro ao sugerir objetivo com IA');
    } finally {
      setSuggesting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 text-bex hover:text-bex/80"
      onClick={handleSuggest}
      disabled={suggesting}
      title="Sugerir objetivo com IA"
    >
      {suggesting ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Target className="h-3 w-3" />
      )}
    </Button>
  );
}
