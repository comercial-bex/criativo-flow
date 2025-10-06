import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

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

export function useClientDashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<DashboardCounts>({
    planejamentosPendentes: 0,
    postsPendentes: 0,
    videosPendentes: 0,
    pagamentosVencendo: 0
  });
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchClientProfile = async () => {
    if (!user) return;

    try {
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
    // FASE 4: Correção - aceitar NULL em cliente_id temporariamente
    if (!user) return;

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

  const fetchTimeline = async () => {
    // FASE 4: Correção - aceitar NULL em cliente_id temporariamente
    if (!user) return;

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
  }, [user]);

  useEffect(() => {
    if (clientProfile) {
      Promise.all([
        fetchDashboardCounts(),
        fetchTimeline()
      ]).finally(() => {
        setLoading(false);
      });
    }
  }, [clientProfile]);

  const refresh = async () => {
    setLoading(true);
    await Promise.all([
      fetchDashboardCounts(),
      fetchTimeline()
    ]);
    setLoading(false);
  };

  return {
    counts,
    timeline,
    clientProfile,
    loading,
    refresh
  };
}