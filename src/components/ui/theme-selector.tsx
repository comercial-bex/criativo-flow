import { Monitor, Moon, Sun, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useThemeManager, ThemeMode } from "@/contexts/ThemeManagerContext";
import { themePresets } from "@/lib/theme-presets";
import { cn } from "@/lib/utils";

export function ThemeSelector() {
  const { theme, setTheme } = useThemeManager();

  const getThemeIcon = (themeMode: ThemeMode) => {
    switch (themeMode) {
      case 'light': return <Sun className="h-4 w-4" />;
      case 'dark': return <Moon className="h-4 w-4" />;
      case 'bex-gamer': return <Gamepad2 className="h-4 w-4" />;
    }
  };

  const getCurrentIcon = () => {
    return getThemeIcon(theme);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 hover:bg-bex/10 hover:text-bex border border-transparent hover:border-bex/30 transition-all"
        >
          {getCurrentIcon()}
          <span className="sr-only">Alternar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover/95 backdrop-blur-md border-bex/20 z-[100]">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Monitor className="h-4 w-4" />
          Aparência
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50" />
        
        {(['light', 'dark', 'bex-gamer'] as ThemeMode[]).map((themeMode) => {
          const preset = themePresets[themeMode];
          return (
            <DropdownMenuItem
              key={themeMode}
              onClick={() => setTheme(themeMode)}
              className={cn(
                "flex items-start gap-3 p-3 cursor-pointer transition-all",
                "hover:bg-bex/10 hover:text-bex",
                theme === themeMode && "bg-bex/15 text-bex border-l-2 border-bex"
              )}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getThemeIcon(themeMode)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{preset.icon} {preset.name}</span>
                  {theme === themeMode && (
                    <span className="text-[10px] bg-bex text-black px-1.5 py-0.5 rounded-full font-semibold">
                      ATIVO
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {preset.description}
                </p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
