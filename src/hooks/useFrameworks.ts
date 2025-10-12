import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useFrameworks() {
  return useQuery({
    queryKey: ["roteiro_frameworks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roteiro_frameworks")
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });
}
