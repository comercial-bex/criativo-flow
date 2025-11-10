import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { GlobalHeader } from "@/components/GlobalHeader";
import { BottomNavigation } from "@/components/BottomNavigation";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { useDeviceType } from "@/hooks/useDeviceType";
import { Button } from "@/components/ui/button";
import { smartToast } from "@/lib/smart-toast";
import { useState } from "react";
import { SPACING } from "@/lib/design-tokens";
interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}
export function ResponsiveLayout({
  children,
  className
}: ResponsiveLayoutProps) {
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const [showVersion, setShowVersion] = useState(false);
  const handleForceUpdate = async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
      smartToast.success('Cache limpo! Recarregando...');
      setTimeout(() => {
        window.location.href = window.location.origin + '?v=' + Date.now();
      }, 500);
    } catch (error) {
      smartToast.error('Erro ao limpar cache');
    }
  };
  if (isMobile) {
    return <div className={`min-h-screen flex flex-col w-full bg-background ${className || ''}`}>
        {/* Mobile Header - Compacto */}
        <header className="layout-header h-14 flex items-center justify-between border-b border-bex/20 bg-black/95 sticky top-0 z-50 shadow-lg shadow-bex/10 safe-area-inset-top ios-optimized-fixed">
          <GlobalHeader />
        </header>
        
        {/* Mobile Content */}
        <main className="layout-content flex-1 overflow-auto bg-muted/20 pb-20 ios-optimized-scroll">
          {children}
        </main>
        
        {/* Mobile Bottom Navigation */}
        <BottomNavigation />
        
        {/* PWA Install Prompt */}
        <PWAInstallPrompt />
      </div>;
  }
  return <SidebarProvider defaultOpen={true}>
      <div className={`min-h-screen w-full bg-background flex ${className || ''}`}>
        <AppSidebar />
        
        <div className="flex flex-col min-h-screen flex-1 overflow-hidden">
          <header className={`layout-header ${isTablet ? 'h-14' : 'h-16'} flex items-center border-b border-bex/20 bg-black/95 sticky top-0 z-40 shadow-lg shadow-bex/10 safe-area-inset-top ios-optimized-fixed`}>
            <div className={`flex items-center ${SPACING.header.gap} flex-1`}>
              <SidebarTrigger className="hover:bg-bex/10 hover:text-bex p-2 rounded-md transition-all border border-transparent hover:border-bex/30" />
              <GlobalHeader />
            </div>
          </header>
          
          <main className="layout-content flex-1 overflow-y-auto bg-muted/20 ios-optimized-scroll">
            {children}
          </main>
          
          {/* Footer com versão e botão de atualização */}
          <footer className="layout-footer border-t border-border/50 bg-card/50 backdrop-blur-sm flex items-center justify-between text-xs text-muted-foreground">
            <div className={`flex items-center ${SPACING.footer.gap}`}>
              <span onClick={() => setShowVersion(!showVersion)} className="cursor-pointer hover:text-bex transition-colors">
                🎮 BEX Flow v4.0.2
              </span>
              {showVersion && <span className="text-[10px] opacity-60">- Gamer Edition</span>}
            </div>
            <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-[10px] hover:text-bex hover:bg-bex/10" onClick={handleForceUpdate}>
              🔄 Forçar Atualização
            </Button>
          </footer>
        </div>
        
        <PWAInstallPrompt />
      </div>
    </SidebarProvider>;
}