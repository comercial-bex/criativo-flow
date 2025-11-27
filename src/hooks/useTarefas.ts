// BEX 3.0 - Hook para gerenciar tarefas

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tarefa } from '@/types/tarefa';
import { useToast } from '@/hooks/use-toast';
import { sanitizeTaskPayload } from '@/utils/tarefaUtils';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';

interface UseTarefasOptions {
  projetoId?: string;
  clienteId?: string;
  responsavelId?: string;
  executorId?: string;
  status?: string[];
  tipo?: string[];
}

export function useTarefas(options: UseTarefasOptions = {}) {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { saveTask, isOnline, getCache, setCache, invalidateCache } = useOfflineStorage();

  const fetchTarefas = useCallback(async () => {
    // Gerar chave de cache baseada nos filtros
    const cacheKey = `tarefas-${JSON.stringify(options)}`;
    
    try {
      setLoading(true);
      
      // Tentar buscar do cache primeiro (se offline)
      if (!isOnline()) {
        const cached = await getCache<Tarefa[]>(cacheKey);
        if (cached) {
          setTarefas(cached);
          setLoading(false);
          return;
        }
      }

      let query = supabase
        .from('tarefa')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(0, 49); // Paginação: primeiros 50 registros

      if (options.projetoId) {
        query = query.eq('projeto_id', options.projetoId);
      }
      if (options.clienteId) {
        query = query.eq('cliente_id', options.clienteId);
      }
      if (options.responsavelId) {
        query = query.eq('responsavel_id', options.responsavelId);
      }
      if (options.executorId) {
        query = query.eq('executor_id', options.executorId);
      }
      if (options.status && options.status.length > 0) {
        query = query.in('status', options.status as any);
      }
      if (options.tipo && options.tipo.length > 0) {
        query = query.in('tipo', options.tipo as any);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const mappedData = (data || []).map(item => ({
        ...item,
        checklist: item.checklist ? JSON.parse(JSON.stringify(item.checklist)) : []
      })) as Tarefa[];
      
      setTarefas(mappedData);
      
      // Salvar no cache (TTL: 5 minutos)
      await setCache(cacheKey, mappedData, {
        ttl: 5 * 60 * 1000,
        tags: ['tarefas', `cliente-${options.clienteId}`, `projeto-${options.projetoId}`].filter(Boolean) as string[]
      });
    } catch (error) {
      // Em caso de erro de rede, tentar buscar do cache
      const cached = await getCache<Tarefa[]>(cacheKey);
      
      if (cached) {
        setTarefas(cached);
        toast({
          title: 'Dados do cache',
          description: 'Mostrando dados salvos localmente',
        });
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao carregar tarefas',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [options, toast, isOnline, getCache, setCache]);

  useEffect(() => {
    fetchTarefas();
  }, [fetchTarefas]);

  const createTarefa = async (novaTarefa: Partial<Tarefa>) => {
    try {
      // Se offline, salvar localmente
      if (!isOnline()) {
        const offlineTask = {
          id: crypto.randomUUID(),
          titulo: novaTarefa.titulo || '',
          descricao: novaTarefa.descricao || '',
          status: novaTarefa.status || 'backlog',
          prioridade: novaTarefa.prioridade || 'media',
          cliente_id: novaTarefa.cliente_id || null,
          projeto_id: novaTarefa.projeto_id || null,
          responsavel_id: novaTarefa.responsavel_id || null,
          executor_id: novaTarefa.executor_id || null,
          tipo: novaTarefa.tipo || 'tarefa',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          checklist: novaTarefa.checklist || [],
          synced: false,
          local_only: false,
        };

        await saveTask(offlineTask as any);
        
        // Adicionar à lista local
        setTarefas(prev => [offlineTask as any, ...prev]);
        
        toast({
          title: 'Tarefa salva offline',
          description: 'Será sincronizada quando você voltar a ficar online',
        });
        
        return { data: offlineTask, error: null };
      }
      
      const payload = sanitizeTaskPayload(novaTarefa as any);
      
      const { data, error } = await supabase
        .from('tarefa')
        .insert(payload as any)
        .select()
        .single();

      if (error) throw error;

      setTarefas((prev) => [{
        ...data,
        checklist: data.checklist ? JSON.parse(JSON.stringify(data.checklist)) : []
      } as Tarefa, ...prev]);
      
      // Invalidar cache
      await invalidateCache('tarefas');
      
      toast({
        title: 'Sucesso',
        description: 'Tarefa criada com sucesso',
      });

      return { data, error: null };
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao criar tarefa',
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const updateTarefa = async (tarefaId: string, updates: Partial<Tarefa>) => {
    try {
      const { data, error } = await supabase
        .from('tarefa')
        .update(updates as any)
        .eq('id', tarefaId)
        .select()
        .single();

      if (error) throw error;

      setTarefas((prev) =>
        prev.map((t) => (t.id === tarefaId ? { 
          ...t, 
          ...data,
          checklist: data.checklist ? JSON.parse(JSON.stringify(data.checklist)) : t.checklist
        } as Tarefa : t))
      );
      
      // Invalidar cache
      await invalidateCache('tarefas');

      toast({
        title: 'Sucesso',
        description: 'Tarefa atualizada',
      });

      return { data, error: null };
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar tarefa',
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const deleteTarefa = async (tarefaId: string) => {
    try {
      const { error } = await supabase
        .from('tarefa')
        .delete()
        .eq('id', tarefaId);

      if (error) throw error;

      setTarefas((prev) => prev.filter((t) => t.id !== tarefaId));
      
      // Invalidar cache
      await invalidateCache('tarefas');

      toast({
        title: 'Sucesso',
        description: 'Tarefa removida',
      });

      return { error: null };
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao remover tarefa',
        variant: 'destructive',
      });
      return { error };
    }
  };

  return {
    tarefas,
    loading,
    createTarefa,
    updateTarefa,
    deleteTarefa,
    refetch: fetchTarefas,
  };
}
