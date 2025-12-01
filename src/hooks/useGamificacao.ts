import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface GamificacaoUsuario {
  id: string;
  user_id: string;
  setor: 'grs' | 'design' | 'audiovisual';
  pontos_totais: number;
  pontos_mes_atual: number;
  posicao_ranking?: number;
  selos_conquistados: any;
  profiles?: {
    nome: string;
    avatar_url?: string;
  };
}

interface Selo {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  setor?: 'grs' | 'design' | 'audiovisual';
}

interface HistoricoPontos {
  id: string;
  tipo_acao: string;
  pontos: number;
  descricao?: string;
  is_privado: boolean;
  created_at: string;
}

export function useGamificacao() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [meuPerfil, setMeuPerfil] = useState<GamificacaoUsuario | null>(null);
  const [ranking, setRanking] = useState<GamificacaoUsuario[]>([]);
  const [selos, setSelos] = useState<Selo[]>([]);
  const [historico, setHistorico] = useState<HistoricoPontos[]>([]);

  const fetchMeuPerfil = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('gamificacao_usuarios')
        .select(`
          *,
          profiles (nome, avatar_url)
        `)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil de gamificação:', error);
        return;
      }

      setMeuPerfil(data as any);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    }
  };

  const fetchRanking = async () => {
    try {
      const { data, error } = await supabase
        .from('gamificacao_usuarios')
        .select(`
          *,
          profiles (nome, avatar_url)
        `)
        .order('pontos_mes_atual', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Erro ao buscar ranking:', error);
        return;
      }

      setRanking((data as any) || []);
    } catch (error) {
      console.error('Erro ao buscar ranking:', error);
    }
  };

  const fetchSelos = async () => {
    try {
      const { data, error } = await supabase
        .from('gamificacao_selos')
        .select('*')
        .order('nome');

      if (error) {
        console.error('Erro ao buscar selos:', error);
        return;
      }

      setSelos(data || []);
    } catch (error) {
      console.error('Erro ao buscar selos:', error);
    }
  };

  const fetchHistorico = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await (supabase
        .from('gamificacao_pontos' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50) as any);

      if (error) {
        console.error('Erro ao buscar histórico:', error);
        return;
      }

      setHistorico((data as HistoricoPontos[]) || []);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    }
  };

  const adicionarPontos = async (
    tipoAcao: 'feedback_positivo' | 'entrega_prazo' | 'agendamento_prazo' | 'relatorio_entregue' | 'atraso_postagem' | 'meta_batida' | 'pacote_concluido' | 'entrega_antecipada' | 'aprovado_primeira' | 'material_reprovado' | 'video_entregue' | 'entregas_semanais' | 'video_aprovado' | 'video_reprovado',
    pontos: number,
    descricao?: string,
    isPrivado: boolean = false
  ) => {
    if (!user?.id) return false;

    try {
      const { data, error } = await supabase.rpc('atualizar_pontuacao_gamificacao', {
        p_user_id: user.id,
        p_tipo_acao: tipoAcao,
        p_pontos: pontos,
        p_descricao: descricao,
        p_is_privado: isPrivado
      });

      if (error) {
        console.error('Erro ao adicionar pontos:', error);
        return false;
      }

      // Atualizar dados locais
      await fetchMeuPerfil();
      await fetchRanking();
      await fetchHistorico();

      return true;
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error);
      return false;
    }
  };

  const getRankingPorSetor = (setor: 'grs' | 'design' | 'audiovisual') => {
    return ranking.filter(usuario => usuario.setor === setor);
  };

  const getSelosPorSetor = (setor?: 'grs' | 'design' | 'audiovisual') => {
    if (!setor) return selos.filter(selo => !selo.setor);
    return selos.filter(selo => selo.setor === setor || !selo.setor);
  };

  const getMensagemMotivacional = () => {
    const mensagens = [
      "Você está evoluindo a cada entrega! 🚀",
      "Mais uma meta cumprida, parabéns pelo foco! 🎯",
      "Continue assim, a qualidade está fazendo a diferença! ⭐",
      "Sua dedicação está sendo reconhecida! 💪",
      "Excelente trabalho, você está no caminho certo! 🌟",
      "Cada ponto conquistado é um passo rumo ao sucesso! 🏆"
    ];
    
    return mensagens[Math.floor(Math.random() * mensagens.length)];
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchMeuPerfil(),
        fetchRanking(),
        fetchSelos(),
        fetchHistorico()
      ]);
      setLoading(false);
    };

    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  return {
    loading,
    meuPerfil,
    ranking,
    selos,
    historico,
    adicionarPontos,
    getRankingPorSetor,
    getSelosPorSetor,
    getMensagemMotivacional,
    refetch: async () => {
      await Promise.all([
        fetchMeuPerfil(),
        fetchRanking(),
        fetchSelos(),
        fetchHistorico()
      ]);
    }
  };
}