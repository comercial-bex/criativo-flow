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
        <header className="h-14 flex items-center border-b border-bex/20 bg-black/40 backdrop-blur-md px-4 sticky top-0 z-50 shadow-lg shadow-bex/10">
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
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen w-full bg-background flex">
        <AppSidebar />
        
        <div className="flex flex-col min-h-screen flex-1 overflow-hidden">
          <header className={`${isTablet ? 'h-14' : 'h-16'} flex items-center border-b border-bex/20 bg-black/40 backdrop-blur-md px-4 sticky top-0 z-40 shadow-lg shadow-bex/10`}>
            <div className="flex items-center gap-3 flex-1">
              <SidebarTrigger className="hover:bg-bex/10 hover:text-bex p-2 rounded-md transition-all border border-transparent hover:border-bex/30" />
              <GlobalHeader />
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto bg-muted/20">
            {children}
          </main>
        </div>
        
        <PWAInstallPrompt />
      </div>
    </SidebarProvider>
  );
}