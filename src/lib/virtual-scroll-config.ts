/**
 * Performance Configuration for Virtual Scrolling
 * Otimizações específicas para listas virtualizadas
 */

export const VIRTUAL_SCROLL_CONFIG = {
  // Row Heights (pixels)
  ROW_HEIGHT_COMPACT: 48,      // Linhas compactas (listas simples)
  ROW_HEIGHT_DEFAULT: 64,      // Linhas padrão (cards pequenos)
  ROW_HEIGHT_COMFORTABLE: 80,  // Linhas confortáveis (cards médios)
  ROW_HEIGHT_LARGE: 120,       // Linhas grandes (cards completos)
  
  // Overscan (items extras renderizados fora da viewport)
  OVERSCAN_SMALL: 3,           // Para listas pequenas (<100 items)
  OVERSCAN_MEDIUM: 5,          // Para listas médias (100-500 items)
  OVERSCAN_LARGE: 8,           // Para listas grandes (500-1000 items)
  OVERSCAN_XLARGE: 10,         // Para listas muito grandes (>1000 items)
  
  // Heights (pixels)
  DEFAULT_LIST_HEIGHT: 600,    // Altura padrão de listas
  FULL_HEIGHT: 'calc(100vh - 200px)', // Altura total menos header/footer
  
  // Performance Thresholds
  ENABLE_VIRTUAL_SCROLL_AT: 50, // Habilitar virtual scroll a partir de N items
  CHUNK_SIZE: 100,              // Tamanho do chunk para carregamento incremental
  
  // Animation
  SCROLL_DEBOUNCE: 16,          // ~60fps
  RESIZE_DEBOUNCE: 150,         // Debounce para resize
} as const;

/**
 * Helper para determinar overscan baseado no tamanho da lista
 */
export function getOptimalOverscan(itemCount: number): number {
  if (itemCount < 100) return VIRTUAL_SCROLL_CONFIG.OVERSCAN_SMALL;
  if (itemCount < 500) return VIRTUAL_SCROLL_CONFIG.OVERSCAN_MEDIUM;
  if (itemCount < 1000) return VIRTUAL_SCROLL_CONFIG.OVERSCAN_LARGE;
  return VIRTUAL_SCROLL_CONFIG.OVERSCAN_XLARGE;
}

/**
 * Helper para determinar se deve usar virtual scroll
 */
export function shouldUseVirtualScroll(itemCount: number): boolean {
  return itemCount >= VIRTUAL_SCROLL_CONFIG.ENABLE_VIRTUAL_SCROLL_AT;
}
