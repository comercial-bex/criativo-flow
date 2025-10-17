import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

interface DashboardCounts {
  planejamentosPendentes: number;
  postsPendentes: number;
  videosPendentes: number;
  pagamentosVencendo: number;
}

interface TimelineItem {
  id: string;
  tipo: string;
  nome: string;
  data: string;
  status: 'entregue' | 'pendente' | 'urgente';
  dataOriginal: Date;
}

interface ClientProfile {
  id: string;
  nome: string;
  email?: string;
  cliente_id?: string;
  cliente_nome?: string;
}

export interface ProjectWithTasks {
  id: string;
  titulo: string;
  status: string;
  progresso: number;
  total_tarefas: number;
  tarefas_concluidas: number;
  data_inicio: string | null;
  data_fim: string | null;
}

export function useClientDashboard(overrideClienteId?: string) {
  const { user } = useAuth();
  const [counts, setCounts] = useState<DashboardCounts>({
    planejamentosPendentes: 0,
    postsPendentes: 0,
    videosPendentes: 0,
    pagamentosVencendo: 0
  });
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [projects, setProjects] = useState<ProjectWithTasks[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClientProfile = async () => {
    if (!user) return;

    try {
      // Se tiver override de cliente (Admin visualizando como cliente)
      if (overrideClienteId) {
        console.log('🔍 Admin override: buscando cliente', overrideClienteId);
        
        const { data: cliente, error } = await supabase
          .from('clientes')
          .select('id, nome')
          .eq('id', overrideClienteId)
          .single();

        if (error) {
          console.error('❌ Erro ao buscar cliente:', error);
          return;
        }

        if (cliente) {
          console.log('✅ Cliente encontrado:', cliente.nome);
          setClientProfile({
            id: user.id,
            nome: user.email || 'Admin',
            email: user.email,
            cliente_id: cliente.id,
            cliente_nome: cliente.nome
          });
        } else {
          console.warn('⚠️ Cliente não encontrado:', overrideClienteId);
        }
        return;
      }

      // Fluxo normal para usuários clientes
      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          id,
          nome,
          email,
          cliente_id,
          clientes!profiles_cliente_id_fkey(nome)
        `)
        .eq('id', user.id)
        .single();

      if (profile) {
        setClientProfile({
          id: profile.id,
          nome: profile.nome,
          email: profile.email,
          cliente_id: profile.cliente_id,
          cliente_nome: profile.clientes?.nome
        });
      }
    } catch (error) {
      console.error('Erro ao buscar perfil do cliente:', error);
    }
  };

  const fetchDashboardCounts = async () => {
    if (!clientProfile?.cliente_id) {
      console.warn('⚠️ fetchDashboardCounts: cliente_id não disponível');
      return;
    }

    try {
      // Planejamentos pendentes de aprovação
      const { count: planejamentosCount } = await supabase
        .from('planejamentos')
        .select('*', { count: 'exact', head: true })
        .eq('cliente_id', clientProfile.cliente_id)
        .eq('status', 'em_aprovacao_final');

      // Posts pendentes de aprovação - buscar planejamentos do cliente primeiro
      const { data: planejamentosCliente } = await supabase
        .from('planejamentos')
        .select('id')
        .eq('cliente_id', clientProfile.cliente_id);

      const planejamentoIds = planejamentosCliente?.map(p => p.id) || [];
      
      const { count: postsCount } = await supabase
        .from('posts_planejamento')
        .select('*', { count: 'exact', head: true })
        .in('planejamento_id', planejamentoIds);

      // Transações próximas do vencimento (próximos 7 dias)
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() + 7);
      
      const { count: pagamentosCount } = await supabase
        .from('transacoes_financeiras')
        .select('*', { count: 'exact', head: true })
        .eq('cliente_id', clientProfile.cliente_id)
        .eq('status', 'pendente')
        .lte('data_vencimento', dataLimite.toISOString().split('T')[0]);

      setCounts({
        planejamentosPendentes: planejamentosCount || 0,
        postsPendentes: postsCount || 0,
        videosPendentes: 0, // Implementar quando houver tabela de vídeos
        pagamentosVencendo: pagamentosCount || 0
      });
    } catch (error) {
      console.error('Erro ao buscar contadores:', error);
    }
  };

  const fetchProjects = async () => {
    if (!clientProfile?.cliente_id) {
      console.warn('⚠️ fetchProjects: cliente_id não disponível');
      return;
    }

    try {
      // Buscar projetos do cliente
      const { data: projetos, error } = await supabase
        .from('projetos')
        .select('id, titulo, status, data_inicio, data_fim')
        .eq('cliente_id', clientProfile.cliente_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Para cada projeto, buscar tarefas e calcular progresso
      const projetosComProgresso: ProjectWithTasks[] = [];
      
      for (const projeto of projetos || []) {
        // Buscar total de tarefas do projeto
        const tarefasResult = await supabase
          .from('tarefa')
          .select('status')
          .eq('projeto_id', projeto.id);

        const total = tarefasResult.data?.length ?? 0;
        const concluidas = tarefasResult.data?.filter(t => t.status === 'concluido').length ?? 0;
        const progresso = total > 0 
          ? Math.round((concluidas / total) * 100) 
          : 0;

        projetosComProgresso.push({
          id: projeto.id,
          titulo: projeto.titulo,
          status: projeto.status,
          data_inicio: projeto.data_inicio,
          data_fim: projeto.data_fim,
          total_tarefas: total,
          tarefas_concluidas: concluidas,
          progresso
        });
      }

      setProjects(projetosComProgresso);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
    }
  };

  const fetchTimeline = async () => {
    if (!clientProfile?.cliente_id) {
      console.warn('⚠️ fetchTimeline: cliente_id não disponível');
      return;
    }

    try {
      const agora = new Date();
      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
      const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0);

      // Buscar posts do mês atual
      const { data: posts } = await supabase
        .from('posts_planejamento')
        .select(`
          id,
          titulo,
          data_postagem,
          created_at,
          planejamentos!inner(cliente_id)
        `)
        .eq('planejamentos.cliente_id', clientProfile.cliente_id)
        .gte('data_postagem', inicioMes.toISOString().split('T')[0])
        .lte('data_postagem', fimMes.toISOString().split('T')[0])
        .order('data_postagem', { ascending: true });

      // Buscar eventos do mês atual
      const { data: eventos } = await supabase
        .from('eventos_agenda')
        .select('*')
        .eq('cliente_id', clientProfile.cliente_id)
        .gte('data_inicio', inicioMes.toISOString())
        .lte('data_inicio', fimMes.toISOString())
        .order('data_inicio', { ascending: true });

      const timelineItems: TimelineItem[] = [];

      // Adicionar posts à timeline
      posts?.forEach(post => {
        const dataPost = new Date(post.data_postagem);
        const dataEntrega = new Date(post.created_at);
        const isEntregue = dataEntrega <= agora;
        const isUrgente = !isEntregue && (agora.getTime() - dataPost.getTime()) > (2 * 24 * 60 * 60 * 1000);

        timelineItems.push({
          id: post.id,
          tipo: 'Post',
          nome: post.titulo,
          data: dataPost.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          status: isEntregue ? 'entregue' : isUrgente ? 'urgente' : 'pendente',
          dataOriginal: dataPost
        });
      });

      // Adicionar eventos à timeline
      eventos?.forEach(evento => {
        const dataEvento = new Date(evento.data_inicio);
        const isPassado = dataEvento <= agora;

        timelineItems.push({
          id: evento.id,
          tipo: evento.tipo === 'reuniao' ? 'Reunião' : 'Evento',
          nome: evento.titulo,
          data: dataEvento.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          status: isPassado ? 'entregue' : 'pendente',
          dataOriginal: dataEvento
        });
      });

      // Ordenar por data
      timelineItems.sort((a, b) => a.dataOriginal.getTime() - b.dataOriginal.getTime());
      setTimeline(timelineItems);

    } catch (error) {
      console.error('Erro ao buscar timeline:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchClientProfile();
    }
  }, [user, overrideClienteId]);

  useEffect(() => {
    if (clientProfile) {
      Promise.all([
        fetchDashboardCounts(),
        fetchTimeline(),
        fetchProjects()
      ]).finally(() => {
        setLoading(false);
      });
    }
  }, [clientProfile]);

  const refresh = async () => {
    setLoading(true);
    await Promise.all([
      fetchDashboardCounts(),
      fetchTimeline(),
      fetchProjects()
    ]);
    setLoading(false);
  };

  return {
    counts,
    timeline,
    projects,
    clientProfile,
    loading,
    refresh
  };
}