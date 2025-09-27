import { Home, Users, FileText, DollarSign, Settings, MoreHorizontal, Calendar, BarChart3 } from 'lucide-react';
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
  { title: 'Clientes', url: '/clientes', icon: Users },
  { title: 'Projetos', url: '/cliente/projetos', icon: FileText },
  { title: 'Financeiro', url: '/financeiro', icon: DollarSign },
  { title: 'Mais', url: '#', icon: MoreHorizontal, isMore: true },
];

const moreNavItems = [
  { title: 'CRM', url: '/crm', icon: Users },
  { title: 'Relatórios', url: '/relatorios', icon: BarChart3 },
  { title: 'Planejamentos', url: '/grs/planejamentos', icon: Calendar },
  { title: 'Especialistas', url: '/especialistas', icon: Users },
  { title: 'Configurações', url: '/configuracoes', icon: Settings },
  { title: 'Perfil', url: '/perfil', icon: Users },
];

export function BottomNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActiveRoute = (url: string) => {
    if (url === '/dashboard') return currentPath === '/' || currentPath === '/dashboard';
    return currentPath.startsWith(url);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-t border-border safe-area-inset-bottom">
      <div className="flex items-center justify-around px-1 py-2">
        {mainNavItems.map((item) => {
          if (item.isMore) {
            return (
              <Sheet key={item.title}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex flex-col items-center gap-1 py-3 px-2 min-h-[56px] text-xs min-w-[64px] transition-all duration-200 hover:scale-105"
                  >
                    <item.icon className="h-6 w-6" />
                    <span className="text-[11px] font-medium">{item.title}</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-auto rounded-t-xl">
                  <SheetHeader className="pb-4">
                    <SheetTitle className="text-lg">Menu Completo</SheetTitle>
                  </SheetHeader>
                  <div className="grid grid-cols-2 gap-3 pb-4">
                    {moreNavItems.map((moreItem) => (
                      <NavLink
                        key={moreItem.title}
                        to={moreItem.url}
                        className={cn(
                          'flex flex-col items-center gap-3 p-4 rounded-xl transition-all duration-200 min-h-[80px] hover:scale-105',
                          isActiveRoute(moreItem.url)
                            ? 'bg-primary/15 text-primary shadow-sm'
                            : 'hover:bg-muted/80 active:bg-muted'
                        )}
                      >
                        <moreItem.icon className="h-7 w-7" />
                        <span className="text-sm font-medium text-center">{moreItem.title}</span>
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
                'flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all duration-200 min-h-[56px] text-xs min-w-[64px] hover:scale-105 active:scale-95',
                isActiveRoute(item.url)
                  ? 'text-primary bg-primary/15 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-[11px] font-medium">{item.title}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}