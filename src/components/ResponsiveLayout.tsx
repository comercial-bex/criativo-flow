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
  const isMobile = deviceType === 'mobile-small' || deviceType === 'mobile';
  const isTablet = deviceType === 'tablet' || deviceType === 'tablet-large';
  const isDesktop = deviceType === 'desktop' || deviceType === 'desktop-large';

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col w-full bg-background">
        {/* Mobile Header - Responsive */}
        <header className={`${
          deviceType === 'mobile-small' ? 'h-12' : 'h-14'
        } flex items-center border-b bg-background px-2 mobile:px-4 sticky top-0 z-50`}>
          <GlobalHeader />
        </header>
        
        {/* Mobile Content */}
        <main className={`flex-1 overflow-auto bg-muted/20 pb-20 ${
          deviceType === 'mobile-small' ? 'px-2' : 'px-4'
        }`}>
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
    <SidebarProvider defaultOpen={isDesktop}>
      <div 
        className="min-h-screen w-full bg-background grid grid-cols-[auto_1fr]"
        data-sidebar={isDesktop ? "expanded" : "collapsed"}
      >
        {/* Sidebar - Show on tablet and desktop */}
        <div className="fixed left-0 top-0 h-screen z-40">
          <AppSidebar />
        </div>
        
        {/* Main Content Area */}
        <div 
          className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
            isDesktop ? 'ml-[var(--sidebar-width,280px)]' : isTablet ? 'ml-0' : 'ml-0'
          }`}
        >
          {/* Responsive Header */}
          <header className={`${
            isTablet ? 'h-14' : 'h-16'
          } flex items-center border-b bg-background/95 backdrop-blur-sm px-2 mobile:px-3 tablet:px-4 sticky top-0 z-50 shadow-sm`}>
          <div className="flex items-center gap-2 mobile:gap-3 flex-1">
              {(isTablet && !isDesktop) && (
                <SidebarTrigger className="hover:bg-muted/50 p-2 rounded-md transition-colors" />
              )}
              <GlobalHeader />
            </div>
          </header>
          
          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto bg-muted/20 relative">
            <div className={`container mx-auto ${
              isTablet ? 'p-4' : 'p-6'
            }`}>
              {children}
            </div>
          </main>
        </div>
        
        {/* PWA Install Prompt */}
        <PWAInstallPrompt />
      </div>
    </SidebarProvider>
  );
}