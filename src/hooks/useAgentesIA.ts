import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAgentesIA() {
  return useQuery({
    queryKey: ["roteiro_agentes_ia"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roteiro_agentes_ia")
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });
}
