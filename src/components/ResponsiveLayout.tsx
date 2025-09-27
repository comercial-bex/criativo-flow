import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { GlobalHeader } from "@/components/GlobalHeader";
import { BottomNavigation } from "@/components/BottomNavigation";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { useDeviceType } from "@/hooks/useDeviceType";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col w-full bg-background">
        {/* Mobile Header - Compacto */}
        <header className="h-14 flex items-center border-b bg-background px-4 sticky top-0 z-40">
          <GlobalHeader />
        </header>
        
        {/* Mobile Content */}
        <main className="flex-1 overflow-auto bg-muted/20 pb-20">
          {children}
        </main>
        
        {/* Mobile Bottom Navigation */}
        <BottomNavigation />
        
        {/* PWA Install Prompt */}
        <PWAInstallPrompt />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col relative">
          <header className={`${isTablet ? 'h-14' : 'h-16'} flex items-center border-b bg-background px-4 sticky top-0 z-40`}>
            <div className="flex items-center gap-3 flex-1">
              <SidebarTrigger className="hover:bg-muted/50 p-2 rounded-md transition-colors" />
              <GlobalHeader />
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-muted/20 relative z-10">
            {children}
          </main>
        </div>
        
        {/* PWA Install Prompt */}
        <PWAInstallPrompt />
      </div>
    </SidebarProvider>
  );
}