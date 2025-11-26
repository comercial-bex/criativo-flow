import { useQuery } from '@tanstack/react-query';

/**
 * Hooks de Inventário - DESABILITADOS
 * Tabelas inventario_* foram removidas
 */
export function useInventarioItens() {
  return useQuery({
    queryKey: ['inventario-itens'],
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

export function useInventarioModelos() {
  return useQuery({
    queryKey: ['inventario-modelos'],
    queryFn: () => [],
    enabled: false,
  });
}

export function useCreateInventarioItem() {
  return {
    mutate: () => console.warn('⚠️ inventario_itens removida'),
    isPending: false,
  };
}

export function useUpdateInventarioItem() {
  return {
    mutate: () => console.warn('⚠️ inventario_itens removida'),
    isPending: false,
  };
}
