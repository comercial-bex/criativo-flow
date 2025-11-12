/**
 * Lazy loading wrapper for Mammoth (Word import)
 * Reduces initial bundle size by ~150KB
 */

export const loadMammoth = async () => {
  const mammoth = await import('mammoth');
  return mammoth.default || mammoth;
};
