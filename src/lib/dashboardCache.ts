/**
 * Configurações de cache para o Dashboard de Gestão
 * 
 * staleTime: Tempo em que os dados são considerados "frescos" (não refaz a query)
 * gcTime (cacheTime): Tempo que os dados ficam em cache após não serem mais usados
 */

export const DASHBOARD_CACHE_CONFIG = {
  // KPIs principais - atualizam com frequência moderada
  kpis: {
    staleTime: 2 * 60 * 1000,      // 2 minutos
    gcTime: 10 * 60 * 1000,        // 10 minutos
    refetchInterval: 5 * 60 * 1000 // Refresh automático a cada 5 min
  },
  
  // Dívidas e inadimplência - dados críticos mas menos dinâmicos
  dividas: {
    staleTime: 5 * 60 * 1000,      // 5 minutos
    gcTime: 15 * 60 * 1000,        // 15 minutos
    refetchInterval: undefined      // Sem refresh automático
  },
  
  // Dados comerciais - mais dinâmicos (orçamentos, propostas)
  comercial: {
    staleTime: 1 * 60 * 1000,      // 1 minuto
    gcTime: 5 * 60 * 1000,         // 5 minutos
    refetchInterval: 3 * 60 * 1000 // Refresh automático a cada 3 min
  },
  
  // Folha de pagamento - dados estáveis
  folha: {
    staleTime: 10 * 60 * 1000,     // 10 minutos
    gcTime: 30 * 60 * 1000,        // 30 minutos
    refetchInterval: undefined      // Sem refresh automático
  },
  
  // Gráficos e análises - podem ser um pouco desatualizados
  charts: {
    staleTime: 3 * 60 * 1000,      // 3 minutos
    gcTime: 15 * 60 * 1000,        // 15 minutos
    refetchInterval: undefined      // Sem refresh automático
  }
} as const;
