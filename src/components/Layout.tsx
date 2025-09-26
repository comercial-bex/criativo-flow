import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { GlobalHeader } from "@/components/GlobalHeader";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex w-full">
      <div className="w-80">
        <AppSidebar />
      </div>
      <div className="flex-1 flex flex-col">
        <header className="h-16 flex items-center border-b bg-background px-4">
          <div className="flex-1">
            <GlobalHeader />
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  );
}