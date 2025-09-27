import { Home, Users, FileText, DollarSign, Settings, MoreHorizontal } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const mainNavItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'CRM', url: '/crm', icon: Users },
  { title: 'Projetos', url: '/cliente/projetos', icon: FileText },
  { title: 'Financeiro', url: '/financeiro', icon: DollarSign },
  { title: 'Mais', url: '#', icon: MoreHorizontal, isMore: true },
];

const moreNavItems = [
  { title: 'Configurações', url: '/configuracoes', icon: Settings },
  { title: 'Relatórios', url: '/relatorios', icon: FileText },
  { title: 'Especialistas', url: '/especialistas', icon: Users },
  { title: 'Clientes', url: '/clientes', icon: Users },
];

export function BottomNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActiveRoute = (url: string) => {
    if (url === '/dashboard') return currentPath === '/' || currentPath === '/dashboard';
    return currentPath.startsWith(url);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="flex items-center justify-around px-2 py-1">
        {mainNavItems.map((item) => {
          if (item.isMore) {
            return (
              <Sheet key={item.title}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex flex-col items-center gap-1 py-2 px-3 min-h-[60px] text-xs"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-[10px]">{item.title}</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-auto">
                  <SheetHeader>
                    <SheetTitle>Menu Completo</SheetTitle>
                  </SheetHeader>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {moreNavItems.map((moreItem) => (
                      <NavLink
                        key={moreItem.title}
                        to={moreItem.url}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-lg transition-colors',
                          isActiveRoute(moreItem.url)
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted'
                        )}
                      >
                        <moreItem.icon className="h-6 w-6" />
                        <span className="text-sm font-medium">{moreItem.title}</span>
                      </NavLink>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            );
          }

          return (
            <NavLink
              key={item.title}
              to={item.url}
              className={cn(
                'flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors min-h-[60px] text-xs',
                isActiveRoute(item.url)
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.title}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}