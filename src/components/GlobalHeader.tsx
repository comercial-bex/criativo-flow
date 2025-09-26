import { Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useUniversalSearch } from "@/hooks/useUniversalSearch";
import { SearchResults } from "@/components/SearchResults";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { CalendarModal } from "@/components/CalendarModal";
import { HelpModal } from "@/components/HelpModal";

export function GlobalHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const { results, isLoading } = useUniversalSearch(searchQuery);

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        {/* Busca Universal */}
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            placeholder="Buscar clientes, projetos, planejamentos..."
            className="pl-10 relative z-10"
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

      </div>
    </div>
  );
}