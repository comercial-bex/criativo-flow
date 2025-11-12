/**
 * Lazy loading wrapper for Intro.js (onboarding)
 * Reduces initial bundle size by ~100KB
 */

export const loadIntroJS = async () => {
  const introJs = await import('intro.js');
  return introJs.default || introJs;
};
