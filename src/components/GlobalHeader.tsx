import { Search, Menu } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useUniversalSearch } from "@/hooks/useUniversalSearch";
import { SearchResults } from "@/components/SearchResults";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { CalendarModal } from "@/components/CalendarModal";
import { HelpModal } from "@/components/HelpModal";
import { useDeviceType } from "@/hooks/useDeviceType";

export function GlobalHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const { results, isLoading } = useUniversalSearch(searchQuery);
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';

  return (
    <div className="flex items-center justify-between w-full">
      {isMobile ? (
        <>
          {/* Mobile Layout */}
          <div className="flex items-center gap-2 flex-1">
            <h1 className="text-lg font-semibold text-foreground">BEX Flow</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setSearchExpanded(!searchExpanded)}
            >
              <Search className="h-5 w-5" />
            </Button>
            
            {/* Mobile Actions Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <CalendarModal />
                    <NotificationDropdown />
                    <HelpModal />
                    <ThemeToggle />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Mobile Search Overlay */}
          {searchExpanded && (
            <div className="absolute top-14 left-0 right-0 bg-background border-b p-4 z-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  className="pl-10 pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowResults(true)}
                  onBlur={() => setTimeout(() => {
                    setShowResults(false);
                    setSearchExpanded(false);
                  }, 200)}
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={() => setSearchExpanded(false)}
                >
                  ×
                </Button>
              </div>
              {showResults && (
                <SearchResults
                  results={results}
                  isLoading={isLoading}
                  query={searchQuery}
                  onResultClick={() => {
                    setShowResults(false);
                    setSearchQuery("");
                    setSearchExpanded(false);
                  }}
                />
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Desktop/Tablet Layout */}
          <div className="flex items-center gap-4">
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
            <CalendarModal />
            <NotificationDropdown />
            <HelpModal />
            <ThemeToggle />
          </div>
        </>
      )}
    </div>
  );
}