import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/use-debounce';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: 'clientes' | 'projetos' | 'posts' | 'equipamentos' | 'captacoes' | 'especialistas';
  link: string;
  score: number;
}

export function useUniversalSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  const calculateRelevanceScore = (query: string, title: string, description: string) => {
    const q = query.toLowerCase();
    const t = (title || '').toLowerCase();
    const d = (description || '').toLowerCase();
    
    let score = 0;
    if (t.includes(q)) score += 10;
    if (t.startsWith(q)) score += 5;
    if (d.includes(q)) score += 3;
    
    return score;
  };

  const searchClientes = async (): Promise<SearchResult[]> => {
    if (!debouncedQuery.trim()) return [];
    
    try {
      const { data } = await supabase
        .from('clientes')
        .select('id, nome, email')
        .or(`nome.ilike.%${debouncedQuery}%,email.ilike.%${debouncedQuery}%`)
        .limit(5);

      return (data || []).map((item: any) => ({
        id: item.id,
        title: item.nome || 'Sem nome',
        description: item.email || 'Sem email',
        category: 'clientes' as const,
        link: `/clientes/${item.id}`,
        score: calculateRelevanceScore(debouncedQuery, item.nome, item.email)
      }));
    } catch {
      return [];
    }
  };

  const searchProjetos = async (): Promise<SearchResult[]> => {
    if (!debouncedQuery.trim()) return [];
    
    try {
      const { data } = await supabase
        .from('projetos')
        .select('id, nome, descricao')
        .or(`nome.ilike.%${debouncedQuery}%,descricao.ilike.%${debouncedQuery}%`)
        .limit(5);

      return (data || []).map((item: any) => ({
        id: item.id,
        title: item.nome || 'Sem nome',
        description: item.descricao || 'Sem descrição',
        category: 'projetos' as const,
        link: `/projetos/${item.id}`,
        score: calculateRelevanceScore(debouncedQuery, item.nome, item.descricao)
      }));
    } catch {
      return [];
    }
  };

  const searchPlanejamentos = async (): Promise<SearchResult[]> => {
    if (!debouncedQuery.trim()) return [];
    
    try {
      const { data } = await supabase
        .from('planejamentos')
        .select('id, titulo, descricao')
        .or(`titulo.ilike.%${debouncedQuery}%,descricao.ilike.%${debouncedQuery}%`)
        .limit(5);

      return (data || []).map((item: any) => ({
        id: item.id,
        title: item.titulo || 'Sem título',
        description: item.descricao || 'Sem descrição',
        category: 'posts' as const,
        link: `/planejamentos/${item.id}`,
        score: calculateRelevanceScore(debouncedQuery, item.titulo, item.descricao)
      }));
    } catch {
      return [];
    }
  };

  const searchEquipamentos = async (): Promise<SearchResult[]> => {
    if (!debouncedQuery.trim()) return [];
    
    try {
      const { data } = await supabase
        .from('equipamentos')
        .select('id, nome, tipo')
        .or(`nome.ilike.%${debouncedQuery}%,tipo.ilike.%${debouncedQuery}%`)
        .limit(5);

      return (data || []).map((item: any) => ({
        id: item.id,
        title: item.nome || 'Sem nome',
        description: item.tipo || 'Sem tipo',
        category: 'equipamentos' as const,
        link: '/audiovisual/equipamentos',
        score: calculateRelevanceScore(debouncedQuery, item.nome, item.tipo)
      }));
    } catch {
      return [];
    }
  };

  const searchCaptacoes = async (): Promise<SearchResult[]> => {
    if (!debouncedQuery.trim()) return [];
    
    try {
      const { data } = await supabase
        .from('captacoes_agenda')
        .select('id, titulo, local')
        .or(`titulo.ilike.%${debouncedQuery}%,local.ilike.%${debouncedQuery}%`)
        .limit(5);

      return (data || []).map((item: any) => ({
        id: item.id,
        title: item.titulo || 'Sem título',
        description: item.local || 'Sem local',
        category: 'captacoes' as const,
        link: '/audiovisual/captacoes',
        score: calculateRelevanceScore(debouncedQuery, item.titulo, item.local)
      }));
    } catch {
      return [];
    }
  };

  const searchEspecialistas = async (): Promise<SearchResult[]> => {
    if (!debouncedQuery.trim()) return [];
    
    try {
      const { data } = await supabase
        .from('pessoas')
        .select('id, nome, email')
        .or(`nome.ilike.%${debouncedQuery}%,email.ilike.%${debouncedQuery}%`)
        .limit(5);

      return (data || []).map((item: any) => ({
        id: item.id,
        title: item.nome || 'Sem nome',
        description: item.email || 'Sem email',
        category: 'especialistas' as const,
        link: `/especialistas/${item.id}`,
        score: calculateRelevanceScore(debouncedQuery, item.nome, item.email)
      }));
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      
      try {
        const searchPromises = [
          searchClientes(),
          searchProjetos(),
          searchPlanejamentos(),
          searchEquipamentos(),
          searchCaptacoes(),
          searchEspecialistas()
        ];

        const allResults = await Promise.all(searchPromises);
        const flatResults = allResults.flat();
        
        // Sort by relevance score
        const sortedResults = flatResults.sort((a, b) => b.score - a.score);
        setResults(sortedResults.slice(0, 10)); // Limit to 10 results
      } catch (error) {
        console.error('Erro na busca:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  return { results, isLoading, query: debouncedQuery };
}