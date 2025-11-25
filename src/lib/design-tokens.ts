/**
 * Design Tokens - Sistema de espaçamento padronizado
 * Centraliza todos os valores de spacing para garantir consistência
 */

export const SPACING = {
  // Header spacing
  header: {
    padding: 'px-4 md:px-6',
    paddingDesktop: 'px-6',
    gap: 'gap-3 md:gap-4',
    height: 'h-14 md:h-16',
    heightDesktop: 'h-16',
  },
  
  // Content spacing
  content: {
    padding: 'p-4 md:p-6 lg:p-8',
    paddingDesktop: 'p-6 lg:p-8',
    paddingX: 'px-4 md:px-6 lg:px-8',
    paddingY: 'py-4 md:py-6 lg:py-8',
    margin: 'mb-4 md:mb-6',
    marginDesktop: 'mb-6',
    gap: 'gap-4 md:gap-6',
  },
  
  // Sidebar spacing
  sidebar: {
    padding: 'p-3 md:p-4',
    paddingDesktop: 'p-4',
    gap: 'gap-2 md:gap-3',
  },
  
  // Modal/Dialog spacing
  modal: {
    padding: 'p-4 md:p-6',
    gap: 'gap-4 md:gap-6',
  },
  
  // Card spacing
  card: {
    padding: 'p-4 md:p-6',
    gap: 'gap-3 md:gap-4',
  },
  
  // Footer spacing
  footer: {
    padding: 'px-4 py-2 md:px-6 md:py-3',
    gap: 'gap-2 md:gap-3',
  }
} as const;

export type SpacingTokens = typeof SPACING;
