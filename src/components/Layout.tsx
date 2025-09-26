import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { GlobalHeader } from "@/components/GlobalHeader";
interface LayoutProps {
  children: React.ReactNode;
}
export function Layout({
  children
}: LayoutProps) {
  return <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col relative">
          <header className="h-16 flex items-center border-b bg-background px-4 sticky top-0 z-50">
            <div className="flex items-center gap-3 flex-1">
              <SidebarTrigger className="hover:bg-muted/50 p-2 rounded-md transition-colors" />
              <GlobalHeader />
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-muted/20 relative z-10">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>;
}