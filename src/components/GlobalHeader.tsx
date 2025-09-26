import { Search, User, LogOut, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useUniversalSearch } from "@/hooks/useUniversalSearch";
import { SearchResults } from "@/components/SearchResults";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { CalendarModal } from "@/components/CalendarModal";
import { HelpModal } from "@/components/HelpModal";

export function GlobalHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { results, isLoading } = useUniversalSearch(searchQuery);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-4 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        
        {/* Busca Universal */}
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes, projetos, planejamentos..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
          />
          {showResults && (
            <SearchResults
              results={results}
              isLoading={isLoading}
              query={searchQuery}
              onResultClick={() => {
                setShowResults(false);
                setSearchQuery("");
              }}
            />
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Calendário Geral - Acesso Rápido */}
        <CalendarModal />

        {/* Notificações */}
        <NotificationDropdown />

        {/* Ajuda */}
        <HelpModal />

        {/* Toggle de Tema */}
        <ThemeToggle />

        {/* Perfil */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span className="hidden md:inline-block">{user?.email}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate('/perfil')}>
              <User className="mr-2 h-4 w-4" />
              Meu Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut}>
              {isSigningOut ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              {isSigningOut ? 'Saindo...' : 'Sair'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}