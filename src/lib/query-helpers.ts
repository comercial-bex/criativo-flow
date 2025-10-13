import { QueryClient } from '@tanstack/react-query';

export const createInvalidateHelpers = (queryClient: QueryClient) => ({
  tarefas: (projetoId?: string) => {
    if (projetoId) {
      queryClient.invalidateQueries({ queryKey: ['tarefas', projetoId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['tarefas'] });
    }
  },
  
  projetos: (clienteId?: string) => {
    if (clienteId) {
      queryClient.invalidateQueries({ queryKey: ['projetos', clienteId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['projetos'] });
    }
  },
  
  planejamentos: (clienteId?: string) => {
    if (clienteId) {
      queryClient.invalidateQueries({ queryKey: ['planejamentos', clienteId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['planejamentos'] });
    }
  },
  
  clientes: () => {
    queryClient.invalidateQueries({ queryKey: ['clientes'] });
  },
  
  posts: (planejamentoId?: string) => {
    if (planejamentoId) {
      queryClient.invalidateQueries({ queryKey: ['posts', planejamentoId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  },
  
  briefings: (projetoId?: string) => {
    if (projetoId) {
      queryClient.invalidateQueries({ queryKey: ['briefings', projetoId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['briefings'] });
    }
  },
  
  aprovacoes: (userId?: string) => {
    if (userId) {
      queryClient.invalidateQueries({ queryKey: ['aprovacoes', userId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['aprovacoes'] });
    }
  },
  
  usuarios: () => {
    queryClient.invalidateQueries({ queryKey: ['usuarios'] });
  },
  
  // 🆕 Invalidação financeira seletiva
  financeiro: (tipo?: 'receita' | 'despesa') => {
    if (tipo === 'receita') {
      queryClient.invalidateQueries({ 
        queryKey: ['composicao-receitas'],
        refetchType: 'none' // Não refetch imediato
      });
      queryClient.invalidateQueries({ 
        queryKey: ['receita-por-cliente'],
        refetchType: 'none'
      });
    } else if (tipo === 'despesa') {
      queryClient.invalidateQueries({ 
        queryKey: ['composicao-despesas'],
        refetchType: 'none'
      });
    } else {
      // Invalidar tudo relacionado a financeiro
      queryClient.invalidateQueries({ 
        queryKey: ['financial-kpis'],
        exact: false // Invalida todas as variações
      });
      queryClient.invalidateQueries({ 
        queryKey: ['receitas-despesas-mensais'],
        exact: false
      });
    }
  },
  
  // 🆕 Invalidação comercial
  comercial: () => {
    queryClient.invalidateQueries({ 
      predicate: (query) => 
        (query.queryKey[0] as string)?.startsWith('comercial-')
    });
  },
});

export type InvalidateHelpers = ReturnType<typeof createInvalidateHelpers>;
