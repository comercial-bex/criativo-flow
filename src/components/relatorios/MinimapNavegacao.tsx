import { motion } from 'framer-motion';
import { 
  TrendingUp, Target, Users, BarChart3, Calendar, 
  Zap, Trophy, Rocket, CheckCircle, Home
} from 'lucide-react';

interface MinimapProps {
  currentSection: number;
  totalSections: number;
  onNavigate: (section: number) => void;
}

const sectionIcons = [
  { icon: Home, label: 'Capa', color: 'from-blue-500 to-blue-600' },
  { icon: TrendingUp, label: 'Resumo', color: 'from-purple-500 to-purple-600' },
  { icon: Target, label: 'Contexto', color: 'from-pink-500 to-pink-600' },
  { icon: Zap, label: 'SWOT', color: 'from-yellow-500 to-yellow-600' },
  { icon: Users, label: 'Audiência', color: 'from-green-500 to-green-600' },
  { icon: BarChart3, label: 'Engajamento', color: 'from-cyan-500 to-cyan-600' },
  { icon: Calendar, label: 'Conteúdo', color: 'from-orange-500 to-orange-600' },
  { icon: Trophy, label: 'Hashtags', color: 'from-red-500 to-red-600' },
  { icon: Rocket, label: 'Maturidade', color: 'from-indigo-500 to-indigo-600' },
  { icon: CheckCircle, label: 'Ações', color: 'from-emerald-500 to-emerald-600' },
];

export function MinimapNavegacao({ currentSection, totalSections, onNavigate }: MinimapProps) {
  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden xl:block">
      <div className="bg-background/80 backdrop-blur-md border border-border rounded-2xl p-3 shadow-2xl">
        <div className="space-y-2">
          {Array.from({ length: Math.min(totalSections, 10) }).map((_, i) => {
            const isActive = i === currentSection;
            const IconComponent = sectionIcons[i]?.icon || Home;
            const gradientColor = sectionIcons[i]?.color || 'from-gray-500 to-gray-600';
            
            return (
              <motion.button
                key={i}
                onClick={() => onNavigate(i)}
                className={`
                  relative group w-12 h-12 rounded-xl flex items-center justify-center
                  transition-all duration-300 
                  ${isActive 
                    ? `bg-gradient-to-br ${gradientColor} shadow-lg scale-110` 
                    : 'bg-muted/50 hover:bg-muted hover:scale-105'
                  }
                `}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconComponent 
                  className={`w-5 h-5 ${isActive ? 'text-white' : 'text-muted-foreground'}`}
                />
                
                {/* Tooltip */}
                <div className="absolute left-full ml-4 px-3 py-2 bg-popover text-popover-foreground rounded-lg 
                  shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap
                  text-sm font-medium border border-border">
                  {sectionIcons[i]?.label || `Seção ${i + 1}`}
                  <div className="text-xs text-muted-foreground mt-1">
                    {i + 1} de {totalSections}
                  </div>
                </div>

                {/* Indicador de progresso */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Progresso geral */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center mb-2">
            Progresso
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentSection + 1) / totalSections) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="text-xs text-muted-foreground text-center mt-2">
            {Math.round(((currentSection + 1) / totalSections) * 100)}%
          </div>
        </div>
      </div>

      {/* Atalhos de teclado */}
      <div className="mt-4 bg-background/80 backdrop-blur-md border border-border rounded-xl p-3 shadow-xl">
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span>← →</span>
            <span className="text-foreground">Navegar</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">F</kbd>
            <span className="text-foreground">Fullscreen</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">P</kbd>
            <span className="text-foreground">Apresentar</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">1-9</kbd>
            <span className="text-foreground">Ir para</span>
          </div>
        </div>
      </div>
    </div>
  );
}
