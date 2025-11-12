/**
 * Lazy loading wrapper for PptxGenJS
 * Reduces initial bundle size by ~200KB
 */

export const loadPptxGenJS = async () => {
  const PptxGenJS = await import('pptxgenjs');
  return PptxGenJS.default || PptxGenJS;
};
