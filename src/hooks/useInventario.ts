import { useQuery } from '@tanstack/react-query';

/**
 * Hooks de Inventário - DESABILITADOS
 * Tabelas inventario_* foram removidas
 */
export function useInventarioItens(_filtros?: any) {
  return useQuery({
    queryKey: ['inventario-itens', _filtros],
    queryFn: () => [],
    enabled: false,
  });
}

export function useInventarioCategorias() {
  return useQuery({
    queryKey: ['inventario-categorias'],
    queryFn: () => [],
    enabled: false,
  });
}

export function useInventarioModelos(_categoriaId?: string) {
  return useQuery({
    queryKey: ['inventario-modelos', _categoriaId],
    queryFn: () => [],
    enabled: false,
  });
}

export function useCreateInventarioItem() {
  return {
    mutate: () => console.warn('⚠️ inventario_itens removida'),
    mutateAsync: (_data: any) => Promise.resolve(),
    isPending: false,
  };
}

export function useUpdateInventarioItem() {
  return {
    mutate: () => console.warn('⚠️ inventario_itens removida'),
    mutateAsync: (_data: any) => Promise.resolve(),
    isPending: false,
  };
}

export function useVerificarDisponibilidade() {
  return {
    mutate: () => console.warn('⚠️ inventario_itens removida'),
    mutateAsync: (_data: any) => Promise.resolve({ disponivel: false, conflitos: [] }),
    isPending: false,
  };
}
