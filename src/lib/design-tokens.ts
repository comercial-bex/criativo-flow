/**
 * Design Tokens - Sistema de espaçamento padronizado
 * Centraliza todos os valores de spacing para garantir consistência
 */

export const SPACING = {
  // Header spacing
  header: {
    padding: 'px-4',          // 16px - padrão mobile/tablet
    paddingDesktop: 'px-6',   // 24px - desktop
    gap: 'gap-3',             // 12px - gap entre elementos
    height: 'h-14',           // 56px - altura mobile/tablet
    heightDesktop: 'h-16',    // 64px - altura desktop
  },
  
  // Content spacing
  content: {
    padding: 'p-4',           // 16px - padrão mobile
    paddingDesktop: 'p-6',    // 24px - desktop
    margin: 'mb-4',           // 16px - margem padrão
    marginDesktop: 'mb-6',    // 24px - margem desktop
    gap: 'gap-4',             // 16px - gap entre elementos
  },
  
  // Sidebar spacing
  sidebar: {
    padding: 'p-3',           // 12px - padrão
    paddingDesktop: 'p-4',    // 16px - desktop
    gap: 'gap-2',             // 8px - gap entre itens
  },
  
  // Modal/Dialog spacing
  modal: {
    padding: 'p-6',           // 24px
    gap: 'gap-4',             // 16px
  },
  
  // Card spacing
  card: {
    padding: 'p-4',           // 16px
    gap: 'gap-3',             // 12px
  },
  
  // Footer spacing
  footer: {
    padding: 'px-4 py-2',     // 16px horizontal, 8px vertical
    gap: 'gap-2',             // 8px
  }
} as const;

export type SpacingTokens = typeof SPACING;
