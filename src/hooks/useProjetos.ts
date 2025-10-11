import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Projeto {
  id: string;
  cliente_id: string | null;
  titulo: string;
  descricao: string | null;
  status: string;
  prioridade: string;
  tipo_projeto: 'plano_editorial' | 'avulso' | 'campanha';
  data_inicio: string | null;
  data_prazo: string | null;
  created_by: string | null;
  responsavel_grs_id: string | null;
  responsavel_atendimento_id: string | null;
  orcamento_estimado: number | null;
  progresso: number;
  created_at: string;
  updated_at: string;
  clientes?: {
    nome: string;
  };
  profiles?: {
    nome: string;
  };
}

export interface TarefaProjeto {
  id: string;
  projeto_id: string;
  titulo: string;
  descricao: string | null;
  setor_responsavel: string;
  responsavel_id: string | null;
  status: string;
  prioridade: string;
  data_inicio: string | null;
  data_prazo: string | null;
  horas_estimadas: number | null;
  horas_trabalhadas: number;
  dependencias: string[] | null;
  anexos: string[] | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  responsavel?: {
    nome: string;
  };
  projetos?: {
    titulo: string;
    clientes?: {
      nome: string;
    };
  };
}

export function useProjetos() {
  const { user } = useAuth();
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [tarefas, setTarefas] = useState<TarefaProjeto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjetos = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('projetos')
        .select(`
          *,
          clientes (nome),
          profiles:created_by (nome)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro detalhado ao buscar projetos:', error);
        if (error.code === 'PGRST116') {
          toast.error('Tabela de projetos não encontrada no banco de dados');
        } else if (error.code === '42703') {
          toast.error('Erro no schema da tabela projetos. Verifique as colunas.');
        } else {
          toast.error('Erro ao carregar projetos: ' + error.message);
        }
        setProjetos([]);
        return;
      }

      setProjetos(data as unknown as Projeto[] || []);
    } catch (error: any) {
      console.error('Erro ao buscar projetos:', error);
      toast.error('Erro inesperado ao carregar projetos');
      setProjetos([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTarefasPorSetor = async (setor?: string) => {
    if (!user) return;

    try {
      let query = supabase
        .from('tarefas_projeto')
        .select(`
          *,
          responsavel:profiles!responsavel_id (nome),
          projetos!projeto_id (
            titulo,
            clientes (nome)
          )
        `)
        .order('created_at', { ascending: false });

      if (setor) {
        query = query.eq('setor_responsavel', setor);
      }

      const { data, error } = await query;

      if (error) throw error;

      setTarefas(data as unknown as TarefaProjeto[] || []);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      toast.error('Erro ao carregar tarefas');
    }
  };

  const createProjeto = async (projeto: Partial<Projeto>) => {
    console.log('🚀 [useProjetos] createProjeto chamado');
    console.log('👤 User:', user?.id);
    console.log('📋 Dados do projeto:', projeto);
    
    if (!user) {
      console.error('❌ Usuário não autenticado');
      return null;
    }

    try {
      console.log('📤 Enviando para Supabase...');
      const { data, error } = await supabase
        .from('projetos')
        .insert(projeto as any)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro do Supabase:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('✅ Projeto criado com sucesso:', data);
      toast.success('Projeto criado com sucesso!');
      fetchProjetos();
      return data;
    } catch (error: any) {
      console.error('💥 Erro ao criar projeto:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      toast.error('Erro ao criar projeto: ' + (error.message || 'Erro desconhecido'));
      return null;
    }
  };

  const updateProjeto = async (id: string, updates: Partial<Projeto>) => {
    try {
      const { error } = await supabase
        .from('projetos')
        .update(updates as any)
        .eq('id', id);

      if (error) throw error;

      toast.success('Projeto atualizado com sucesso!');
      fetchProjetos();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
      toast.error('Erro ao atualizar projeto');
      return false;
    }
  };

  const createTarefa = async (tarefa: Partial<TarefaProjeto>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('tarefas_projeto')
        .insert(tarefa as any)
        .select()
        .single();

      if (error) throw error;

      toast.success('Tarefa criada com sucesso!');
      fetchTarefasPorSetor();
      return data;
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast.error('Erro ao criar tarefa');
      return null;
    }
  };

  const updateTarefa = async (id: string, updates: Partial<TarefaProjeto>) => {
    try {
      const { error } = await supabase
        .from('tarefas_projeto')
        .update(updates as any)
        .eq('id', id);

      if (error) throw error;

      toast.success('Tarefa atualizada com sucesso!');
      fetchTarefasPorSetor();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast.error('Erro ao atualizar tarefa');
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjetos();
      fetchTarefasPorSetor();
    }
  }, [user]);

  return {
    projetos,
    tarefas,
    loading,
    fetchProjetos,
    fetchTarefasPorSetor,
    createProjeto,
    updateProjeto,
    createTarefa,
    updateTarefa,
  };
}