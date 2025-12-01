import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityEvent {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id?: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  metadata?: any;
  user_email?: string;
  user_role?: string;
}

interface ActivityLog {
  id: string;
  usuario_id: string;
  acao: string;
  entidade_tipo: string;
  entidade_id?: string;
  descricao: string;
  metadata?: any;
  data_hora: string;
  user_email?: string;
}

interface SecurityStats {
  totalAccessAttempts: number;
  failedAccessAttempts: number;
  sensitiveDataAccess: number;
  recentAlerts: number;
  topUsers: Array<{ user_email: string; count: number }>;
  topTables: Array<{ table_name: string; count: number }>;
}

export function useSecurityMonitoring() {
  const { toast } = useToast();
  const [realtimeEvents, setRealtimeEvents] = useState<SecurityEvent[]>([]);

  // Fetch audit logs (dados simulados até criação da tabela audit_sensitive_access)
  const { data: auditLogs = [], refetch: refetchAudit } = useQuery({
    queryKey: ['security-audit-logs'],
    queryFn: async () => {
      // Retorna array vazio por enquanto - será preenchido quando a tabela estiver disponível
      return [] as SecurityEvent[];
    },
    refetchInterval: 10000
  });

  // Fetch activity logs
  const { data: activityLogs = [], refetch: refetchActivity } = useQuery({
    queryKey: ['security-activity-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('logs_atividade')
        .select('*')
        .order('data_hora', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching activity logs:', error);
        return [];
      }

      // Buscar emails dos usuários
      const userIds = [...new Set(data.map(log => log.usuario_id))].filter(Boolean);
      const { data: profiles } = await (supabase
        .from('pessoas')
        .select('profile_id, email')
        .in('profile_id', userIds) as any);

      const profileMap = new Map((profiles as any[])?.map((p: any) => [p.profile_id, p.email]) || []);

      return (data || []).map(log => ({
        ...log,
        user_email: profileMap.get(log.usuario_id) || 'System'
      })) as ActivityLog[];
    },
    refetchInterval: 10000
  });

  // Calculate statistics
  const { data: stats } = useQuery({
    queryKey: ['security-stats', auditLogs, activityLogs],
    queryFn: async () => {
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const recentAudits = auditLogs.filter(log => log.timestamp > last24h);
      const failedAccess = recentAudits.filter(log => !log.success);
      
      // Count by user
      const userCounts = new Map<string, number>();
      recentAudits.forEach(log => {
        const email = log.user_email || 'Unknown';
        userCounts.set(email, (userCounts.get(email) || 0) + 1);
      });

      // Count by table
      const tableCounts = new Map<string, number>();
      recentAudits.forEach(log => {
        tableCounts.set(log.table_name, (tableCounts.get(log.table_name) || 0) + 1);
      });

      const topUsers = Array.from(userCounts.entries())
        .map(([user_email, count]) => ({ user_email, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const topTables = Array.from(tableCounts.entries())
        .map(([table_name, count]) => ({ table_name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalAccessAttempts: recentAudits.length,
        failedAccessAttempts: failedAccess.length,
        sensitiveDataAccess: recentAudits.filter(log => 
          ['credenciais_cliente', 'rh_colaboradores'].includes(log.table_name)
        ).length,
        recentAlerts: failedAccess.length + activityLogs.filter(log => 
          log.acao.includes('failed') || log.acao.includes('unauthorized')
        ).length,
        topUsers,
        topTables
      } as SecurityStats;
    },
    enabled: auditLogs.length > 0
  });

  // Setup realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('security-monitoring')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_sensitive_access'
        },
        async (payload) => {
          console.log('🚨 New security event:', payload);
          
          const newEvent = payload.new as SecurityEvent;
          
          // Fetch user details
          const { data: profile } = await (supabase
            .from('pessoas')
            .select('email')
            .eq('profile_id', newEvent.user_id)
            .single() as any);

          const enrichedEvent = {
            ...newEvent,
            user_email: profile?.email || 'Unknown'
          };

          setRealtimeEvents(prev => [enrichedEvent, ...prev.slice(0, 19)]);

          // Show toast for critical events
          if (!newEvent.success) {
            toast({
              title: "🚨 Acesso Negado Detectado",
              description: `Tentativa não autorizada: ${newEvent.action} em ${newEvent.table_name}`,
              variant: "destructive"
            });
          } else if (['credenciais_cliente', 'rh_colaboradores'].includes(newEvent.table_name)) {
            toast({
              title: "🔐 Acesso a Dados Sensíveis",
              description: `${profile?.email || 'Usuário'} acessou ${newEvent.table_name}`,
            });
          }

          // Refetch data
          refetchAudit();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'logs_atividade'
        },
        (payload) => {
          console.log('📝 New activity log:', payload);
          refetchActivity();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast, refetchAudit, refetchActivity]);

  return {
    auditLogs,
    activityLogs,
    realtimeEvents,
    stats,
    refetch: () => {
      refetchAudit();
      refetchActivity();
    }
  };
}
