import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

interface Briefing {
  id: string;
  tarefa_id: string;
  cliente_id: string;
  titulo: string;
  descricao?: string;
  objetivo_postagem?: string;
  publico_alvo?: string;
  formato_postagem: string;
  call_to_action?: string;
  hashtags?: string;
  contexto_estrategico?: string;
  observacoes?: string;
  anexos?: string[];
  created_at: string;
  updated_at: string;
}

export function useBriefings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [briefings, setBriefings] = useState<Briefing[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBriefings = async (clienteId?: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('briefings')
        .select('*')
        .order('created_at', { ascending: false });

      if (clienteId) {
        query = query.eq('cliente_id', clienteId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBriefings(data || []);
    } catch (error) {
      console.error('Erro ao buscar briefings:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os briefings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createBriefing = async (briefingData: Partial<Briefing> & { cliente_id: string; tarefa_id: string; titulo: string }): Promise<string | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('briefings')
        .insert([briefingData])
        .select()
        .single();

      if (error) throw error;

      // Criar log de atividade
      if (briefingData.cliente_id) {
        await supabase.rpc('criar_log_atividade', {
          p_cliente_id: briefingData.cliente_id,
          p_usuario_id: user.id,
          p_acao: 'criou',
          p_entidade_tipo: 'briefing',
          p_entidade_id: data.id,
          p_descricao: `Briefing "${briefingData.titulo}" foi criado`,
          p_metadata: { 
            formato: briefingData.formato_postagem,
            objetivo: briefingData.objetivo_postagem 
          }
        });
      }

      toast({
        title: "Sucesso",
        description: "Briefing criado com sucesso!",
      });

      setBriefings(prev => [data, ...prev]);
      return data.id;

    } catch (error: any) {
      console.error('Erro ao criar briefing:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o briefing.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateBriefing = async (id: string, updates: Partial<Briefing>): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('briefings')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      // Criar log de atividade
      const briefing = briefings.find(b => b.id === id);
      if (briefing?.cliente_id) {
        await supabase.rpc('criar_log_atividade', {
          p_cliente_id: briefing.cliente_id,
          p_usuario_id: user.id,
          p_acao: 'atualizou',
          p_entidade_tipo: 'briefing',
          p_entidade_id: id,
          p_descricao: `Briefing "${briefing.titulo}" foi atualizado`,
          p_metadata: updates
        });
      }

      toast({
        title: "Sucesso",
        description: "Briefing atualizado com sucesso!",
      });

      setBriefings(prev => prev.map(briefing => 
        briefing.id === id ? { ...briefing, ...updates } : briefing
      ));

      return true;

    } catch (error: any) {
      console.error('Erro ao atualizar briefing:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o briefing.",
        variant: "destructive",
      });
      return false;
    }
  };

  const getBriefingByTarefa = async (tarefaId: string): Promise<Briefing | null> => {
    try {
      const { data, error } = await supabase
        .from('briefings')
        .select('*')
        .eq('tarefa_id', tarefaId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;

    } catch (error) {
      console.error('Erro ao buscar briefing da tarefa:', error);
      return null;
    }
  };

  const deleteBriefing = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const briefing = briefings.find(b => b.id === id);
      
      const { error } = await supabase
        .from('briefings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Criar log de atividade
      if (briefing?.cliente_id) {
        await supabase.rpc('criar_log_atividade', {
          p_cliente_id: briefing.cliente_id,
          p_usuario_id: user.id,
          p_acao: 'deletou',
          p_entidade_tipo: 'briefing',
          p_entidade_id: id,
          p_descricao: `Briefing "${briefing.titulo}" foi removido`,
          p_metadata: {}
        });
      }

      toast({
        title: "Sucesso",
        description: "Briefing removido com sucesso!",
      });

      setBriefings(prev => prev.filter(briefing => briefing.id !== id));
      return true;

    } catch (error: any) {
      console.error('Erro ao deletar briefing:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível remover o briefing.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    briefings,
    loading,
    fetchBriefings,
    createBriefing,
    updateBriefing,
    getBriefingByTarefa,
    deleteBriefing
  };
}