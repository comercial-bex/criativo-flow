// BEX 3.0 - Hook para gerenciar tarefas

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tarefa } from '@/types/tarefa';
import { useToast } from '@/hooks/use-toast';
import { sanitizeTaskPayload } from '@/utils/tarefaUtils';

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

  const fetchTarefas = useCallback(async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('tarefa')
        .select('*')
        .order('created_at', { ascending: false });

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
      setTarefas((data || []).map(item => ({
        ...item,
        checklist: item.checklist ? JSON.parse(JSON.stringify(item.checklist)) : []
      })) as Tarefa[]);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar tarefas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [options, toast]);

  useEffect(() => {
    fetchTarefas();
  }, [fetchTarefas]);

  const createTarefa = async (novaTarefa: Partial<Tarefa>) => {
    try {
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
      
      toast({
        title: 'Sucesso',
        description: 'Tarefa criada com sucesso',
      });

      return { data, error: null };
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
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

      toast({
        title: 'Sucesso',
        description: 'Tarefa atualizada',
      });

      return { data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
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

      toast({
        title: 'Sucesso',
        description: 'Tarefa removida',
      });

      return { error: null };
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
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
