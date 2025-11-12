/**
 * Centralized Query Key Factory
 * Garante consistência e evita duplicação de queries
 */

export const queryKeys = {
  // Clientes
  clientes: {
    all: ['clientes'] as const,
    lists: () => [...queryKeys.clientes.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.clientes.lists(), { filters }] as const,
    details: () => [...queryKeys.clientes.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.clientes.details(), id] as const,
    stats: () => [...queryKeys.clientes.all, 'stats'] as const,
  },
  
  // Projetos
  projetos: {
    all: ['projetos'] as const,
    lists: () => [...queryKeys.projetos.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.projetos.lists(), { filters }] as const,
    details: () => [...queryKeys.projetos.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.projetos.details(), id] as const,
    byClient: (clientId: string) => [...queryKeys.projetos.all, 'byClient', clientId] as const,
  },
  
  // Tarefas
  tarefas: {
    all: ['tarefas'] as const,
    lists: () => [...queryKeys.tarefas.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.tarefas.lists(), { filters }] as const,
    details: () => [...queryKeys.tarefas.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.tarefas.details(), id] as const,
    byUser: (userId: string, setor?: string) => 
      [...queryKeys.tarefas.all, 'byUser', userId, { setor }] as const,
    stats: (userId: string) => [...queryKeys.tarefas.all, 'stats', userId] as const,
  },
  
  // Financeiro
  financeiro: {
    all: ['financeiro'] as const,
    lancamentos: {
      all: () => [...queryKeys.financeiro.all, 'lancamentos'] as const,
      list: (filters?: any) => [...queryKeys.financeiro.lancamentos.all(), 'list', { filters }] as const,
      detail: (id: string) => [...queryKeys.financeiro.lancamentos.all(), 'detail', id] as const,
    },
    receitas: () => [...queryKeys.financeiro.all, 'receitas'] as const,
    despesas: () => [...queryKeys.financeiro.all, 'despesas'] as const,
    planoContas: () => [...queryKeys.financeiro.all, 'plano-contas'] as const,
    dashboard: () => [...queryKeys.financeiro.all, 'dashboard'] as const,
  },
  
  // RH
  rh: {
    all: ['rh'] as const,
    colaboradores: {
      all: () => [...queryKeys.rh.all, 'colaboradores'] as const,
      list: (filters?: any) => [...queryKeys.rh.colaboradores.all(), 'list', { filters }] as const,
      detail: (id: string) => [...queryKeys.rh.colaboradores.all(), 'detail', id] as const,
    },
    folhaPonto: () => [...queryKeys.rh.all, 'folha-ponto'] as const,
    folhaPagamento: () => [...queryKeys.rh.all, 'folha-pagamento'] as const,
  },
  
  // Planejamentos
  planejamentos: {
    all: ['planejamentos'] as const,
    lists: () => [...queryKeys.planejamentos.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.planejamentos.lists(), { filters }] as const,
    details: () => [...queryKeys.planejamentos.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.planejamentos.details(), id] as const,
  },
  
  // Aprovações
  aprovacoes: {
    all: ['aprovacoes'] as const,
    pending: () => [...queryKeys.aprovacoes.all, 'pending'] as const,
    history: () => [...queryKeys.aprovacoes.all, 'history'] as const,
    detail: (id: string) => [...queryKeys.aprovacoes.all, 'detail', id] as const,
  },
  
  // Briefings
  briefings: {
    all: ['briefings'] as const,
    lists: () => [...queryKeys.briefings.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.briefings.lists(), { filters }] as const,
    detail: (id: string) => [...queryKeys.briefings.all, 'detail', id] as const,
  },
  
  // Posts
  posts: {
    all: ['posts'] as const,
    lists: () => [...queryKeys.posts.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.posts.lists(), { filters }] as const,
    detail: (id: string) => [...queryKeys.posts.all, 'detail', id] as const,
  },
  
  // Usuários
  usuarios: {
    all: ['usuarios'] as const,
    profile: (userId: string) => [...queryKeys.usuarios.all, 'profile', userId] as const,
    role: (userId: string) => [...queryKeys.usuarios.all, 'role', userId] as const,
    permissions: (userId: string) => [...queryKeys.usuarios.all, 'permissions', userId] as const,
  },
  
  // Notificações
  notificacoes: {
    all: ['notificacoes'] as const,
    unread: () => [...queryKeys.notificacoes.all, 'unread'] as const,
    list: (userId: string) => [...queryKeys.notificacoes.all, 'list', userId] as const,
  },
  
  // Métricas (realtime)
  metrics: {
    all: ['metrics'] as const,
    dashboard: () => [...queryKeys.metrics.all, 'dashboard'] as const,
    realtime: (type: string) => [...queryKeys.metrics.all, 'realtime', type] as const,
  },
} as const;

export type QueryKeys = typeof queryKeys;
