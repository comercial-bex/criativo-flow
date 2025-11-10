import { useEffect } from 'react';

/**
 * Frontend Health Monitor
 * Detecta problemas comuns de duplicação e inconsistências
 */
export function useFrontendHealth() {
  useEffect(() => {
    // Only run in development mode
    if (import.meta.env.DEV) {
      const checkHealth = () => {
        // 1. Verificar duplicação de toast containers
        const toasters = document.querySelectorAll('[data-sonner-toaster]');
        if (toasters.length > 1) {
          console.error(`❌ HEALTH CHECK: ${toasters.length} toast containers encontrados! Deveria ser apenas 1.`);
        } else if (toasters.length === 1) {
          console.log(`✅ HEALTH CHECK: Toast container único detectado.`);
        }
        
        // 2. Verificar margens hardcoded
        const hardcodedPadding = document.querySelectorAll('[class*="px-["], [class*="py-["], [class*="mx-["], [class*="my-["]');
        if (hardcodedPadding.length > 0) {
          console.warn(`⚠️ HEALTH CHECK: ${hardcodedPadding.length} elementos com padding/margin hardcoded encontrados.`);
          console.warn('Considere usar tokens do design system em design-tokens.ts');
        } else {
          console.log(`✅ HEALTH CHECK: Nenhum padding hardcoded detectado.`);
        }
        
        // 3. Verificar dropdowns duplicados
        const notificationDropdowns = document.querySelectorAll('[data-notification-dropdown]');
        if (notificationDropdowns.length > 1) {
          console.error(`❌ HEALTH CHECK: ${notificationDropdowns.length} NotificationDropdowns encontrados! Deveria ser apenas 1.`);
        } else if (notificationDropdowns.length === 1) {
          console.log(`✅ HEALTH CHECK: NotificationDropdown único detectado.`);
        }
        
        // 4. Score geral
        const issues = 
          (toasters.length > 1 ? 1 : 0) +
          (hardcodedPadding.length > 10 ? 1 : 0) +
          (notificationDropdowns.length > 1 ? 1 : 0);
        
        const healthScore = Math.max(0, 100 - (issues * 20));
        
        if (healthScore === 100) {
          console.log(`✅ FRONTEND HEALTH SCORE: ${healthScore}% - Excelente!`);
        } else if (healthScore >= 80) {
          console.warn(`⚠️ FRONTEND HEALTH SCORE: ${healthScore}% - Bom, mas pode melhorar.`);
        } else {
          console.error(`❌ FRONTEND HEALTH SCORE: ${healthScore}% - Necessita atenção!`);
        }
      };
      
      // Check após o DOM estar completamente carregado
      const timer = setTimeout(checkHealth, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);
}
