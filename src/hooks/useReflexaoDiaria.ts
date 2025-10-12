import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CACHE_KEY = 'reflexao_diaria_cache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

interface CachedReflexao {
  texto: string;
  timestamp: number;
}

export function useReflexaoDiaria() {
  const [reflexao, setReflexao] = useState<string>("Carregando reflexão do dia...");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const generateReflexao = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('generate-reflexao', {
        body: {}
      });

      if (error) throw error;

      const novaReflexao = data.reflexao || "Mantenha o foco e a determinação!";
      
      // Salvar no cache
      const cache: CachedReflexao = {
        texto: novaReflexao,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      
      setReflexao(novaReflexao);
    } catch (error) {
      console.error('Erro ao gerar reflexão:', error);
      setReflexao("Comece o dia com propósito e determinação!");
      
      toast({
        title: "Aviso",
        description: "Não foi possível gerar uma nova reflexão. Usando mensagem padrão.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFromCache = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return false;

      const data: CachedReflexao = JSON.parse(cached);
      const isExpired = Date.now() - data.timestamp > CACHE_TTL;

      if (isExpired) {
        localStorage.removeItem(CACHE_KEY);
        return false;
      }

      setReflexao(data.texto);
      setLoading(false);
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const hasCachedData = loadFromCache();
    
    if (!hasCachedData) {
      generateReflexao();
    }
  }, []);

  const refresh = () => {
    localStorage.removeItem(CACHE_KEY);
    generateReflexao();
  };

  return {
    reflexao,
    loading,
    refresh
  };
}
