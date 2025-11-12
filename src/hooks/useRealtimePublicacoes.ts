import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { playNotificationSound } from '@/lib/notification-sound';

export function useRealtimePublicacoes() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('publicacoes_realtime')
      // Monitorar publicações concluídas
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'publicacao_queue',
        filter: `status=eq.publicado`
      }, (payload: any) => {
        playNotificationSound();
        toast({
          title: '✅ Post Publicado',
          description: `Publicação realizada com sucesso em ${payload.new.plataforma}`,
          variant: 'default'
        });
      })
      // Monitorar erros de publicação
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'publicacao_queue',
        filter: `status=eq.erro`
      }, (payload: any) => {
        playNotificationSound();
        toast({
          title: '❌ Erro na Publicação',
          description: payload.new.erro_mensagem || 'Falha ao publicar post',
          variant: 'destructive'
        });
      })
      // Monitorar resultados de A/B testing
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'posts_planejamento'
      }, (payload: any) => {
        if (payload.new.variacao_vencedora && !payload.old.variacao_vencedora) {
          playNotificationSound();
          toast({
            title: '🏆 Teste A/B Concluído',
            description: `Variação vencedora identificada com ${Math.round(payload.new.confianca_estatistica || 0)}% de confiança`,
            variant: 'default'
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
}
